const isEmpty = require('./isEmpty')
const validator = require('validator')

module.exports = function validateNewList(data) {

    let errors = {}

    // if data is not empty keep it, else make it a string
    data.list_name = !isEmpty(data.list_name) ? data.list_name : ''
    data.description = !isEmpty(data.description) ? data.description : ''

    if (!validator.isLength(data.list_name, { max: 250 })) {
        errors.list_name = 'Character limit is 100'
    }

    if (validator.isEmpty(data.list_name)) {
        errors.list_name = 'List name field is required'
    }

    if (!validator.isLength(data.description, { max: 250 })) {
        errors.description = 'Character limit is 250'
    }

    if (validator.isEmpty(data.description)) {
        errors.description = 'Description field is required'
    }

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
}