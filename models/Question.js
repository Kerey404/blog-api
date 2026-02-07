import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true
        },
        questionText: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true
        },
        questionType: {
            type: String,
            enum: ['multiple-choice', 'true-false'],
            default: 'multiple-choice'
        },
        options: [{
            text: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                default: false
            }
        }],
        timeLimit: {
            type: Number,
            default: 20,
            min: 5,
            max: 120
        },
        points: {
            type: Number,
            default: 100,
            min: 50,
            max: 1000
        },
        image: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

questionSchema.pre('save', function(next) {
    const hasCorrectAnswer = this.options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
        next(new Error('At least one option must be marked as correct'));
    }
    next();
});

export default mongoose.model("Question", questionSchema);