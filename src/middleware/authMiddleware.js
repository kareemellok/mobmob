import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
    let accessToken;
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            accessToken = req.headers.authorization.split(" ")[1];
            if (!accessToken) {
                return res.status(401).json({ message: "Not authorized, no token" });
            }
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            if (!decoded) {
                return res.status(401).json({ message: "Not authorized, token failed" });
            }
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error("Error verifying token:", error.message);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
}

export default protectRoute;