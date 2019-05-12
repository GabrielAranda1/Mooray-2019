const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

const User = require('../../models/Users')
const Review = require('../../models/Posts').Review
const sequelize = require('../../models/Movies').sequelize

const validateNewReview = require('../../validation/validateNewReview')

// @route   POST api/reviews/:movie_id/:user_id/new
// @desc    Creates a new review
// @access  Private
router.post('/:movie_id/:user_id/new', (req, res) => {

    const { errors, isValid } = validateNewReview(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    sequelize.models.movie_user.findOne({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(flag => {

        if (!flag) {
            res.json('You need to watch this movie to create a review!')
        } else {
            Review.create({
                review_id: uuid(),
                text: req.body.text,
                owner: req.params.user_id,
                movie_id: req.params.movie_id
            }).then(review => {
                res.json(review)
            })
        }
    })
})

// @route   GET api/reviews/:movie_id
// @desc    Gets all reviews of a movie
// @access  Public
router.get('/:movie_id', (req, res) => {
    sequelize.query('SELECT p.review_id, p.text, p.likes, p.commentaries, p.createdAt, p.owner, u.avatar, u.username, p.movie_id FROM reviews as p JOIN tb_user as u ON p.movie_id = ? AND p.owner = u.ID ORDER BY p.createdAt DESC',
        { replacements: [req.params.movie_id, req.params.post_id], type: sequelize.QueryTypes.SELECT }
    ).then(reviews => { res.json(reviews) })
})

// @route   GET api/reviews/:user_id
// @desc    Gets all reviews of a user
// @access  Public
router.get('/:user_id/user', (req, res) => {
    sequelize.query('SELECT p.review_id, p.text, p.likes, p.commentaries, p.createdAt, p.owner, p.movie_id, m.cover, m.name FROM reviews as p JOIN movies as m ON p.owner = ? AND m.movie_id = p.movie_id',
        { replacements: [req.params.user_id], type: sequelize.QueryTypes.SELECT }).then(reviews => {
            res.json(reviews)
        })
})

// @route   POST api/reviews/:review_id/:user_id/like
// @desc    Likes/unlikes a review
// @access  Private
router.post('/:review_id/:user_id/like', (req, res) => {
    sequelize.models.review_like.findOne({
        where: { user_id: req.params.user_id, review_id: req.params.review_id }
    }).then(result => {
        if (result !== null) {
            sequelize.models.review_like.destroy({
                where: { user_id: req.params.user_id, review_id: req.params.review_id }
            }).then(() => {
                sequelize.query("SELECT COUNT(*) as likes FROM review_like WHERE review_id =?", { replacements: [req.params.review_id], type: sequelize.QueryTypes.SELECT }).then(likes => {
                    Review.update({
                        likes: likes[0].likes
                    }, {
                            where: { review_id: req.params.review_id }
                        })
                })
                res.json(false)
            })

        } else {
            sequelize.models.review_like.create({
                review_id: req.params.review_id,
                user_id: req.params.user_id
            }).then(() => {
                sequelize.query("SELECT COUNT(*) as likes FROM review_like WHERE review_id =?", { replacements: [req.params.review_id], type: sequelize.QueryTypes.SELECT }).then(likes => {
                    Review.update({
                        likes: likes[0].likes
                    }, {
                            where: { review_id: req.params.review_id }
                        })
                })

                res.json(true)
            })
        }
    })
})

module.exports = router