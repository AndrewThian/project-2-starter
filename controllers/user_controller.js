const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Party = require('../models/party')
const Task = require('../models/task')

router.get('/profile', function (req, res) {
  User.findById(req.user.id)
  .populate('parties')
  .populate({
    path: 'forked_challenges',
    populate: {
      path: 'tasks'
    }
  })
  .exec(function (err, userData) {
    if (err) return err
    res.render('user/user_profile', {userData: userData})
  })
})

router.get('/parties', function (req, res) {
  let userId = req.user.id

  Party.find({
    creator: userId
  })
  .populate('creator')
  .exec(function (err, partyData) {
    if (err) {
      req.flash('error', 'Could not get party')
      res.redirect('/user/profile')
    }
    Party.find(function (err, partyAll) {
      if (err) {
        req.flash('error', 'Could not get party')
        res.redirect('/user/profile')
      }
      // res.render('user/user_parties', {
      //   partyData: partyData,
      //   partyAll: partyAll
      // })
      User.findById(req.user.id)
      .populate('parties')
      .exec(function (err, userData) {
        if (err) {
          req.flash('error', 'Could not get user')
          res.redirect('/user/profile')
        }
        res.render('user/user_parties', {
          partyData: partyData,
          partyAll: partyAll,
          userData: userData
        })
      })
    })
  })
})

router.get('/tasks', function (req, res) {
  let userId = req.user.id

  Party.find({
    participants: req.user.id
  })
  .populate('creator')
  .exec(function (err, partyData) {
    if (err) {
      req.flash('error', 'Could not get party')
      res.redirect('/user/profile')
    }
    User.findById(userId)
    .populate('parties')
    .populate({
      path: 'forked_challenges',
      populate: {
        path: 'tasks'
      }
    })
    .exec(function (err, userData) {
      if (err) {
        req.flash('error', 'Could not get user')
        res.redirect('/user/profile')
      }
      Task.find(function (err, taskAll) {
        if (err) {
          req.flash('error', 'Could not get tasks')
          res.redirect('/user/profile')
        }
        res.render('user/user_tasks', {
          partyData: partyData,
          userData: userData,
          taskAll: taskAll
        })
      })
    })
  })
})

module.exports = router
