const ImgurStorage = require('multer-storage-imgur');

module.exports = {
	storage: ImgurStorage({ clientId: process.env.IMGUR_CLIENT_ID }),
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

/*
MULTER DISK STORAGE

multer.diskStorage({
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
*/
