import { Router } from "express";
import { ProtectRoute } from "../middleware/auth";
import { getMessages } from "../controller/messageController";

const router = Router();

router.get("/chat/:chatID", ProtectRoute, getMessages);

export default router;
