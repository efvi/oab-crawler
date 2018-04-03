'use strict'

const app = require('../src/app')
const path = require('path')
// const admin = require('firebase-admin')
const debug = require('debug')('oab7:app')
// const config = require('../config/constants')
// const serviceAccount = require('../serviceAccountKey.json')

process.on('unhandledRejection', (err) => { 
    debug(`ERR: ${err}`)
    process.exit(1)
})

// try {
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: config.firebase.database
//     })
// } catch(err) {
//     debug(`ERR: ${err}`)
//     process.exit(1)
// }

app.main()