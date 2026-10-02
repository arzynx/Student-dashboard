import { SORT_FIELDS } from '../config/rules.js';

const mapStudent = row => row && ({ id: row.id, name: row.name, enrollmentNumber: row.enrollment_number, branch: row.branch, semester: row.semester, marks: row.marks, createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at });
export function studentRepository(db) {
  const activeById = async id => mapStudent(await db.get('SELECT * FROM students WHERE id = ? AND deleted_at IS NULL', [id]));
  const activity = async (action, student, summary) => db.run('INSERT INTO activity_log (action, student_id, student_name, enrollment_number, summary, snapshot) VALUES (?, ?, ?, ?, ?, ?)', [action, student.id, student.name, student.enrollmentNumber, summary, JSON.stringify(student)]);
  return {
    async list(query) {
      const clauses = ['deleted_at IS NULL']; const params = [];
      if (query.search) { clauses.push('(name LIKE ? COLLATE NOCASE OR enrollment_number LIKE ? COLLATE NOCASE OR branch LIKE ? COLLATE NOCASE)'); const term = `%${query.search}%`; params.push(term, term, term); }
      if (query.branch) { clauses.push('branch = ?'); params.push(query.branch); }
      if (query.semester) { clauses.push('semester = ?'); params.push(query.semester); }
      if (query.minMarks !== undefined) { clauses.push('marks >= ?'); params.push(query.minMarks); }
      if (query.maxMarks !== undefined) { clauses.push('marks <= ?'); params.push(query.maxMarks); }
      const rows = await db.all(`SELECT * FROM students WHERE ${clauses.join(' AND ')} ORDER BY ${SORT_FIELDS[query.sort]} ${query.order.toUpperCase()}, id DESC`, params);
      return rows.map(mapStudent);
    },
    activeById,
    async create(input) {
      const stamp = new Date().toISOString(); const result = await db.run('INSERT INTO students (name, enrollment_number, branch, semester, marks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [input.name, input.enrollmentNumber, input.branch, input.semester, input.marks, stamp, stamp]);
      const student = await activeById(result.lastID); await activity('created', student, 'Student record created'); return student;
    },
    async update(id, input) {
      const before = await activeById(id); if (!before) return null;
      const stamp = new Date().toISOString(); await db.run('UPDATE students SET name=?, enrollment_number=?, branch=?, semester=?, marks=?, updated_at=? WHERE id=?', [input.name, input.enrollmentNumber, input.branch, input.semester, input.marks, stamp, id]);
      const student = await activeById(id); const fields = Object.keys(input).filter(key => before[key] !== student[key]); await activity('updated', student, fields.length ? `Updated ${fields.join(', ')}` : 'Saved without changes'); return student;
    },
    async remove(id) { const student = await activeById(id); if (!student) return null; await db.run('UPDATE students SET deleted_at=?, updated_at=? WHERE id=?', [new Date().toISOString(), new Date().toISOString(), id]); await activity('deleted', student, 'Student record moved to trash'); return student; },
    async restore(id) { const row = await db.get('SELECT * FROM students WHERE id = ? AND deleted_at IS NOT NULL', [id]); if (!row) return null; await db.run('UPDATE students SET deleted_at=NULL, updated_at=? WHERE id=?', [new Date().toISOString(), id]); const student = await activeById(id); await activity('restored', student, 'Student record restored'); return student; },
    async insights() { const totals = await db.get('SELECT COUNT(*) AS total, AVG(marks) AS averageMarks, MAX(marks) AS highestMarks, MIN(marks) AS lowestMarks FROM students WHERE deleted_at IS NULL'); const branches = await db.all('SELECT branch, COUNT(*) AS count FROM students WHERE deleted_at IS NULL GROUP BY branch ORDER BY branch'); const distribution = await db.all(`SELECT CASE WHEN marks < 40 THEN '0–39' WHEN marks < 60 THEN '40–59' WHEN marks < 75 THEN '60–74' WHEN marks < 90 THEN '75–89' ELSE '90–100' END AS range, COUNT(*) AS count FROM students WHERE deleted_at IS NULL GROUP BY range ORDER BY MIN(marks)`); return { ...totals, averageMarks: totals.averageMarks ? Number(totals.averageMarks.toFixed(1)) : null, branchCounts: branches, marksDistribution: distribution }; },
    async activity(action) { const rows = await db.all(`SELECT * FROM activity_log ${action ? 'WHERE action = ?' : ''} ORDER BY created_at DESC, id DESC LIMIT 100`, action ? [action] : []); return rows.map(row => ({ id: row.id, action: row.action, studentId: row.student_id, studentName: row.student_name, enrollmentNumber: row.enrollment_number, summary: row.summary, createdAt: row.created_at })); }
  };
}
