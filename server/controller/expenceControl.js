const db = require("../database")



exports.signLogin = (req,res)=>{
    res.render("signLogin");
}

exports.signIn = (req,res)=>{
    const{name,email,password} = req.body;
    
    db.query("select email from logindata where email=?",[email],(err,responce)=>{
     if(!err){
        if(responce =="" ){
            db.query("insert into logindata(name,email,password) values (?,?,?)",[name,email,password],(err,result)=>{
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
    
    db.query("select * from LoginData where email=?",[email],(err,response)=>{
        if(!err){
            if(response==""){
                res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
            }
            else{
                if(response[0].password == password){
                    res.send("welcome"+ response[0].name);
                }
                else{
                    res.render("signLogin",{msg:"Password Incorrect"});
                }
            }
        }
    })
}