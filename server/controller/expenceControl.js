const model = require("../mongoDB/Schema");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {promisify} = require("util");
const Razorpay=require("razorpay");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();


let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRETKEY
})


exports.signLogin = (req,res)=>{
    res.render("signLogin");
}


exports.signIn = async (req,res)=>{
    const{name,email,password} = req.body;
    
    try {

        await model.find({email:email})
        .then(async(response)=>{
                if(response==""){
                    const passwordHashed = await bcrypt.hash(password,10);

                    await model.create({name:name,email:email,password:passwordHashed,usertype:"nonpremium"})
                    .then(()=>{
                        res.render("signLogin",{msg:"Accout Created Sucessfully..!!"})
                    })
                    .catch((error)=>console.log(error))
                    
                }
                else{
                    res.render("signLogin",{msg:"Account Already Exist!"})
                }
        })
        .catch((error)=>{
            console.log(error)
        })

     } catch (error) {
        console.log(error);
     }

}

exports.login = async (req,res,next)=>{
    const{email,password}= req.body;

    await model.find({email:email})
    .then((response)=>{ 
        if(response==""){
            res.status(404);
            res.render("signLogin",{msg:"Account Not Exist, Please Signup!"})
        }
        else{
            (async () => {
                await new Promise((resolve) => setImmediate(async ()=>{
                    if((await bcrypt.compare(password, response[0].password))){
                        const id = response[0]._id
                        const token = jwt.sign({id:id}, process.env.JWT_SECRETKEY);
                        res.cookie("userID",token)

                        await model.find({_id:id})
                        .then(async(result)=>{

                            if(result[0].usertype=="nonpremium"){

                                await model.find({id:id})
                                .then((response)=>{
                                    let result = response.map((value)=>{
                                       return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                                    })
                                    res.render("expPage",{result})
                                   })
                            }
                            else{
                                await model.find({id:id})
                                .then((response)=>{
                                    let result = response.map((value)=>{
                                       return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                                    })
                                    res.render("expPage",{result,msg3:"premiumuser"})
                                })
                            }

                        }).catch((err)=>{
                            console.log(err);
                        })
                    }
                    else{
                        res.status(401);
                        res.render("signLogin",{msg:"Password Incorrect!"})
                    }
                }))
            }) ()
            .then((res)=>{
                console.log(res);
            })
            .catch (err => {
                console.log (err);
            });
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

exports.pagereload = async (req,res)=>{
    const id = req.authID
   
    await model.find({_id:id})
    .then(async(result)=>{

        if(result[0].usertype=="nonpremium"){
            await model.find({id:id})
           .then((response)=>{
              let result = response.map((value)=>{
                 return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
             })
            res.render("expPage",{result})
           })
        }
        else{
             await model.find({id:id})
            .then((response)=>{
              let result = response.map((value)=>{
                 return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
              })
            res.render("expPage",{result,msg3:"premiumuser"})
          })
        }

        })
        .catch((err)=> console.log(err))

}


exports.exApp = async(req,res)=>{
    const{name,amount,type}=req.body;
    const id = req.authID;
  
    await model.find({_id:id})
    .then( async (results)=>{

         await model.create( {id:id, expenses:{exname:results[0].name, productName:name,amount:amount,purchase:type}})
        .then(async (result)=>{

         await model.find({_id:id})
        .then(async(result)=>{

            if(result[0].usertype=="nonpremium"){
                await model.find({id:id})
               .then((response)=>{
                  let result = response.map((value)=>{
                     return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                 })
                res.render("expPage",{result})
               })
            }
            else{
                 await model.find({id:id})
                .then((response)=>{
                  let result = response.map((value)=>{
                     return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                  })
                res.render("expPage",{result,msg3:"premiumuser"})
              })
            }

            })
            .catch((err)=> console.log(err))

        })
        .catch(err=> console.log(err))
        
     })
    .catch((err)=> console.log(err))
}


exports.delete = async(req,res)=>{
    const productId = req.params.id;
    const id = req.authID;
    
    await model.deleteOne({_id:productId})
    .then(async (result1)=>{
        
        await model.find({_id:id})
        .then(async(result)=>{

            if(result[0].usertype=="nonpremium"){

                await model.find({id:id})
                .then((response)=>{
                    let result = response.map((value)=>{
                       return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                    })
                    res.render("expPage",{result})
                   })
            }
            else{
                await model.find({id:id})
                .then((response)=>{
                    let result = response.map((value)=>{
                       return{ name:value.expenses.productName, type:value.expenses.purchase, amount:value.expenses.amount, uid:value._id};
                    })
                    res.render("expPage",{result,msg3:"premiumuser"})
                })
            }

        }).catch((err)=>{
            console.log(err);
        })
    
      })
      .catch(err=> console.log(err))
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

exports.verify= async(req,res)=>{
  const{orderid,paymentID,signature} = req.body;
  const id = req.authID;

  var concat = orderid + "|" + paymentID;
  var expectedSignature = crypto.createHmac('sha256', process.env.PAYMENT_CRYPTOKEY).update(concat.toString()).digest('hex');
  if(expectedSignature === signature){
    
    await model.updateOne({usertype:"premium"}).where({_id:id})
    .then((result)=>{
        res.render("premiumpayment",{msg:"Success"});
    })
    .catch((err)=>{
        console.log(err+" update Premium on DB");
    })
   }  
  else{
    res.render("premiumpayment",{msg1:"Retry"});
  } 
}


exports.leaderboard= async(req,res)=>{

    await model.find().then((result)=>{

    let arr=[]
      
       result.map((ele)=>{
        
          if(ele.id != null){
            arr.push({id:ele.id, name:ele.expenses.exname, productName:ele.expenses.productName, Amount:ele.expenses.amount});
          }    
       })

        let arr1 =[];
        let resArr =[];
           
        for(let i=0; i<arr.length; i++){
            
           if(arr1.includes(arr[i].id)) continue;
           else{
            arr1.push(arr[i].id)
        
            let name = arr[i].name;;
            let counter =  Number( arr[i].Amount );
              
            for(let j = i+1; j<=arr.length-1; j++){
               
                if(arr[i].id === arr[j].id){
                    name = arr[i].name;
                    counter += Number( arr[j].Amount );
                }
            }
             resArr.push({name:name, amount:counter})
            }
        }  
        
        resArr.sort((a,b) => b.amount - a.amount);
        res.render("leaderboard",{resArr})
    })
    .catch((err)=>{
        console.log(err);
    })

}

//Forget password 
exports.forgetpassword=(req,res)=>{
    res.render("forgetpass")
}

exports.forgetmail = async(req,res)=>{
    const{email}= req.body;

    await model.find({email:email})
    .then((result)=>{

    if(result==""){
            res.render("forgetpass",{msg:"You don't have an Account"})
     }
    else{
        const secret = process.env.JWT_SECRETKEY + result[0].password;
        const payload ={
            email: result[0].email,
            id: result[0]._id
        }
        const token = jwt.sign(payload,secret,{expiresIn: '5m'})
        sgMail.setApiKey(process.env.SENDGRID_SECRETKEY)
        const msg = {
           to: email, // Change to your recipient
           from: 'msivagurunathan00@gmail.com', // Change to your verified sender
           subject: 'Reset Password From ExpenseTracker',
           text: 'Click to Reset Password',
           html: `http://127.0.0.1:3800/resetpassword/${result[0]._id}/${token}`

        }
        sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })
       
        // console.log( `http://127.0.0.1:4600/resetpassword/${result[0]._id}/${token}`);
        res.render("forgetpass",{msg:"mail sent successfully"})
    }
                      

    })
    .catch((err)=> console.log(err))
}



exports.resetpass =async(req,res)=>{
    const{id,token} = req.params;

    await model.find({_id:id})
    .then(async(result)=>{
        const secret = process.env.JWT_SECRETKEY + result[0].password;
        try {
            const verification = await promisify(jwt.verify)(token,secret);
            res.render("resetpass");
        } catch (error) {
            console.log(error);
            res.sendStatus(401);
        }
    })

}



exports.reset = async(req,res)=>{
    const{id,token} = req.params;
    const{password,cnfpassword} = req.body;

    if(password === cnfpassword ){
     
        await model.find({_id:id})
        .then( async(result)=>{
        
            const secret = process.env.JWT_SECRETKEY + result[0].password;
            
            try {
                const verification = await promisify(jwt.verify)(token,secret);
                const passwordHashed = await bcrypt.hash(password,10);
                
                await model.updateOne({password:passwordHashed}).where({email:verification.email})
                .then((result)=>{
                    res.render("resetpass",{msg:"Password Reset Successfully"})
                })
                .catch((err)=>console.log(err))
            } 
            catch (error) {
                console.log(error);
                res.sendStatus(401);
            }

        })
        .catch((err)=>console.log(err))

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