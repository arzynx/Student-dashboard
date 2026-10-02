import express from 'express'; import cors from 'cors'; import { existsSync } from 'node:fs';
import { RULES } from './config/rules.js'; import { errorHandler, AppError, notFound } from './errors.js'; import { validateStudent, parseListQuery } from './validation/student.js'; import { studentRepository } from './repositories/students.js';
export function createApp(db, { staticDir } = {}) {
  const app = express(); const students = studentRepository(db);
  app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true })); app.use(express.json({ limit: '20kb' }));
  app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } })); app.get('/api/config', (_req, res) => res.json({ data: RULES }));
  app.get('/api/students', async (req, res) => res.json({ data: await students.list(parseListQuery(req.query)) }));
  app.get('/api/students/:id', async (req, res) => { const student = await students.activeById(Number(req.params.id)); if (!student) throw notFound(); res.json({ data: student }); });
  app.post('/api/students', async (req, res) => res.status(201).json({ data: await students.create(validateStudent(req.body)) }));
  app.put('/api/students/:id', async (req, res) => { const student = await students.update(Number(req.params.id), validateStudent(req.body)); if (!student) throw notFound(); res.json({ data: student }); });
  app.delete('/api/students/:id', async (req, res) => { const student = await students.remove(Number(req.params.id)); if (!student) throw notFound(); res.status(200).json({ data: student }); });
  app.post('/api/students/:id/restore', async (req, res) => { const student = await students.restore(Number(req.params.id)); if (!student) throw new AppError(404, 'Deleted student not found'); res.json({ data: student }); });
  app.get('/api/insights', async (_req, res) => res.json({ data: await students.insights() }));
  app.get('/api/activity', async (req, res) => { const action = req.query.action; if (action && !['created', 'updated', 'deleted', 'restored'].includes(action)) throw new AppError(400, 'Invalid activity filter'); res.json({ data: await students.activity(action) }); });
  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.use((req, res, next) => req.method === 'GET' && req.accepts('html') ? res.sendFile('index.html', { root: staticDir }) : next());
  }
  app.use((_req, _res, next) => next(new AppError(404, 'Endpoint not found'))); app.use(errorHandler); return app;
}
