const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

const readFirstWorkoutFile = async () => {   
    let dir = path.join(__dirname, 'data')
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function(err, files) {
            if (err) reject(err)
            let found = false
            for(let i = 0; i < files.length; i++) {
                let name = files[i]
                if(path.extname(name) === ".json") {
                    found = true
                    fs.readFile(path.join(dir, name), (err, data) => {
                        if (err) reject(err)
                        resolve(JSON.parse(data))
                    })
                    break
                }                
            }
            if (!found) resolve({})
        })    
    }) 
}

// middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// frontend
app.use('/', express.static('static'))

// apis
app.get('/workouts', async (req, res, next) => {    
    try {        
        let data = await readFirstWorkoutFile()
        res.json(data)
    } catch (err) {
        next(err)
    }
})

// default error handler
app.use(function (err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: err })
    } else {
        next(err)
    }
})

app.listen(port, () => console.log(`Express running on http://localhost:${port} ..`))