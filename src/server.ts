import express from 'express'

import path from 'path'
import { router } from './router'

const PORT = 3000
const app = express()

app.use(express.static(path.join(__dirname, '../public')))

app.use('/api', router)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
