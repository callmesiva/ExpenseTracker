const db = require("../database");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {promisify} = require("util");



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






exports.login = async (req,res,next)=>{
    const{email,password}= req.body;
    
    db.query("select * from LoginData where email=?",[email],async(err,response)=>{
        if(!err){
            if(response==""){
                res.status(404);
                res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
            }
            else{
                if((await bcrypt.compare(password, response[0].password))){
                   
                    const id = response[0].id;
                    const token = jwt.sign({id:id},"decodethis");
                    res.cookie("userID",token)
                    
                    db.query("select * from extable where userId=?",[id],(err,result)=>{
                        res.render("expPage",{result});
                    })
                }
                else{
                    res.status(401);
                    res.render("signLogin",{msg:"Password Incorrect!"})
                }
            }
        }
    })
}





exports.checkingCookie= async (req,res,next)=>{
        
        if(req.cookies.userID){
            const verification = await promisify(jwt.verify)(
                req.cookies.userID,
                "decodethis" 
            );
          
            req.authID = verification.id;
            next();
        }
        else{
            res.sendStatus(401);
        }
}




exports.exApp =(req,res)=>{
    const{name,amount,type}=req.body;
    const userId = req.authID;
    
     db.query("insert into extable(name,amount,type,userId) values(?,?,?,?)",[name,amount,type,userId],(err,response)=>{
        if(!err){
            db.query("select * from extable where userId=?",[userId],(err,result)=>{
                res.render("expPage",{result});
            })
        }
    })
}




exports.delete =(req,res)=>{
    const id = req.params.id;
    const userId = req.authID;
    db.query("delete from extable where id=?",[id],(err,resul)=>{
        if(!err){
            db.query("select * from extable where userId=?",[userId],(err,result)=>{
                res.render("expPage",{result});
            })
        }
    })
}