import { RULES, SORT_FIELDS } from '../config/rules.js';
import { AppError } from '../errors.js';

const allowed = ['name', 'enrollmentNumber', 'branch', 'semester', 'marks'];
export function validateStudent(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new AppError(400, 'A student object is required');
  const unexpected = Object.keys(payload).filter(key => !allowed.includes(key));
  const errors = {};
  if (unexpected.length) errors.request = 'Request contains unsupported fields';
  const name = typeof payload.name === 'string' ? payload.name.trim().replace(/\s+/g, ' ') : '';
  const enrollmentNumber = typeof payload.enrollmentNumber === 'string' ? payload.enrollmentNumber.trim().toUpperCase() : '';
  const branch = typeof payload.branch === 'string' ? payload.branch.trim().toUpperCase() : '';
  const semester = Number(payload.semester); const marks = Number(payload.marks);
  if (name.length < 2 || name.length > 100) errors.name = 'Name must be between 2 and 100 characters';
  if (!RULES.enrollmentPattern.test(enrollmentNumber)) errors.enrollmentNumber = RULES.enrollmentHint;
  if (!RULES.branches.includes(branch)) errors.branch = 'Select a supported branch';
  if (!Number.isInteger(semester) || semester < RULES.semester.min || semester > RULES.semester.max) errors.semester = `Semester must be ${RULES.semester.min}–${RULES.semester.max}`;
  if (!Number.isFinite(marks) || marks < RULES.marks.min || marks > RULES.marks.max) errors.marks = `Marks must be ${RULES.marks.min}–${RULES.marks.max}`;
  if (Object.keys(errors).length) throw new AppError(400, 'Please correct the highlighted fields', errors);
  return { name, enrollmentNumber, branch, semester, marks };
}
export function parseListQuery(query) {
  const { search = '', branch, semester, minMarks, maxMarks, sort = RULES.defaultSort, order = RULES.defaultOrder } = query;
  if (typeof search !== 'string' || search.length > 100) throw new AppError(400, 'Invalid search query');
  if (branch && !RULES.branches.includes(String(branch).toUpperCase())) throw new AppError(400, 'Invalid branch filter');
  if (semester && (!Number.isInteger(Number(semester)) || Number(semester) < 1 || Number(semester) > 8)) throw new AppError(400, 'Invalid semester filter');
  if (minMarks !== undefined && (!Number.isFinite(Number(minMarks)) || Number(minMarks) < 0 || Number(minMarks) > 100)) throw new AppError(400, 'Invalid minimum marks');
  if (maxMarks !== undefined && (!Number.isFinite(Number(maxMarks)) || Number(maxMarks) < 0 || Number(maxMarks) > 100)) throw new AppError(400, 'Invalid maximum marks');
  if (!(sort in SORT_FIELDS) || !['asc', 'desc'].includes(String(order).toLowerCase())) throw new AppError(400, 'Invalid sort options');
  return { search: search.trim(), branch: branch?.toUpperCase(), semester: semester && Number(semester), minMarks: minMarks === undefined ? undefined : Number(minMarks), maxMarks: maxMarks === undefined ? undefined : Number(maxMarks), sort, order: String(order).toLowerCase() };
}
