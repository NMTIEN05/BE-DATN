import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import { JWT_SECRET } from "../configs/enviroments.js";

const jwtMiddleware = (req, res, next) => {
	// Token có thể được gửi qua cookie hoặc header
	const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

	if (!token) {
		return next(createError(401, "Bạn cần phải đăng nhập"));
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return next(createError(403, "Forbidden - Token không hợp lệ"));
	}
};

export default jwtMiddleware;
