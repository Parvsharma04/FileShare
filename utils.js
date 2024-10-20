const User = require('./models/users')

async function checkDb(username, password) {
  const exists = await User.find({
    username: username,
    password: password,
  });
  return exists
}

module.exports = checkDb
