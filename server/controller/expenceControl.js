const db = require("../database");
const bcrypt = require('bcrypt');



exports.signLogin = (req,res)=>{
    res.render("signLogin");
}

exports.signIn = (req,res)=>{
    const{name,email,password} = req.body;
    
    db.query("select email from logindata where email=?",[email],async(err,responce)=>{
     if(!err){
        if(responce =="" ){

            const passwordHashed = await bcrypt.hash(password,10);
            db.query("insert into logindata(name,email,password) values (?,?,?)",[name,email,passwordHashed],(err,result)=>{
                if(!err){
                    res.send("success");
                }  
            })
         }
        else{
            res.render("signLogin",{msg:"Account Already Exist"})
        }
    }
    })
}


exports.login = (req,res)=>{
    const{email,password}= req.body;
    
    db.query("select * from LoginData where email=?",[email],async(err,response)=>{
        if(!err){
            if(response==""){
                // res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
                res.status().send(404);
            }
            else{
                if((await bcrypt.compare(password, response[0].password))){
                    res.send("welcome "+ response[0].name);
                }
                else{
                    res.status().send(401);
                }
            }
        }
    })
}

