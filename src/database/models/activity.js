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

		message: {
			type: String,
			required: true,
		},

		answered: Boolean,
	},
	{ timestamps: true, versionKey: false }
);

ActivitySchema.pre('save', function (next) {
	var activity = this;

	if (activity.type === 'REQUEST') {
		activity.answered = true;
	}

	next();
});

module.exports = mongoose.model('activity', ActivitySchema);
