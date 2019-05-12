const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const User = require('./Users')
const Movie = require('./Movies').Movie
const uuid = require('uuid/v4')

const Report = sequelize.define('reports', {

    report_id: {
        type: Sequelize.STRING, primaryKey: true, defaultValue: uuid()
    },

    type: {
        type: Sequelize.STRING, allowNull: false
    },

    reports: {
        type: Sequelize.INTEGER, allowNull: false, defaultValue: 1
    },

    content_id: {
        type: Sequelize.STRING, allowNull: false
    },

    content_type: {
        type: Sequelize.STRING, allowNull: false
    },

    status: {
        type: Sequelize.STRING, allowNull: false, defaultValue: 'Pending'
    }
})

Report.belongsTo(Movie, { foreignKey: 'movie_id' })

// synchronize model
Report.sync().catch(err => {
    console.log('Unable to create/update reports model:', err)
})

module.exports = Report