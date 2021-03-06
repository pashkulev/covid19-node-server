const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dataParser = require('./data-parser');
const covidocController = require('./api/controllers/covidoc-controller');
const patientsController = require('./api/controllers/patient-controller');

const databaseUrl = 'mongodb+srv://vankata:' + process.env.MONGO_ATLAS_PASSWORD + '@covid-19-app.kopr8.mongodb.net/covid?retryWrites=true&w=majority';
mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

dataParser.initData();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET');
        return res.status(200).json({});
    }

    next();
});

app.use('/covidocs', covidocController);
app.use('/patients', patientsController);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;