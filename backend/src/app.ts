import express from "express";
import authRoutes from "./routes/authRoutes.ts";
import chatRoutes from "./routes/chatRoutes.ts";
import messageRoutes from "./routes/messageRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";

const app = express();

// Parse incoming json request bodies and makes them avaialbale as req. body is your route hndlers

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

export default app;
