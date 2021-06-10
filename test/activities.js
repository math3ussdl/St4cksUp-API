process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Activity = require('../src/database/models/activity');
const User = require('../src/database/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const logger = require('../src/config/logger');
const { StatusCodes } = require('http-status-codes');
const { UserFixture } = require('./fixtures/user');
const should = chai.should();

chai.use(chaiHttp);

describe('Activities', () => {
	beforeEach(done => {
		Activity.deleteMany({}, err => {
			if (err) logger.error.bind(err, 'Database Error: ');

			User.deleteMany({}, err => {
				if (err) logger.error.bind(err, 'Database Error: ');
				done();
			});
		});
	});

	/**
	 * Test the GET /activities route
	 */
	describe('GET /activities', () => {
		it('should GET all the activities', done => {
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
									.get('/activities')
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
});
