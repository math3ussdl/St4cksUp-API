const { StatusCodes } = require('http-status-codes');
const Activity = require('../database/models/activity');
const User = require('../database/models/user');
const Request = require('../database/models/request');
const { decodeJWT } = require('../utils/jwt');

/*
 * POST /users/request route create a request.
 */
async function createRequest(req, res) {
	try {
		const type = req.headers['x-connection-type'];
		const token = req.headers['x-access-token'];
		const targetId = req.headers['x-target-id'];
		const { id } = decodeJWT(token);

		const author = await User.findOne({ _id: id });
		const target = await User.findOne({ _id: targetId });

		const messages = {
			'CONNECTION@REQ': 'asked her to enter his network!',
			'STARTUP@REQ': 'asked her to enter his startup!',
		};

		const request = await Request.create({
			type,
			author,
			target,
		});

		await Activity.create({
			type: 'REQUEST',
			author: author._id,
			target: target._id,
			message: messages[type],
		});

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Request successfully created!', request });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/*
 * DELETE /users/request/:id/accepts route accepts this request.
 */
async function acceptRequest(req, res) {
	try {
		const { id } = req.params;

		const request = await Request.findOne({ _id: id });

		const author = await User.findOne({ _id: request.author });
		if (!author) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Author not found!' });
		}

		switch (request.type) {
			case 'CONNECTION@REQ':
				await User.updateOne(
					{ _id: author._id },
					{ $set: { connection: [...author.connection, request.target._id] } }
				);

				await Request.deleteOne({ _id: id });
				break;

			case 'STARTUP@REQ':
				break;

			case 'PROJECT@REQ':
				break;

			case 'TASK@REQ':
				break;
		}
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/*
 * DELETE /users/request/:id/rejects route rejects this request.
 */
async function rejectRequest(req, res) {
	try {
		const { id } = req.params;

		const request = await Request.findOne({ _id: id });

		await Activity.deleteOne({ _id: request.activityId });
		await Request.deleteOne({ _id: id });

		return res.json({ message: 'Request sucessfully deleted!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

module.exports = {
	createRequest,
	acceptRequest,
	rejectRequest,
};
