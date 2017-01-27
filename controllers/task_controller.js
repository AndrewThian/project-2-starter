const express = require('express')
const router = express.Router()
const Challenge = require('../models/challenge')
const Task = require('../models/task')

router.post('/:id/new/:partyId', function (req, res) {
  let partyId = req.params.partyId
  let challengeId = req.params.id
  let userId = req.user.id

  Task.create({
    description: req.body.description,
    creator: userId,
    challenge_id: challengeId,
    party_id: partyId
  }, function (err, taskData) {
    if (err) return res.send({error: err})

    Challenge.findById(challengeId, function (err, challengeData) {
      if (err) return err
      challengeData.tasks.push(taskData._id)
      req.user.task_created.push(taskData._id)
      challengeData.save()
      req.user.save()
      res.redirect('/challenges/' + partyId + '/' + challengeId)
    })
  })
})

router.get('/:partyId/:challengeId/completed/:taskId', function (req, res) {
  let challengeId = req.params.challengeId
  let taskId = req.params.taskId
  let userId = req.user.id
  let partyId = req.params.partyId

  console.log('router completed called..')

  // checking if userId is unique
  Task.findOne({
    _id: taskId,
    completed: { '$ne': userId }
  })
  .exec(function (err, taskData) {
    if (err) return err
    if (!taskData) {
      req.flash('error', 'Task already completed!')
      res.redirect('/challenges/' + partyId + '/' + challengeId)
    } else {
      taskData.completed.push(userId)
      req.user.task_completed.push(1)
      taskData.save()
      req.user.save()
      req.flash('success', 'task completed!')
      res.redirect('/user/tasks')
    }
  })
})

router.put('/:partyId/:challengeId/:taskId/edit', function (req, res) {
  let partyId = req.params.partyId
  let challengeId = req.params.challengeId
  let taskId = req.params.taskId

  console.log(1)

  Task.findByIdAndUpdate(taskId, {
    description: req.body.description
  }, function (err, taskData) {
    console.log(taskData)
    if (err) return err
    res.redirect('/challenges/' + partyId + '/' + challengeId)
  })
})

module.exports = router
