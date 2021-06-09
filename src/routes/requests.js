const { StatusCodes } = require('http-status-codes');
const Activity = require('../database/models/activity');
const User = require('../database/models/user');
const Startup = require('../database/models/startup');
const Request = require('../database/models/request');
const { decodeJWT } = require('../utils/jwt');

/**
 * POST /users/request route create a request.
 */
async function createRequest(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { type, email } = req.body;

		const { id } = await decodeJWT(token);

		const author = await User.findOne({ _id: id });
		const target = await User.findOne({ email });

		const request = await Request.create({
			type,
			author: author._id,
			target: target._id,
		});

		await Activity.create({
			type: 'REQUEST',
			author: author._id,
			target: target._id,
			message: 'asked her to enter his network!',
		});

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Request successfully created!', request });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * DELETE /users/request/:id/accepts route accepts this request.
 */
async function acceptRequest(req, res) {
	try {
		const { id } = req.params;

		const request = await Request.findOne({ _id: id });

		switch (request.type) {
			case 'CONNECTION@REQ':
				const author = await User.findOne({ _id: request.author });
				if (!author) {
					return res
						.status(StatusCodes.NOT_FOUND)
						.json({ message: 'Author not found!' });
				}

				await User.updateOne(
					{ _id: author._id },
					{ $set: { connection: [...author.connection, request.target._id] } }
				);

				await Request.deleteOne({ _id: id });

				break;

			case 'STARTUP@REQ':
				const startup = await Startup.findOne({ _id: request.startupId });
				if (!startup) {
					return res
						.status(StatusCodes.NOT_FOUND)
						.json({ message: 'Startup not found!' });
				}

				await Startup.updateOne(
					{ _id: request.startupId },
					{
						$set: {
							members: [
								...startup.members,
								{ user: request.target._id, responsability: 'DEVELOPER' },
							],
						},
					}
				);

				await Activity.deleteOne({ requestId: id });

				await Activity.create({
					type: 'SUCCESS',
					author: request.target,
					target: request.author,
					message: 'is now part of your startup!',
				});

				await Request.deleteOne({ _id: id });

				break;
		}

		return res.json({ message: 'Request successfully accepted!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
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
