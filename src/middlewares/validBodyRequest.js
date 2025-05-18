const validBodyRequest = (schema) => (req, res, next) => {
	try {
		const data = schema.parse(req.body);
		req.body = data;
		next();
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export default validBodyRequest;
