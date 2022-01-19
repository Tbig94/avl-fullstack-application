const bcrypt = require('bcrypt');

async function hashPasswowrd(password) {
  const salt = process.env.BCRYPT_SALT;
  return await bcrypt.hash(password, salt);
}

module.exports = hashPasswowrd;
