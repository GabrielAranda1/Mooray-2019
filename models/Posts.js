const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const User = require('./Users')
const Movie = require('./Movies').Movie
const uuid = require('uuid/v4')

const Post = sequelize.define('post', {

    post_id: {
        type: Sequelize.STRING, primaryKey: true, defaultValue: uuid()
    },

    title: {
        type: Sequelize.STRING,
        allowNull: false
    },

    text: {
        type: Sequelize.STRING,
        allowNull: false
    },

    likes: {
        type: Sequelize.INTEGER,
        allowNull: false, defaultValue: 0
    },

    commentaries: {
        type: Sequelize.INTEGER,
        allowNull: false, defaultValue: 0
    }
}, {
        timestamps: true
    })

const Review = sequelize.define('reviews', {

    review_id: {
        type: Sequelize.STRING, primaryKey: true, defaultValue: uuid()
    },

    text: {
        type: Sequelize.STRING,
        allowNull: false
    },

    likes: {
        type: Sequelize.INTEGER,
        allowNull: false, defaultValue: 0
    },

    commentaries: {
        type: Sequelize.INTEGER,
        allowNull: false, defaultValue: 0
    }
})

const Comment = sequelize.define('comment', {

    comment_id: {
        type: Sequelize.STRING, primaryKey: true, defaultValue: uuid()
    },

    text: {
        type: Sequelize.STRING,
        allowNull: false
    },

    likes: {
        type: Sequelize.INTEGER,
        allowNull: false, defaultValue: 0
    }
}, {
        timestamps: true
    })

Post.belongsTo(User, { foreignKey: 'owner' })
Post.belongsTo(Movie, { foreignKey: 'movie_id' })

Review.belongsTo(User, { foreignKey: 'owner' })
Review.belongsTo(Movie, { foreignKey: 'movie_id' })

Comment.belongsTo(Post, { foreignKey: 'post_id' })
Comment.belongsTo(User, { foreignKey: 'owner' })

Post.belongsToMany(User, { foreignKey: 'post_id', through: 'post_like', primaryKey: true })							// post likes 
User.belongsToMany(Post, { foreignKey: 'user_id', through: 'post_like', primaryKey: true })							// post likes 

Review.belongsToMany(User, { foreignKey: 'review_id', through: 'review_like', primaryKey: true })					// review likes 
User.belongsToMany(Review, { foreignKey: 'user_id', through: 'review_like', primaryKey: true })						// review likes 

Comment.belongsToMany(User, { foreignKey: 'comment_id', through: 'comment_like', primaryKey: true })
User.belongsToMany(Comment, { foreignKey: 'user_id', through: 'comment_like', primaryKey: true })

// synchronize model
Post.sync().catch(err => {
    console.log('Unable to create posts model:', err)
})

module.exports = {
    Post,
    Review,
    Comment,
    sequelize
}