const request = require('superagent');
const { user, password, rolesEndpoint, usersEndpoint } = require('./env.js');
const { Role } = require('../models/role.js');

const createRole = (role) => request.post(rolesEndpoint).auth(user, password).send(new Role(role));

// Example of a user service
// const createUser = (user) => request.post(usersEndpoint).auth(user, password).send(new User(user));

module.exports = {
  createRole,
  // createUser
};
