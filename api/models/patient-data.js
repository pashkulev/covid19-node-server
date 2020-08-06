const mongoose = require('mongoose');

const covidPatientSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ordinalId: Number,
    caseInCountry: Number,
    reportingDate: mongoose.Schema.Types.Date,
    summary: String,
    location: String,
    country: String,
    gender: String,
    age: Number,
    symptomOnset: mongoose.Schema.Types.Date,
    onsetApproximated: Boolean,
    hospVisitDate: mongoose.Schema.Types.Date,
    exposureStart: mongoose.Schema.Types.Date,
    exposureEnd: mongoose.Schema.Types.Date,
    isVisitingWuhan: Boolean,
    isFromWuhan: Boolean,
    dateOfDeath: mongoose.Schema.Types.Date,
    recoveryDate: mongoose.Schema.Types.Date,
    symptoms: String,
    source: String,
    link: String
});

module.exports = mongoose.model('Patient', covidPatientSchema);