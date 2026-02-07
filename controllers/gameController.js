import GameSession from "../models/GameSession.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

export const startGame = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'This quiz has no questions'
            });
        }

        const gameSession = await GameSession.create({
            quiz: quiz._id,
            player: req.user.id,
            totalQuestions: quiz.questions.length
        });

        res.status(201).json({
            success: true,
            message: 'Game started successfully',
            gameSession: {
                id: gameSession._id,
                quiz: quiz,
                totalQuestions: quiz.questions.length
            }
        });
    } catch (error) {
        console.error('Start game error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error starting game'
        });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { questionId, selectedOption, timeSpent } = req.body;

        const gameSession = await GameSession.findById(req.params.sessionId);

        if (!gameSession) {
            return res.status(404).json({
                success: false,
                message: 'Game session not found'
            });
        }

        if (gameSession.player.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'This is not your game session'
            });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const isCorrect = question.options[selectedOption]?.isCorrect || false;

        let pointsEarned = 0;
        if (isCorrect) {
            const timeBonus = Math.max(0, 1 - (timeSpent / question.timeLimit));
            pointsEarned = Math.round(question.points * (0.5 + timeBonus * 0.5));
        }

        gameSession.answers.push({
            question: questionId,
            selectedOption,
            isCorrect,
            timeSpent,
            pointsEarned
        });

        gameSession.totalScore += pointsEarned;
        if (isCorrect) gameSession.correctAnswers += 1;

        await gameSession.save();

        res.status(200).json({
            success: true,
            isCorrect,
            correctOption: question.options.findIndex(opt => opt.isCorrect),
            pointsEarned,
            totalScore: gameSession.totalScore,
            answeredQuestions: gameSession.answers.length,
            totalQuestions: gameSession.totalQuestions
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error submitting answer'
        });
    }
};

export const finishGame = async (req, res) => {
    try {
        const gameSession = await GameSession.findById(req.params.sessionId)
            .populate('quiz');

        if (!gameSession) {
            return res.status(404).json({
                success: false,
                message: 'Game session not found'
            });
        }

        if (gameSession.player.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'This is not your game session'
            });
        }

        gameSession.status = 'completed';
        gameSession.completedAt = new Date();
        await gameSession.save();

        const quiz = await Quiz.findById(gameSession.quiz._id);
        quiz.timesPlayed += 1;

        const avgScore = ((quiz.averageScore * (quiz.timesPlayed - 1)) + gameSession.totalScore) / quiz.timesPlayed;
        quiz.averageScore = Math.round(avgScore);
        await quiz.save();

        const user = await User.findById(req.user.id);
        user.quizzesPlayed.push({
            quiz: quiz._id,
            score: gameSession.totalScore,
            playedAt: new Date()
        });
        user.totalPoints += gameSession.totalScore;
        user.level = Math.floor(user.totalPoints / 1000) + 1;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Game finished successfully',
            results: {
                totalScore: gameSession.totalScore,
                correctAnswers: gameSession.correctAnswers,
                totalQuestions: gameSession.totalQuestions,
                accuracy: Math.round((gameSession.correctAnswers / gameSession.totalQuestions) * 100),
                pointsEarned: gameSession.totalScore,
                newLevel: user.level
            }
        });
    } catch (error) {
        console.error('Finish game error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error finishing game'
        });
    }
};

export const getGameResults = async (req, res) => {
    try {
        const gameSession = await GameSession.findById(req.params.sessionId)
            .populate('quiz')
            .populate('answers.question');

        if (!gameSession) {
            return res.status(404).json({
                success: false,
                message: 'Game session not found'
            });
        }

        res.status(200).json({
            success: true,
            gameSession
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching results'
        });
    }
};