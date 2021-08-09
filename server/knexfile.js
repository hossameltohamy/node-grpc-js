const path = require('path');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      user: '',
      password: '',
      port: '5432',
      database: 'arwa',
    },
    pool: {
      min: 2,
      max: 10,
      propagateCreateError: false // <- default is true, set to false

    },
    migrations: {
      directory: path.join(__dirname, 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds'),
    },
  },
};