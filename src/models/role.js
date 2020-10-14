class Role {
  constructor({ id, name, description, privileges }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.privileges = privileges;
  }
}

module.exports = {
  Role,
};
