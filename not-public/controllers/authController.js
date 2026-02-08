import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const register = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Пользователь уже существует' });
        }

        const user = await User.create({ username, email, password, avatar });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: { id: user._id, username: user.username, avatar: user.avatar },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка регистрации' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            data: {
                user: { id: user._id, username: user.username, avatar: user.avatar },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка входа' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')

            .populate('quizzesCreated')
            .populate('quizzesPlayed.quiz');

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения профиля'
        });
    }
};