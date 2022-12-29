const db = require("../database");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {promisify} = require("util");
var Razorpay=require("razorpay");
var crypto = require("crypto");
require("dotenv").config();


let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRETKEY
})




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
                    res.render("signLogin",{msg:"Accout Created Sucessfully..!!"})
                }  
            })
         }
        else{
            res.render("signLogin",{msg:"Account Already Exist!"})
        }
    }
    else{
        console.log(err);
    }
    })
}


exports.login = async (req,res,next)=>{
    const{email,password}= req.body;
    
    db.query("select * from logindata where email=?",[email],async(err,response)=>{
        if(!err){
            if(response==""){
                res.status(404);
                res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
            }
            else{
                if((await bcrypt.compare(password, response[0].password))){
                   
                    const id = response[0].id;
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETKEY);
                    res.cookie("userID",token)

                    db.query("select userType from logindata where email=?",[email],(err,result)=>{
                        if(!err){
                            if(result[0].userType == "premium"){
                                db.query("select * from extable where userId=?",[id],(err,result)=>{
                                    res.render("expPage",{result,msg3:"premiumuser"});
                                })
                            }
                            else{
                                db.query("select * from extable where userId=?",[id],(err,result)=>{
                                    res.render("expPage",{result});
                                })
                            }
                        }
                    })
                }
                else{
                    res.status(401);
                    res.render("signLogin",{msg:"Password Incorrect!"})
                }
            }
        }
        else{
            console.log(err);
        }
    })
}





exports.checkingCookie= async (req,res,next)=>{
        
        if(req.cookies.userID){
            const verification = await promisify(jwt.verify)(
                req.cookies.userID,
                process.env.JWT_SECRETKEY 
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

            db.query("select userType from logindata where id=?",[userId],(err,result)=>{
                if(!err){
                    if(result[0].userType == "premium"){
                        db.query("select * from extable where userId=?",[userId],(err,result)=>{
                            res.render("expPage",{result,msg3:"premiumuser"});
                        })
                    }
                    else{
                        db.query("select * from extable where userId=?",[userId],(err,result)=>{
                            res.render("expPage",{result});
                        })
                    }
                }
            })


        }
    })
}




exports.delete =(req,res)=>{
    const id = req.params.id;
    const userId = req.authID;
    db.query("delete from extable where id=?",[id],(err,resul)=>{
        if(!err){

            db.query("select userType from logindata where id=?",[userId],(err,result)=>{
                if(!err){
                    if(result[0].userType == "premium"){
                        db.query("select * from extable where userId=?",[userId],(err,result)=>{
                            res.render("expPage",{result,msg3:"premiumuser"});
                        })
                    }
                    else{
                        db.query("select * from extable where userId=?",[userId],(err,result)=>{
                            res.render("expPage",{result});
                        })
                    }
                }
            })


        }
    })
}


exports.premium =(req,res)=>{
    res.render("premiumpayment")
}


exports.createOrderId =(req,res)=>{
    const {amount} = req.body;
   
     var params = {
        amount: 399.35*100,
        currency: "INR",
        receipt: "order_rept01"
      };
    
    instance.orders.create(params).then((data) => {
        var id = data.id;
        res.render("premiumpayment",{id})
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(401);
    })
}


exports.verify=(req,res)=>{
  const{orderid,paymentID,signature} = req.body;
  const userId = req.authID;

  var concat = orderid + "|" + paymentID;
  var expectedSignature = crypto.createHmac('sha256', process.env.PAYMENT_CRYPTOKEY).update(concat.toString()).digest('hex');

  if(expectedSignature === signature){
     
    db.query("update logindata set userType=? where id=?",["premium",userId],(err,resolve)=>{
        if(!err){
            res.render("premiumpayment",{msg:"Success"});
        }
     })
   }  
  else{
    res.render("premiumpayment",{msg1:"Retry"});
  } 
}



exports.leaderboard=(req,res)=>{
  
    let sql ='SELECT sum(extable.amount),logindata.name from logindata join extable on logindata.id = extable.userId Group by extable.userId order by sum(extable.amount) desc';
    
    db.query(sql,(err,result)=>{
        if(!err){
             
            let values = result.map((item)=>{
                return { amount:item["sum(extable.amount)"], name:item.name }
            });
                       
            res.render("leaderboard",{values})
        }
    })

    
}

//Forget password 

exports.forgetpassword=(req,res)=>{
    res.render("forgetpass")
}


exports.forgetmail =(req,res)=>{
    const{email}= req.body;
    
    db.query("select * from logindata where email=?",[email],async(err,result)=>{
        if(!err){
            if(result==""){
                res.render("forgetpass",{msg:"You don't have an Account"})
            }
            else{
               
                const secret = process.env.JWT_SECRETKEY + result[0].password;
                 
                const payload ={
                    email: result[0].email,
                    id: result[0].id
                }
                
                const token = jwt.sign(payload,secret,{expiresIn: '5m'})
                const link = `http://15.207.71.172:3600/resetpassword/${result[0].id}/${token}`
                console.log(link);
                res.render("forgetpass",{msg:"mail sent successfully"})
            }
        }
    })
}


exports.resetpass =(req,res)=>{
    const{id,token} = req.params;
   
     db.query("select * from logindata where id=?",[id], async(err,result)=>{
        if(!err){
            const secret = process.env.JWT_SECRETKEY + result[0].password;
             
            try {
                const verification = await promisify(jwt.verify)(token,secret);
                res.render("resetpass");
            } catch (error) {
                console.log(error);
                res.sendStatus(401);
            }
        
        }
     })
}




exports.reset =(req,res)=>{
    const{id,token} = req.params;
    const{password,cnfpassword} = req.body;

    if(password === cnfpassword ){

        db.query("select * from logindata where id=?",[id], async(err,result)=>{
              if(!err){
                  
                const secret = process.env.JWT_SECRETKEY + result[0].password;
                 
                try {
                    const verification = await promisify(jwt.verify)(token,secret);
                    
                    const passwordHashed = await bcrypt.hash(password,10);
                    db.query("update logindata set password=? where email=?",[passwordHashed,verification.email],(err,result)=>{
                        if(!err){
                            res.render("resetpass",{msg:"Password Reset Successfully"})
                        }
                    })
                } 
                catch (error) {
                    console.log(error);
                    res.sendStatus(401);
                }
                 
              }
         })
    }
    else{
        res.render("resetpass",{msg:"Password Mismatch"})
    }
}


exports.logout = async(req,res)=>{
    res.cookie("userID","logout",{
        expires: new Date(new Date().getTime()),
        httpOnly:true
    })

    res.redirect("/");
}