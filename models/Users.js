const Sequelize = require('sequelize')
const sequelize = require('../config/db')

// define Movie model
const User = sequelize.define('tb_user', {

    ID: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    last_name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    role: { type: Sequelize.STRING, allowNull: false, defaultValue: 'USER' },
    avatar: { type: Sequelize.STRING, allowNull: false },
    bio: { type: Sequelize.STRING, allowNull: true },
    username: { type: Sequelize.STRING, allowNull: false },
    is_active: { type: Sequelize.BOOLEAN, allowNull: false },
    country: { type: Sequelize.STRING, allowNull: false },
    state: { type: Sequelize.STRING, allowNull: true },
    city: { type: Sequelize.STRING, allowNull: true },
}, {
        timestamps: true,
        freezeTableName: true
    })

// synchronize model
User.sync().catch(err => {
    console.log('Unable to create user model:', err)
})

module.exports = User