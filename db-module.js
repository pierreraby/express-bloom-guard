import { createClient } from '@libsql/client';
import EventEmitter from 'events';

const db = createClient({ url: "file:./db/my-database.db" });

// Create the table
await db.batch(
    [
        "CREATE TABLE IF NOT EXISTS previous (id INTEGER PRIMARY KEY AUTOINCREMENT, claim TEXT NOT NULL UNIQUE)",
        "CREATE TABLE IF NOT EXISTS current (id INTEGER PRIMARY KEY AUTOINCREMENT, claim TEXT NOT NULL UNIQUE)",
        "CREATE TABLE IF NOT EXISTS next (id INTEGER PRIMARY KEY AUTOINCREMENT, claim TEXT NOT NULL UNIQUE)"
    ],
    "write",
);

// Insert into SQLite
async function insertIntoDatabase(claim) {
  try {
      await db.batch(
          [
            {
                sql:'INSERT INTO current (claim) VALUES (?)',
                args: [claim],
            },
            {
                sql:'INSERT INTO next (claim) VALUES (?)',
                args: [claim],
            },
              
              
          ],
          'write',
      );
  } catch (err) {
      if (err.message.includes('UNIQUE constraint')) {
          console.log(`CLAIM ${claim} already exists in the database.`);
      } else {
          console.error('Database error:', err);
      }
  }
}

const eventEmitter = new EventEmitter(); // Event system

// Event listener to process a single claim
eventEmitter.on('addToDatabase', async (claim) => {
  await insertIntoDatabase(claim);
});

export { eventEmitter };