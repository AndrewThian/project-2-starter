const mongoose = require('mongoose')
const Schema = mongoose.Schema

var TaskSchema = new mongoose.Schema({

  // name of task
  description: {
    type: String,
    required: [true, 'no name provided']
  },

  creator: {
    type: Schema.Types.ObjectId, ref: 'User'
  },

  challenge_id: {
    type: Schema.Types.ObjectId, ref: 'Challenge'
  },

  party_id: {
    type: Schema.Types.ObjectId, ref: 'Party'
  },

  // number of users that have completed the task
  completed: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }]
})

module.exports = mongoose.model('Task', TaskSchema)
