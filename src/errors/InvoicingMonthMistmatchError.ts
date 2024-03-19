export class InvoicingMonthMismatchError extends Error {
  constructor(
    message: string = 'Invoicing month does not match the file date.',
  ) {
    super(message)
    this.name = 'InvoicingMonthMismatchError'
  }
}
