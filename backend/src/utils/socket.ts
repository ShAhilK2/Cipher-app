import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { User } from "../models/User";
import { verifyToken } from "@clerk/express";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";

// store online users in memory : userId -> socketId
export const onlineUsers = new Map<string, string>();

export const initilizeSocket = (httpServer: HttpServer) => {
  // Vite and Expo
  const allowedOrigins = [
    "http://localhost:5173",
    "https://localhost:8081",
    process.env.FRONTEND_URL, //production
  ].filter(Boolean) as string[];
  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
    },
  });

  //   VERIFY SOCKET CONNECTION - if the user is autthenticated ,we will store te user id in the socket

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; //this is  what user will send from client
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = session.sub;

      const user = await User.findOne({ clerkId });
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.userId = user._id.toString();

      next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  // this "connection" event name is special and should be written like this
  //   it's the event that is triggered when a new client connects to the server

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // send list of currently online users to the newly connected client
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    // join private room
    socket.join(`user:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // handle sending message

    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;
          const chat = await Chat.findById({
            _id: chatId,
            participants: userId,
          });

          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found" });
            return;
          }

          const message = new Message({
            chat: chatId,
            sender: userId,
            text,
          });

          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();

          await chat.save();
          await message.populate("sender", "name  avatar");

          //   emit to chat room (for users inside the chat)

          io.to(`chat:${chatId}`).emit("new-message", message);

          // also emit to participants personal rooma (for chat list view)
          for (const participantId of chat.participants) {
            io.to(`user:${participantId}`).emit("new-message", message);
          }
        } catch (error) {
          socket.emit("socket-error", { message: "Failed to send message" });
        }
      },
    );

    // Todo : Later typing indicator

    socket.on("typing", async (data) => {});

    // disconnect handler
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);

      //   notify others
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
};
