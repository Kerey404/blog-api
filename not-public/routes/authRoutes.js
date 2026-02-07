import express from "express";
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getUserStats
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateRegister, validateProfile } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validateProfile, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/stats", protect, getUserStats);

export default router;