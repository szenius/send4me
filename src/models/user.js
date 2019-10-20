class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username || user.first_name;
  }

  getId() {
    return this.id;
  }

  getUsername() {
    return this.username;
  }
}

module.exports = {
  User
};
