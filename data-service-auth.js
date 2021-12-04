var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName":  {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }],
    "country": String  
});
let User; // to be defined on new connection (see initialize) 

module.exports.initialize = () =>{
    return new Promise( function (resolve, reject){
        let db = mongoose.createConnection("mongodb+srv://kevinUser:6y9S2qE2rvWL0kb5@assignment06.w3b58.mongodb.net/Assignment6?retryWrites=true&w=majority");
        db.on('error', (err)=>{ 
            reject(err); // reject the promise with the provided error 
        }); 
        db.once('open', ()=>{ 
           User = db.model("users", userSchema); 
           resolve(); 
        }); 
    });
};

module.exports.registerUser = (userData)  =>{
    return new Promise( (resolve, reject)=> {
        if(userData.password !== userData.password2){
            reject('Passwords do not match');
        }else{
            bcrypt.genSalt(10)  // Generate a "salt" using 10 rounds 
            .then(salt=>bcrypt.hash(userData.password,salt)) // encrypt the password: "myPassword123" 
            .then(hash=>{ 
                userData.password = hash    
                let newUser = new User(userData);
                newUser.save((err) => {  
                    if(err && err.code == 11000){ //11000 is a duplicate key
                        return reject("User Name already taken");
                    }
                    else if(err){
                        return reject(`There was an error creating the user: ${err}`);
                    }
                    else
                    resolve();          
                 })
            }) 
            .catch(err=>{ 
                reject ('There was an error encrypting the password');
            });
        }
    })
}

module.exports.checkUser = (userData) =>{
    return new Promise( (resolve,reject) =>{
        User.find({ userName: userData.userName }) 
        .exec()
        .then((users) => {
            if(users.length === 0){
                reject(`Unable to find user: ${userData.userName}` );
            }
            //users[0].password is a hash value from db
            bcrypt.compare(userData.password, users[0].password).then((result) => { 
                if(result === false){
                    reject(`Incorrect Password for user: ${userData.userName}` );
                }   
                else if(result === true){
                    users[0].loginHistory.push({
                        dateTime: (new Date()).toString(), userAgent: userData.userAgent
                    })
                    User.updateOne(
                        {users: users[0].userName},
                        {$set: {loginHistory: users[0].loginHistory}}
                    ).exec()
                    .then(()=>{
                        resolve(users[0]);
                    })
                    .catch((err)=>{
                        reject(`There was an error verifying the user:${err}`)
                    });                 
                } 
            })
        })
        .catch((err)=>{
            reject(`Unable to find user: ${userData.userName}`)
        })

    })
    
}