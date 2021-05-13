const mongoose = require('mongoose');
const logger = require('../config/logger');

//db connection
mongoose
	.connect(process.env.DB_HOST, {
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => logger.info('mongodb is connected!'))
	.catch(() => {
		logger.error('mongodb unable to connect!!');
		process.exit(1);
	});

const db = mongoose.connection;
db.on('error', logger.error.bind(console, 'connection error:'));
