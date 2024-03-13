export enum Columns {
  Customer = 'Customer',
  CustNo = "Cust No'",
  ProjectType = 'Project Type',
  Quantity = 'Quantity',
  PricePerItem = 'Price Per Item',
  ItemPriceCurrency = 'Item Price Currency',
  TotalPrice = 'Total Price',
  InvoiceCurrency = 'Invoice Currency',
  Status = 'Status',
  InvoiceNo = 'Invoice #',
  ContractComments = 'Contract Comments',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum Status {
  Done = 'Done',
  Ready = 'Ready',
}

export type RowData = {
  [Columns.Customer]?: string
  [Columns.CustNo]?: number
  [Columns.ProjectType]?: string
  [Columns.Quantity]?: number
  [Columns.PricePerItem]?: number
  [Columns.ItemPriceCurrency]?: string
  [Columns.TotalPrice]?: number
  [Columns.InvoiceCurrency]?: Currency | string
  [Columns.Status]?: Status | string
  [Columns.InvoiceNo]?: string
  [Columns.ContractComments]?: string
}

export type InvoicesData = RowData & {
  validationErrors: string[]
  'Invoice Total'?: string | null
}
