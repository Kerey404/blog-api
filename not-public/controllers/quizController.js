import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

export const createQuiz = async (req, res) => {
    try {
        const { title, description, category, difficulty, coverImage } = req.body;

        const quiz = await Quiz.create({
            title,
            description,
            category,
            difficulty,
            coverImage: coverImage || '📚',
            author: req.user.id
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { quizzesCreated: quiz._id }
        });

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating quiz'
        });
    }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;

        let filter = { isPublic: true };

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const quizzes = await Quiz.find(filter)
            .populate('author', 'username avatar')
            .populate('questions')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching quizzes'
        });
    }
};

export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('questions');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching quiz'
        });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own quizzes'
            });
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            quiz: updatedQuiz
        });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating quiz'
        });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own quizzes'
            });
        }

        await Question.deleteMany({ quiz: req.params.id });
        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting quiz'
        });
    }
};

export const addQuestion = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only add questions to your own quizzes'
            });
        }

        const question = await Question.create({
            ...req.body,
            quiz: req.params.id
        });

        quiz.questions.push(question._id);
        await quiz.save();

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            question
        });
    } catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error adding question'
        });
    }
};

export const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ author: req.user.id })
            .populate('questions')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get my quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching your quizzes'
        });
    }
};