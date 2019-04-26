const isEmpty = require('./isEmpty')
const validator = require('validator')

module.exports = function validateNewMovie(data) {
    let errors = {}

    // if data is not empty keep it, else make it a string
    data.name = !isEmpty(data.name) ? data.name : ''
    data.description = !isEmpty(data.description) ? data.description : ''
    data.release_date = !isEmpty(data.release_date) ? data.release_date : ''
    data.duration = !isEmpty(data.duration) ? data.duration : ''
    data.character_name = !isEmpty(data.character_name) ? data.character_name : ''
    data.director_id = !isEmpty(data.director_id) ? data.director_id : ''
    data.performer_id = !isEmpty(data.performer_id) ? data.performer_id : ''
    data.cover = !isEmpty(data.cover) ? data.cover : ''

    let performer_list = []
    let character_list = []

    // forces id list to array type
    performer_list.push(data.performer_id)
    character_list.push(data.character_name)

    if (validator.isEmpty(data.name)) {
        errors.name = 'Name field is required'
    }

    if (validator.isEmpty(data.description)) {
        errors.description = 'Description field is required'
    }

    if (validator.isEmpty(data.release_date)) {
        errors.release_date = 'Release date field is required'
    }

    if (validator.isEmpty(data.duration)) {
        errors.duration = 'Duration field is required'
    }

    if (!validator.isInt(data.duration)) {
        errors.duration = 'Duration must be an integer number'
    }

    if (isEmpty(data.director_id)) {
        errors.director_id = 'At least one director is required'
    }

    //if (isEmpty(data.performer_id)) {
    //    errors.performer_id = 'At least one performer is required'
    // }

    if (validator.isEmpty(data.cover)) {
        errors.cover = 'A cover is required'
    }

    if (!validator.isLength(data.cover, { min: 40 })) {
        data.cover = 'https://afridocs.net/wp-content/uploads/2017/01/500x735.png'
    }
    // if (performer_list.length != character_list.length) {
    //   errors.performer_id = 'Every performer must have a character'
    //}
    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
}

