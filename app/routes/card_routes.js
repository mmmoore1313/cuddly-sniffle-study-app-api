const express = require('express')

const passport = require('passport')

const Card = require('../models/card')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// Create
router.post('/cards', requireToken, (req, res, next) => {
  req.body.card.owner = req.user.id
  Card.create(req.body.card)
    .then(card => {
      res.status(201).json({ card: card.toObject() })
    })
    .catch(next)
})


module.exports = router