import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- ИСПРАВЛЕНИЕ CORS ---
// Теперь сервер будет принимать запросы только с твоего домена на Netlify
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://quizland1.netlify.app',
    credentials: true
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public"), {
    extensions: ['html']
}));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/game", gameRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;