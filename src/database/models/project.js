const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// project schema definition
const ProjectSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},

		description: {
			type: String,
			required: true,
		},

		startup: {
			type: Schema.Types.ObjectId,
			ref: 'startup',
		},

		tasks: [
			{
				type: Schema.Types.ObjectId,
				ref: 'task',
			},
		],
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('project', ProjectSchema);
