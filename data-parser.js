const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const iconv = require('iconv-lite');
const CoviDoc = require('./api/models/covidoc-data');
const Patient = require('./api/models/patient-data');

const initData = () => {
    initCovidocs();
    initCovidPatients();
}

const initCovidocs = () => {
    CoviDoc.countDocuments({}, (err, count) => {
        console.log("Covid Docs Count: " + count);

        if (err) {
            console.log(err);
            return;
        }

        if (count === 0) {
            fs.createReadStream('./data/covid_19_data.csv')
                .pipe(csv())
                .on('data', (data) => {
                    const coviDoc = new CoviDoc({
                        _id: new mongoose.Types.ObjectId(),
                        sno: data['Sno'],
                        observationDate: data['ObservationDate'],
                        province_state: data["Province/State"],
                        country_region: data["Country/Region"],
                        lastUpdate: data["Last Update"],
                        confirmed: data["Confirmed"],
                        deaths: data["Deaths"],
                        recovered: data["Recovered"]
                    });
    
                    coviDoc.save()
                        .then(newCoviDoc => console.log("Saved: " + newCoviDoc))
                        .catch(error => console.log(error));
                });
        }
    });
};

const initCovidPatients = () => {
    Patient.countDocuments({}, (err, count) => {
        console.log("Patients Count: " + count);

        if (err) {
            console.log(error);
            return;
        }
    
        if (count === 0) {
            fs.createReadStream('./data/COVID19_line_list_data.csv')
                .pipe(iconv.decodeStream('utf8'))
                .pipe(csv())
                .on('data', (data) => {
                    const patient = new Patient({
                        _id: new mongoose.Types.ObjectId(),
                        ordinalId: data['id'],
                        caseInCountry: notAvailableValueHandler(data, 'case_in_country'),
                        reportingDate: notAvailableValueHandler(data, 'reporting date'),
                        summary: data['summary'],
                        location: data['location'],
                        country: data['country'],
                        gender: notAvailableValueHandler(data, 'gender'),
                        age: notAvailableValueHandler(data, 'age'),
                        symptomOnset: notAvailableValueHandler(data, 'symptom_onset'),
                        onsetApproximated: notAvailableValueHandler(data, 'If_onset_approximated'),
                        hospVisitDate: notAvailableValueHandler(data, 'hosp_visit_date'),
                        exposureStart: notAvailableValueHandler(data, 'exposure_start'),
                        exposureEnd: notAvailableValueHandler(data, 'exposure_end'),
                        isVisitingWuhan: notAvailableValueHandler(data, 'visiting Wuhan'),
                        isFromWuhan: notAvailableValueHandler(data, 'from Wuhan'),
                        dateOfDeath: dateValueHandler(data['death']),
                        recoveryDate: dateValueHandler(data['recovered']),
                        symptoms: data['symptom'].split(",").filter(e => e !== ""),
                        source: data['source'],
                        link: data['link']
                    });

                    patient.save()
                        .then(result => console.log("Saved: " + result))
                        .catch(error => console.log(error));
                });
        }
    });  
};

const notAvailableValueHandler = (data, fieldName) => {
    return data[fieldName] === 'NA' ? null : data[fieldName];
};

const dateValueHandler = (date) => {
    return date == 0 || date == 1 ? null : date;
};

module.exports = {initData};
