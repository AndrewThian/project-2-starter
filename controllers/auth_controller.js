const express = require('express')
const router = express.Router()
const passport = require('../config/ppConfig')
const User = require('../models/user')
require('colors')

router.get('/signup', function (req, res, callback) {
  console.log('user @ signup'.blue)
  res.render('auth/sign_up')
})

// create route for signup post
router.post('/signup', function (req, res) {
  User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password
  }, function (err, createdUser) {
    if (err) {
      console.log('An error occurred @ POST: '.red + err)
      req.flash('error', 'Could not create user')
      res.redirect('/auth/sign_up')
    } else {
      console.log('user account created'.blue)
      passport.authenticate('local', {
        successRedirect: '/user/profile',
        sucessFlash: 'Account created and logged in'
      })(req, res)
    }
  })
})

router.get('/login', function (req, res) {
  console.log('user @ login'.blue)
  res.render('auth/log_in')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/user/profile',
  failureRedirect: '/auth/log_in',
  failureFlash: 'Invalid user name and/or password',
  successFlash: 'You have logged in'
}))

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'You have logged out')
  console.log('user logged out'.blue)
  res.redirect('/')
})

module.exports = router
