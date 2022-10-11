import express from 'express'
const prizeRouter = require('./routes/prizeRoute')

const app = express()
app.use(express.json())

// swagger
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// route
app.use('/prizes', prizeRouter)

app.listen(process.env.PORT)
export default app
