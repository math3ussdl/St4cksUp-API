const { createTransport } = require('nodemailer');

exports.transporter = createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.ADMIN_MAIL_USER,
		pass: process.env.ADMIN_MAIL_PASSWORD,
	},
});
