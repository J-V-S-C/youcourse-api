import { Course } from 'src/domain/ecommerce/enterprise/entities/course';

export class CoursePresenter {
  static toHTTP(course: Course) {
    return {
      id: course.id.toString(),
      name: course.name,
      description: course.description,
      price: course.price,
      visible: course.visible,
      sellable: course.sellable,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
