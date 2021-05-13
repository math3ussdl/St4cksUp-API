const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const User = require('../database/models/user');

/*
 * GET /users route retrieve all the users.
 */
async function getUsers(_req, res) {
	try {
		const users = await User.find();
		return res.json(users);
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: error });
	}
}

/*
 * POST /users to save a new user.
 */
async function postUser(req, res) {
	try {
		let user = await User.create(req.body);

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'User successfully created!', user });
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * GET /users/:id route to retrieve a user given its id.
 */
async function getUser(req, res) {
	const user = await User.findById(req.params.id);

	if (!user) {
		return res
			.status(StatusCodes.NOT_FOUND)
			.json({ message: 'User not found!' });
	}

	return res.json(user);
}

/*
 * PUT /users/:id to update a user given its id
 */
async function updateUser(req, res) {
	try {
		const updatedUser = req.body;
		let user = await User.findById(req.params.id);

		if (!user) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		user = await User.updateOne(
			{ id: user.id },
			{ $set: updatedUser },
			{ new: true }
		);

		return res.json({ message: 'User updated!' });
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * DELETE /users/:id to delete a user given its id.
 */
async function deleteUser(req, res) {
	try {
		let user = await User.findById(req.params.id);

		if (!user) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		let result = await User.deleteOne({ _id: user.id });

		return res.json({ message: 'User successfully deleted!', result });
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

module.exports = {
	getUsers,
	postUser,
	getUser,
	updateUser,
	deleteUser,
};
