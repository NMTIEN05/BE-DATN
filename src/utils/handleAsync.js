import createError from "./createError.js";

const handleAsync = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((error) => next(createError(500, error.message || "Đã xảy ra lỗi")));
};

export default handleAsync;
