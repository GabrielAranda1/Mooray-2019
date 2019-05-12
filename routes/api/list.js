const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

// load models
const Movie = require('../../models/Movies').Movie
const List = require('../../models/Lists').List
const User = require('../../models/Users')

// sequelize object
const sequelize = require('../../models/Movies').sequelize

// List validation
const validateNewList = require('../../validation/validateNewList')

// @route   POST api/lists/:user_id/new
// @desc    Creates a new list
// @access  Private
router.post('/:user_id/new', (req, res) => {
    if (req.params.user_id) {

        const { errors, isValid } = validateNewList(req.body)

        // check validation
        if (!isValid) {
            return res.status(400).json(errors)
        }

        List.create({
            list_id: uuid(),
            list_name: req.body.list_name,
            description: req.body.description,
            owner: req.params.user_id
        }).then(list => {
            res.json(list)
        })

    } else
        res.status(404).json('User not found')
})

// @route   DELETE api/lists/:user_id/:list_id
// @desc    Deletes a list
// @access  Private
router.delete('/:user_id/:list_id', (req, res) => {
    if (req.params.user_id) {

        List.findOne({
            where: { list_id: req.params.list_id, owner: req.params.user_id }
        }).then(flag => {
            if (flag) {
                List.destroy({
                    where: { list_id: req.params.list_id, owner: req.params.user_id }
                }).then(() => {
                    res.json({ success: 'List excluded.' })
                })
            } else {
                res.json('List not found')
            }
        })
    } else
        res.status(404).json('User not found')
})

// @route   POST api/lists/:user_id/:list_id
// @desc    Updates an existing list
// @access  Private
router.post('/:user_id/:list_id', (req, res) => {
    if (req.params.user_id) {

        const { errors, isValid } = validateNewList(req.body)

        // check validation
        if (!isValid) {
            return res.status(400).json(errors)
        }

        List.findOne({
            where: { list_id: req.params.list_id, owner: req.params.user_id }
        }).then(flag => {
            if (flag) {
                List.update({
                    list_name: req.body.list_name,
                    description: req.body.description
                },
                    {
                        where: { list_id: req.params.list_id, owner: req.params.user_id }
                    }
                ).then(list => {
                    if (!list) {
                        res.json('An error has occurred')

                    } else {

                        res.json('Update successfull')
                    }
                })
            } else
                res.json('List not found')
        })
    } else {
        res.status(404).json('User not found')
    }
})

// @route   POST api/lists/:user_id/:list_id/:movie_id
// @desc    Adds a movie to an existing list
// @access  Private
router.post('/:user_id/:list_id/:movie_id', (req, res) => {

    if (req.params.user_id) {

        // check if list exists
        List.findOne({
            where: { list_id: req.params.list_id, owner: req.params.user_id }
        }).then(list => {

            if (list) {

                // check if movie exists
                Movie.findOne({
                    where: { movie_id: req.params.movie_id }
                }).then(movie => {

                    if (!movie)
                        res.json("Movie doesn't exists")

                    else {

                        // check if movie is already in list
                        sequelize.models.list_movie.findOne({
                            where: { list_id: req.params.list_id, movie_id: req.params.movie_id }
                        }).then(movie => {

                            if (movie) {
                                res.json('Movie already in this list')

                            } else {

                                // adds movie to list
                                sequelize.models.list_movie.create({
                                    movie_id: req.params.movie_id,
                                    list_id: req.params.list_id
                                }).then(flag => {
                                    if (flag)
                                        res.json('Movie added to list.')
                                    else
                                        res.json('An error has occurred')
                                })
                            }
                        })
                    }
                })

            } else
                res.json('List not found')
        })

    } else
        res.status(404).json('User not found')
})

// @route   DELETE api/lists/:user_id/:list_id/:movie_id
// @desc    Removes a movie from an existing list
// @access  Private
router.delete('/:user_id/:list_id/:movie_id', (req, res) => {

    // check if list exists
    List.findOne({
        where: { list_id: req.params.list_id, owner: req.params.user_id }
    }).then(list => {

        if (!list)
            res.json("List doesn't exist")

        else {

            // check if movie is already in list
            sequelize.models.list_movie.findOne({
                where: { list_id: req.params.list_id, movie_id: req.params.movie_id }
            }).then(movie => {

                if (!movie)
                    res.json('This movie is not in this list')

                else {

                    sequelize.models.list_movie.destroy({
                        where: { list_id: req.params.list_id, movie_id: req.params.movie_id }
                    }).then(flag => {
                        flag ? res.json('Movie removed.') : res.json('An error has occurred')
                    })
                }
            })
        }
    })
})

// @route   GET api/lists/:user_id
// @desc    Gets all user lists
// @access  Private
router.get('/:user_id', async (req, res) => {

    var response = []
    var i = 0, j = 0
    let user = null

    if (req.params.user_id) {
        user = await User.findOne({
            where: { id: req.params.user_id }
        })
    }

    if (!user.dataValues) {
        res.json('User not found')
    } else {

        // find all lists from this user
        let lists = await List.findAll({
            where: { owner: req.params.user_id }
        })

        for (i = 0; i < lists.length; i++) {

            response.push(lists[i].dataValues)

            // finds all movie ids in this list
            let movies = await sequelize.models.list_movie.findAll({
                where: { list_id: lists[i].dataValues.list_id },
                attributes: ['movie_id']
            })

            let ml = []

            for (j = 0; j < movies.length; j++) {

                // finds all movies from the list 
                let pics = await Movie.findOne({
                    where: { movie_id: movies[j].dataValues.movie_id },
                    attributes: ['movie_id', 'name', 'cover']
                })

                ml.push(pics.dataValues)
                response[i].movies = ml
            }

        }

        res.json(response)
    }
})

// @route   GET api/lists/:user_id/short
// @desc    Gets all user lists' name
// @access  Private
router.get('/:user_id/short', (req, res) => {

    if (!req.params.user_id) {
        res.json('User not found')
    } else {
        // find all lists from this user
        List.findAll({
            where: { owner: req.params.user_id }
        }).then(lists => {
            res.json(lists)
        })
    }
})

// @route   GET api/lists/:list_id/user=:user_id
// @desc    Returns a list
// @access  Private
router.get('/:list_id/user=:user_id', async (req, res) => {

    var response = {}
    var i = 0, j = 0

    if (!req.params.user_id) {
        res.json('User not found')
    } else {

        // find all lists from this user
        let list = await List.findOne({
            where: { list_id: req.params.list_id }
        })

        response.list = list

        // finds all movie ids in this list
        let movies = await sequelize.models.list_movie.findAll({
            where: { list_id: list.dataValues.list_id },
            attributes: ['movie_id']
        })

        let ml = []

        for (j = 0; j < movies.length; j++) {

            // finds all movies from the list 
            let pics = await Movie.findOne({
                where: { movie_id: movies[j].dataValues.movie_id },
                attributes: ['movie_id', 'name', 'cover']
            })

            ml.push(pics.dataValues)
            response.movies = ml
        }

        res.json(response)
    }
})

module.exports = router

