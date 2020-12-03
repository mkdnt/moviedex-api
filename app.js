require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors')
const movies = require('./movies-data.json')

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    console.log('validate bearer token middleware')
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized Request'})
    }
    next();
})

function handleGetMovies(req, res){
    const {genre, country, avg_vote} = req.query;
    let results = [...movies];

    if (country) {
        results = results.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase())) 
    }

    if (genre) {
        results = results.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }

    if (avg_vote) {
        results = results.filter(movie => Number(movie.avg_vote) >= Number(avg_vote))
    }

    return res
    .json(results)
}

app.get('/movie', handleGetMovies)

app.get('/', (req, res) => {
    let results = [...movies]

    res
    .json(results)
})

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        response = {error}
    }
    res.status(500).json(response)
})


module.exports = app;