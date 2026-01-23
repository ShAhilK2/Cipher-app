import express from "express";
import authRoutes from "./routes/authRoutes.ts";
import chatRoutes from "./routes/chatRoutes.ts";
import messageRoutes from "./routes/messageRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middleware/errorHandler.ts";
import path from "path";

const app = express();

// Parse incoming json request bodies and makes them avaialbale as req. body is your route hndlers

app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware

// error handler mustome after all the routes and other middlwewares so they can catch errors passed with next(err)
// or thrown nside asynsc handlers
app.use(errorHandler);

// serve frontendin production

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app;
