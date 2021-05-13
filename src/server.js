require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('./config/logger');
const users = require('./routes/users');
const auth = require('./routes/auth');
const { verifyJWT } = require('./middlewares/verifyJWT');

const app = express();
const port = process.env.PORT || 3333;

require('./database');

//don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

// route definitions
app.route('/users').get(verifyJWT, users.getUsers).post(users.postUser);

app
	.route('/users/:id')
	.get(verifyJWT, users.getUser)
	.put(verifyJWT, users.updateUser)
	.delete(verifyJWT, users.deleteUser);

app.route('/users/active/:id').put(users.activeUser);
app.route('/users/invite').post(verifyJWT, users.inviteUsers);
app.route('/users/auth').post(auth.authenticate);

app.listen(port);
logger.info(`Server initialized with port: ${port}`);

module.exports = app;
