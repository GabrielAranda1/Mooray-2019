const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')

const Report = require('../../models/Reports')
const Movie = require('../../models/Movies').Movie
const Post = require('../../models/Posts').Post
const Review = require('../../models/Posts').Review
const Comment = require('../../models/Posts').Comment
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
// @desc    Returns all pending reports
// @access  Private
router.get('/:status', (req, res) => {
    if (req.params.status) {

        Report.findAll({
            where: { status: req.params.status },
            order: [
                ['reports', 'DESC'],
                ['createdAt', 'ASC']
            ]
        }).then(reports => {
            if (!reports)
                res.json({ error: 'There are no reports' })
            else
                res.json(reports)
        })
    }
})

// @route   GET api/reports/:content_type/:content_id
// @desc    Returns a reported post/review 
// @access  Private
router.get('/:content_type/:report_id', async (req, res) => {
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
                    post.dataValues.reports = report.dataValues.reports
                    post.dataValues.type = report.dataValues.type
                    res.json(post)
                }

            } else if (report.content_type === 'review') {

                const review = await Review.findOne({
                    where: { review_id: report.content_id }
                })

                if (!review)
                    res.json({ error: 'Review not found' })
                else {
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

module.exports = router