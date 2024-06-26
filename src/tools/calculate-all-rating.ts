import { initDb } from '../backend/services/db.js';
import 'reflect-metadata';

(async () => {
  await initDb();
  (await import('./calculate-all-rating.worker')).default();
})();
