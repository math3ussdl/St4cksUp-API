process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Activity = require('../src/database/models/activity');
const Request = require('../src/database/models/request');
const Startup = require('../src/database/models/startup');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const { UserFixture, UserFixture2 } = require('./fixtures/user');
const should = chai.should();

chai.use(chaiHttp);

describe('Startups', () => {
	beforeEach(done => {
		Activity.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');

			Request.deleteMany({}, err => {
				if (err) logger.error.bind(err, 'Database Error: ');

				Startup.deleteMany({}, err => {
					if (err) logger.error.bind(err, 'Database Error: ');

					User.deleteMany({}, err => {
						if (err) logger.error.bind(err, 'Database Error: ');
						done();
					});
				});
			});
		});
	});

	/**
	 * Test the GET /startups route
	 */
	describe('GET /startups', () => {
		it('should GET all the startups', done => {
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
									.get('/startups')
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

	/**
	 * Test the POST /startups route
	 */
	describe('POST /startups', () => {
		it('should POST a startup passing all data correctly', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.CREATED);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Startup successfully created!');

										done();
									});
							});
					});
			});
		});
	});

	/**
	 * Test the GET /startups/:id route
	 */
	describe('GET /startups/:id', () => {
		it('should not GET a startup given a not valid id', done => {
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
									.get(`/startups/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.INTERNAL_SERVER_ERROR);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql(
												`Cast to ObjectId failed for value \"${_id}\" at path \"_id\" for model \"startup\"`
											);

										done();
									});
							});
					});
			});
		});

		it('should not GET a startup given a non existent startup id', done => {
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
									.put(`/startups/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Startup not found!');

										done();
									});
							});
					});
			});
		});

		it('should GET a startup by the given id', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, startup) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.get(`/startups/${startup.body.startup._id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('_id')
													.eql(startup.body.startup._id);

												done();
											});
									});
							});
					});
			});
		});
	});

	/**
	 * Test the PUT /startups/:id route
	 */
	describe('PUT /startups/:id', () => {
		it('should not PUT a startup given a not valid id', done => {
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
									.put(`/startups/${_id}`)
									.send({
										name: 'RocketSpace',
										description: 'A Startup that develops agile softwares!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, res) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.INTERNAL_SERVER_ERROR);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql(
												`Cast to ObjectId failed for value \"${_id}\" at path \"_id\" for model \"startup\"`
											);

										done();
									});
							});
					});
			});
		});

		it('should not PUT a startup given a non existent startup id', done => {
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
									.put(`/startups/${_id}`)
									.set('x-access-token', authRes.body.token)
									.send({
										name: 'RocketSpace',
										description: 'A Startup that develops agile softwares!',
									})
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Startup not found!');

										done();
									});
							});
					});
			});
		});

		it('should PUT a startup by the given id', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, startup) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.put(`/startups/${startup.body.startup._id}`)
											.send({
												name: 'RocketSpace',
												description: 'A Startup that develops agile softwares!',
											})
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql('Startup updated!');

												done();
											});
									});
							});
					});
			});
		});
	});

	/**
	 * Test the DELETE /startups/:id route
	 */
	describe('DELETE /startups/:id', () => {
		it('should not DELETE a startup given a not valid id', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, _startup) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.delete(`/startups/${_id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(
													StatusCodes.INTERNAL_SERVER_ERROR
												);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql(
														`Cast to ObjectId failed for value \"${_id}\" at path \"_id\" for model \"startup\"`
													);

												done();
											});
									});
							});
					});
			});
		});

		it('should not DELETE a startup given a non existent startup id', done => {
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
									.delete(`/startups/${_id}`)
									.set('x-access-token', authRes.body.token)
									.end((errReq, res) => {
										if (errReq) logger.error.bind(err, 'Request Error: ');

										res.should.have.status(StatusCodes.NOT_FOUND);
										res.body.should.be.a('object');
										res.body.should.have
											.property('message')
											.eql('Startup not found!');

										done();
									});
							});
					});
			});
		});

		it('should DELETE a startup by the given id', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, startup) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.delete(`/startups/${startup.body.startup._id}`)
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql('Startup successfully deleted!');

												done();
											});
									});
							});
					});
			});
		});
	});

	/**
	 * Test the PUT /startups/:id/members/add route
	 */
	describe('PUT startups/:id/members/add', () => {
		it('should PUT a startup by the given id adding a member', done => {
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
									.post('/startups')
									.send({
										name: 'RocketSpeed',
										description: 'A Startup that develops agile softwares!!',
									})
									.set('x-access-token', authRes.body.token)
									.end((err, startup) => {
										if (err) logger.error.bind(err, 'Request Error: ');

										chai
											.request(server)
											.put(`/startups/${startup.body.startup._id}/members/add`)
											.send({
												emails: ['bdoe123@gmail.com'],
											})
											.set('x-access-token', authRes.body.token)
											.end((err, res) => {
												if (err) logger.error.bind(err, 'Request Error: ');

												res.should.have.status(StatusCodes.OK);
												res.body.should.be.a('object');
												res.body.should.have
													.property('message')
													.eql('Members Invited!');

												done();
											});
									});
							});
					});
			});
		});
	});

	/**
	 * Test the PUT /startups/:id/members/remove route
	 */
	describe('PUT startups/:id/members/remove', () => {
		it('should PUT a startup by the given id removing a member', done => {
			let user = new User(UserFixture);
			var user2 = new User(UserFixture2);

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/active/${user._id}`)
					.end((errReq, _res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						user2.save((err, resUser2) => {
							if (err) logger.error.bind(err, 'Database Error: ');

							chai
								.request(server)
								.put(`/users/active/${resUser2._id}`)
								.end((errReq, _res) => {
									if (errReq) logger.error.bind(err, 'Request Error: ');

									chai
										.request(server)
										.post('/users/auth')
										.send({ email: user.email, password: '123456789' })
										.end((authErr, authRes) => {
											if (authErr)
												logger.error.bind(authErr, 'Request Error: ');

											chai
												.request(server)
												.post('/users/auth')
												.send({ email: user2.email, password: '12345678' })
												.end((authErr2, authRes2) => {
													if (authErr2)
														logger.error.bind(authErr2, 'Request Error: ');

													chai
														.request(server)
														.post('/startups')
														.send({
															name: 'RocketSpeed',
															description:
																'A Startup that develops agile softwares!!',
														})
														.set('x-access-token', authRes.body.token)
														.end((err, startup) => {
															if (err)
																logger.error.bind(err, 'Request Error: ');

															chai
																.request(server)
																.put(
																	`/startups/${startup.body.startup._id}/members/add`
																)
																.send({
																	emails: ['mary.doe@gmail.com'],
																})
																.set('x-access-token', authRes.body.token)
																.end(async (err, _addResponse) => {
																	if (err)
																		logger.error.bind(err, 'Request Error: ');

																	const requestId = await Request.findOne({
																		startupId: startup._id,
																	});

																	chai
																		.request(server)
																		.delete(
																			`/users/request/${requestId}/accepts`
																		)
																		.set('x-access-token', authRes2.body.token)
																		.end((err, _) => {
																			if (err)
																				logger.error.bind(
																					err,
																					'Request Error: '
																				);

																			chai
																				.request(server)
																				.put(
																					`/startups/${startup.body.startup._id}/members/remove`
																				)
																				.set(
																					'x-access-token',
																					authRes.body.token
																				)
																				.send({
																					emails: ['mary.doe@gmail.com'],
																				})
																				.end((err, res) => {
																					if (err)
																						logger.error.bind(
																							err,
																							'Request Error: '
																						);

																					res.should.have.status(
																						StatusCodes.OK
																					);
																					res.body.should.be.a('object');
																					res.body.should.have
																						.property('message')
																						.eql('Member removed!');
																					done();
																				});
																		});
																});
														});
												});
										});
								});
						});
					});
			});
		});
	});
});
