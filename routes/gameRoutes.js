import express from "express";
import {
    startGame,
    submitAnswer,
    finishGame,
    getGameResults
} from "../controllers/gameController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/start/:quizId", protect, startGame);
router.post("/:sessionId/answer", protect, submitAnswer);
router.post("/:sessionId/finish", protect, finishGame);
router.get("/:sessionId/results", protect, getGameResults);

export default router;