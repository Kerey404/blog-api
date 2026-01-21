import express from "express";
import mongoose from "mongoose";
import { getBlogs, createBlog, deleteBlog, updateBlog } from "./controllers/blogController.js";

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/blogDB")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ Connection error:", err));

app.get("/blogs", getBlogs);
app.post("/blogs", createBlog);
app.put("/blogs/:id", updateBlog);
app.delete("/blogs/:id", deleteBlog);

app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));