const express = require('express');
const route = express.Router();

const expenceControl = require("../controller/expenceControl");

route.get("/",expenceControl.signLogin);
route.post("/",expenceControl.signLoginSave);


module.exports =route;