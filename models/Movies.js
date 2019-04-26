const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const User = require('./Users')

// define Movie model
const Movie = sequelize.define('movies', {

    movie_id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING(2500), allowNull: false },
    rate: { type: Sequelize.FLOAT, defaultValue: 0 },
    release_date: { type: Sequelize.DATE, allowNull: false },
    duration: { type: Sequelize.INTEGER, allowNull: false },
    is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    cover: { type: Sequelize.STRING, allowNull: false },
}, {
        timestamps: true
    }
)

// define Director model
const Director = sequelize.define('directors', {

    director_id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    lastname: { type: Sequelize.STRING, allowNull: false },
    bio: { type: Sequelize.STRING(5000), allowNull: true },
    birthdate: { type: Sequelize.DATEONLY, allowNull: false },
    deathdate: { type: Sequelize.DATEONLY, allowNull: true },
    picture: { type: Sequelize.STRING, allowNull: false }

}, {
        timestamps: true
    }
)

const Performer = sequelize.define('performers', {

    performer_id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    lastname: { type: Sequelize.STRING, allowNull: false },
    bio: { type: Sequelize.STRING(5000), allowNull: true },
    birthdate: { type: Sequelize.DATEONLY, allowNull: false },
    deathdate: { type: Sequelize.DATEONLY, allowNull: true },
    picture: { type: Sequelize.STRING, allowNull: false }
}, {
        timestamps: true
    }
)

const Character = sequelize.define('characters', {
    character_id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
})

const MovieRate = sequelize.define('movie_rate', {
    rate: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
}, {
        freezeTableName: true
    }
)

const MovieUser = sequelize.define('movie_user', {
    favorite: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
}, {
        freezeTableName: true
    }
)

// creates many-to-many tables
Movie.belongsToMany(Director, { through: 'movie_director', foreignKey: 'movie_id' })
Director.belongsToMany(Movie, { through: 'movie_director', foreignKey: 'director_id' })

Movie.belongsToMany(Performer, { through: 'movie_performer', foreignKey: 'movie_id' })
Performer.belongsToMany(Movie, { through: 'movie_performer', foreignKey: 'performer_id' })

Character.belongsToMany(Movie, { through: 'movie_character', foreignKey: 'character_id' })
Movie.belongsToMany(Character, { through: 'movie_character', foreignKey: 'movie_id' })

Character.belongsTo(Performer, { foreignKey: 'performer_id' })

Movie.belongsToMany(User, { through: 'movie_user', foreignKey: 'movie_id' })
User.belongsToMany(Movie, { through: 'movie_user', foreignKey: 'user_id' })

Movie.belongsToMany(User, { through: 'movie_rate', foreignKey: 'movie_id', primaryKey: true })
User.belongsToMany(Movie, { through: 'movie_rate', foreignKey: 'user_id', primaryKey: true })

// synchronize model
sequelize.sync().then(() => {
    console.log('Models created/updated.')
}).catch(err => {
    console.log('Unable to create models:', err)
})

module.exports = {
    Movie,
    Director,
    Character,
    Performer,
    MovieRate,
    MovieUser,
    sequelize
}