export class ResourceNotFoundError extends Error {
  constructor(resource?: string) {
    super(resource ? `${resource} not found.` : `Resource not found.`);
  }
}
