const db = require("../database");
const bcrypt = require('bcrypt');
const e = require("express");



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
                    db.query("select * from extable",(err,result)=>{
                        if(!err){
                            res.render("expPage",{result});
                        }
                    })
                }  
            })
         }
        else{
            res.render("signLogin",{msg:"Account Already Exist!"})
        }
    }
    })
}


exports.login = (req,res)=>{
    const{email,password}= req.body;
    
    db.query("select * from LoginData where email=?",[email],async(err,response)=>{
        if(!err){
            if(response==""){
                res.status(404);
                res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
            }
            else{
                if((await bcrypt.compare(password, response[0].password))){
                    db.query("select * from extable",(err,result)=>{
                        res.render("expPage",{result})
                    });
                }
                else{
                    res.status(401);
                    res.render("signLogin",{msg:"Password Incorrect!"})
                }
            }
        }
    })
}



exports.exApp =(req,res)=>{
    const{name,amount,type}=req.body;
    
    db.query("insert into extable(name,amount,type) values(?,?,?)",[name,amount,type],(err,response)=>{
       if(!err){
         db.query("select * from extable",(err,result)=>{
            if(!err){
                res.render("expPage",{result});
            }
         })
       }
    })
}

exports.delete =(req,res)=>{
    const id = req.params.id;
    db.query("delete from extable where id=?",[id],(err,resul)=>{
        if(!err){
            db.query("select * from extable",(err,result)=>{
                if(!err){
                    res.render("expPage",{result});
                }
            })
        }
    })
}