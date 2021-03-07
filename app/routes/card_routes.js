const express = require('express')

const passport = require('passport')

const Card = require('../models/card')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// Index
router.get('/cards', requireToken, (req, res, next) => {
  Card.find()
    .then(cards => {
      return cards.map(card => card.toObject())
    })
    .then(cards => res.status(200).json({ cards: cards }))
    .catch(next)
})

// Show
router.get('/cards/:id', requireToken, (req, res, next) => {
  Card.findById(req.params.id)
    .then(handle404)
    .then(card => res.status(200).json({ card: card.toObject() }))
    .catch(next)
})

// Create
router.post('/cards', requireToken, (req, res, next) => {
  req.body.card.owner = req.user.id
  Card.create(req.body.card)
    .then(card => {
      res.status(201).json({ card: card.toObject() })
    })
    .catch(next)
})

// Update
router.patch('/cards/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.card.owner

  Card.findById(req.params.id)
    .then(handle404)
    .then(card => {
      requireOwnership(req, card)
      return card.updateOne(req.body.card)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// Delete
router.delete('/cards/:id', requireToken, (req, res, next) => {
  Card.findById(req.params.id)
    .then(handle404)
    .then(card => {
      requireOwnership(req, card)
      card.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router