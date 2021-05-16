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

const server = require('http').createServer(app);
const io = require('socket.io')(server);

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

// Socket connection event
io.on('connection', socket => {
	logger.info(`Socket connected: ${socket.id}`);

	// Network request event
	socket.on('network_request', data => {
		logger.debug('Data: ', data);
	});

	// Network request accepted event
	socket.on('network_accepted', data => {
		logger.debug('Data: ', data);
	});

	// Network request rejected event
	socket.on('network_rejected', data => {
		logger.debug('Data: ', data);
	});
});

server.listen(port);
logger.info(`Server initialized with port: ${port}`);

module.exports = app;
