const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// activity schema definition
const ActivitySchema = new Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ['REQUEST', 'ALERT', 'SUCCESS', 'FAILURE'],
		},

		message: {
			type: String,
			required: true,
		},

		// activity author
		author: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		// user logged
		target: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		requestId: {
			type: Schema.Types.ObjectId,
			ref: 'request',
		},
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('activity', ActivitySchema);
