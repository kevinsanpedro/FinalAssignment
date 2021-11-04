
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

//employee?6
getEmployeeByNumber=(empNum)=>{
    return new Promise((res,rej)=>{
        let employee = employees.filter(employee => employee.employeeNum == empNum);
        if(employee.length == 0){
            rej("no result returned")
        }
        else {
            res(employee[0]);  
        }
        
    })
}
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
updateEmployee = (employeeData) => {
    return new Promise ((res,rej) =>{
        let employee = employees.filter(employee => employee.employeeNum == employeeData.employeeNum);
    
        if(employee.length == 0){
            // rej("no result return")
        }
        else{
            employees[0].firstName = employeeData.firstName;
            employees[0].lastName = employeeData.lastName;
            employees[0].email = employeeData.email
            employees[0].addressStreet = employeeData.addressStreet
            employees[0].addressCity = employeeData.addressCity
            employees[0].addressState = employeeData.addressState
            employees[0].addressPostal = employeeData.addressPostal
            
            employees[0].employeeManagerNum = employeeData.employeeManagerNum
            employees[0].status =  employeeData.status
            employees[0].department =  employeeData.department
            
            res()
            
        }   
    })

}
