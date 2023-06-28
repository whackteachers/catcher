import express, { Application } from 'express'
import bodyParser from 'body-parser'
import * as http from 'http'
import cors from 'cors'
import { initializeSocket } from './socket'
import router from './routes'

const PORT = Number(process.env.PORT) || 80
const app: Application = express()
const server = http.createServer(app)
initializeSocket(server)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(router)

server.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`)
})
