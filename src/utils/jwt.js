const jwt = require('jsonwebtoken');

exports.genJWT = id => {
	return jwt.sign({ id }, process.env.APP_SECRET, {
		expiresIn: 86400, // expires in 24 hours
	});
};

exports.decodeJWT = async token => {
	return jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
		if (err) throw new Error('Token not decoded!');

		return decoded;
	});
};
