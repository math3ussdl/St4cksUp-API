const { StatusCodes } = require('http-status-codes');
const Startup = require('../database/models/startup');
const User = require('../database/models/user');
const Request = require('../database/models/request');
const { decodeJWT } = require('../utils/jwt');

/**
 * GET /startups/:id/projects route retrieve all the projects
 */
async function getProjects(req, res) {}

/**
 * POST /startups/:id/projects route create a project.
 */
async function createProject(req, res) {}

/**
 * GET /startups/:id/projects/:projid route to retrieve a project given its id.
 */
async function getProject(req, res) {}

/**
 * PUT /startups/:id/projects/:projid route to updates a projects given its id
 */
async function updateProject(req, res) {}

/**
 * DELETE /startups/:id/projects/:projid to delete a project given its id
 */
async function deleteProject(req, res) {}

module.exports = {
	createProject,
	deleteProject,
	getProject,
	getProjects,
	updateProject,
};
