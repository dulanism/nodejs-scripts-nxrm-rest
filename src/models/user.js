class User {
    constructor({ userId, firstName, lastName, emailAddress, password, status, roles }) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailAddress = emailAddress;
        this.password = password;
        this.status = status;
        this.roles = roles;
    }
}

module.exports = {
    User,
};