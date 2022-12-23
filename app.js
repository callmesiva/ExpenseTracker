const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static("public"));

//SSL 
//const privatekey = fs.readFileSync('server.key');
//const certificate = fs.readFileSync('server.cert');


const handlebars = exphbs.create({extname:".hbs"});
app.engine('hbs',handlebars.engine);
app.set("view engine","hbs");

const accessLogStream = fs.createWriteStream(
    path.join(__dirname,'access.log'),
    {flags:'a'}
);


const routes = require("./server/router/expenceRoute")

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));

app.use('/',routes);

//starting server
//https.createServer({key:privatekey, cert:certificate},app).listen(3600);
app.listen(3600);