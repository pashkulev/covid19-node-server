const express = require('express');
const router = express.Router();

const Product = require('./models/product');
const CoviDoc = require('./models/covid-data');

router.get('/country-region', async (req, res, next) => {
    try {
        const countryRegions = await CoviDoc.find({})
            .map(doc => doc.country_region)
            .distinct("country_region");
        res.status(200).json(countryRegions)
    } catch (error) {
        res.status(500).json({error: error});
    }
});

router.get('/province-state', async (req, res, next) => {
    try {
        const countryRegion = req.query.country_region;
        const provinceStates = await CoviDoc.find({country_region: countryRegion})
            .where("province_state").ne("")
            .distinct("province_state");
        removeCountryRegionFromProvinceStates(provinceStates, countryRegion);
        res.status(200).json(provinceStates);
    } catch (error) {
        res.status(500).json({error: error});
    }  
});

router.get('/covidocs', async (req, res, next) => {
    try {
        const countryRegion = req.query.country_region;
        const provinceState = req.query.province_state;
        const covidocs = await CoviDoc.find({
            province_state: provinceState,
            country_region: countryRegion
        });
        res.status(200).json(covidocs);
    } catch (error) {
        res.status(500).json({error: error});
    }
});

router.get('/worldwide-stats', async (req, res, next) => {
    handleWorldwideOrCountryRegionRequest(req, res);
});

router.get('/country-region-stats', async (req, res, next) => {
    handleWorldwideOrCountryRegionRequest(req, res);
});

// router.post('/products', (req, res, next) => {
//     const product = new Product({
//         _id: new mongoose.Types.ObjectId(),
//         name: req.body.name,
//         price: req.body.price
//     });
//     product
//         .save()
//         .then(result => {
//             console.log(result);
//             res.status(201).json({
//                 message: 'Handling POST requests to /products',
//                 createdProduct: result
//             });
//         })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({error: err});
//     });
   
// });

// router.get('/products', (req, res, next) => {
//     Product.find()
//         .exec()
//         .then(docs => {
//             const data = parser.initData();
//             console.log(data);
//             res.status(200).json(data);
//         })
//         .catch(err => res.status(500).json({error: err}));
// });

// router.get('/products/:productId', (req, res, next) => {
//     const productId = req.params.productId;
//     Product.findById(productId)
//         .exec()
//         .then(doc => {
//             if (doc) {
//                 console.log(doc);
//                 res.status(200).json({
//                     product: doc
//                 });
//             } else {
//                 res.status(404).json({
//                     message: 'Product not found'
//                 })
//             }
            
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({error: err});
//         });
    
// });

// router.patch('/products/:productId', (req, res, next) => {
//     const id = req.params.productId;
//     const updateOps = {};

//     for (const ops of req.body) {
//         updateOps[ops.propName] = ops.propValue;
//     }

//     Product.update({_id: id}, {$set: updateOps})
//         .exec()
//         .then(result => {
//             console.log(result);
//             res.status(200).json(result);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({error: err});
//         });
// })

// router.delete("/products/:productId", (req, res, next) => {
//     const productId = req.params.productId;
//     console.log(productId);
//     Product.remove({_id: productId})
//         .exec()
//         .then(result => {
//             res.status(200).json(result);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({error: err});
//         });
// });

// this method removes Province/State if it is the same as Country/Region
const removeCountryRegionFromProvinceStates = (provinceStates, countryRegion) => {
    const countryRegionIndex = provinceStates.indexOf(countryRegion);

    if (countryRegionIndex !== -1) {
        provinceStates.splice(countryRegionIndex, 1);
    }
} 

const handleWorldwideOrCountryRegionRequest = async (req, res) => {
    try {
        const aggregate = CoviDoc.aggregate([]);
        const countryRegion = req.query.name;
        
        if (countryRegion && req.url.startsWith('/country-region')) {
            aggregate.match({country_region: countryRegion});
        }

        aggregate.group({
            _id: '$observationDate',
            confirmed: {$sum: '$confirmed'},
            recovered: {$sum: '$recovered'},
            deaths: {$sum: '$deaths'}
        });
        aggregate.sort({_id: 1});
        aggregate.project({
            _id: 0,
            observationDate: '$_id',
            confirmed: 1,
            recovered: 1,
            deaths: 1
        });
        
        const results = await aggregate.exec();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({error: error});
    }
}

module.exports = router;