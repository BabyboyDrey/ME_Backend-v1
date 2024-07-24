const express = require('express')
const cors = require('cors')
const ngrok = require('ngrok')
const cookieParser = require('cookie-parser')
const connectDb = require('./db/database')
const ioi_comp1_routes = require('./controllers/comp_1/ioi')
const pdo_comp1_routes = require('./controllers/comp_1/pdo')
const student_bio_comp1_routes = require('./controllers/comp_1/studentBio')
const tc_comp1_routes = require('./controllers/comp_1/TC')
const teachers_comp1_routes = require('./controllers/comp_1/Teachers')
const ccs_comp1_routes = require('./controllers/comp_1/crossCuttingIssues')
const project_summary_comp1_routes = require('./controllers/comp_1/projectSummary')
const general_activities_comp1_routes = require('./controllers/comp_1/generalActivities')
const path = require('path')
const app = express()

if (process.env.NODE_ENV !== 'Production') {
  require('dotenv').config({
    path: '.env'
  })
}

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://www.ideasmis.com'],
    credentials: true
  })
)
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())
app.use('/', express.static('uploads'))
app.use('/api/v1/ioi/c1', ioi_comp1_routes)
app.use('/api/v1/pdo/c1', pdo_comp1_routes)
app.use('/api/v1/student/c1', student_bio_comp1_routes)
app.use('/api/v1/tc/c1', tc_comp1_routes)
app.use('/api/v1/teachers/c1', teachers_comp1_routes)
app.use('/api/v1/ccs/c1', ccs_comp1_routes)
app.use('/api/v1/ps/c1', project_summary_comp1_routes)
app.use('/api/v1/ga/c1', general_activities_comp1_routes)
connectDb()

process.on('uncaughtException', err => {
  console.log(`Uncaught Exception Err: ${err}`)
  console.log('Shutting down server for uncaught exception')
})

process.on('unhandledRejection', err => {
  console.log(`Unhandled Rejection Err: ${err}`)
  console.log('Shutting down server for unhandled rejection')
  server.close(() => {
    process.exit(1)
  })
})

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'))
//  })

app.get('/dice', (req, res) => {
  res.send('Url of ngrok functional')
})

const PORT = process.env.SERVER_PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT}`)
  console.log(`worker pid: ${process.pid}`)
  ngrok
    .connect(PORT)
    .then(ngrokUrl => {
      console.log(`Ngrok tunnel in ${ngrokUrl}`)
    })
    .catch(error => {
      console.log(`Couldn't tunnel ngrok: ${error}`)
    })
})
