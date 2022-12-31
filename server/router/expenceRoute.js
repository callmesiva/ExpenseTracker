const express = require('express');
const route = express.Router();
const expenceControl = require("../controller/expenceControl");

route.get("/",expenceControl.signLogin);
route.post("/sign",expenceControl.signIn);
route.post("/login",expenceControl.login);
route.get("/login",expenceControl.checkingCookie, expenceControl.pagereload)
route.post("/exapp",expenceControl.checkingCookie, expenceControl.exApp);
route.get("/exapp",expenceControl.checkingCookie, expenceControl.pagereload);
route.get("/delete/:id",expenceControl.checkingCookie, expenceControl.delete);

//payment
route.get("/premiumPayment",expenceControl.premium);
route.post("/createOrderId",expenceControl.createOrderId);
route.post("/verify",expenceControl.checkingCookie, expenceControl.verify);

route.get("/premium/leaderboard",expenceControl.leaderboard);

//Password Reset
route.get("/forgetpassword",expenceControl.forgetpassword);
route.post("/forgetpassword",expenceControl.forgetmail);
route.get("/resetpassword/:id/:token",expenceControl.resetpass);
route.post("/resetpassword/:id/:token",expenceControl.reset);

route.get("/logout",expenceControl.logout);
module.exports =route;