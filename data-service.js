/* 
Credentials
Host ec2-34-198-189-252.compute-1.amazonaws.com
Database d2g556h33jumms
User jllgevhjvewght
Port 5432
Password    00a048e8120dc0fe8c749d412bf74eeb4488350b542548f1b726e0dd5786f169
URI postgres://jllgevhjvewght:00a048e8120dc0fe8c749d412bf74eeb4488350b542548f1b726e0dd5786f169@ec2-34-198-189-252.compute-1.amazonaws.com:5432/d2g556h33jumms
Heroku CLI    heroku pg:psql postgresql-aerodynamic-74970 --app obscure-plateau-20353
*/

const Sequelize = require('sequelize');
var sequelize = new Sequelize('d2g556h33jumms', 'jllgevhjvewght', '00a048e8120dc0fe8c749d412bf74eeb4488350b542548f1b726e0dd5786f169', 
{ 
    host: 'ec2-34-198-189-252.compute-1.amazonaws.com', 
    dialect: 'postgres', 
    port: 5432, 
    dialectOptions: { 
        ssl: { rejectUnauthorized: false } 
    },
    query: { raw: true }
}); 


/********************** Creating employee table, and Department table ***********************/
var Employee = sequelize.define('Employee',{
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
    
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
    
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
        departmentName: Sequelize.STRING
    },{
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
        
});

/* This will ensure that our Employee model gets a "department" column that will act as a foreign key to the Department model.   */
Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = () =>{
    return new Promise(function (resolve, reject) { 
        sequelize.sync().then(() => { 
            resolve();
        }).catch((err) => {
            reject("Unable to sync to the database");
        });
    })
};

module.exports.getAllEmployees = () => {
    return new Promise(function (resolve, reject) { 
        Employee.findAll()
        .then((data) => {
            
            resolve(data);
        })
        .catch((err) => {
            //console.log(data)
            reject("no results returned"); 
        });
    });
};

///employees?status=Part Time
module.exports.getEmployeesByStatus = (inStatus) => {
    return new Promise(function (resolve, reject) { 
        Employee.findAll({where:{status: inStatus}})
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            reject("no results returned"); 
        });
    })
};

//employees?department=5
module.exports.getEmployeesByDepartment = (inDepartment) => {
    return new Promise(function (resolve, reject) { 
        Employee.findAll({where:{department: inDepartment}})
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            reject("no results returned"); 
        });
    })
}

//employees?manager=5
module.exports.getEmployeesByManager = (inManager) => {
    return new Promise(function (resolve, reject) { 
        Employee.findAll({where:{employeeManagerNum: inManager}})
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            reject("no results returned"); 
        });
    })
};

//employee?6
module.exports.getEmployeeByNum= (empNum) => {
    return new Promise(function (resolve, reject) { 
        Employee.findAll({where:{employeeNum: empNum}})
        .then((data) => {
            resolve(data[0])
        })
        .catch((err) => {
            reject("no results returned"); 
        });
    })
};


module.exports.addEmployee = function(employeeData){
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData) {
            if(employeeData[i] == ""){
                employeeData[i] = null;
            }
        }
        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
            }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to create employee");
        });
    });       
};

module.exports.updateEmployee = (employeeData) => {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData) {
            if(employeeData[i] == ""){
                employeeData[i] = null;
            }
        }
        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department
        }, { where: { employeeNum: employeeData.employeeNum}
        }).then(()=>{
            resolve("Update success");
        }).catch((err)=>{
            reject( "unable to update employee");
        });
    });
};

module.exports.deleteEmployeeByNum = (empNum)  => {
    return new Promise(function (resolve, reject ){
        console.log("step 1")
        
            Employee.destroy({
                where: { employeeNum: empNum}
            }).then((data) => {
                resolve("destroyed") 
            }).catch((err) => {
            reject("deparment cannot destroy");
     });
    })
}

/************************** deparment  ************************************/
module.exports.getDepartments = () => {
    return new Promise(function (resolve, reject) { 
        Department.findAll()
        .then((data) => {
            resolve(data);
        })
        .catch((err) => {
            reject("no results returned"); 
        });
    });
};
module.exports.addDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) { 
        for (let i in departmentData) {
            if(departmentData[i] == ""){
                departmentData[i] = null;
            }
        }

    Department.create({
        departmentName: departmentData.departmentName
    } )
    .then((data) => {
        console.log("succesfully create department")
        resolve()

     })
    .catch((err) => {
        reject("unable to create department");
        });
    });
};

module.exports.updateDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) {
        for (let i in departmentData) {
            if(departmentData[i] == "")
                departmentData[i] = null;
            };
        Department.update({
            departmentName: departmentData.departmentName
            }, 
            { where: {  departmentId: departmentData.departmentId}
        }).then(()=>{
            resolve("update success");
        }).catch((err)=>{
            reject("unable to update department");
        });
    });       
}

module.exports.getDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where:{
                departmentId: id
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("no results returned");
        });
    });       
}

module.exports.deleteDepartmentById = (id)  => {
    return new Promise(function (resolve, reject ){
            Department.destroy({
                where: { departmentId: id}
            }).then((data) => {
                resolve("destroyed") 
            }).catch((err) => {
            reject("deparment cannot destroy");
     });
    })
}