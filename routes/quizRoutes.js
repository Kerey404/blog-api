import express from "express";
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    getMyQuizzes
} from "../controllers/quizController.js";
import { protect } from "../middleware/auth.js";
import { validateQuiz, validateQuestion } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);
router.post("/", protect, validateQuiz, createQuiz);
router.get("/my/created", protect, getMyQuizzes);
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);
router.post("/:id/questions", protect, validateQuestion, addQuestion);

export default router;