const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Challenge = require('../models/challenge')
const Party = require('../models/party')
const Task = require('../models/task')

// render challenge page
//
router.get('/:partyId/new', function (req, res) {
  let partyId = req.params.partyId

  res.render('challenges/challenges_new', {partyId: partyId})
})

router.get('/:partyId/:challengeId', function (req, res) {
  let partyId = req.params.partyId
  let challengeId = req.params.challengeId

  Challenge.findById(challengeId)
  .populate('tasks')
  .populate('creator')
  .exec(function (err, challengeData) {
    if (err) return err

    // testing if currentUser === currentParty.creator
    Party.findOne({
      _id: partyId
    }).populate('participants')
      .populate({
        path: 'challenges',
        populate: {
          path: 'creator'
        }
      })
      .populate('creator')
      .exec(function (err, partyData) {
        if (err) return err
        var partyCreator = null
        if (partyData.creator.equals(req.user.id)) { partyCreator = true }
        Challenge.findOne({
          _id: challengeId
        }).populate('creator')
        .exec(function (err, challengeUnique) {
          if (err) {
            req.flash('error', 'error finding challenge')
            return res.redirect('/challenges/' + partyId + '/' + challengeId)
          }
          var challengeCreator = null
          if (challengeUnique.creator.equals(req.user.id)) { challengeCreator = true }

          res.render('challenges/challenge_main', {
            challengeData: challengeData,
            partyData: partyData,
            partyId: partyId,
            partyCreator: partyCreator,
            challengeCreator: challengeCreator
          })
        })
      })
  })
})

router.post('/:partyId/new', function (req, res) {
  let partyId = req.params.partyId
  let userId = req.user.id

  Challenge.create({
    name: req.body.name,
    description: req.body.description,
    creator: req.user.id,
    party_id: partyId
  }, function (err, challengeData) {
    if (err) {
      req.flash('error', 'Challenge name required!')
      return res.redirect('/party/' + req.params.partyId)
    }

    let challengeId = challengeData._id

    Party.findById(partyId, function (err, partyData) {
      if (err) return res.json({'error': 'error in referencing party'})
      console.log(partyData)
      req.user.forked_challenges.push(challengeId)
      req.user.challenge_created.push(1)
      req.user.challenge_joined.push(1)
      partyData.challenges.push(challengeId)
      challengeData.users_joined.push(userId)
      partyData.save()
      req.user.save()
      challengeData.save()
      req.flash('success', 'Challenge created')
      res.redirect('/challenges/' + partyId + '/' + challengeId)
    })
  })
})

router.put('/edit/:partyId/:challengeId/', function (req, res) {
  let challengeId = req.params.challengeId
  let partyId = req.params.partyId

  console.log(1)
  Challenge.findOneAndUpdate({
    _id: challengeId
  }, {
    name: req.body.name,
    description: req.body.description
  }, function (err, challengeData) {
    console.log(2)
    if (err) {
      req.flash('error', 'error in editing challenge data')
      return res.redirect('/party/list')
    }
    res.redirect('/challenges/' + partyId + '/' + challengeId)
  })
})

router.put('/join/:partyId/:challengeId', function (req, res) {
  let challengeId = req.params.challengeId
  // let partyId = req.params.partyId
  let user = req.user

  Challenge.findById(challengeId, function (err, challengeData) {
    if (err) throw err
    challengeData.users_joined.push(req.user.id)
    user.forked_challenges.push(challengeId)
    user.challenge_joined.push(1)
    challengeData.save()
    req.user.save()
    res.redirect('/user/parties/')
  })
})

router.delete('/:partyId/:challengeId', function (req, res) {
  let challengeId = req.params.challengeId
  let partyId = req.params.partyId

  User.findByIdAndUpdate(req.user.id, {
    '$pull': {forked_challenges: challengeId}
  }, function (err, userdata) {
    if (err) {
      req.flash('error', 'Unable to remove challenges from user')
      return res.redirect('/party/' + partyId)
    }
    Party.findByIdAndUpdate(partyId, {
      '$pull': {challenges: challengeId}
    }, function (err, partyData) {
      if (err) {
        req.flash('error', 'Unable to remove challenges from party')
        return res.redirect('/party/' + partyId)
      }
      Task.remove({ 'challenge_id': challengeId }, function (err, taskData) {
        if (err) return err
        Challenge.findByIdAndRemove(challengeId, function (err, challengeData) {
          if (err) {
            req.flash('error', 'Unable to remove task')
            return res.redirect('/party/' + partyId)
          }
          res.redirect('/party/' + partyId)
        })
      })
    })
  })
})

module.exports = router
