export type Student = { id: number; name: string; enrollmentNumber: string; branch: string; semester: number; marks: number; createdAt: string; updatedAt: string };
export type Activity = { id:number; action:'created'|'updated'|'deleted'|'restored'; studentId:number; studentName:string; enrollmentNumber:string; summary:string; createdAt:string };
export type Insights = { total:number; averageMarks:number|null; highestMarks:number|null; lowestMarks:number|null; branchCounts:{branch:string;count:number}[]; marksDistribution:{range:string;count:number}[] };
export type StudentInput = Omit<Student, 'id'|'createdAt'|'updatedAt'>;
