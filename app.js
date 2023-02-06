const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const compression = require('compression');
// const morgan = require('morgan');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static("public"));

//SSL 
// const privatekey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


const handlebars = exphbs.create({extname:".hbs"});
app.engine('hbs',handlebars.engine);
app.set("view engine","hbs");

//Creating Log file
// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname,'access.log'),
//     {flags:'a'}
// );
//app.use(morgan('combined',{stream:accessLogStream}));

const routes = require("./server/router/expenceRoute")
const db = require("./server/MongoDB/Mongoose")

app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc:["'self'"],
      scriptSrc: ["'self'", 'https://checkout.razorpay.com/v1/checkout.js'],
      frameSrc:  ["'self'", 'https://api.razorpay.com/'],
     
    }
  }));

app.use(compression());


app.use('/',routes);

//starting server
app.listen(3800);
//https.createServer({key:privatekey, cert:certificate},app).listen(4600);
