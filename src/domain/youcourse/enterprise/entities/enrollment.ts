import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";

export interface EnrollmentProps {
  studentId: UniqueEntityID;
  courseId: UniqueEntityID;
  enrolledAt: Date;
}

export class Enrollment extends Entity<EnrollmentProps> {
  get courseId() {
    return this.props.courseId;
  }
  get studentId() {
    return this.props.studentId;
  }
  get enrolledAt() {
    return this.props.enrolledAt;
  }

  static create(
    props: Optional<EnrollmentProps, 'enrolledAt'>,
    id?: UniqueEntityID,
  ) {
    return new Enrollment(
      {
        ...props,
        enrolledAt: props.enrolledAt ?? new Date(),
      },
      id,
    );
  }
}
