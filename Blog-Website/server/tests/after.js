import { disconnectDB } from './helpers/db.js';

// Run once after all tests are complete
after(async () => {
  await disconnectDB();
});
