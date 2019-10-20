class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username || user.first_name;
  }

  getId = () => this.id;
  getUsername = () => this.username;
}
