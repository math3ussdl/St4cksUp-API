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

describe('Users', () => {
	beforeEach(done => {
		User.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');
			done();
		});
	});

	/*
	 * Test the GET /users route
	 */
	describe('GET /users', () => {
		it('it should GET all the users', done => {
			chai
				.request(server)
				.get('/users')
				.end((err, res) => {
					if (err) logger.error.bind(err, 'Request Error: ');

					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(0);

					done();
				});
		});
	});

	/*
	 * Test the POST /users route
	 */
	describe('POST /users', () => {
		it('should not POST a user without email field', done => {
			let user = {
				name: 'John Doe',
				username: 'doe_-_john',
				password: '123456789',
				stack: [
					{
						image: 'url',
						name: 'Node.JS',
					},
				],
			};

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
			let user = {
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
			};

			chai
				.request(server)
				.post('/users')
				.send(user)
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
	 * Test the GET /users/:id route
	 */
	describe('GET /users/:id', () => {
		it('should GET a user by the given id', done => {
			let user = new User({
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

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.get(`/users/${user.id}`)
					.end((errReq, res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('_id').eql(user.id);

						done();
					});
			});
		});
	});

	/*
	 * Test the PUT /users/:id route
	 */
	describe('PUT /users/:id', () => {
		it('should UPDATE a user given the id', done => {
			let user = new User({
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

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.put(`/users/${user.id}`)
					.send({
						name: 'Bill Doe',
						username: 'doe_-_bill',
						email: 'bill.doe123@gmail.com',
						password: '123456789',
						stack: [
							{
								image: 'url',
								name: 'Node.JS',
							},
						],
					})
					.end((errReq, res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('message').eql('User updated!');

						done();
					});
			});
		});
	});

	/*
	 * Test the DELETE /users/:id route
	 */
	describe('DELETE /users/:id', () => {
		it('should DELETE a user given the id', done => {
			let user = new User({
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

			user.save((err, user) => {
				if (err) logger.error.bind(err, 'Database Error: ');

				chai
					.request(server)
					.delete(`/users/${user.id}`)
					.end((errReq, res) => {
						if (errReq) logger.error.bind(err, 'Request Error: ');

						res.should.have.status(200);
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
