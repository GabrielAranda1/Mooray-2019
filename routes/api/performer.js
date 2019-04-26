const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')
const uuid = require('uuid/v4')

// load models
const Movie = require('../../models/Movies').Movie
const Director = require('../../models/Movies').Director
const Performer = require('../../models/Movies').Performer
const Character = require('../../models/Movies').Character

// sequelize object
const sequelize = require('../../models/Movies').sequelize

// validateNewMovie
const validateNewPerformer = require('../../validation/validateNewPerformer')

// @route   POST api/performers/new
// @desc    Creates a new performer
// @access  Private
router.post('/new', (req, res) => {

    const { errors, isValid } = validateNewPerformer(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Performer.findOne({
        where: { name: req.body.name, lastname: req.body.lastname }
    }).then(performer => {
        if (performer) {         // performer already exists

            errors.name = 'Performer already exists.'
            return res.status(400).json(errors)
        } else {

            Performer.create({
                performer_id: uuid(),
                name: req.body.name,
                lastname: req.body.lastname,
                bio: req.body.bio,
                birthdate: req.body.birthdate,
                deathdate: req.body.deathdate,
                picture: req.body.picture
            }).then(performer => { res.json(performer) })
                .catch(err => {
                    console.log('An error has occured', err)
                })
        }
    })

})

// @route   POST api/performer
// @desc    Updates a performer
// @access  Private
router.post('/:performer_id', (req, res) => {

    const { errors, isValid } = validateNewPerformer(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Performer.update({

        name: req.body.name,
        lastname: req.body.lastname,
        bio: req.body.bio,
        birthdate: req.body.birthdate,
        deathdate: req.body.deathdate,
        picture: req.body.picture

    },
        {
            where: {
                performer_id: req.params.performer_id
            }
        }
    ).then(performer => {
        if (performer)
            res.json(req.body)
    }).catch(err => console.log('An error occurred while updating a performer:', err))
})

// @route   DELETE api/performers/:performer_id
// @desc    Deletes a performer
// @access  Private
router.delete('/:performer_id', (req, res) => {
    Performer.destroy({
        where: { performer_id: req.params.performer_id }
    }).then(() => res.json({ success: true }))
})

// @route   GET api/performers/all
// @desc    Get all performers
// @access  Public
router.get('/all', (req, res) => {

    const errors = {}

    Performer.findAll({
    }).then(performers => {

        if (!performers) {
            errors.noperformers = 'There are no performers'
            return res.status(400).json(errors)
        }

        res.json(performers)
    }).catch(err => res.status(404).json({ performer: 'There are no performers' }))
})

// @route   GET api/profile/performers/:performer_id
// @desc    Get director by ID
// @access  Public
router.get('/:performer_id', (req, res) => {

    const errors = {}

    Performer.findByPk(
        req.params.performer_id,
        {
            attributes: ['name', 'lastname', 'bio', 'birthdate', 'deathdate', 'picture']
        }
    ).then(performer => {

        if (!performer) {
            return res.status(404).json('Performer not found')
        }
        sequelize.query("SELECT movies.movie_id, result.performer_id, movies.name, movies.description, movies.rate, movies.release_date, movies.duration, movies.is_active, movies.cover FROM ( " +
            "SELECT moper.performer_id, moper.movie_id FROM( " +
            "SELECT name, lastname, bio, birthdate, deathdate, picture, performer_id " +
            "FROM les_mooray.performers as per " +
            "WHERE per.performer_id = ? " +
            ") as per JOIN movie_performer as moper ON per.performer_id = moper.performer_id" +
            ") as result JOIN movies ON result.movie_id = movies.movie_id"
            ,
            {
                replacements: [req.params.performer_id], type: sequelize.QueryTypes.SELECT
            }).then(movies => res.json([performer, movies])).catch(err => res.status(400).json('An error has occured', err))
    }).catch(err => res.status(400).json('An error has occured'))
})

// @route   GET api/performers/last-added
// @desc    Gets last 5 added performers
// @access  Public
router.get('/data/last-added', (req, res) => {
    Performer.findAll({
        attributes: ['name', 'lastname', 'picture', 'createdAt', 'performer_id'],
        order: [['createdAt', 'DESC']],
        limit: 5
    }).then(performers => {
        res.json(performers)
    })
})

// @route   GET api/performers/last-updated
// @desc    Gets last 5 updated performers
// @access  Public
router.get('/data/last-updated', (req, res) => {
    Performer.findAll({
        attributes: ['name', 'lastname', 'picture', 'updatedAt', 'performer_id'],
        order: [['updatedAt', 'DESC']],
        limit: 5
    }).then(performers => {
        res.json(performers)
    })
})

module.exports = router