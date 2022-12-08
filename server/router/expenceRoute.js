const express = require('express');
const route = express.Router();

const expenceControl = require("../controller/expenceControl");

route.get("/",expenceControl.signLogin);
route.post("/sign",expenceControl.signIn);
route.post("/login",expenceControl.login);
route.post("/exapp",expenceControl.checkingCookie, expenceControl.exApp);
route.get("/delete/:id",expenceControl.checkingCookie, expenceControl.delete);


module.exports =route;