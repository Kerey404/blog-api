import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 3600000,
            secure: false,
        },
    })
);


connectDB();


app.use("/api/auth", authRoutes);
app.use("/blogs", blogRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});


app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));