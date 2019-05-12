const isEmpty = require('./isEmpty')
const validator = require('validator')

module.exports = function validateNewReview(data) {
    let errors = {}

    // if data is not empty keep it, else make it a string
    data.text = !isEmpty(data.text) ? data.text : ''

    if (!validator.isLength(data.text, { max: 250 })) {
        errors.text = 'Character limit is 250'
    }

    if (validator.isEmpty(data.text)) {
        errors.text = 'text field is required'
    }

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
}