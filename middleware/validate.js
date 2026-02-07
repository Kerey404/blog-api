import { body, validationResult } from 'express-validator';

export const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

export const validateQuiz = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Quiz title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('category')
        .optional()
        .isIn(['Science', 'History', 'Math', 'Geography', 'Entertainment', 'Sports', 'General', 'Other'])
        .withMessage('Invalid category'),
    handleValidationErrors
];

export const validateQuestion = [
    body('questionText')
        .trim()
        .notEmpty()
        .withMessage('Question text is required'),
    body('options')
        .isArray({ min: 2, max: 4 })
        .withMessage('Must provide 2-4 options'),
    body('timeLimit')
        .optional()
        .isInt({ min: 5, max: 120 })
        .withMessage('Time limit must be between 5 and 120 seconds'),
    handleValidationErrors
];

export const validateProfile = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Bio cannot exceed 200 characters'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),
    body('website')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Website URL cannot exceed 200 characters'),
    handleValidationErrors
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
}