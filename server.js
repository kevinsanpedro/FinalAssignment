/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
* Name: KEVIN SAN PEDRO Student ID:023503139 Date:2021-11-18
* Online (Heroku) Link: https://obscure-plateau-20353.herokuapp.com/home
* Mongoose setup Link: mongodb+srv://kevinUser:6y9S2qE2rvWL0kb5@assignment06.w3b58.mongodb.net/Assignment6?retryWrites=true&w=majority
********************************************************************************/ 

const  data = require('./data-service.js');
const dataServiceAuth = require("./data-service-auth.js")

const express = require("express");
const multer = require("multer");
const clientSessions = require("client-sessions");
const fs = require('fs'); 
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const  HTTP_PORT = process.env.PORT || 8080;

//handling handle-bars

/* engine is for creating a helper if each and else are build in helper for handlebars */
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine' , '.hbs');

app.engine('.hbs', exphbs({ extname: '.hbs', helpers: { 
    navLink: function(url, options){ 
        return '<li' +  
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +  
            '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
    }, 
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
        }
    })
);
/*************  Setup client-sessions ***************/ 
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) { 
    res.locals.session = req.session; 
    next(); 
});

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

app.get("/employees", ensureLogin, (req, res) => { 
    if(req.query.status){
        data.getEmployeesByStatus(req.query.status)
        .then((data) => { 
            res.render("employees", {user: req.session.user, employees: data});
            })
        }
    else if(req.query.department){
        data.getEmployeesByDepartment(req.query.department)
        .then((data) => { 
            res.render("employees", {user: req.session.user, employees: data});
            })
        }
    else if(req.query.manager){
        data.getEmployeesByManager(req.query.manager)
        .then((data) => { 
            res.render("employees", {user: req.session.user, employees: data});
            })
        }
    else 
        data.getAllEmployees()
        .then((data) => {
            if( data.length > 0 ){
                res.render("employees", {user: req.session.user, employees: data});
            }else{ 
                res.render("employees",{user: req.session.user, message: "no results" });
                }
            }).catch((err) => {
                res.render("employees", {user: req.session.user,message:"no results"})
    })
});

app.get("/departments", ensureLogin,(req, res) => {
    data.getDepartments().then((data) => {
        if(data.length  > 0 ){
            res.render("departments",{departments: data} )
        }else
            res.render("departments", {message: "no results"});
    }).catch((err) => {
        res.render("departments", {message: err})
    })
});

app.get("/images/add", ensureLogin, (req, res) => {
     res.render(path.join(__dirname + "/views/addImage"));
});

app.get("/images", ensureLogin, (req, res) => {
    fs.readdir(path.join(__dirname,"/public/images/uploaded"),
    (err, items) =>{          
        res.render('images', {images: items});
    });
}); 


app.get("/employee/:empNum", ensureLogin, (req, res) => { 
 
    // initialize an empty object to store the values 
    let viewData = {}; 
 
    data.getEmployeeByNum(req.params.empNum).then((data) => { 
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

app.get('/employees/add', ensureLogin, (req, res) => { 
    data.getDepartments().then((data) => {
        res.render('addEmployee', {departments: data });
    })
    .catch((err) => {
        res.render("addEmployee", {departments: []});
    })
});

app.get('/departments/add', ensureLogin, (req, res) => { 
    res.render('addDepartment');
});

app.get('/department/:departmentId',ensureLogin, (req, res) => {
    data.getDepartmentById(req.params.departmentId)
    .then((data) => {
        res.render('department', {department: data });})
        .catch((err) =>{
            res.status(404).send("Department Not Found");
    }).catch((err) =>{
        res.status(404).send("Department Not Found"); 
    });
});

app.get('/departments/delete/:departmentId', ensureLogin, (req, res) => {
    data.deleteDepartmentById(req.params.departmentId)
    .then(res.redirect('/departments'))
    .catch((err) =>{
            res.status(500).send( "Unable to Remove Department / Department not found");
    })
});

app.get('/employees/delete/:empNum',ensureLogin, (req, res) => {
    data.deleteEmployeeByNum(req.params.empNum)
    .then(() => {
        res.redirect('/employees')
    })
    .catch((err) =>{
            res.status(500).send( "Unable to Remove Employee / Employee not found");
    })
});

app.get("/login",  (req, res) => {
    res.render("login");
});

app.get("/register",  (req, res) => {
    res.render("register");
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
  });

/****************** end of  get route *****************/

/****************** middleware to ensure user login before accessing the website *****************/
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

/****************** start post route *****************/
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => { //A3 part 2 step 2
    res.redirect("/images")
});

app.post('/employees/add', ensureLogin, (req, res)=>{ 
    data.addEmployee(req.body).then(res.redirect('/employees')).catch((err) =>{
        res.status(500).send( "Unable to add Employee / Employee not found");
    });
})

app.post("/employee/update", ensureLogin, (req, res) => { 
    data.updateEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err) =>{
        res.status(500).send( "Unable to update Employee / Employee not found");
}); 
});

app.post('/departments/add', ensureLogin, (req, res) =>{ 
    data.addDepartment(req.body)
    .then( () => {
        res.redirect('/departments')
    })
    .catch((err) => {   
        res.status(500).send("Unable to add department"); 
    });
})

app.post("/department/update", ensureLogin, (req, res) => { 
    
    data.updateDepartment(req.body)
    .then( () => {
        res.redirect('/departments')
    })
    .catch((err) => {   
        res.status(500).send("Unable to Update department"); 
    });; 
});

app.post('/register', (req, res)=>{ 
    dataServiceAuth.registerUser(req.body)
    .then(()=>{
        res.render('register', {successMessage: "User created"} );
    })
    .catch((err)=>{
        res.render('register', {errorMessage: err, userName: req.body.userName});
    });
})

app.post('/login', (req, res)=>{ 
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => { 
        req.session.user = { 
            userName: user.userName, // authenticated user's userName 
            email: user.email,// authenticated user's email 
            loginHistory: user.loginHistory // authenticated user's loginHistory 
        } 
        res.redirect('/employees'); 
    }).catch((err)=>{
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
})
/****************** End post route *****************/

/****************** Error page incase a invalid route is input by the user *****************/
app.use((req, res) => { 
    res.status(404).send("Error 404! page Not Found");
});

//to review check week 2 notes and week 3 
data.initialize().then(dataServiceAuth.initialize())
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });

}).catch(function(err){
    console.log("unable to start server: " + err);
});








