const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

const User = require('../../models/Users')
const Post = require('../../models/Posts').Post
const Comment = require('../../models/Posts').Comment
const sequelize = require('../../models/Movies').sequelize

const validateNewPost = require('../../validation/validateNewPost')
const validateNewComment = require('../../validation/validateNewComment')

// @route   POST api/posts/:movie_id/:user_id/new
// @desc    Creates a new post
// @access  Private
router.post('/:movie_id/:user_id/new', (req, res) => {

    const { errors, isValid } = validateNewPost(req.body)

    // check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    sequelize.models.movie_user.findOne({
        where: { user_id: req.params.user_id, movie_id: req.params.movie_id }
    }).then(flag => {

        if (!flag) {
            res.json('You need to watch this movie to create a post!')
        } else {
            Post.create({
                post_id: uuid(),
                title: req.body.title,
                text: req.body.text,
                owner: req.params.user_id,
                movie_id: req.params.movie_id
            }).then(post => {
                res.json(post)
            })
        }
    })
})

// @route   GET api/posts/:movie_id
// @desc    Gets all posts of a movie
// @access  Public
router.get('/:movie_id', (req, res) => {
    sequelize.query('SELECT p.post_id, p.title, p.text, p.likes, p.commentaries, p.createdAt, p.owner, u.avatar, u.username, p.movie_id FROM posts as p JOIN tb_user as u ON p.movie_id = ? AND p.owner = u.ID ORDER BY p.createdAt DESC',
        { replacements: [req.params.movie_id, req.params.post_id], type: sequelize.QueryTypes.SELECT }
    ).then(posts => { res.json(posts) })
})

// @route   GET api/posts/user=:user_id/
// @desc    Gets all posts of a user
// @access  Public
router.get('/:user_id/user', (req, res) => {
    sequelize.query('SELECT p.post_id, p.title, p.text, p.likes, p.commentaries, p.createdAt, p.owner, p.movie_id, m.cover, m.name FROM posts as p JOIN movies as m ON p.owner = ? AND m.movie_id = p.movie_id',
        { replacements: [req.params.user_id], type: sequelize.QueryTypes.SELECT }).then(posts => {
            res.json(posts)
        })
})

// @route   GET api/posts/:movie_id/:post_id
// @desc    Gets a specific post of a movie
// @access  Public
router.get('/:movie_id/:post_id', (req, res) => {
    sequelize.query('SELECT p.post_id, p.title, p.text, p.likes, p.commentaries, p.createdAt, p.owner, u.avatar, u.username, FROM posts as p JOIN tb_user as u ON p.movie_id = ? AND p.post_id = ? AND p.owner = u.ID',
        { replacements: [req.params.movie_id, req.params.post_id], type: sequelize.QueryTypes.SELECT }
    ).then(post => {
        sequelize.query('SELECT c.comment_id, c.createdAt, c.owner, c.text, c.post_id, u.username, u.avatar from comments as c JOIN tb_user as u WHERE c.owner = u.ID',
            { replacements: [req.params.post_id], type: sequelize.QueryTypes.SELECT }
        ).then(comments => {
            res.json([post, comments])
        })
    })
})

// @route   POST api/posts/:post_id/:user_id/like
// @desc    Likes/unlikes a post
// @access  Private
router.post('/:post_id/:user_id/like', (req, res) => {
    sequelize.models.post_like.findOne({
        where: { user_id: req.params.user_id, post_id: req.params.post_id }
    }).then(result => {
        if (result !== null) {
            sequelize.models.post_like.destroy({
                where: { user_id: req.params.user_id, post_id: req.params.post_id }
            }).then(() => {
                sequelize.query("SELECT COUNT(*) as likes FROM post_like WHERE post_id =?", { replacements: [req.params.post_id], type: sequelize.QueryTypes.SELECT }).then(likes => {
                    Post.update({
                        likes: likes[0].likes
                    }, {
                            where: { post_id: req.params.post_id }
                        })
                })
                res.json(false)
            })

        } else {
            sequelize.models.post_like.create({
                post_id: req.params.post_id,
                user_id: req.params.user_id
            }).then(() => {
                sequelize.query("SELECT COUNT(*) as likes FROM post_like WHERE post_id =?", { replacements: [req.params.post_id], type: sequelize.QueryTypes.SELECT }).then(likes => {
                    Post.update({
                        likes: likes[0].likes
                    }, {
                            where: { post_id: req.params.post_id }
                        })
                })

                res.json(true)
            })
        }
    })
})

// @route   GET api/posts/:post_id/:user_id/like
// @desc    Checks if user has liked this post
// @access  Private
router.get('/:post_id/:user_id/like', (req, res) => {
    sequelize.models.post_like.findOne({
        where: { post_id: req.params.post_id, user_id: req.params.user_id }
    }).then(flag => {
        flag ? res.json(true) : res.json(false)
    })
})

// @route   POST api/posts/:post_id/:user_id/comment
// @desc    Creates a comment on this post
// @access  Private
router.post('/:post_id/:user_id/comment', (req, res) => {

    // Checks if post exists
    Post.findOne({
        where: { post_id: req.params.post_id }
    }).then(post => {
        if (post) {

            // Checks if user exists
            User.findOne({
                where: { ID: req.params.user_id }
            }).then(user => {
                if (user) {

                    // Checks if user has watched this movie
                    sequelize.models.movie_user.findOne({
                        where: { user_id: req.params.user_id, movie_id: post.dataValues.movie_id }
                    }).then(result => {

                        if (result) {

                            const { errors, isValid } = validateNewComment(req.body)

                            // check validation
                            if (!isValid) {
                                return res.status(400).json(errors)
                            }

                            Comment.create({
                                text: req.body.text,
                                owner: req.params.user_id,
                                post_id: req.params.post_id,
                                comment_id: uuid()
                            }).then(comment => res.json(comment))
                        } else {
                            res.json('You need to watch this movie first in order to comment on posts!')
                        }
                    })

                } else {
                    res.status(404).json('User not found')
                }
            })
        } else {
            res.status(404).json('Post not found')
        }
    })

})

module.exports = router