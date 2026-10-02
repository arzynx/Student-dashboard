import 'dotenv/config';
import { createDatabase } from './db.js';
import { studentRepository } from './repositories/students.js';
const db = await createDatabase(); const students = studentRepository(db);
const existing = await students.list({ search:'', sort:'name', order:'asc' });
if (existing.length) console.log('Database already contains students; skipped seed.');
else {
  const demo = [
    ['Aarav Mehta','CSE-2024001','CSE',3,88], ['Nisha Patel','IT-2024002','IT',5,76], ['Rohan Kapoor','ECE-2024003','ECE',2,91], ['Ishita Shah','EEE-2024004','EEE',7,69], ['Kabir Singh','ME-2024005','ME',4,82], ['Diya Nair','CE-2024006','CE',6,58]
  ];
  for (const [name,enrollmentNumber,branch,semester,marks] of demo) await students.create({ name,enrollmentNumber,branch,semester,marks });
  console.log(`Seeded ${demo.length} student records.`);
}
await db.close();
