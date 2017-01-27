const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/project2')

const User = require('./models/user')
const Party = require('./models/party')
const Challenge = require('./models/challenge')
const Task = require('./models/task')

// var partyTest = new Party({
//   name: 'test party',
//   creator: '5885f54b80aa7500d564e879',
//   description: 'Book lovers!',
//   private: false
// })
//
// partyTest.save()
// console.log(partyTest)

// User.findById('5885f54b80aa7500d564e879', function (err, userData) {
//   if (err) return err
//   Party.findById('58861f42a8fc9d13804caf67', function (err, partyData) {
//     if (err) return err
//     partyData.participants.push(userData._id)
//     userData.parties.push(partyData._id)
//     partyData.save()
//     userData.save()
//   })
// })

var challengeTest = new Challenge({
  name: 'test Challenge'
})

challengeTest.save()

Party.findById('58861f42a8fc9d13804caf67', function (err, data) {
  data.challenges.push(challengeTest._id)
  data.save()
})
