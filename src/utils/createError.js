const createError = (statusCode, message) => {
	const error = new Error(message || "Internal Server Error");
	error.statusCode = statusCode || 500;
	return error;
};

export default createError;
