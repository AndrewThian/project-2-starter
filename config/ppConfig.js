const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
require('colors')

// passport serializes objects like (user), making them easier to store as ID
// converters user into ID
passport.serializeUser(function (user, done) {
  console.log('passport serializer is called..'.green)
  // console.log('user: '.blue + user, 'serializing...'.green)
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  console.log('passport deserializer is called...'.green)
  console.log('current User_ID is: '.blue + id, 'finding ID that matches'.green)
  User.findById(id, function (err, user) {
    // console.log('user found! @ ppConfig'.blue, user)
    if (err) console.log('something wrong @ PASSPORT(deserialize): ' + err)
    done(err, user)
  })
})

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  // console.log('user details @ ppConfig: '.blue + email, password)
  User.findOne({ email: email }, function (err, user) {
    if (err) return done(err)

    // if no user found
    if (!user) return done(null, false)

    // check if password correct
    if (!user.validPassword(password)) return done(null, false)
    return done(null, user)
  })
}))

module.exports = passport
