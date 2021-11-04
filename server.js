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
const { res } = require('express');
//handling handle-bars

/* engine is for creating a customer helper if each and else are build in helper for handlebars */
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine' , '.hbs');

const  HTTP_PORT = process.env.PORT || 8080;

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

/*************Middle ware navigation bar  **************/ 
app.use(function(req,res,next){ 
    let route = req.baseUrl + req.path; 
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, ""); 
    next(); 
}); 

/** use static folder to load image from the server after sending it**/ 
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.urlencoded({ extended: true }));

app.engine('.hbs', exphbs({ extname: '.hbs', helpers: { 
    // The benefit here is that the navlink helper will 
    // automatically render the correct <li> element add the class "active" if app.locals.activeRoute matches the 
    // provided url, ie "/about"
navLink: function(url, options){ 
    return '<li' +  
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +  
        '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
}
, 

equal: function (lvalue, rvalue, options) { 
    if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters"); 
    if (lvalue != rvalue) { 
        return options.inverse(this); 
    } else { 
        return options.fn(this); 
    } 
},
    defaultLayout: 'main'
}}));


/*************Html get Routes **************/ 
app.get('/', (req, res) => {
    res.render('home', {layout: 'main'});
    // res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/home', (req, res) => {
    res.render('home', {layout: 'main'});
    // res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/about', (req, res) => {
    res.render('about', {layout: 'main'});
    //res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/employees", (req, res) => { 
    //week 4 property or method. sending data from the client to the server is in the query string. E.g. /user?user=bob req.query.user
    /*‘query’ will be an object with key value pairs matching the key value pairs sent in the query string of the req. */
    if(req.query.status){
        getEmployeesByStatus(req.query.status).then((data) => { res.render("employees", 
        {employees: data});})
        }
    else if(req.query.department){
        getEmployeesByDepartment(req.query.department).then((data) => { res.render("employees", 
        {employees: data});})
        }
    else if(req.query.manager){
        getEmployeesByManager(req.query.manager).then((data) => { res.render("employees", 
        {employees: data});})
        }
    else 
        getAllEmployees().then((data) => {
            res.render("employees", 
            {employees: data});
            }).catch((err) => {
                res.render("employees", {message: err})
    })
});

app.get("/departments", (req, res) => {
    getDepartments().then((data) => {
        res.render("departments", {departments: data});;
    }).catch((err) => {
        res.json({message: err});
    })
});

/******************* adding images route *******************/
app.get("/images/add", (req, res) => {
    //res.render('addImage', {layout: 'main'});
    //other way to render a path of addImage
     res.render(path.join(__dirname + "/views/addImage"));
});

app.get("/images", function(req, res) {
    fs.readdir(path.join(__dirname,"/public/images/uploaded"),
    (err, items) =>{          
        res.render('images', {images: items});
        
        // res.json({images : items});
    });
}); 

/* new EMPLOYEE/value using handle bars format  */
app.get('/employee/:value', (req, res) => {
    getEmployeeByNumber(req.params.value).then((data) => {
        res.render('employee', {employee: data });}).catch((err) =>{
            res.render('employee',{message:err});
    })
});

/* OLD EMPLOYEE/VALUE json format  */
// app.get('/employee/:value', (req, res) => {
//     getEmployeeByNumber(req.params.value).then((data) => {
//         res.json(data); }).catch((err) =>{
//             res.json({message: err});
//    })
// });

app.get('/employees/add', (req, res) => { 
    res.render('addEmployee', {layout: 'main'});
});
/****************** end of  get route *****************/


/****************** start post route *****************/
app.post("/images/add", upload.single("imageFile"), (req, res) => { //A3 part 2 step 2
    res.redirect("/images")
});

app.post('/employees/add', function(req, res){ 
    dataService.addEmployee(req.body).then(res.redirect('/employees'));
})


app.post("/employee/update", (req, res) => { 
    console.log("update", req.body); 
    updateEmployee(req.body).then(res.redirect('/employees')); 
});
/****************** End post route *****************/

/****************** Error page incase a invalid route is input by the user *****************/
/****************** step 3 [no matching route]  note week 4 a2 ******************/
app.use((req, res) => { 
    res.status(404).send("Error 404! page Not Found");
});

//to review check week 2 notes and week 3 
initialize().then(function(){ 
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("Error");
});






