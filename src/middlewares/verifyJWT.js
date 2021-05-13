const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

exports.verifyJWT = (req, res, next) => {
	const token = req.headers['x-access-token'];
	if (!token)
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ errors: ['No token provided.'], data: null });

	jwt.verify(token, process.env.APP_SECRET, function (err) {
		if (err)
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ errors: ['Failed to authenticate token.'], data: null });

		next();
	});
};
