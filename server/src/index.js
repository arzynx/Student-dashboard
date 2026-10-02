import 'dotenv/config'; import { resolve } from 'node:path'; import { createDatabase } from './db.js'; import { createApp } from './app.js';
const db = await createDatabase(); const app = createApp(db, { staticDir: resolve(process.cwd(), '../client/dist') }); const port = Number(process.env.PORT || 3001);
const server = app.listen(port, () => console.log(`Student API listening on http://localhost:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { server.close(); await db.close(); process.exit(0); });
