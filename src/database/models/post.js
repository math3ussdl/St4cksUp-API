const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// post schema definition
const PostSchema = new Schema(
	{
		image: {
			type: String,
			required: true,
		},

		image_hash: {
			type: String,
			required: true,
		},

		description: {
			type: String,
			required: true,
		},

		author: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},

		upvotes: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true, versionKey: false }
);

module.exports = mongoose.model('post', PostSchema);
