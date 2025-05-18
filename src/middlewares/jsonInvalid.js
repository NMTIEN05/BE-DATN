const jsonValid = (err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return res.status(400).json({ success: false, message: "Invalid JSON format" });
	}
	next(err);
};

export default jsonValid;
