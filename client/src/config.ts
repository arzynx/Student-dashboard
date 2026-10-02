export const RULES = { branches: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'], semester: { min: 1, max: 8 }, marks: { min: 0, max: 100 }, enrollmentPattern: /^[A-Z]{2,6}-\d{4,8}$/ };
export const emptyStudent = { name: '', enrollmentNumber: '', branch: '', semester: 1, marks: 0 };
