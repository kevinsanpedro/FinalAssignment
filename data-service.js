const { rejects } = require('assert');
let fs = require('fs');    
var employees = [];
var departments = [];


initialize = function(){
    return new Promise (function(res, rej){
        // read employees
        fs.readFile('./data/employees.json', 'utf8', (err,data) => {
            if (err) {
                rej ("unable to read file");
            }else
            employees = JSON.parse(data);
            
        });
        //readdepartments
        fs.readFile('./data/departments.json', 'utf8', (err,data)=> {
            if (err) {
                rej ("unable to read file");
            }else 
                departments = JSON.parse(data);
            
        })
        //invoke the res method
        res();
    })
}

getAllEmployees = function() {
    return new Promise (function(res,rej){
        if (employees.length == 0) {
            rej("no results returned");
        } 
        res(employees);
    })
};

getManagers = function() {
    return new Promise (function(res, rej){
        let managers = employees.filter(employee => employee.isManager == true);
        if (managers.length === 0) {
            rej("no results returned");
        }   
        res(managers);
    })
};

getDepartments = function() {
    return new Promise((res,rej) => {
        if (departments.length == 0) {
            rej ("no results returned");
        }
        else 
        res (departments);
        
    })
};

module.exports.addEmployee  = function(employeeData)  {
    return new Promise((res,rej)=>{
        if(!employeeData.isManager)
            employeeData.isManager = false;
        else 
            employeeData.isManager = true;
        //set the employee number to new employee and add one
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        res();   
    })
};
///employees?status=Part Time
getEmployeesByStatus = (status) => {
    return new Promise (function(res, rej){
        let employeesStatus = employees.filter(employee => employee.status == status);
        if (employees.length === 0) {
            rej("no results returned");
        }   
        res(employeesStatus);
    })
}
//employees?department=5
getEmployeesByDepartment = (department) => {
    return new Promise (function(res, rej){
        let employeesDepartment = employees.filter(employee => employee.department == department);
        if (employees.length === 0) {
            rej("no results returned");
        }   
        res(employeesDepartment);
    })
}
//employees?manager=5
getEmployeesByManager = (manager) => {
    return new Promise (function(res, rej){
        let employeesManager = employees.filter(employee => employee.employeeManagerNum == manager);
        if (employees.length === 0) {
            rej("no results returned");
        }   
        res(employeesManager);
    })
}

getEmployeeByNumber  = (value)  =>{
    return new Promise((res,rej)=>{
        let employee = employees.filter(employee => employee.employeeNum == value);
        if(employee.length === 0){
            rej("no result returned")
        }
        else 
            res(employee);  
    })
}
