require('colors')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

var emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/

var UserSchema = new mongoose.Schema({

  task_completed: [{
    type: Number
  }],

  task_created: [{
    type: Schema.Types.ObjectId, ref: 'Task'
  }],

  challenge_created: [{
    type: Number
  }],

  challenge_joined: [{
    type: Number
  }],

  parties_created: [{
    type: Number
  }],

  parties_joined: [{
    type: Number
  }],

  level: {
    type: Number
  },

  // name of user
  name: {
    type: String,
    minlength: [5, 'Name length has to be greater than 5 characters']
  },

  // email of user
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: emailRegex
  },

  // password of user
  password: {
    type: String,
    minlength: [5, 'Password has be greater than 5 characters']
  },

  // user forked challenges
  forked_challenges: [{
    type: Schema.Types.ObjectId, ref: 'Challenge'
  }],

  // create single task list
  parties: [{
    type: Schema.Types.ObjectId, ref: 'Party'
  }]
})

UserSchema.pre('save', function (callback) {
  var user = this
  console.log('user is new? '.blue + user.isNew)

  // only has password if new or has be modified
  if (!user.isModified('password')) return callback()

  // hash given password
  var hash = bcrypt.hashSync(user.password, 10)

  // override cleartext password with hashed
  user.password = hash
  callback()
})

UserSchema.methods.validPassword = function (password) {
  // compare is a bcrypt method that will return a boolean value
  return bcrypt.compareSync(password, this.password)
}

UserSchema.options.toJSON = {
  transform: function (doc, ret, opt) {
    // doc === user created document
    // ret === data returning to the request

    // delete password from document
    delete ret.password
    return ret
  }
}

module.exports = mongoose.model('User', UserSchema)
