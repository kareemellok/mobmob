import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";

const generateTokens = async (id, res) => {
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
    )
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    )
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    })
    return { accessToken } 
}

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username must be at least 3 characters",
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            }); 
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            }); 
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            }); 
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "Username already exists",
            }); 
        }
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        const user = new User({
            username,
            email,
            password,
            profileImage,
        });
        await user.save();
        const { accessToken } = await generateTokens(user._id, res);
        res.status(201).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });
    } catch (error) {
        console.log("Error registering user", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
        });
    }
};

const login = async (req, res) => {    
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields",
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            }); 
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            }); 
        }
        const user = User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }
        const { accessToken } = await generateTokens(user._id, res);
        res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });
    } catch (error) {
        console.log("Error logging in user", error);
        res.status(500).json({
            success: false,
            message: "Error logging in user",
        });
    }
    
};

export { register, login };