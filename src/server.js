require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const logger = require('./config/logger');
const router = require('./routes');

const app = express();
const port = process.env.PORT || 3333;

require('./database');

//don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.json({ type: 'application/json' }));
app.use(router);

app.listen(port, () => logger.info(`Server initialized with port: ${port}`));

module.exports = app;
