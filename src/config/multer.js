const multer = require('multer');
const ImgurStorage = require('multer-storage-imgur');
const crypto = require('crypto');
const path = require('path');

const storageTypes = {
	imgur: ImgurStorage({ clientId: process.env.IMGUR_CLIENT_ID }),
	local: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
		},
		filename: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if (err) cb(err);

				const fileName = `${hash.toString('hex')}-${file.originalname}`;

				cb(null, fileName);
			});
		},
	}),
};

module.exports = {
	storage:
		process.env.NODE_ENV === 'test' ? storageTypes.local : storageTypes.imgur,
	limits: {
		fileSize: 2 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'image/jpeg',
			'image/pjpeg',
			'image/png',
			'image/gif',
		];

		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type.'));
		}
	},
};
