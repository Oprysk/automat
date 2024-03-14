import express from 'express'
import xlsx from 'xlsx'
import multer from 'multer'
import type { Request, Response } from 'express'

import { processWorkbook } from './process-data/file'

export const router = express.Router()

// Multer configuration for file upload
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    // Validate file structure
    const workbook = xlsx.read(req.file?.buffer, { type: 'buffer' })
    // Extract relevant data from the workbook
    const { invoicingMonth, currencyRates, invoicesData } = processWorkbook(
      workbook,
      req.body.invoicingMonth,
    )

    // Send the processed data as the response
    res.json({
      invoicingMonth: invoicingMonth,
      currencyRates: currencyRates,
      invoicesData: invoicesData,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})
