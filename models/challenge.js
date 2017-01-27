const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ChallengeSchema = new mongoose.Schema({

  // name of list
  name: {
    type: String,
    required: [true, 'name required!']
  },

  party_id: {
    type: Schema.Types.ObjectId, ref: 'Party'
  },

  creator: {
    type: Schema.Types.ObjectId, ref: 'User'
  },

  description: {
    type: String
  },

  // users that have picked up the Challenge
  users_joined: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],

  // todos reference
  tasks: [{
    type: Schema.Types.ObjectId, ref: 'Task'
  }]
})

module.exports = mongoose.model('Challenge', ChallengeSchema)
