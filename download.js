const endomondo = require('./index')
const ArgumentParser = require('argparse').ArgumentParser
const path = require('path')

const dateParser = (str) => {
    let dt = new Date(str)
    let M = `${dt.getUTCMonth()+1}`.padStart(2, '0')
    let D = `${dt.getUTCDate()}`.padStart(2, '0')
    let H = `${dt.getUTCHours()}`.padStart(2, '0')
    let m = `${dt.getUTCMinutes()}`.padStart(2, '0')
    let s = `${dt.getUTCSeconds()}`.padStart(2, '0')
    return `${dt.getUTCFullYear()}-${M}-${D} ${H}:${m}:${s} UTC`
} 

parser = new ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'Endomondo workouts downloader'
})

parser.addArgument('email', {help: 'Endomondo account email'})
parser.addArgument('password', {help: 'Endomondo account password'})
parser.addArgument(['-a', '--after'], {required: true, type: dateParser, metavar: 'first_date', help: 'First workout date (YYYY-MM-DD)'})
parser.addArgument(['-g', '--gender'], {required: true, choices: ['M', 'F'], help: 'Gender to calculate value such as VO2 Max'})
parser.addArgument(['-w', '--weight'], {required: true, type: parseInt, help: 'Body weight (Kg) to calculate value such as VO2 Max'})
let args = parser.parseArgs()

endomondo.download({
    email: args.email,
    password: args.password,
    after: args.after,
    fileName: args.fileName, 
}, path.join(__dirname, 'data'))
