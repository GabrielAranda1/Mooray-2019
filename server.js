const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport')

const movies = require('./routes/api/movie')
const directors = require('./routes/api/director')
const performers = require('./routes/api/performer')
const users = require('./routes/api/user')
const posts = require('./routes/api/post')
const reviews = require('./routes/api/review')
const lists = require('./routes/api/list')
const reports = require('./routes/api/report')

const db = require('./config/db')
const app = express()

// use routes
app.use(cors())
app.options('*', cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Authenticate db
db
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.')
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err)
    })

// passport middleware
app.use(passport.initialize())

// passport config
require('./config/passport')(passport)

app.use('/api/movies', movies)
app.use('/api/directors', directors)
app.use('/api/performers', performers)
app.use('/api/users', users)
app.use('/api/posts', posts)
app.use('/api/reviews', reviews)
app.use('/api/lists', lists)
app.use('/api/reports', reports)

const port = process.env.PORT || 5000

app.listen(port, () => console.log('Server is running on port', port))