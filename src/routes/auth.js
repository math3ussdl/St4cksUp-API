const { compare } = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const User = require('../database/models/user');
const { genJWT } = require('../utils/jwt');

/*
 * POST /users/auth route authenticate a user.
 */
async function authenticate(req, res) {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		if (!user.is_active) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'Active your account before sign in!' });
		}

		const isMatch = await compare(password, user.password);
		if (!isMatch) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'Passwords not match!' });
		}

		const token = genJWT(user._id);

		return res.json({ user, token });
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: error });
	}
}

module.exports = { authenticate };
