const express = require('express')
const router = express.Router()

const Patient = require('../models/patient-data');

router.get('/', async (req, res, next) => {
    try {
        const patients = await Patient.find({}).limit(100);
        res.status(200).json(patients);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error});
    }
})

module.exports = router;