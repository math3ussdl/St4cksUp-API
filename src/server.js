require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const logger = require('./config/logger');
const users = require('./routes/users');
const auth = require('./routes/auth');
const { verifyJWT } = require('./middlewares/verifyJWT');
const {
	createRequest,
	acceptRequest,
	rejectRequest,
} = require('./routes/requests');
const { listActivities } = require('./routes/activities');

const app = express();
const port = process.env.PORT || 3333;

const server = require('http').createServer(app);
const io = require('socket.io')(server);

require('./database');

//don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.json({ type: 'application/json' }));

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

app.route('/users/request').post(verifyJWT, createRequest);
app.route('/users/request/:id/accepts').delete(verifyJWT, acceptRequest);
app.route('/users/request/:id/rejects').delete(verifyJWT, rejectRequest);

app.route('/activities').get(verifyJWT, listActivities);

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
