process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const { UserFixture, UserFixtureWithoutEmail } = require('./fixtures/user');
const should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
	beforeEach(done => {
		User.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');
			done();
		});
	});

	/*
	 * Test the POST /users route
	 */
	describe('POST /users', () => {
		it('should not POST a user without email field', done => {
			let user = UserFixtureWithoutEmail;

			chai
				.request(server)
				.post('/users')
				.send(user)
				.end((err, res) => {
					if (err) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(StatusCodes.BAD_REQUEST);
					res.body.should.be.a('object');
					res.body.should.have.property('errors');
					res.body.errors.should.have.property('email');

					done();
				});
		});

		it('should POST a user', done => {
			chai
				.request(server)
				.post('/users')
				.send(UserFixture)
				.end((err, res) => {
					if (err) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(StatusCodes.CREATED);
					res.body.should.be.a('object');
					res.body.should.have
						.property('message')
						.eql('User successfully created!');
					res.body.should.have.property('user');
					res.body.user.should.be.a('object');

					done();
				});
		});
	});

	/*
	 * Test the GET /users route
	 */
	describe('GET /users', () => {
		it('it should GET all the users', done => {
			let user = new User(UserFixture);

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
									.get('/users')
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
	 * Test the GET /users/:id route
	 */
	describe('GET /users/:id', () => {
		it('should not GET a user given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User(UserFixture);

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
									.put(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

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

		it('should not GET a user given a non existent user id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User(UserFixture);

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
									.put(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('User not found!');

										done();
									});
							});
					});
			});
		});

		it('should GET a user by the given id', done => {
			let user = new User(UserFixture);

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
									.get(`/users/${user.id}`)
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.OK);
										res.body.should.be.a('object');
										res.body.should.have.property('_id').eql(user.id);

										done();
									});
							});
					});
			});
		});
	});

	/*
	 * Test the PUT /users/active/:id route
	 */
	describe('PUT /users/active/:id', () => {
		it('should not ACTIVATE a user given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			chai
				.request(server)
				.put(`/users/active/${_id}`)
				.end((errReq, res) => {
					if (errReq) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(StatusCodes.BAD_REQUEST);
					res.body.should.be.a('object');
					res.body.should.have.property('value').eql(_id);
					res.body.should.have.property('path').eql('_id');
					res.body.should.have.property('name').eql('CastError');

					done();
				});
		});

		it('should not ACTIVATE a user given a non existent user id', done => {
			const _id = '609d7a245121582eccba6d85';

			chai
				.request(server)
				.put(`/users/active/${_id}`)
				.end((errReq, res) => {
					if (errReq) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(StatusCodes.NOT_FOUND);
					res.body.should.be.a('object');
					res.body.should.have.property('message').eql('User not found!');

					done();
				});
		});

		it('should ACTIVATE a user given the id', done => {
			let user = new User(UserFixture);

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						res.should.have.status(StatusCodes.OK);
						res.body.should.be.a('object');
						res.body.should.have.property('message').eql('User activated!');

						done();
					});
			});
		});
	});

	/*
	 * Test the POST /users/invite route
	 */
	describe('POST /users/invite', () => {
		it('should INVITE a users given your emails', done => {
			let user = new User(UserFixture);

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
									.post('/users/invite')
									.set('x-access-token', authRes.body.token)
									.send({
										emails: [
											'jamesfernandes@gmail.com',
											'rayssa.lima@gmail.com',
										],
									})
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.OK);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('All emails notified!');

										done();
									});
							});
					});
			});
		});
	});

	/*
	 * Test the PUT /users/:id route
	 */
	describe('PUT /users/:id', () => {
		it('should not UPDATE a user given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User(UserFixture);

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
									.put(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.send({
										name: 'Bill Doe',
										username: 'doe_-_bill',
										email: 'bill.doe123@gmail.com',
										password: '123456789',
										location: 'San Francisco, CA',
										stack: [
											{
												image: 15897,
												name: 'Node.JS',
											},
										],
									})
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

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

		it('should not UPDATE a user given a non existent user id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User(UserFixture);

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
									.put(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.send({
										name: 'Bill Doe',
										username: 'doe_-_bill',
										email: 'bill.doe123@gmail.com',
										password: '123456789',
										location: 'San Francisco, CA',
										stack: [
											{
												image: 15897,
												name: 'Node.JS',
											},
										],
									})
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('User not found!');

										done();
									});
							});
					});
			});
		});

		it('should UPDATE a user given the id', done => {
			let user = new User(UserFixture);

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
									.put(`/users/${user.id}`)
									.set('x-access-token', authRes.body.token)
									.send({
										name: 'Bill Doe',
										username: 'doe_-_bill',
										email: 'bill.doe123@gmail.com',
										password: '123456789',
										location: 'San Francisco, CA',
										stack: [
											{
												image: 15897,
												name: 'Node.JS',
											},
										],
									})
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.OK);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('User updated!');

										done();
									});
							});
					});
			});
		});
	});

	/*
	 * Test the DELETE /users/:id route
	 */
	describe('DELETE /users/:id', () => {
		it('should not DELETE a user given a not valid id', done => {
			const _id = '609d7a245121582eccba6d';

			let user = new User(UserFixture);

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
									.delete(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

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

		it('should not DELETE a user given a non existent user id', done => {
			const _id = '609d7a245121582eccba6d85';

			let user = new User(UserFixture);

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
									.delete(`/users/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('User not found!');

										done();
									});
							});
					});
			});
		});

		it('should DELETE a user given the id', done => {
			let user = new User(UserFixture);

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
									.delete(`/users/${user.id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.OK);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('User successfully deleted!');
										res.body.result.should.have.property('ok').eql(1);
										res.body.result.should.have.property('n').eql(1);

										done();
									});
							});
					});
			});
		});
	});
});
