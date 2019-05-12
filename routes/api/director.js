const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

const Director = require('../../models/Movies').Director
const sequelize = require('../../models/Movies').sequelize

// Front end validation
const validateNewDirector = require('../../validation/validateNewDirector')

// @route   POST api/director/new
// @desc    Creates a new director
// @access  Private
router.post('/new'/*, passport.authenticate('jwt', { session: false })*/, (req, res) => {

    const { errors, isValid } = validateNewDirector(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Director.findOne({
        where: { name: req.body.name, lastname: req.body.lastname }
    }).then(director => {

        if (director) {                    // already exists

            errors.name = 'Director already exists.'
            return res.status(400).json(errors)
        } else {
            Director.create({
                director_id: uuid(),
                name: req.body.name,
                lastname: req.body.lastname,
                bio: req.body.bio,
                birthdate: req.body.birthdate,
                deathdate: req.body.deathdate,
                picture: req.body.picture
            }).then(director => res.json(director))
                .catch(err => console.log(err))
        }
    })
})

// @route   POST api/director
// @desc    Updates a director
// @access  Private
router.post('/:director_id', (req, res) => {

    const { errors, isValid } = validateNewDirector(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Director.update({

        name: req.body.name,
        lastname: req.body.lastname,
        bio: req.body.bio,
        birthdate: req.body.birthdate,
        deathdate: req.body.deathdate,
        picture: req.body.picture

    },
        {
            where: {
                director_id: req.params.director_id
            }
        }
    ).then(director => {
        if (director)
            res.json(req.body)
    }).catch(err => console.log('An error occurred while updating a director:', err))
})

// @route   DELETE api/director
// @desc    Deletes a director
// @access  Private
router.delete('/:director_id', (req, res) => {
    Director.destroy({
        where: { director_id: req.params.director_id }
    }).then(() => res.json({ success: true }))
})

// @route   GET api/directors/all
// @desc    Get all directors
// @access  Public
router.get('/all', (req, res) => {

    const errors = {}

    Director.findAll({
    }).then(directors => {

        if (!directors) {
            errors.nodirectors = 'There are no directors'
            return res.status(400).json(errors)
        }

        res.json(directors)
    }).catch(err => res.status(404).json({ performer: 'There are no performers' }))
})

// @route   GET api/directors/director_id
// @desc    Get director by ID
// @access  Public
router.get('/:director_id', (req, res) => {

    const errors = {}

    Director.findByPk(
        req.params.director_id,
        {
            attributes: ['name', 'lastname', 'bio', 'birthdate', 'deathdate', 'picture']
        }
    ).then(director => {
        sequelize.query("SELECT movies.movie_id, movies.cover, result.director_id, movies.name, movies.description, movies.rate, movies.release_date, movies.duration, movies.is_active, movies.cover as movies FROM ( " +
            "SELECT modir.director_id, modir.movie_id FROM( " +
            "SELECT name, lastname, bio, birthdate, deathdate, picture, director_id " +
            "FROM les_mooray.directors as dir " +
            "WHERE dir.director_id = ? " +
            ") as dir JOIN movie_director as modir ON dir.director_id = modir.director_id" +
            ") as result JOIN movies ON result.movie_id = movies.movie_id"
            ,
            {
                replacements: [req.params.director_id], type: sequelize.QueryTypes.SELECT
            }).then(movies => res.json({ director, movies })).catch(err => res.status(400).json('An error has occured', err))
    }).catch(err => res.status(400).json('An error has occured'))
})
module.exports = router