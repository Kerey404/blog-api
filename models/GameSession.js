import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true
        },
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        answers: [{
            question: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            },
            selectedOption: Number,
            isCorrect: Boolean,
            timeSpent: Number,
            pointsEarned: Number
        }],
        totalScore: {
            type: Number,
            default: 0
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        correctAnswers: {
            type: Number,
            default: 0
        },
        completedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress'
        }
    },
    { timestamps: true }
);

export default mongoose.model("GameSession", gameSessionSchema);