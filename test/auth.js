process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const should = chai.should();

chai.use(chaiHttp);

describe('Auth', () => {
	beforeEach(done => {
		User.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');
			done();
		});
	});

	/*
	 * Test the POST /users/auth route
	 */
	describe('POST /users/auth', () => {
		it('should not POST a auth passing a non existent user', done => {
			let auth = {
				email: 'limab356@gmail.com',
				password: '123456789',
			};

			chai
				.request(server)
				.post('/users/auth')
				.send(auth)
				.end((err, res) => {
					if (err) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(StatusCodes.NOT_FOUND);
					res.body.should.be.a('object');
					res.body.should.have.property('message').eql('User not found!');

					done();
				});
		});

		it('should not POST a auth passing a user not active', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 'url',
						name: 'Node.JS',
					},
				],
			});

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.post('/users/auth')
					.send({ email: user.email, password: user.password })
					.end((errReq, res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						res.should.have.status(StatusCodes.UNAUTHORIZED);
						res.body.should.be.a('object');
						res.body.should.have
							.property('message')
							.eql('Active your account before sign in!');

						done();
					});
			});
		});

		it('should not POST a auth passing a not valid password', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 'url',
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
							.send({ email: user.email, password: 'wrong_password' })
							.end((authErr, authRes) => {
								if (authErr) logger.error.bind(authErr, 'Request Error: ');

								authRes.should.have.status(StatusCodes.UNAUTHORIZED);
								authRes.body.should.be.a('object');
								authRes.body.should.have
									.property('message')
									.eql('Passwords not match!');

								done();
							});
					});
			});
		});

		it('should POST a auth passing a email and password', done => {
			let user = new User({
				name: 'John Doe',
				username: 'doe_-_john',
				email: 'john.doe123@gmail.com',
				password: '123456789',
				location: 'San Francisco, CA',
				stack: [
					{
						image: 'url',
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

								authRes.should.have.status(StatusCodes.OK);
								authRes.body.should.be.a('object');
								authRes.body.should.have.property('user');
								authRes.body.should.have.property('token');

								done();
							});
					});
			});
		});
	});
});
