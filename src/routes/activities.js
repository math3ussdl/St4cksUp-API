const { StatusCodes } = require('http-status-codes');
const Activity = require('../database/models/activity');
const User = require('../database/models/user');
const { decodeJWT } = require('../utils/jwt');

async function listActivities(req, res) {
	try {
		const { q } = req.query;
		const token = req.headers['x-access-token'];
		const { id } = decodeJWT(token);

		const user = await User.findOne({ _id: id });
		let activities;

		if (q && q !== '') {
			activities = await Activity.find({
				message: { $regex: q },
				target: user._id,
			});
		} else {
			activities = await Activity.find();
		}

		return res.json(activities);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

module.exports = {
	listActivities,
};
