const UserFixture = {
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
};

const UserFixtureWithoutEmail = {
	name: 'John Doe',
	username: 'doe_-_john',
	password: '123456789',
	location: 'San Francisco, CA',
	stack: [
		{
			image: 15897,
			name: 'Node.JS',
		},
	],
};

const UserFixture2 = {
	name: 'Mary Doe',
	username: 'maryd234_-_1',
	email: 'mary.doe@gmail.com',
	password: '12345678',
	location: 'San Francisco, CA',
	stack: [
		{
			image: 15897,
			name: 'Node.JS',
		},
		{
			image: 15897,
			name: 'React.JS',
		},
	],
};

module.exports = {
	UserFixture,
	UserFixtureWithoutEmail,
	UserFixture2,
};
