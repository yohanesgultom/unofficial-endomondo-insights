const request = require('request-promise-native'),
    common = require('./common')

let workouts = async (params) => {
    let url = `${common.urls.api}${common.urls.paths.activitiesList}`
    return request.get({url: url, qs: params, json: true})
}

module.exports = workouts