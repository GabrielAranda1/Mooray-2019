const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const User = require('./Users')
const Movie = require('./Movies').Movie

// define List model
const List = sequelize.define('lists', {
    list_id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    list_name: { type: Sequelize.STRING(100), allowNull: false },
    description: { type: Sequelize.STRING(250), allowNull: true }
})

List.belongsTo(User, { foreignKey: 'owner' })

List.belongsToMany(Movie, { foreignKey: 'list_id', through: 'list_movie', primaryKey: true })
Movie.belongsToMany(List, { foreignKey: 'movie_id', through: 'list_movie', primaryKey: true })

// synchronize model
List.sync().catch(err => {
    console.log('Unable to create lists model:', err)
})

module.exports = {
    List
}