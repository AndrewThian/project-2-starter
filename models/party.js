const mongoose = require('mongoose')
const Schema = mongoose.Schema

var PartySchema = new mongoose.Schema({

  // name of party
  name: {
    type: String,
    required: true,
    minlength: [5, 'Name length has to be greater than 5 characters']
  },

  // creator of the party
  creator: {
    type: Schema.Types.ObjectId, ref: 'User'
  },

  // participants in the party
  // creator of the party will be in participants
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // description of the party
  description: {
    type: String,
    maxlength: [150, 'Must be less than 150 characters'],
    default: "I don't have a description!"
  },

  // challenges in the users can access in the party
  challenges: [{
    type: Schema.Types.ObjectId, ref: 'Challenge'
  }],

  // if the party is private or not
  private: {
    type: Boolean,
    require: true
  }
})

module.exports = mongoose.model('Party', PartySchema)
