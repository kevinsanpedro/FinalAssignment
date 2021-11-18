/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
* Name: KEVIN SAN PEDRO Student ID:023503139 Date:2021-11-18
* Online (Heroku) Link: https://obscure-plateau-20353.herokuapp.com/home
********************************************************************************/ 

var  dataService = require('./data-service.js');
const  express = require("express");
const  app = express();
const  path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
let  fs = require('fs'); 
const { res } = require('express');
//handling handle-bars

/* engine is for creating a helper if each and else are build in helper for handlebars */
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
/* 
    The benefit here is that the navlink helper will 
    automatically render the correct <li> element add the class "active" if app.locals.activeRoute matches the 
    provided url, ie "/about" 
*/
app.engine('.hbs', exphbs({ extname: '.hbs', helpers: { 
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
    res.render('home');  
});

app.get('/home', (req, res) => {
    res.render('home');   
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get("/employees", (req, res) => { 
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query.status)
        .then((data) => { 
            res.render("employees", {employees: data});
            })
        }
    else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data) => { 
            res.render("employees", {employees: data});
            })
        }
    else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager)
        .then((data) => { 
            res.render("employees", {employees: data});
            })
        }
    else 
        dataService.getAllEmployees()
        .then((data) => {
            if( data.length > 0 ){
                res.render("employees", {employees: data});
            }else{ 
                res.render("employees",{ message: "no results" });
                }
            }).catch((err) => {
                res.render("employees", {message:"no results"})
    })
});

app.get("/departments", (req, res) => {
    dataService.getDepartments().then((data) => {
        if(data.length  > 0 ){
            res.render("departments",{departments: data} )
        }else
            res.render("departments", {message: "no results"});
    }).catch((err) => {
        res.render("departments", {message: err})
    })
});

app.get("/images/add", (req, res) => {
     res.render(path.join(__dirname + "/views/addImage"));
});

app.get("/images", (req, res) => {
    fs.readdir(path.join(__dirname,"/public/images/uploaded"),
    (err, items) =>{          
        res.render('images', {images: items});
    });
}); 


app.get("/employee/:empNum", (req, res) => { 
 
    // initialize an empty object to store the values 
    let viewData = {}; 
 
    dataService.getEmployeeByNum(req.params.empNum).then((data) => { 
        if (data) { 
            viewData.employee = data; //store employee data in the "viewData" object as "employee" 
        } else { 
            viewData.employee = null; // set employee to null if none were returned 
        } 
    }).catch(() => { 
        viewData.employee = null; // set employee to null if there was an error  
    }).then(dataService.getDepartments) 
    .then((data) => { 
        viewData.departments = data; // store department data in the "viewData" object as "departments" 
 
        // loop through viewData.departments and once we have found the departmentId that matches 
        // the employee's "department" value, add a "selected" property to the matching  
        // viewData.departments object 
 
        for (let i = 0; i < viewData.departments.length; i++) { 
            if (viewData.departments[i].departmentId == viewData.employee.department) { 
                viewData.departments[i].selected = true; 
            } 
        } 
 
    }).catch(() => { 
        viewData.departments = []; // set departments to empty if there was an error 
    }).then(() => { 
        if (viewData.employee == null) { // if no employee - return an error 
            res.status(404).send("Employee Not Found"); 
        } else { 
            res.render("employee", { viewData: viewData }); // render the "employee" view 
        } 
    }); 
}); 

app.get('/employees/add', (req, res) => { 
    dataService.getDepartments().then((data) => {
        res.render('addEmployee', {departments: data });
    })
    .catch((err) => {
        res.render("addEmployee", {departments: []});
    })
});

app.get('/departments/add', (req, res) => { 
    res.render('addDepartment');
});

app.get('/department/:departmentId', (req, res) => {
    dataService.getDepartmentById(req.params.departmentId)
    .then((data) => {
        res.render('department', {department: data });})
        .catch((err) =>{
            res.status(404).send("Department Not Found");
    }).catch((err) =>{
        res.status(404).send("Department Not Found"); 
    });
});

app.get('/departments/delete/:departmentId', (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId)
    .then(res.redirect('/departments'))
    .catch((err) =>{
            res.status(500).send( "Unable to Remove Department / Department not found");
    })
});

app.get('/employees/delete/:empNum', (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then(() => {
        res.redirect('/employees')
    })
    .catch((err) =>{
            res.status(500).send( "Unable to Remove Employee / Employee not found");
    })
});
/****************** end of  get route *****************/


/****************** start post route *****************/
app.post("/images/add", upload.single("imageFile"), (req, res) => { //A3 part 2 step 2
    res.redirect("/images")
});

app.post('/employees/add', function(req, res){ 
    dataService.addEmployee(req.body).then(res.redirect('/employees')).catch((err) =>{
        res.status(500).send( "Unable to add Employee / Employee not found");
    });
})

app.post("/employee/update", (req, res) => { 
    dataService.updateEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err) =>{
        res.status(500).send( "Unable to update Employee / Employee not found");
}); 
});

app.post('/departments/add', function(req, res){ 
    dataService.addDepartment(req.body)
    .then( () => {
        res.redirect('/departments')
    })
    .catch((err) => {   
        res.status(500).send("Unable to add department"); 
    });
})

app.post("/department/update", (req, res) => { 
    console.log("update", req.body);
    dataService.updateDepartment(req.body)
    .then( () => {
        res.redirect('/departments')
    })
    .catch((err) => {   
        res.status(500).send("Unable to Update department"); 
    });; 
});

/****************** End post route *****************/

/****************** Error page incase a invalid route is input by the user *****************/
app.use((req, res) => { 
    res.status(404).send("Error 404! page Not Found");
});

//to review check week 2 notes and week 3 
dataService.initialize().then(function(){ 
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log("Error");
});






