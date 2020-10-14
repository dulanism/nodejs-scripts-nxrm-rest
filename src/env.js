module.exports = {
  rolesEndpoint:
    process.env.ROLES_ENDPOINT || 'http://localhost:8081/service/rest/v1/security/roles',
  //usersEndpoint: process.env.USERS_ENDPOINT || 'http://localhost:8081/service/rest/v1/security/users',
  user: 'admin',
  password: 'popsicle',
};
