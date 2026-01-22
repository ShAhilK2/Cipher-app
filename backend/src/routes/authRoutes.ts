import { Router } from "express";
import { authCallback, getMe } from "../controller/authController";

const router = Router();

router.get("/me", getMe);
router.post("/callback", authCallback);

export default router;
