const bcrypt = require('bcrypt');

const plainPassword = process.env.PLAIN_PASSWORD;
const salt = process.env.BCRYPT_SALT;

const hash = bcrypt.hashSync(plainPassword, salt);

const users = [
  {
    username: 'user1',
    password: hash,
    active: true,
  },
  {
    username: 'admin1',
    password: hash,
    active: true,
  },
  {
    username: 'super-admin',
    password: hash,
    active: true,
  },
];

module.exports = users;
