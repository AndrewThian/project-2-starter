const express = require('express')
const router = express.Router()
const Party = require('../models/party')
const Challenge = require('../models/challenge')
const Task = require('../models/task')
const User = require('../models/user')

router.get('/new', function (req, res) {
  res.render('party/party_new')
})

router.get('/list', function (req, res) {
  Party.find()
  .populate('creator')
  .exec(function (err, partyList) {
    if (err) return err
    res.render('party/party_tavern', {partyList: partyList})
  })
})

router.get('/:id/join', function (req, res) {
  Party.findOne({
    _id: req.params.id,
    participants: { '$ne': req.user.id }
  })
  .exec(function (err, partyData) {
    if (err) return err
    console.log(partyData)
    if (!partyData) {
      req.flash('error', 'User already in party')
      res.redirect('/party/' + req.params.id)
    } else {
      partyData.participants.push(req.user.id)
      console.log(req.user)
      req.user.parties.push(req.params.id)
      req.user.parties_joined.push(1)
      partyData.save()
      req.user.save()
      console.log('partyData and userData saved')
      req.flash('success', 'Joined ' + partyData.name)
      res.redirect('/party/' + req.params.id)
    }
  })
})

router.get('/:id/leave', function (req, res) {
  let partyId = req.params.id

  Party.findByIdAndUpdate(partyId, {
    '$pull': {participants: req.user.id}
  }, function (err, partyData) {
    if (err) return res.json({'error': 'error in deleting participants in party'})
    Challenge.findOne({
      party_id: partyId
    }, function (err, challengeData) {
      if (err) {
        var challengeId = challengeData.id

        req.flash('error', 'Unable to find challenge')
        return res.redirect('/party/' + partyId)
      }
      User.findByIdAndUpdate(req.user.id, {
        '$pull': {
          parties: partyId,
          forked_challenges: challengeId
        }
      }, function (err, userData) {
        if (err) {
          req.flash('error', 'Unable to update user')
          return res.redirect('/party/' + partyId)
        }
        req.flash('success', 'User left party')
        res.redirect('/party/' + partyId)
      })
    })
  })
})

router.get('/:id', function (req, res) {
  Party.findById(req.params.id)

  // populate party data array of participants and challenges
  .populate('participants')
  .populate({
    path: 'challenges',
    populate: {
      path: 'creator'
    }
  })
  .populate({
    path: 'challenges',
    populate: {
      path: 'tasks'
    }
  })
  .populate('creator')

  .exec(function (err, partyData) {
    if (err) return err

    // finding one user that does not have the current party Id
    // req.params.id === partyId
    User.findOne({
      _id: req.user.id,
      parties: { '$ne': req.params.id }
    }, function (err, userData) {
      // userData is user that DOES NOT belong to current party
      if (err) return err

      // checking for creator of party
      var creator = null
      if (partyData !== null) {
        if (partyData.creator.equals(req.user.id)) { creator = true }
      }

      // render party index page
      res.render('party/party_main', {partyData: partyData, userData: userData, checkCurrentUser: creator})
    })
  })
})

router.post('/new', function (req, res) {
  console.log('post to party/new')
  Party.create({
    name: req.body.name,
    creator: req.user.id,
    participants: [req.user.id],
    description: req.body.description,
    private: false
  }, function (err, partyData) {
    if (err) {
      req.flash('error', 'Party')
      return res.redirect('/party/list')
    }
    req.user.parties.push(partyData._id)
    req.user.parties_created.push(1)
    req.user.save()
    res.redirect('/party/' + partyData._id)
  })
})

router.put('/:id/edit', function (req, res) {
  let partyId = req.params.id

  Party.findOneAndUpdate({
    _id: partyId
  }, {
    name: req.body.name,
    description: req.body.description
  }, function (err, partyData) {
    if (err) return res.json({ 'error': 'error at updating current party' })
    res.redirect('/party/' + partyId)
  })
})

router.get('/delete/:id', function (req, res) {
  let userId = req.user._id

  // res.redirect('/user/profile')
  Challenge.findOne({ 'party_id': req.params.id }, function (err, challengeData) {
    console.log(challengeData)
    if (err) {
      req.flash('error', 'unable to find challenge!')
      return res.redirect('/party/list')
    }
    // console.log(challengeData.id, 'challenge id')
    if (challengeData !== null) {
      Party.findByIdAndRemove(req.params.id, function (err, partyData) {
        if (err) return err
        // res.redirect('/party/list')

        User.findByIdAndUpdate(userId, {
          '$pull': {
            parties: req.params.id,
            forked_challenges: challengeData.id}
        }, function (err, userData) {
          if (err) {
            req.flash('error', 'unable to update user data')
            return res.redirect('/party/list')
          }
          // req.flash('success', 'Party deleted')
          // res.redirect('/party/list')

          Task.remove({ 'party_id': req.params.id }, function (err, taskData) {
            if (err) {
              req.flash('error', 'unable to remove task')
              return res.redirect('/party/list')
            }

            Challenge.remove({ 'party_id': req.params.id }, function (err, challengeData) {
              if (err) {
                req.flash('error', 'unable to remove challenge')
                return res.redirect('/party/list')
              }

              req.flash('success', 'Party deleted')
              res.redirect('/party/list')
            })
          })
        })
      })
    } else if (challengeData === null) {
      Party.findByIdAndRemove(req.params.id, function (err, partyData) {
        if (err) return err
        // res.redirect('/party/list')

        User.findByIdAndUpdate(userId, {
          '$pull': {
            parties: req.params.id}
        }, function (err, userData) {
          if (err) {
            req.flash('error', 'unable to update user data')
            return res.redirect('/party/list')
          }
          req.flash('success', 'Party deleted')
          res.redirect('/party/list')
        })
      })
    }
  })
})

module.exports = router
