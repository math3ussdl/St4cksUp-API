const { StatusCodes } = require('http-status-codes');
const Startup = require('../database/models/startup');
const Project = require('../database/models/project');
const Task = require('../database/models/task');
const User = require('../database/models/user');
const { decodeJWT } = require('../utils/jwt');

/**
 * GET /startups/:id/projects/:projid/tasks route retrieve all the tasks
 */
async function getTasks(req, res) {
	try {
		const { projid } = req.params;

		const tasks = await Task.find({
			project: projid,
		})
			.populate('author')
			.populate('responsible')
			.populate('project');

		return res.json(tasks);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * POST /startups/:id/projects/:projid/tasks route create a task.
 */
async function createTask(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { description } = req.body;

		const { id } = await decodeJWT(token);

		const loggedUser = await User.findOne({ _id: id });
		if (!loggedUser) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		const targetProject = await Project.findById(req.params.projid);
		if (!targetProject) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		const targetTask = await Task.findOne({ description });
		if (targetTask) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ message: 'Task already exists!' });
		}

		const task = await Task.create({
			author: id,
			responsible: id,
			project: req.params.projid,
			...req.body,
		});

		await Project.updateOne(
			{ _id: targetProject.id },
			{
				$set: {
					tasks: [...targetProject.tasks, task._id],
				},
			}
		);

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Task successfully created!', task });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * GET /startups/:id/projects/:projid/tasks/:taskid route to retrieve a task given its id.
 */
async function getTask(req, res) {
	try {
		const project = await Project.findById(req.params.projid).populate(
			'startup'
		);

		if (!project) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		const task = await Task.findById(req.params.taskid).populate('project');

		if (!task) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Task not found!' });
		}

		return res.json(task);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/projects/:projid/tasks/:taskid route to updates a task given its id
 */
async function updateTask(req, res) {
	try {
		const updatedTask = req.body;
		let task = await Task.findById(req.params.taskid);

		if (!task) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Task not found!' });
		}

		task = await Task.updateOne(
			{ _id: task.id },
			{ $set: updatedTask },
			{ new: true }
		);

		return res.json({ message: 'Task updated!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/projects/:projid/tasks/:taskid/responsible/add
 */
async function addResponsible(req, res) {
	try {
		const { email } = req.body;
		let task = await Task.findById(req.params.taskid);

		if (!task) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Task not found!' });
		}

		const responsible = await User.findOne({ email });
		if (!responsible) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		task = await Task.updateOne(
			{ _id: task.id },
			{
				$set: {
					responsible: responsible._id,
				},
			},
			{ new: true }
		);

		return res.json({ message: 'Responsible changed!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/projects/:projid/tasks/:taskid/completed
 */
async function completeTask(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { id } = await decodeJWT(token);

		let task = await Task.findById(req.params.taskid).populate('responsible');

		if (!task) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Task not found!' });
		}

		const responsible = await User.findOne({ _id: task.responsible._id });
		if (!responsible) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		if (responsible._id.toString() !== id) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'You are not responsible for this task!' });
		}

		await Task.updateOne(
			{ _id: task.id },
			{
				$set: {
					is_completed: true,
				},
			},
			{ new: true }
		);

		return res.json({ message: 'Task completed!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * DELETE /startups/:id/projects/:projid/tasks/:taskid to delete a task given its id
 */
async function deleteTask(req, res) {
	try {
		let project = await Project.findById(req.params.projid);
		if (!project) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		let task = await Task.findById(req.params.taskid);
		if (!task) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Task not found!' });
		}

		let result = await Task.deleteOne({ _id: task.id });

		const tasks = project.tasks;
		const index = tasks.map(el => el).indexOf(task._id);
		if (index > -1) {
			tasks.splice(index, 1);
		}

		await Project.updateOne(
			{ _id: project._id },
			{ $set: { ...project, tasks } }
		);

		return res.json({ message: 'Task successfully deleted!', result });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

module.exports = {
	addResponsible,
	createTask,
	completeTask,
	deleteTask,
	getTask,
	getTasks,
	updateTask,
};
