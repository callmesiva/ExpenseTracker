const express = require('express');
const route = express.Router();

const expenceControl = require("../controller/expenceControl");

route.get("/",expenceControl.signLogin);
route.post("/sign",expenceControl.signIn);
route.post("/login",expenceControl.login);
route.post("/exapp",expenceControl.checkingCookie, expenceControl.exApp);
route.get("/delete/:id",expenceControl.checkingCookie, expenceControl.delete);
route.get("/premiumPayment",expenceControl.premium);
route.post("/createOrderId",expenceControl.createOrderId);
route.post("/verify",expenceControl.checkingCookie, expenceControl.verify);
route.get("/premium/leaderboard",expenceControl.leaderboard);
route.get("/forgetpassword",expenceControl.forgetpassword);
route.post("/forgetpassword",expenceControl.forgetmail)
route.get("/resetpassword",expenceControl.resetpass);
route.post("/resetpassword",expenceControl.reset);
module.exports =route;