const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// request schema definition
const RequestSchema = new Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ['CONNECTION@REQ', 'STARTUP@REQ'],
		},

		activityId: {
			type: Schema.Types.ObjectId,
			ref: 'activity',
		},

		// user logged
		author: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		target: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('request', RequestSchema);
