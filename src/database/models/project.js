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

		tasks: [
			{
				type: Schema.Types.ObjectId,
				ref: 'task',
			},
		],

		members: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: 'member',
				},

				responsability: {
					type: String,
					required: true,
					enum: ['AUTHOR', 'EDITOR', 'VIEW_ONLY'],
				},
			},
		],
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('project', ProjectSchema);
