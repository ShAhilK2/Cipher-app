import { Router } from "express";
import { ProtectRoute } from "../middleware/auth";
import { getUsers } from "../controller/userController";

const router = Router();

// Get all the users

router.get("/", ProtectRoute, getUsers);

export default router;
