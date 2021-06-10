const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// startup schema definition
const StartupSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},

		description: {
			type: String,
			required: true,
		},

		projects: [
			{
				type: Schema.Types.ObjectId,
				ref: 'project',
			},
		],

		members: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: 'user',
				},

				responsability: {
					type: String,
					required: true,
					enum: ['OWNER', 'DESIGN', 'DEVELOPER', 'DEVOPS'],
				},
			},
		],
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('startup', StartupSchema);
