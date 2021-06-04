const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const Post = require('../database/models/post');
const { decodeJWT } = require('../utils/jwt');

/*
 * GET /posts route retrieve all the posts.
 */
async function getPosts(_req, res) {
	try {
		const posts = await Post.find().populate('author');
		return res.json(posts);
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * POST /posts to save a new post.
 */
async function createPost(req, res) {
	try {
		const token = req.headers['x-access-token'];
		const { id } = await decodeJWT(token);

		let post = await Post.create({
			author: id,
			image: req.file.link,
			image_hash: req.file.deletehash,
			...req.body,
		});

		return res.status(StatusCodes.CREATED).json({
			message: 'Post successfully created!',
			post,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * GET /posts/:id route to retrieve a post given its id.
 */
async function getPost(req, res) {
	try {
		const post = await Post.findById(req.params.id).populate('author');

		if (!post) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Post not found!' });
		}

		return res.json(post);
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * PUT /posts/:id to updates a post given its id
 */
async function updatePost(req, res) {
	try {
		const updatedPost = req.body;
		let post = await Post.findById(req.params.id);

		if (!post) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Post not found!' });
		}

		post = await Post.updateOne(
			{ _id: post.id },
			{ $set: updatedPost },
			{ new: true }
		);

		return res.json({ message: 'Post updated!' });
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

/*
 * DELETE /posts/:id to delete a post given its id.
 */
async function deletePost(req, res) {
	try {
		let post = await Post.findById(req.params.id);

		if (!post) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Post not found!' });
		}

		await axios.delete(`https://api.imgur.com/3/image/${post.image_hash}`, {
			headers: {
				Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
			},
		});

		let result = await Post.deleteOne({ _id: post.id });

		return res.json({ message: 'Post successfully deleted!', result });
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json(error);
	}
}

module.exports = {
	createPost,
	deletePost,
	getPost,
	getPosts,
	updatePost,
};
