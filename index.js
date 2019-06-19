const authenticate = require('./lib/authentication'),
    workouts = require('./lib/workouts'),
    workout = require('./lib/workout'),
    fs = require('fs'),
    path = require('path')

/**
 * Download workouts data of given user
 * @param {*} params {email: 'user@email.com', password: 'password', after: '2013-11-10 00:00:00 UTC'}
 */
const download = async (params, baseDir) => {
    let data = null
    let fileName = params.fileName
    baseDir = baseDir || __dirname
    console.log(`Authenticating..`)
    try {
        let auth = await authenticate(params)
        let workoutsData = []
        let maxResults = 100
        let after = params.after
        let res = {}

        let d = new Date(params.after)
        fileName = params.fileName || `workouts_${auth.userId}_${d.getUTCFullYear()}${d.getUTCMonth() + 1}${d.getUTCDate()}.json`
        fileName = path.join(baseDir, fileName)
                
        let isFileExists = await checkFileExists(fileName)
        if (isFileExists) {
            console.log(`Existing file found ${fileName} ..`)
            // read file
            data = await readJsonFile(fileName)
            // workouts are sorted descending
            after = data.workouts[0].start_time
        }

        // download all workouts data
        do {
            console.log(`Downloading workouts after ${after} ...`)
            res = await workouts({authToken: auth.authToken, maxResults: maxResults, after: after})
            if (res.data && res.data.length > 0) {
                workoutsData = workoutsData.concat(res.data)
                after = res.data[0].start_time
            }
        } while (res.data && res.data.length > 0)
        
        // save to file
        if (workoutsData.length > 0) {    
            if (data) {
                data.workouts = workoutsData.concat(data.workouts)
            } else {
                data = {userId: auth.userId, gender: params.gender, weight: params.weight, workouts: workoutsData}
            }
        } else {
            console.log('No workouts data found')
        }
        
        // load details
        console.log('Fetching more details..')
        for (let i = 0; i < data.workouts.length; i++) {
            let w = data.workouts[i]
            if (!w.points) {
                console.log(`Fetching details for workout ${w.id} ..`)
                let details = await workout.get({authToken: auth.authToken, workoutId: w.id, fields: 'points,polyline_encoded_small'})
                data.workouts[i].points = details.points
                data.workouts[i].polyline_encoded_small = details.polyline_encoded_small
            }
        }

        // update data
        console.log(`Saving to file ${fileName}..`)
        await writeJsonFile(fileName, data)

        console.log('Bye.')  
    } catch (error) {
        console.error(error)
        // attempt to save data
        if (data && fileName) {
            console.log(`Saving to file ${fileName}..`)
            await writeJsonFile(fileName, data)
        }                
    }   
}

const checkFileExists = async (filepath) => {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.F_OK, (err) => {
            if (err) resolve(false)
            resolve(true)
        })    
    })
}

const readJsonFile = async (filepath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {  
            if (err) reject(err)
            resolve(JSON.parse(data))
        })        
    })    
}

const writeJsonFile = async (filepath, data) => {
    data = JSON.stringify(data)
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, data, (err) => {  
            if (err) reject(err)
            resolve(true)
        });
    })    
}

module.exports= { authenticate, workouts, workout, download }