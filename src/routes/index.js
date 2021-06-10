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
	upvotePost,
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

const {
	createProject,
	deleteProject,
	getProject,
	getProjects,
	updateProject,
} = require('./projects');

const {
	addResponsible,
	createTask,
	completeTask,
	deleteTask,
	getTask,
	getTasks,
	updateTask,
} = require('./tasks');

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

router.route('/posts/:id/upvote').put(verifyJWT, upvotePost);

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

router
	.route('/startups/:id/projects')
	.get(verifyJWT, getProjects)
	.post(verifyJWT, createProject);

router
	.route('/startups/:id/projects/:projid')
	.get(verifyJWT, getProject)
	.put(verifyJWT, updateProject)
	.delete(verifyJWT, deleteProject);

router
	.route('/startups/:id/projects/:projid/tasks')
	.get(verifyJWT, getTasks)
	.post(verifyJWT, createTask);

router
	.route('/startups/:id/projects/:projid/tasks/:taskid')
	.get(verifyJWT, getTask)
	.put(verifyJWT, updateTask)
	.delete(verifyJWT, deleteTask);

router
	.route('/startups/:id/projects/:projid/tasks/:taskid/responsible/add')
	.put(verifyJWT, addResponsible);

router
	.route('/startups/:id/projects/:projid/tasks/:taskid/completed')
	.put(verifyJWT, completeTask);

module.exports = router;
