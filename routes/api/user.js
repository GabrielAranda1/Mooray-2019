const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

const User = require('../../models/Users')
const sequelize = require('../../models/Movies').sequelize

// @route   GET api/users/login
// @desc    Login route / returning JWT token
// @access  Public 
router.get('/login/:user_id', (req, res) => {

    errors = {}

    const id = req.params.user_id

    // find one user
    User.findByPk(id)
        .then(user => {
            if (!user) {
                errors.auth = 'Authentication error.'
                return res.status(404).json(errors)
            }

            const payload = { id: user.ID, name: user.name, lastname: user.last_name, username: user.username, avatar: user.avatar, role: user.role }

            // Sign token
            jwt.sign(
                payload,
                keys.secretOrKey,
                { expiresIn: '24h' },
                (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    })
                })

        })
})

// @route   POST api/users/:user_id/:movie_id
// @desc    Adds/removes a movie to watched list
// @access  Private
router.post('/:user_id/:movie_id', (req, res) => {
    sequelize.models.movie_user.findAll({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(result => {
        if (result.length > 0) {
            sequelize.models.movie_user.destroy({
                where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
            })
            res.json('Movie removed')
        } else {
            sequelize.models.movie_user.create({
                movie_id: req.params.movie_id,
                user_id: req.params.user_id
            }).then(item => item ? res.json('Movie added to watchlist') : res.json('Error adding movie'))
        }
    })
})

// @route   GET api/users/:user_id/movies
// @desc    Returns list of watched movies 
// @access  Private 
router.get('/:user_id/movies', (req, res) => {

    sequelize.query("SELECT res.name, res.cover, res.movie_id, res.favorite FROM (" +
        " SELECT mu.movie_id, mu.user_id, mov.name, mov.cover, mu.favorite FROM les_mooray.movie_user as mu JOIN movies as mov ON mu.user_id = ? AND mu.movie_id = mov.movie_id" +
        " ) as res"
        ,
        {
            replacements: [req.params.user_id], type: sequelize.QueryTypes.SELECT
        }
    ).then(movies => {
        res.json(movies)
    })
})


// @route   GET api/users/:user_id/:movie_id
// @desc    Check if this user has watched this movie
// @access  Private 
router.get('/:user_id/:movie_id', (req, res) => {
    sequelize.models.movie_user.findOne({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(flag => {
        flag ? res.json(true) : res.json(false)
    })
})

// @route   POST api/users/favorites/:user_id/:movie_id
// @desc    Adds the selected movie to favorites
// @access  Private 
router.post('/favorites/:user_id/:movie_id', (req, res) => {
    sequelize.models.movie_user.findOne({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(result => {
        if (result.length === 0) {
            res.status(404).json('You need to watch this movie first!')
        } else {
            sequelize.models.movie_user.update({
                favorite: !result.dataValues.favorite
            }, {
                    where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
                }
            ).then(() => {
                if (!result.dataValues.favorite)
                    res.json('Movie added to favorites!')
                else
                    res.json('Movie removed from favorites')
            })
        }
    })
})

// @route   GET api/users/favorites/:user_id/:movie_id
// @desc    Check if this user has this movie in its favorite list
// @access  Private 
router.get('/favorites/:user_id/:movie_id', (req, res) => {
    sequelize.models.movie_user.findOne({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id, favorite: true }
    }).then(flag => {
        flag ? res.json(true) : res.json(false)
    })
})

module.exports = router