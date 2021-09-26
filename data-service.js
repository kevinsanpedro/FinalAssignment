let fs = require('fs');    
var employees = [];
var departments = [];

initialize = function(){
    return new Promise (function(resolve, reject){
        //employees
        fs.readFile('./data/employees.json', 'utf8', (err,data) => {
            if (err) {
                reject ("unable to read file");
            }else
            employees = JSON.parse(data);
            
        });
        //departments
        fs.readFile('./data/departments.json', 'utf8', (err,data)=> {
            if (err) {
                reject ("unable to read file");
            }else 
                departments = JSON.parse(data);
            
        })
        //invoke the resolve method
        resolve();
    })
};

getAllEmployees = function() {
    return new Promise (function(resolve,reject){
        if (employees.length == 0) {
            reject("no results returned");
        } 
        resolve(employees);
    })
};

getManagers = function() {
    return new Promise (function(resolve, reject){
        let managers = employees.filter(employee => employee.isManager == true);
        if (managers.length == 0) {
            reject("no results returned");
        }
        resolve(managers);
    })
};

getDepartments = function() {
    return new Promise((resolve,reject) => {
        if (departments.length == 0) {
            reject ("no results returned");
        }
        else 
        resolve (departments);
        
    })
};

