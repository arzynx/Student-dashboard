export const RULES = Object.freeze({
  branches: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'],
  semester: { min: 1, max: 8 },
  marks: { min: 0, max: 100 },
  enrollmentPattern: /^[A-Z]{2,6}-\d{4,8}$/,
  enrollmentHint: 'Use 2–6 uppercase letters, a hyphen, and 4–8 digits (for example, CSE-2024001).',
  defaultSort: 'updatedAt',
  defaultOrder: 'desc',
  pageSize: 20
});

export const SORT_FIELDS = Object.freeze({
  name: 'name', enrollmentNumber: 'enrollment_number', branch: 'branch',
  semester: 'semester', marks: 'marks', updatedAt: 'updated_at'
});
