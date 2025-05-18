import jwt from "jsonwebtoken";

import { JWT_REFRESH_SECRET, JWT_SECRET } from "../configs/enviroments.js";
const generateToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
};

const generateRefreshToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: "60d" });
};

export { generateToken, generateRefreshToken };
