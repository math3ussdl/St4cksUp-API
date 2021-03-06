const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// task schema definition
const TaskSchema = new Schema(
	{
		description: {
			type: String,
			required: true,
		},

		is_completed: {
			type: Boolean,
			required: true,
			default: false,
		},

		author: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		responsible: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		project: {
			type: Schema.Types.ObjectId,
			ref: 'project',
		},

		delivery_date: {
			type: Date,
			required: true,
			default: Date.now(),
		},
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('task', TaskSchema);
