import type { AuthRequest } from "../middleware/auth";
import type { NextFunction, Response } from "express";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";

export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = await Message.find({ chatId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.json(message);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
