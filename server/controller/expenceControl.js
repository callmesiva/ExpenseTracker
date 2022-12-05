const db = require("../database")



exports.signLogin = (req,res)=>{
    res.render("signLogin");
}

exports.signLoginSave = (req,res)=>{
    const{name,email,password} = req.body;
    

    db.query("select email from LoginData where email=?",[email],(err,responce)=>{
     if(!err){
        if(responce<0){
             res.render("signLogin",{msg:"User Already Exist!"});
        }
        else{
          db.query("insert into LoginData(name,email,password) values (?,?,?)",[name,email,password],(err,result)=>{
            if(!err){
                res.send("success");
            }  
        })
        }
    }
    })
}