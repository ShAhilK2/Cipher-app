import { Router } from "express";
import { ProtectRoute } from "../middleware/auth";
import { getChats, getOrCreateChat } from "../controller/chatController";

const router = Router();

router.use(ProtectRoute);
router.get("/", getChats);
router.post("/with/:participantId", getOrCreateChat);

export default router;
