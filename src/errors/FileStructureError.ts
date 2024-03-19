export class FileStructureError extends Error {
  constructor(message: string = 'File structure is invalid') {
    super(message)
    this.name = 'FileStructureError'
  }
}
