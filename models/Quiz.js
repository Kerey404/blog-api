import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Quiz title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        category: {
            type: String,
            enum: ['Science', 'History', 'Math', 'Geography', 'Entertainment', 'Sports', 'General', 'Other'],
            default: 'General'
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
        },
        coverImage: {
            type: String,
            default: '📚'
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        }],
        isPublic: {
            type: Boolean,
            default: true
        },
        timesPlayed: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);