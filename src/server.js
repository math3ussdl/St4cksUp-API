require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const logger = require('./config/logger');
const users = require('./routes/users');
const auth = require('./routes/auth');
const multerConfig = require('./config/multer');
const { verifyJWT } = require('./middlewares/verifyJWT');
const {
	createRequest,
	acceptRequest,
	rejectRequest,
} = require('./routes/requests');
const { listActivities } = require('./routes/activities');
const {
	getPosts,
	createPost,
	getPost,
	updatePost,
	deletePost,
} = require('./routes/posts');

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

app
	.route('/posts')
	.get(verifyJWT, getPosts)
	.post(verifyJWT, multer(multerConfig).single('file'), createPost);
app
	.route('/posts/:id')
	.get(verifyJWT, getPost)
	.put(verifyJWT, updatePost)
	.delete(verifyJWT, deletePost);

app.listen(port);
logger.info(`Server initialized with port: ${port}`);

module.exports = app;
