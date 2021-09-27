/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: KEVIN SAN PEDRO Student ID:023503139 Date:2021-09-26
*
* Online (Heroku) Link: https://obscure-plateau-20353.herokuapp.com/
*
********************************************************************************/ 

//first step is to "require" this module at the top of your server.js file so that we can use it to interact with the data from server.js
var dataService = require("./data-service");
var express = require("express");
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;

onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}

app.use(express.static('public'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + "/views/home.html"));
});


app.get('/home', (request, response) => {
    response.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/about', (request, response) => {
    response.sendFile(path.join(__dirname + "/views/about.html"));
});


//step 5 and 6
app.get("/employees", (request, response) => {
   getAllEmployees().then((data) => {
        response.json(data);
    }).catch((err) => {
        response.json({message: err});
    })
});

app.get("/managers", (request, response) => {
    getManagers().then((data) => {
        response.json(data);
    }).catch((err) => {
        response.json({message: err});
    })
});
app.get("/departments", (request, response) => {
    getDepartments().then((data) => {
        response.json(data);
    }).catch((err) => {
        response.json({message: err});
    })
});

//step 3 [no matching route] // note week 4
app.use((req, res) => {
    res.status(404).send("Error 404! page Not Found");
});

//Step 5: week 2 notes and week 3 then
initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("Error");
});