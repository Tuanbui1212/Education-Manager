export interface IClassRequest {
  _id: string;
  creatorId: string;
  name: string;
  courseId: string;
  teacherId: string;
  roomId?: string;
  startDate?: Date;
  totalLessons: number;
  maxNumberOfStudents: number;
  lessonsPerWeek: number;
  optionalRequirements?: string[];
}
