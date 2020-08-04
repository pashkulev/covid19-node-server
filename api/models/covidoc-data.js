const mongoose = require('mongoose');

const covidocDataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sno: Number,
    observationDate: mongoose.Schema.Types.Date,
    province_state: String,
    country_region: String,
    lastUpdate: mongoose.Schema.Types.Date,
    confirmed: Number,
    deaths: Number,
    recovered: Number
});

module.exports = mongoose.model('CoviDoc', covidocDataSchema);