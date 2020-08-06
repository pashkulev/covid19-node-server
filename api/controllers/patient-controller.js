const express = require("express");
const router = express.Router();
const url = require("url");
const queryString = require("querystring");

const Patient = require("../models/patient-data");

router.get("/", async (req, res, next) => {
  try {
    const parsedUrl = url.parse(req.url);
    const parsedQueryParams = queryString.parse(parsedUrl.query);
    const fromAge = parsedQueryParams.fromAge || 0;
    delete parsedQueryParams.fromAge;
    const toAge = parsedQueryParams.toAge || 120;
    delete parsedQueryParams.toAge;
    const searchObj = {
        ...parsedQueryParams,
        age: { $gte: fromAge, $lte: toAge },
    }

    const patients = await Patient.find(searchObj);
    res.status(200).json(patients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});



router.get("/countries", async (req, res, next) => {
  try {
    const countries = await Patient.find({})
      .map((p) => p.country)
      .distinct("country");
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/locations", async (req, res, next) => {
  try {
    const country = req.query.country;
    const locations = await Patient.find({ country: country })
      .where("location")
      .ne("")
      .distinct("location");
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/age-stats", async (req, res, next) => {
  try {
    const aggregate = Patient.aggregate([]);
    const patientStatus = req.query.status;

    if (patientStatus === "recovered") {
      aggregate.match({ recoveryDate: { $ne: null }, age: { $ne: null } });
    } else if (patientStatus === "death") {
      aggregate.match({ dateOfDeath: { $ne: null }, age: { $ne: null } });
    }

    aggregate.group({
      _id: "$age",
      count: { $sum: 1 },
    });
    aggregate.sort({ _id: 1 });
    aggregate.project({
      _id: 0,
      age: "$_id",
      count: 1,
    });

    const results = await aggregate.exec();
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/:id/details", async (req, res, next) => {
    try {
        const id = req.params.id;
        const patient = await Patient.findById(id);
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ error: error });
    }

});

module.exports = router;
