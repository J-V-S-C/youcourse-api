import { Course } from '../../enterprise/entities/course';
import { CourseMetrics } from '../../enterprise/entities/course-metrics';

export interface CourseWithMetrics {
  course: Course;
  metrics: CourseMetrics;
  score: number;
}
