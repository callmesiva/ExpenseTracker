const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    id:String,
    name : String,
    email : String,
    password : String,
    usertype : String,
    expenses:{ 
        exname : String,
        productName : String,
        amount : String, 
        purchase : String,
    }
    
       
})

module.exports = mongoose.model("UserData",schema);