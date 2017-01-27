require('colors')
require('dotenv').config({ silent: true })
const path = require('path')
const express = require('express')
const logger = require('morgan')
const ejsLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('./config/ppConfig')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn')
const methodOverride = require('method-override')
const authController = require('./controllers/auth_controller.js')
const userController = require('./controllers/user_controller.js')
const partyController = require('./controllers/party_controller.js')
const challengesController = require('./controllers/challenges_controller.js')
const taskController = require('./controllers/task_controller.js')
const app = express()

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/project2')

app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(ejsLayouts, function (req, res, next) {
  console.log('ejsLayouts called and running...'.green)
  next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.use(methodOverride('_method'))

// ===================================================== //
// ================= session middleware ================ //
// ===================================================== //

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}), function (req, res, next) {
  console.log('sessions started...'.green)
  next()
})

// ===================================================== //
// ================= passport middleware =============== //
// ===================================================== //

app.use(passport.initialize(), function (req, res, next) {
  console.log('passport initialize started...'.green)
  next()
})

app.use(passport.session(), function (req, res, next) {
  console.log('passport session started...'.green)
  next()
})

// ===================================================== //
// =================== flash middleware ================ //
// ===================================================== //

app.use(flash(), function (req, res, next) {
  console.log('connect-flash'.underline + ' was called...'.green)
  next()
})

app.use(function (req, res, next) {
  res.locals.alerts = req.flash()
  next()
})

// ===================================================== //
// =============== main/user  middleware =============== //
// ===================================================== //

app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  res.locals.curretPartyId = req.params.id
  next()
})

app.get('/', function (req, res) {
  res.status(200).render('home_page')
})

// ===================================================== //
// =================== auth middleware ================= //
// ===================================================== //

app.use('/auth', authController)

app.use(isLoggedIn)

// ===================================================== //
// =================== router middleware =============== //
// ===================================================== //

app.use('/user', userController)
app.use('/party', partyController)
app.use('/challenges', challengesController)
app.use('/task', taskController)

// ===================================================== //
// ============ server port & error handling =========== //
// ===================================================== //

app.listen(3000, function () {
  console.log('listening')
})
