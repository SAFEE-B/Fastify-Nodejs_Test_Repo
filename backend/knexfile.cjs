// knexfile.cjs
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './production.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  }
}; 