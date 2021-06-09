const router = require('express').Router();
const multer = require('multer');
const multerConfig = require('../config/multer');
const { verifyJWT } = require('../middlewares/verifyJWT');

const {
	getUsers,
	postUser,
	getUser,
	activeUser,
	inviteUsers,
	updateUser,
	deleteUser,
} = require('./users');

const { authenticate } = require('./auth');

const { createRequest, acceptRequest, rejectRequest } = require('./requests');

const { listActivities } = require('./activities');

const {
	getPosts,
	createPost,
	getPost,
	updatePost,
	deletePost,
} = require('./posts');

const {
	addMembers,
	createStartup,
	deleteStartup,
	getStartup,
	getStartups,
	removeMember,
	updateStartup,
} = require('./startups');

// route definitions
router.route('/users').get(verifyJWT, getUsers).post(postUser);

router
	.route('/users/:id')
	.get(verifyJWT, getUser)
	.put(verifyJWT, updateUser)
	.delete(verifyJWT, deleteUser);

router.route('/users/active/:id').put(activeUser);
router.route('/users/invite').post(verifyJWT, inviteUsers);
router.route('/users/auth').post(authenticate);

router.route('/users/request').post(verifyJWT, createRequest);
router.route('/users/request/:id/accepts').delete(verifyJWT, acceptRequest);
router.route('/users/request/:id/rejects').delete(verifyJWT, rejectRequest);

router.route('/activities').get(verifyJWT, listActivities);

router
	.route('/posts')
	.get(verifyJWT, getPosts)
	.post(verifyJWT, multer(multerConfig).single('file'), createPost);

router
	.route('/posts/:id')
	.get(verifyJWT, getPost)
	.put(verifyJWT, updatePost)
	.delete(verifyJWT, deletePost);

router
	.route('/startups')
	.get(verifyJWT, getStartups)
	.post(verifyJWT, createStartup);

router
	.route('/startups/:id')
	.get(verifyJWT, getStartup)
	.put(verifyJWT, updateStartup)
	.delete(verifyJWT, deleteStartup);

router.route('/startups/:id/members/add').put(verifyJWT, addMembers);

router.route('/startups/:id/members/remove').put(verifyJWT, removeMember);

module.exports = router;
