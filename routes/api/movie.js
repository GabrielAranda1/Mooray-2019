const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

// load models
const Movie = require('../../models/Movies').Movie
const Director = require('../../models/Movies').Director
const Performer = require('../../models/Movies').Performer
const Character = require('../../models/Movies').Character

// sequelize object
const sequelize = require('../../models/Movies').sequelize

// validateNewMovie
const validateNewMovie = require('../../validation/validateNewMovie')

// @route   POST api/movie/new
// @desc    Creates a new movie
// @access  Private
router.post('/new', (req, res) => {

    const { errors, isValid } = validateNewMovie(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    Movie.findOne({
        where: { name: req.body.name }
    }).then(movie => {
        if (movie) {         // movie name already exists

            errors.name = 'Movie already exists.'
            return res.status(400).json(errors)
        } else {
            Movie.create({
                movie_id: uuid(),
                name: req.body.name,
                release_date: req.body.release_date,
                description: req.body.description,
                duration: req.body.duration,
                cover: req.body.cover
            }).then(movie => {

                let performer_list = []
                let character_list = []

                // forces id list to array type
                performer_list.push(req.body.performer_id)
                character_list.push(req.body.character_name)

                // adds all characters
                for (i = 0; i < character_list.length; i++) {
                    char_id = uuid()

                    Character.create({

                        character_id: char_id,
                        name: character_list[i],
                        performer_id: performer_list[i]
                    })

                    sequelize.models.movie_character.create({
                        character_id: char_id,
                        movie_id: movie.movie_id
                    })

                    sequelize.models.movie_performer.create({
                        movie_id: movie.movie_id,
                        performer_id: performer_list[i]
                    })
                }

                let director_list = []
                director_list.push(req.body.director_id)

                // adds all directors
                for (i = 0; i < director_list.length; i++) {

                    sequelize.models.movie_director.create({
                        movie_id: movie.movie_id,
                        director_id: director_list[i]
                    })
                }

                res.json(movie)

            }).catch(err => {
                res.json(400).json({ error: 'Unsuccessful register' })
            })
        }
    })

})

// @route   POST api/movie/:movie_id
// @desc    Updates a movie
// @access  Private
router.post('/:movie_id', (req, res) => {

    const { errors, isValid } = validateNewMovie(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    let charId_list = ['']
    let performer_list = ['']
    let character_list = ['']

    // forces id list to array type
    // charId_list = req.body.character_id.toString().split(',')
    //performer_list = req.body.performer_id.toString().split(',')
    //character_list = req.body.character_name.toString().split(',')

    Movie.update({

        name: req.body.name,
        description: req.body.description,
        release_date: req.body.release_date,
        duration: req.body.duration,
        cover: req.body.cover

    },
        {
            where: {
                movie_id: req.params.movie_id
            }
        }
    ).then(movie => {
        if (!movie) {

            errors.notfound = 'Movie not found.'
            res.status(404).json(errors)

        } else {

            // insert into character table
            for (i = 0; i < charId_list.length; i++) {
                Character.update({

                    name: character_list[i],
                    performer_id: performer_list[i]

                }, {
                        where: { character_id: charId_list[i] }
                    }).then(success => {
                        i = 0

                        if (success == 0) {

                            // didn't find character -- create it then
                            let newId = uuid()

                            Character.create({
                                character_id: newId,
                                name: character_list[i],
                                performer_id: performer_list[i]
                            })

                            sequelize.models.movie_character.create({
                                character_id: newId,
                                movie_id: req.params.movie_id
                            })

                            sequelize.models.movie_performer.create({
                                movie_id: req.params.movie_id,
                                performer_id: performer_list[i]
                            })

                        }
                    })
            }
            let director_list = []
            director_list = req.body.director_id.toString().split(',')

            sequelize.models.movie_director.destroy({
                where: { movie_id: req.params.movie_id }
            }).then(result => {
                if (!result) {
                    res.json('Update failed')
                } else {
                    for (i = 0; i < director_list.length; i++) {
                        sequelize.models.movie_director.create({
                            movie_id: req.params.movie_id,
                            director_id: director_list[i]
                        })
                    }
                }
            })

        }
    }).then(() => res.json({ success: 'Update Successful' }))
})

// @route   GET api/movie/:movie_id
// @desc    Gets a movie by its id
// @access  Public
router.get('/unique/:movie_id', (req, res) => {

    Movie.findByPk(req.params.movie_id).then(movie => {
        if (movie) {
            sequelize.query("SELECT CONCAT(dir.name, ' ', dir.lastname) as director, dir.director_id FROM movie_director as modir JOIN directors as dir ON dir.director_id = modir.director_id AND modir.movie_id = ?",
                { replacements: [req.params.movie_id], type: sequelize.QueryTypes.SELECT }
            ).then(director => {
                res.json({ director, movie })
            })
        }
        else
            res.status(404).json({ notfound: 'Movie not found' })
    }).catch(err => res.json({ notfound: 'Movie not found' }))
})

// @route   POST api/movie/status/:movie_id
// @desc    Updates a movie status to active or inactive
// @access  Private
router.post('/status/:movie_id', (req, res) => {

    Movie.findOne({
        where: { movie_id: req.params.movie_id },
        attributes: ['is_active']
    }).then(result => {

        Movie.update({
            is_active: !result.dataValues.is_active
        }, {
                where: { movie_id: req.params.movie_id }
            })

        res.json('Update Successful')
    }).catch(err => res.status(404).json(err))
})

// @route   DELETE api/movie/:movie_id
// @desc    Deletes a movie from the database
// @access  Private
router.delete('/status/:movie_id', (req, res) => {

    Movie.destroy({
        where: { movie_id: req.params.movie_id }
    }).then(() => res.json({ success: true }))
})

// @route   GET api/movie/all-short
// @desc    Gets all basic information from movies
// @access  Public
router.get('/all-short', (req, res) => {

    Movie.findAll({}).then(movies => {
        if (!movies) {
            errors.nomovies = 'There are no movies'
            return res.status(400).json(errors)
        }

        res.json(movies)
    }).catch(err => res.status(404).json({ movie: 'There are no movies' }))
})

// @route   GET api/movie/last-added
// @desc    Gets last 5 added movies
// @access  Public
router.get('/last-added', (req, res) => {
    Movie.findAll({
        attributes: ['name', 'cover', 'createdAt', 'movie_id'],
        order: [['createdAt', 'DESC']],
        limit: 5
    }).then(movies => {
        res.json(movies)
    })
})

// @route   GET api/movie/last-updated
// @desc    Gets last 5 updated movies
// @access  Public
router.get('/last-updated', (req, res) => {
    Movie.findAll({
        attributes: ['name', 'cover', 'updatedAt', 'movie_id'],
        order: [['updatedAt', 'DESC']],
        limit: 5
    }).then(movies => {
        res.json(movies)
    })
})

// @route   POST api/movie/rate/:movie_id/:user_id
// @desc    Saves a user's movie rate 
// @access  Private
router.post('/:rate/:movie_id/:user_id', (req, res) => {
    sequelize.models.movie_rate.findAll({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(data => {
        if (data.length === 0) {

            sequelize.models.movie_rate.create({
                movie_id: req.params.movie_id,
                user_id: req.params.user_id,
                rate: req.params.rate
            }).then(() => {

                sequelize.query("SELECT COUNT(*) as rate FROM movie_rate WHERE movie_id =?", { replacements: [req.params.movie_id], type: sequelize.QueryTypes.SELECT }).then(rate => {
                    sequelize.models.movie_rate.sum('rate', { where: { movie_id: req.params.movie_id } }).then(sum => {
                        Movie.update({
                            rate: (sum / rate[0].rate).toFixed(2)
                        }, {
                                where: { movie_id: req.params.movie_id }
                            })
                    })
                })

                res.status(200).json('Success!')
            })

        } else {
            sequelize.models.movie_rate.update({
                rate: req.params.rate
            }, {
                    where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
                }).then(() => {

                    sequelize.query("SELECT COUNT(*) as rate FROM movie_rate WHERE movie_id =?", { replacements: [req.params.movie_id], type: sequelize.QueryTypes.SELECT }).then(rate => {
                        sequelize.models.movie_rate.sum('rate', { where: { movie_id: req.params.movie_id } }).then(sum => {
                            Movie.update({
                                rate: (sum / rate[0].rate).toFixed(2)
                            }, {
                                    where: { movie_id: req.params.movie_id }
                                })
                        })
                    })

                    res.status(200).json('Changed rate successfully!')
                })
        }
    }).catch(() => res.status(400).json('An error has occured!'))
})

// @route   GET api/movie/rate/:movie_id/:user_id
// @desc    Gets an user rate for a specific movie
// @access  Private
router.get('/rate/:movie_id/:user_id', (req, res) => {
    sequelize.models.movie_rate.findOne({
        where: { movie_id: req.params.movie_id, user_id: req.params.user_id }
    }).then(result => {
        if (result) {
            if (result.dataValues.rate)
                res.json(result.dataValues.rate)
        } else {
            res.json(null)
        }
    })
})

module.exports = router