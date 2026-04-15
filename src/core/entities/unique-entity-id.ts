export class UniqueEntityID {
  private value: string;

  toString() {
    return this.value;
  }

  constructor(value?: string) {
    this.value = value ?? crypto.randomUUID();
  }

  public equals(id: UniqueEntityID) {
    return id.value === this.value
  }

}
