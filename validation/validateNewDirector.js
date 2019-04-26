const isEmpty = require('./isEmpty')
const validator = require('validator')

module.exports = function validateNewDirector(data) {
    let errors = {}

    // if data is not empty keep it, else make it a string
    data.name = !isEmpty(data.name) ? data.name : ''
    data.lastname = !isEmpty(data.lastname) ? data.lastname : ''
    data.bio = !isEmpty(data.bio) ? data.bio : ''
    data.birthdate = !isEmpty(data.birthdate) ? data.birthdate : ''
    data.deathdate = !isEmpty(data.deathdate) ? data.deathdate : null
    data.picture = !isEmpty(data.picture) ? data.picture : ''

    let birthdate = new Date(data.birthdate)
    let deathdate = new Date(data.deathdate)

    if (validator.isEmpty(data.name)) {
        errors.name = 'Name field is required'
    }

    if (validator.isEmpty(data.lastname)) {
        errors.lastname = 'Last name field is required'
    }

    if (validator.isEmpty(data.birthdate)) {
        errors.birthdate = 'Birth date field is required'
    }

    if (validator.isAfter(birthdate.toString())) {
        errors.birthdate = 'Please specify a valid birth date'
    }

    if (validator.isAfter(deathdate.toString())) {
        errors.deathdate = 'Please specify a valid death date'
    }

    if (!validator.isLength(data.bio, { min: 20, max: 4999 })) {
        errors.bio = 'Bio must have length between 20 and 4999 characters.'
    }

    if (validator.isEmpty(data.bio)) {
        errors.bio = 'Bio field is required'
    }

    if (validator.isEmpty(data.picture)) {
        errors.picture = 'Picture field is required'
    }

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
}

