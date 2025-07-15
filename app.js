var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var cors = require('cors');

  // create reusable transporter object using the default SMTP transport


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mysql = require('mysql2');
var app = express();

app.use(session({
  secret: '!@#qwe123',
  resave: true,
  saveUninitialized: true,
  cookie: {secure: false},
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var dbConnectionPool = mysql.createPool({
  host: "localhost",
  database: "events_db"
});

app.use(function(req,res,next){
  req.pool = dbConnectionPool;

  next();
});

// --> send email stuff (not finished, ignore)

// start nodemail
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  // host: "smtp-mail.outlook.com",
  port: 587,
  auth: {
    user: 'q2zulttiyk4jbk4d@ethereal.email',
    pass: '3TtFuJwF7k4s76cDJD'
  },
});

// const transporter = nodemailer.createTransport({
//   service: "Outlook365",
//   host: "smtp-mail.outlook.com",
//   secureConnection: false,
//   // host: "smtp-mail.outlook.com",
//   port: 587,
//   auth: {
//     user: 'a1829554@adelaide.edu.au',
//     pass: 'n(HOLEcom!c18*'
//   },
//   tls : {
//     ciphers: 'SSLv3',
//     rejectUnauthorized: false,
//   },
// });

app.use(function(req,res,next){
  req.emailService = transporter; // new for nodemailer
  next();
});

//end nodemail

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use(cors({
//   origin: "https://niki81519-code50-80305592-pjgqg5wrg29p79-8080.githubpreview.dev"
// }));
app.use(cors());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.send(200);
  }
  else {
  //move on
    next();
  }
});


// app.options("/*", function(req, res, next){
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
//   res.send(200);
// });

app.get('/events', (req, res) => {
  req.pool.getConnection (function(error, connection){
      if (error) {
          res.sendStatus(500);
          console.log(error);
          return;
      }

      connection.query("select * from Event", function(error, rows, fields){
          //console.log("query response is ", results);
          connection.release();
          if (error) {
              res.sendStatus(500);
              console.log(error);
              return;
          }
          res.json(rows);
          return
      });
});
// const results = [
//     {id: "0001", host: "0001", name: "Graduation Ceremony", location: "Uni Adelaide", date:"5th May, 13:00", now: new Date()},
//     {id: "0002", host: "0002", name: "Club Meetup", location: "Rundle Mall", date: "7th May, 15:00", now: new Date()},
//     {id: "0003", host: "0003", name: "Club Meetup 2", location: "Rundle Mall", date: "17th May, 15:00", now: new Date()},
//   ];

// res.json(results);
});


// const port = 3000;
// app.listen(port, () => {
//     console.log(`Success! Your application is running on port ${port}.`);
//   });


module.exports = app;

// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var session = require('express-session');
// var logger = require('morgan');
// var cors = require('cors');


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// const mysql = require('mysql2');
// var app = express();

// app.use(session({
//   secret: '!@#qwe123',
//   resave: true,
//   saveUninitialized: true,
//   cookie: {secure: false},
// }));

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// var dbConnectionPool = mysql.createPool({
//   host: "localhost",
//   database: "events_db"
// });

// app.use(function(req,res,next){
//   req.pool = dbConnectionPool;

//   next();
// });

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// // app.use(cors({
// //   origin: "https://niki81519-code50-80305592-pjgqg5wrg29p79-8080.githubpreview.dev"
// // }));
// app.use(cors());

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

//   //intercepts OPTIONS method
//   if ('OPTIONS' === req.method) {
//     //respond with 200
//     res.send(200);
//   }
//   else {
//   //move on
//     next();
//   }
// });


// // app.options("/*", function(req, res, next){
// //   res.header('Access-Control-Allow-Origin', '*');
// //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
// //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
// //   res.send(200);
// // });

// app.get('/events', (req, res) => {
//   req.pool.getConnection (function(error, connection){
//       if (error) {
//           res.sendStatus(500);
//           console.log(error);
//           return;
//       }

//       connection.query("select * from Event", function(error, rows, fields){
//           //console.log("query response is ", results);
//           connection.release();
//           if (error) {
//               res.sendStatus(500);
//               console.log(error);
//               return;
//           }
//           res.json(rows);
//           return
//       });
// });
// // const results = [
// //     {id: "0001", host: "0001", name: "Graduation Ceremony", location: "Uni Adelaide", date:"5th May, 13:00", now: new Date()},
// //     {id: "0002", host: "0002", name: "Club Meetup", location: "Rundle Mall", date: "7th May, 15:00", now: new Date()},
// //     {id: "0003", host: "0003", name: "Club Meetup 2", location: "Rundle Mall", date: "17th May, 15:00", now: new Date()},
// //   ];

// // res.json(results);
// });





// module.exports = app;
