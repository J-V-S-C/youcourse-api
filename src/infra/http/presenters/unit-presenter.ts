import { Unit } from "src/domain/youcourse/enterprise/entities/unit";

export class UnitPresenter {
  static toHTTP(unit: Unit) {
    return {
      id: unit.id.toString(),
      name: unit.name,
      description: unit.description,
      position: unit.position,
      courseId: unit.courseId.toString(),
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    }
  }
}
