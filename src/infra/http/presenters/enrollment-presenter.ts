import { Enrollment } from "src/domain/youcourse/enterprise/entities/enrollment";

export class EnrollmentPresenter {
  static toHTTP(enrollment: Enrollment) {
    return {
      id: enrollment.id.toString(),
      courseId: enrollment.courseId.toString(),
      studentId: enrollment.studentId.toString(),
      enrolledAt: enrollment.enrolledAt
    };
  }
}
