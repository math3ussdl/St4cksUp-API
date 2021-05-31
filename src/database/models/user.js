const { compare, genSalt, hash } = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user schema definition
const UserSchema = new Schema(
	{
		is_active: {
			type: Boolean,
			required: true,
			default: false,
		},

		name: {
			type: String,
			required: true,
		},

		username: {
			type: String,
			required: true,
			unique: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},

		password: {
			type: String,
			required: true,
		},

		bio: {
			type: String,
			required: true,
			default: "Hi! I'm using ST4cksUP!",
		},

		stack: [
			{
				image: String,
				name: String,
			},
		],

		connection: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],
	},
	{ timestamps: true, versionKey: false }
);

UserSchema.pre('save', function (next) {
	var user = this;

	if (!user.isModified('password')) return next();

	genSalt(10, (err, salt) => {
		if (err) return next(err);

		hash(user.password, salt, (err, hash) => {
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	compare(candidatePassword, this.password, function (err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('user', UserSchema);
