const { transporter } = require('../config/nodemailer');

exports.sendMail = async mail => {
	await transporter.sendMail(mail);
};
