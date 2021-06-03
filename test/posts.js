process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Post = require('../src/database/models/post');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const should = chai.should();

chai.use(chaiHttp);

describe('Posts', () => {
	beforeEach(done => {
		Post.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');

			User.deleteMany({}, err => {
				if (err) logger.error.bind(err, 'Database Error: ');
				done();
			});
		});
	});

	/**
	 * Test the GET /posts route
	 */
	describe('GET /posts', () => {
		it('should GET all the posts', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.get('/posts')
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.OK);
										res.body.should.be.a('array');
										done();
									});
							});
					});
			});
		});
	});

	/*
	 * Test the POST /posts route
	 */
	describe('POST /posts', () => {
		it('should POST a post passing all data correctly', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.CREATED);
										res.body.should.be.a('object');
										done();
									});
							});
					});
			});
		});
	});

	/*
	 * Test the GET /posts/:id route
	 */
	describe('GET /posts/:id', () => {
		it('should not GET a post given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.get(`/posts/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.BAD_REQUEST);
										res.body.should.be.a('object');
										res.body.should.have.property('value').eql(_id);
										res.body.should.have.property('path').eql('_id');
										res.body.should.have.property('name').eql('CastError');

										done();
									});
							});
					});
			});
		});

		it('should not GET a post given a non existent post id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.put(`/posts/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Post not found!');

										done();
									});
							});
					});
			});
		});

		it('should GET a post by the given id', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, post) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.get(`/posts/${post.body.post._id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('_id')
													.eql(post.body.post._id);

												done();
											});
									});
							});
					});
			});
		});
	});

	/*
	 * Test the PUT /posts/:id route
	 */
	describe('PUT /posts/:id', () => {
		it('should not PUT a post given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, _post) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.put(`/posts/${_id}`)
											.send({
												image: 'url2',
												image_hash: 'hash2',
												description: 'sample post 2',
											})
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.BAD_REQUEST);
												res.body.should.be.a('object');
												res.body.should.have.property('value').eql(_id);
												res.body.should.have.property('path').eql('_id');
												res.body.should.have.property('name').eql('CastError');

												done();
											});
									});
							});
					});
			});
		});

		it('should not PUT a post given a non existent post id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.put(`/posts/${_id}`)
									.send({
										image: 'url2',
										image_hash: 'hash2',
										description: 'sample post 2',
									})
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Post not found!');

										done();
									});
							});
					});
			});
		});

		it('should PUT a post by the given id', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, post) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.put(`/posts/${post.body.post._id}`)
											.send({
												image: 'url2',
												image_hash: 'hash2',
												description: 'sample post 2',
											})
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql('Post updated!');

												done();
											});
									});
							});
					});
			});
		});
	});

	/*
	 * Test the DELETE /posts/:id route
	 */
	describe('DELETE /posts/:id', () => {
		it('should not DELETE a post given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, _post) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.delete(`/posts/${_id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.BAD_REQUEST);
												res.body.should.be.a('object');
												res.body.should.have.property('value').eql(_id);
												res.body.should.have.property('path').eql('_id');
												res.body.should.have.property('name').eql('CastError');

												done();
											});
									});
							});
					});
			});
		});

		it('should not DELETE a post given a non existent post id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.delete(`/posts/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Post not found!');

										done();
									});
							});
					});
			});
		});

		it('should DELETE a post by the given id', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 15897,
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						chai
							.request(server)
							.post('/users/auth')
							.send({ email: user.email, password: '123456789' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								chai
									.request(server)
									.post('/posts')
									.send({
										image: 'url',
										image_hash: 'hash',
										description: 'sample post',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, post) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.delete(`/posts/${post.body.post._id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql('Post successfully deleted!');

												done();
											});
									});
							});
					});
			});
		});
	});
});
