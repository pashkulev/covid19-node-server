This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Covid Statistics App

- [Description](#description)

## Description
This is a Node.js server app providing REST API for the Covid-19 React application.
It is using Mongo Atlas as its database. There are 2 data models: 
- CoviDoc: represents data from the covid_19_data.csv file
- Patient: represents data from the COVID19_line_list_data.csv file
 
and 2 controllers providing REST endpoints for fetching data about each of the 2 data models
