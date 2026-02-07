import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters']
        },
        avatar: {
            type: String,
            default: '🎮'
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio cannot exceed 200 characters'],
            default: ''
        },
        location: {
            type: String,
            maxlength: [100, 'Location cannot exceed 100 characters'],
            default: ''
        },
        website: {
            type: String,
            maxlength: [200, 'Website URL cannot exceed 200 characters'],
            default: ''
        },
        quizzesCreated: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        }],
        quizzesPlayed: [{
            quiz: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            },
            score: Number,
            playedAt: Date
        }],
        totalPoints: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);