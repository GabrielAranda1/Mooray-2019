const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')
const passport = require('passport')

const Report = require('../../models/Reports')
const Movie = require('../../models/Movies').Movie
const Post = require('../../models/Posts').Post
const Review = require('../../models/Posts').Review
const Comment = require('../../models/Posts').Comment
const User = require('../../models/Users')
const sequelize = require('../../models/Movies').sequelize

// @route   POST api/reports/:movie_id/:content_id?type=:type&content_type=:content_type
// @desc    Create a new report
// @access  Private
router.post('/:movie_id/:content_id', (req, res) => {

    Movie.findOne({
        where: { movie_id: req.params.movie_id }
    }).then(movie => {

        if (!movie)
            res.json({ error: 'Movie not found' })

        else {
            if (req.query) {
                // check if content type is a post
                if (req.query.content_type === 'post') {

                    Post.findOne({
                        where: { movie_id: req.params.movie_id, post_id: req.params.content_id }
                    }).then(post => {

                        if (!post)
                            res.json({ error: 'Post not found' })

                        else {
                            Report.findOne({
                                where: { content_type: 'post', content_id: req.params.content_id }
                            }).then(report => {

                                if (!report) {
                                    Report.create({
                                        report_id: uuid(),
                                        type: req.query.type,
                                        content_id: req.params.content_id,
                                        content_type: req.query.content_type,
                                        movie_id: req.params.movie_id
                                    }).then(rep => {
                                        rep ? res.json('Report Submitted') : res.json('An error has occurred.')
                                    })
                                } else {
                                    Report.update({
                                        reports: report.dataValues.reports + 1
                                    }, {
                                            where: { report_id: report.dataValues.report_id }
                                        }).then(final => {
                                            res.json('Report Submitted')
                                        })
                                }
                            })
                        }
                    })
                } else if (req.query.content_type === 'review') {
                    Review.findOne({
                        where: { movie_id: req.params.movie_id, review_id: req.params.content_id }
                    }).then(review => {

                        if (!review)
                            res.json({ error: 'Review not found' })

                        else {

                            Report.findOne({
                                where: { content_type: 'review', content_id: req.params.content_id }
                            }).then(report => {

                                if (!report) {
                                    Report.create({
                                        report_id: uuid(),
                                        type: req.query.type,
                                        content_id: req.params.content_id,
                                        content_type: req.query.content_type,
                                        movie_id: req.params.movie_id
                                    }).then(rep => {
                                        rep ? res.json('Report Submitted') : res.json('An error has occurred.')
                                    })
                                } else {
                                    Report.update({
                                        reports: report.dataValues.reports + 1
                                    }, {
                                            where: { report_id: report.dataValues.report_id }
                                        }).then(final => {
                                            res.json('Report Submitted')
                                        })
                                }
                            })
                        }
                    })
                }
            }
        }
    })
})

// @route   GET api/reports/:status
// @desc    Returns all reports depending on status
// @access  Private
router.get('/status=:status', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.params.status) {

        const reports = await sequelize.query('SELECT r.report_id, r.type, r.reports, r.content_id, r.content_type, r.status, r.createdAt, r.updatedAt, r.movie_id, m.name FROM reports as r JOIN movies as m ON r.status = ? AND r.movie_id = m.movie_id ORDER BY r.reports DESC, r.createdAt ASC',
            { replacements: [req.params.status], type: sequelize.QueryTypes.SELECT })

        if (!reports)
            res.json({ error: 'There are no reports' })
        else {
            res.json(reports)
        }
    }
})

// @route   GET api/reports/:status
// @desc    Returns all reports depending on status
// @access  Private
router.get('/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const reports = await sequelize.query('SELECT r.report_id, r.type, r.reports, r.content_id, r.content_type, r.status, r.createdAt, r.updatedAt, r.movie_id, m.name FROM reports as r JOIN movies as m ON r.movie_id = m.movie_id ORDER BY r.reports DESC, r.createdAt ASC',
        { type: sequelize.QueryTypes.SELECT })

    if (!reports)
        res.json({ error: 'There are no reports' })
    else {
        res.json(reports)
    }
})

// @route   GET api/reports/:content_type/:content_id
// @desc    Returns a reported post/review 
// @access  Private
router.get('/:content_type/:report_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.params.report_id && req.params.content_type) {

        const report = await Report.findOne({
            where: { report_id: req.params.report_id, content_type: req.params.content_type }
        })

        if (!report)
            res.json({ error: 'Report not found' })
        else {
            if (report.content_type === 'post') {

                let post = await Post.findOne({
                    where: { post_id: report.content_id }
                })

                if (!post)
                    res.json({ error: 'Post not found' })
                else {

                    let user = await User.findOne({
                        where: { id: post.dataValues.owner }
                    })

                    post.dataValues.report_id = req.params.report_id
                    post.dataValues.avatar = user.dataValues.avatar
                    post.dataValues.username = user.dataValues.username
                    post.dataValues.reports = report.dataValues.reports
                    post.dataValues.type = report.dataValues.type
                    res.json(post)
                }

            } else if (report.content_type === 'review') {

                const review = await Review.findOne({
                    where: { review_id: report.content_id }
                })

                let user = await User.findOne({
                    where: { id: review.dataValues.owner }
                })

                if (!review)
                    res.json({ error: 'Review not found' })
                else {
                    review.dataValues.report_id = req.params.report_id
                    review.dataValues.avatar = user.dataValues.avatar
                    review.dataValues.username = user.dataValues.username
                    review.dataValues.reports = report.dataValues.reports
                    review.dataValues.type = report.dataValues.type
                    res.json(review)
                }
            }

        }

    } else {
        res.json({ error: 'An error has occured' })
    }
})

// @route   POST api/reports/result/:report_id/:result
// @desc    Applies the result from the admin
// @access  Private
router.post('/result/:report_id/:result', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.params.report_id && req.params.result) {

        const report = await Report.findOne({
            attributer: ['content_id', 'content_type'],
            where: { report_id: req.params.report_id }
        })

        // if result = Delete, set report status to 'Deleted' and exclude content from db
        if (req.params.result === 'Delete') {

            if (report) {
                const update = await Report.update({
                    status: 'Deleted'
                }, {
                        where: {
                            report_id: req.params.report_id
                        }
                    })

                if (report.dataValues.content_type === 'post') {
                    const post = Post.destroy({
                        where: { post_id: report.dataValues.content_id }
                    })

                    if (post && update)
                        res.json('Post excluded.')

                } else if (report.dataValues.content_type === 'review') {
                    const review = Review.destroy({
                        where: { review_id: report.dataValues.content_id }
                    })

                    if (review && update)
                        res.json('Review excluded.')
                }
            }
        } else if (req.params.result === 'Dismiss') {                        // if result equals 'Dismiss', update report to 'Dismissed'

            const update = Report.update({
                status: 'Dismissed'
            }, {
                    where: { report_id: req.params.report_id }
                })

            if (update)
                res.json('Report dismissed.')

        } else if (req.params.result === 'Suspend') {                        // if result equals 'Suspend', update report to 'User Suspended', delete post/review and set user to inactive

            const update = await Report.update({
                status: 'User Suspended'
            }, {
                    where: {
                        report_id: req.params.report_id
                    }
                })

            const user = User.update({
                is_active: 0
            }, {
                    where: { id: req.query.user }
                })

            if (report.dataValues.content_type === 'post') {
                const post = Post.destroy({
                    where: { post_id: report.dataValues.content_id }
                })

            } else if (report.dataValues.content_type === 'review') {
                const review = Review.destroy({
                    where: { review_id: report.dataValues.content_id }
                })

            }

            if (update && user) {
                res.json('User Suspended')
            }
        }
    }
})

module.exports = router