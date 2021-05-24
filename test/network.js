process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Activity = require('../src/database/models/activity');
const Request = require('../src/database/models/request');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const should = chai.should();

chai.use(chaiHttp);

describe.only('Networks', () => {
	beforeEach(done => {
		Activity.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');

			Request.deleteMany({}, err => {
				if (err) logger.error.bind(err, 'Database Error: ');

				User.deleteMany({}, err => {
					if (err) logger.error.bind(err, 'Database Error: ');
					done();
				});
			});
		});
	});

	/**
	 * Test the POST /users/request route
	 */
	describe('POST /users/request', () => {
		it('should POST a request and requests a user to join in our network connection', () => {
			let user1 = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				stack: [
					{
						image: 'url',
						name: 'Node.JS',
					},
				],
			});

			user1.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				let user2 = new User({
					name: 'Mary Doe',
					username: 'maryd234_-_1',
					email: 'mary.doe@gmail.com',
					password: '12345678',
					stack: [
						{
							image: 'url',
							name: 'Node.JS',
						},
						{
							image: 'url',
							name: 'React.JS',
						},
					],
				});

				user2.save((err, user2) => {
					if (err) logger.error.bind(err, 'Database Error: ');

					chai
						.request(server)
						.put(`/users/active/${user._id}`)
						.end((errReq, _res) => {
							if (errReq) logger.error.bind(err, 'Request Error: ');

							chai
								.request(server)
								.put(`/users/active/${user2._id}`)
								.end((errReq2, _res) => {
									if (errReq2) logger.error.bind(err, 'Request Error: ');

									chai
										.request(server)
										.post('/users/auth')
										.send({ email: user.email, password: '123456789' })
										.end((authErr, authRes) => {
											if (authErr)
												logger.error.bind(authErr, 'Request Error: ');

											chai
												.request(server)
												.post('/users/request')
												.set('x-connection-type', 'CONNECTION@REQ')
												.set('x-access-token', authRes.body.token)
												.set('x-target-id', user2._id)
												.end((err, res) => {
													if (err) logger.error.bind(err, 'Request Error: ');

													// Test here!
													res.should.have.status(StatusCodes.CREATED);
													res.body.should.be.a('object');
													res.body.should.have
														.property('message')
														.eql('Request successfully created!');
													res.body.should.have.property('request');

													done();
												});
										});
								});
						});
				});
			});
		});
	});

	/**
	 * Test the DELETE /users/request/:id/accepts route
	 */
	describe('DELETE /users/request/:id/accepts', () => {
		it('should DELETE a request and add a user in our network connection', () => {
			let user1 = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				stack: [
					{
						image: 'url',
						name: 'Node.JS',
					},
				],
			});

			user1.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				let user2 = new User({
					name: 'Mary Doe',
					username: 'maryd234_-_1',
					email: 'mary.doe@gmail.com',
					password: '12345678',
					stack: [
						{
							image: 'url',
							name: 'Node.JS',
						},
						{
							image: 'url',
							name: 'React.JS',
						},
					],
				});

				user2.save((err, user2) => {
					if (err) logger.error.bind(err, 'Database Error: ');

					chai
						.request(server)
						.put(`/users/active/${user._id}`)
						.end((errReq, _res) => {
							if (errReq) logger.error.bind(err, 'Request Error: ');

							chai
								.request(server)
								.put(`/users/active/${user2._id}`)
								.end((errReq2, _res) => {
									if (errReq2) logger.error.bind(err, 'Request Error: ');

									chai
										.request(server)
										.post('/users/auth')
										.send({ email: user.email, password: '123456789' })
										.end((authErr, authRes) => {
											if (authErr)
												logger.error.bind(authErr, 'Request Error: ');

											chai
												.request(server)
												.post('/users/request')
												.set('x-connection-type', 'CONNECTION@REQ')
												.set('x-access-token', authRes.body.token)
												.set('x-target-id', user2._id)
												.end((err, requestRes) => {
													if (err) logger.error.bind(err, 'Request Error: ');

													chai
														.request(server)
														.delete(`/users/request/${requestRes._id}/accepts`)
														.set('x-access-token', authRes.body.token)
														.end((err, res) => {
															if (err)
																logger.error.bind(err, 'Request Error: ');

															res.should.have.status(StatusCodes.OK);
															res.body.should.be.a('object');
															res.body.should.have
																.property('message')
																.eql('Request successfully accepted!');

															done();

															// Resolves this error!!!
														});
												});
										});
								});
						});
				});
			});
		});
	});

	/**
	 * Test the DELETE /users/request/:id/rejects route
	 */
	// describe('DELETE /users/request/:id/rejects', () => {});
});
