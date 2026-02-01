import express from "express";
import { register, login, logout, getProfile, checkAuth } from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/check", checkAuth);

// Защищенные роуты
router.post("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getProfile);

export default router;