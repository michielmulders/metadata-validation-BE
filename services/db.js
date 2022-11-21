// @Docs main: https://github.com/WiseLibs/better-sqlite3
// @Docs API: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options
const Database = require('better-sqlite3');

const dbName = process.env.ENVIRONMENT === "test" ? "testnfts.db" : "nfts.db";
const db = new Database(dbName);

function query(sql, params) {
  return db.prepare(sql).all(params);
}

function run(sql, params) {
  return db.prepare(sql).run(params);
}

function exec(sql) {
  return db.exec(sql);
}

/* SQL Commands */
const createTableCollections = "CREATE TABLE collections (id INTEGER PRIMARY KEY AUTOINCREMENT, nft_id VARCHAR(30) NOT NULL UNIQUE, token_id VARCHAR(15) NOT NULL, serial VARCHAR(7) NOT NULL, is_conform NUMBER(1) NOT NULL, network VARCHAR(7), metadata text NOT NULL, errors text NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);";
const dropTableCollections = "DROP TABLE collections;";

module.exports = {
  query,
  run,
  exec,

  createTableCollections,
  dropTableCollections
}