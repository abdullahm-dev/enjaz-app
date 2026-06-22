import Database from 'better-sqlite3';
const db = new Database(':memory:');
db.exec('CREATE TABLE test (amount REAL);');
const res = db.prepare('SELECT SUM(amount) as sum FROM test').get();
console.log(res);
