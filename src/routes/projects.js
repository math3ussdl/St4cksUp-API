const { StatusCodes } = require('http-status-codes');
const Startup = require('../database/models/startup');
const Project = require('../database/models/project');
const Task = require('../database/models/task');
const User = require('../database/models/user');
const { decodeJWT } = require('../utils/jwt');

/**
 * GET /startups/:id/projects route retrieve all the projects
 */
async function getProjects(req, res) {
	try {
		const { id: startupId } = req.params;

		const projects = await Project.find({
			startup: startupId,
		})
			.populate('tasks')
			.populate('startup');

		return res.json(projects);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * POST /startups/:id/projects route create a project.
 */
async function createProject(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { name } = req.body;

		const { id } = await decodeJWT(token);

		const loggedUser = await User.findOne({ _id: id });
		if (!loggedUser) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'User not found!' });
		}

		const targetStartup = await Startup.findById(req.params.id);
		if (!targetStartup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		const targetProject = await Project.findOne({ name });
		if (targetProject) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ message: 'Project already exists!' });
		}

		const project = await Project.create({
			startup: req.params.id,
			...req.body,
		});

		await Startup.updateOne(
			{ _id: targetStartup.id },
			{
				$set: {
					projects: [...targetStartup.projects, project._id],
				},
			}
		);

		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Project successfully created!', project });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * GET /startups/:id/projects/:projid route to retrieve a project given its id.
 */
async function getProject(req, res) {
	try {
		const startup = await Startup.findById(req.params.id)
			.populate('project')
			.populate('members.user');

		if (!startup) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Startup not found!' });
		}

		const project = await Project.findById(req.params.projid).populate(
			'startup'
		);

		if (!project) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		return res.json(project);
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * PUT /startups/:id/projects/:projid route to updates a projects given its id
 */
async function updateProject(req, res) {
	try {
		const updatedProject = req.body;
		let project = await Project.findById(req.params.projid);

		if (!project) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		project = await Project.updateOne(
			{ _id: project.id },
			{ $set: updatedProject },
			{ new: true }
		);

		return res.json({ message: 'Project updated!' });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

/**
 * DELETE /startups/:id/projects/:projid to delete a project given its id
 */
async function deleteProject(req, res) {
	try {
		let project = await Project.findById(req.params.projid);

		if (!project) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Project not found!' });
		}

		await project.tasks.map(async el => {
			await Task.findByIdAndDelete(el);
		});

		let result = await Project.deleteOne({ _id: project.id });

		return res.json({ message: 'Project successfully deleted!', result });
	} catch ({ message }) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
	}
}

module.exports = {
	createProject,
	deleteProject,
	getProject,
	getProjects,
	updateProject,
};
