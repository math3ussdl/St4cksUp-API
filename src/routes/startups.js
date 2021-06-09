const { StatusCodes } = require('http-status-codes');
const Activity = require('../database/models/activity');
const Startup = require('../database/models/startup');
const Request = require('../database/models/request');
const User = require('../database/models/user');
const { sendMail } = require('../utils/sendMail');
const { decodeJWT } = require('../utils/jwt');

/**
 * GET /startups route retrieve all the startups
 */
async function getStartups(_req, res) {
	try {
		const startups = await Startup.find()
			.populate('project')
			.populate('members.user');

		return res.json(startups);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * POST /startups route create a startup.
 */
async function createStartup(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { name } = req.body;

		const { id } = await decodeJWT(token);

		const loggedUser = await User.findOne({ _id: id });

		if (!loggedUser) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		const targetStartup = await Startup.findOne({ name });

		if (targetStartup) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ message: 'Startup already exists!' });
		}

		const startup = await Startup.create({
			members: [
				{
					user: id,
					responsability: 'OWNER',
				},
			],
			...req.body,
		});

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Startup successfully created!', startup });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * GET /startups/:id route to retrieve a startup given its id.
 */
async function getStartup(req, res) {
	try {
		const startup = await Startup.findById(req.params.id)
			.populate('project')
			.populate('members.user');

		if (!startup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		return res.json(startup);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id route to updates a startup given its id
 */
async function updateStartup(req, res) {
	try {
		const updatedStartup = req.body;
		let startup = await Startup.findById(req.params.id);

		if (!startup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		startup = await Startup.updateOne(
			{ _id: startup.id },
			{ $set: updatedStartup },
			{ new: true }
		);

		return res.json({ message: 'Startup updated!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/members/add
 */
async function addMembers(req, res) {
	try {
		const { emails } = req.body;
		const token = req.headers['x-access-token'];

		const { id } = await decodeJWT(token);

		const userAuth = await User.findById(id);
		const startup = await Startup.findById(req.params.id);

		emails.forEach(async email => {
			const target = await User.findOne({ email });

			if (!target) {
				await sendMail({
					from: process.env.ADMIN_MAIL,
					to: email,
					subject: `${userAuth.name} convidou você para participar do St4cksUP`,
					html: `
					Hey, tudo bem? Isso mesmo que você ouviu! Venha se juntar a ${userAuth.name}
					e a outros usuários que fazem a diferença para a comunidade de tecnologia!
				`,
				});
			} else {
				const request = await Request.create({
					type: 'STARTUP@REQ',
					author: userAuth._id,
					startupId: startup._id,
					target: target._id,
				});

				await Activity.create({
					type: 'REQUEST',
					author: userAuth._id,
					target: target._id,
					requestId: request._id,
					message: 'asked her to enter his startup!',
				});

				await sendMail({
					from: process.env.ADMIN_MAIL,
					to: email,
					subject: `${userAuth.name} convidou você para participar da Startup ${startup.name}`,
					html: `
					Hey, tudo bem? Isso mesmo que você ouviu! Venha se juntar a ${userAuth.name}
					e a outros usuários da ${startup.name} e mude o mundo conosco!
				`,
				});
			}
		});

		return res.json({
			message: 'Members Invited!',
		});
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/members/remove
 */
async function removeMember(req, res) {
	try {
		const { emails } = req.body;
		const { id } = req.params;

		const startup = await Startup.findById(id);
		if (!startup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		const members = startup.members;

		emails.forEach(async email => {
			const target = await User.findOne({ email });

			if (!target) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.json({ message: 'User not found!' });
			}

			const index = members.map(el => el.user).indexOf(target._id);
			if (index > -1) {
				members.splice(index, 1);
			}

			const startupUpdated = await Startup.updateOne(
				{ _id: startup._id },
				{ $set: { ...startup, members } },
				{ new: true }
			);

			return res.json({ message: 'Member removed!', startup: startupUpdated });
		});
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * DELETE /startups/:id to delete a startup given its id
 */
async function deleteStartup(req, res) {
	try {
		let startup = await Startup.findById(req.params.id);

		if (!startup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		let result = await Startup.deleteOne({ _id: startup.id });

		return res.json({ message: 'Startup successfully deleted!', result });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

module.exports = {
	addMembers,
	createStartup,
	deleteStartup,
	getStartup,
	getStartups,
	updateStartup,
	removeMember,
};
