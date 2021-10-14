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
var  dataService = require('./data-service.js');
const  express = require("express");
const  app = express();
const  path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
let  fs = require('fs'); 
const { response } = require('express');

const  HTTP_PORT = process.env.PORT || 8080;

/** use static folder to load image from the server after sending it**/ 
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}

/*************Support Image uploads***************/ 
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

/*************Html Routes **************/ 
app.get('/', (req, response) => {
    response.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/home', (req, response) => {
    response.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/about', (req, response) => {
    response.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/employees", (req, response) => { 
    //week 4 property or method. sending data from the client to the server is in the query string. E.g. /user?user=bob req.query.user
    /*‘query’ will be an object with key value pairs matching the key value pairs sent in the query string of the req. */
    if(req.query.status){
        getEmployeesByStatus(req.query.status).then((data) => {response.json(data);})
        }
    else if(req.query.department){
        getEmployeesByDepartment(req.query.department).then((data) => {response.json(data);})
        }
    else if(req.query.manager){
        getEmployeesByManager(req.query.manager).then((data) => {response.json(data);})
        }
    else 
        getAllEmployees().then((data) => {
                response.json(data);
            }).catch((err) => {
                response.json({message: err});
    })
});

app.get("/managers", (req, response) => {
    getManagers().then((data) => {
        response.json(data);
    }).catch((err) => {
        response.json({message: err});
    })
});

app.get("/departments", (req, response) => {
    getDepartments().then((data) => {
        response.json(data);
    }).catch((err) => {
        response.json({message: err});
    })
});

/*part 2 adding images */
app.get("/images/add", (req, response) => {
    response.sendFile(path.join(__dirname + "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => { //A3 part 2 step 2
    res.redirect("/images")
});

/*step 3 adding Get route using the fs module */
app.get("/images", function(req, res) {
    fs.readdir(path.join(__dirname,"/public/images/uploaded"),
     (err, items) =>{ 
            res.json({images : items});
      });
});

/*part 3 step 4 adding employee route */
app.use(bodyParser.urlencoded({extended: true}));
app.get('/employees/add', (req, res) => { 
    res.sendFile(path.join(__dirname + "/views/addEmployee.html"));
});

app.post('/employees/add', function(req, res){ 
    dataService.addEmployee(req.body).then(res.redirect('/employees'));
})

/*part 4 step 2 add employee route */
app.get('/employee/:value', (req, res) => {
    getEmployeeByNumber(req.params.value).then((data) => {
        res.json(data); }).catch((err) =>{
            res.json({message: err});
        })
});


/*Error page incase a invalid route is inpute by the user */
app.use((req, res) => { //step 3 [no matching route] // note week 4 a2
    res.status(404).send("Error 404! page Not Found");
});

initialize().then(function(){ //Step 5: week 2 notes and week 3 then a2
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("Error");
});




