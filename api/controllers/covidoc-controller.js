const express = require('express')
const router = express.Router()

const CoviDoc = require('../models/covidoc-data')

router.get('/', async (req, res, next) => {
  try {
    const countryRegion = req.query.country_region
    const provinceState = req.query.province_state
    const covidocs = await CoviDoc.find({
      province_state: provinceState,
      country_region: countryRegion,
    })
    res.status(200).json(covidocs)
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

router.get('/country-regions', async (req, res, next) => {
  try {
    const countryRegions = await CoviDoc.find({})
      .map((doc) => doc.country_region)
      .distinct('country_region')
    res.status(200).json(countryRegions)
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

router.get('/province-states', async (req, res, next) => {
  try {
    const countryRegion = req.query.country_region
    const provinceStates = await CoviDoc.find({ country_region: countryRegion })
      .where('province_state')
      .ne('')
      .distinct('province_state')
    removeCountryRegionFromProvinceStates(provinceStates, countryRegion)
    res.status(200).json(provinceStates)
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

router.get('/worldwide-timeline', (req, res, next) => {
  handleWorldwideOrCountryRegionRequest(req, res)
})

router.get('/country-region-timeline', (req, res, next) => {
  handleWorldwideOrCountryRegionRequest(req, res)
})

router.get('/country-region-aggregates', async (req, res, next) => {
  try {
    const aggregate = CoviDoc.aggregate([
      {
        $group: {
          _id: '$country_region',
          confirmed: { $sum: '$confirmed' },
          recovered: { $sum: '$recovered' },
          deaths: { $sum: '$deaths' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          country_region: '$_id',
          confirmed: 1,
          recovered: 1,
          deaths: 1,
        },
      },
    ])

    const results = await aggregate.exec()
    res.status(200).json(results)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error })
  }
})

const removeCountryRegionFromProvinceStates = (
  provinceStates,
  countryRegion,
) => {
  const countryRegionIndex = provinceStates.indexOf(countryRegion)

  if (countryRegionIndex !== -1) {
    provinceStates.splice(countryRegionIndex, 1)
  }
}

const handleWorldwideOrCountryRegionRequest = async (req, res) => {
  try {
    const aggregate = CoviDoc.aggregate([])
    const countryRegion = req.query.name

    if (countryRegion && req.url.startsWith('/country-region')) {
      aggregate.match({ country_region: countryRegion })
    }

    aggregate.group({
      _id: '$observationDate',
      confirmed: { $sum: '$confirmed' },
      recovered: { $sum: '$recovered' },
      deaths: { $sum: '$deaths' },
    })
    aggregate.sort({ _id: 1 })
    aggregate.project({
      _id: 0,
      observationDate: '$_id',
      confirmed: 1,
      recovered: 1,
      deaths: 1,
    })

    const results = await aggregate.exec()
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

module.exports = router
