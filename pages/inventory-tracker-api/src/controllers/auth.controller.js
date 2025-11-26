import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

export const register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        const token = signToken(user);
        res.status(201).json({ user: { id: user._id, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken(user);
    res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
};
