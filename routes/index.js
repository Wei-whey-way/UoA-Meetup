var express = require('express');
var router = express.Router();
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_OAUTH2_CLIENT_ID;
const gClient = new OAuth2Client(CLIENT_ID);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/reset-password', function (req, res, next){ //new for reset password profile
  req.pool.getConnection (function(error, connection){
    if (error) {
        res.sendStatus(500);
        console.log(error);
        return;
    }
    var user = req.body;

    connection.query("update User set user_password = ? where email = ?", [user.password, user.email], function(error, data){
        console.log(data);

        connection.release();
        if (error) {
            res.sendStatus(500);
            console.log(error);
            return;
        }
        // check data.affectedRows to be 1
        res.sendStatus(200);
    })
})
});

router.get('/forgot-password', function(req, res) { // new for logout
  const email = req.query.email;
  req.emailService.sendMail({
    from: 'Administrator" <uoameetup@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Reset password", // Subject line
    text: `click this link to reset your password`, // plain text body
    html: `<a href="https://wei-way-code50-87966966-q74vrwxx5h97jv-3000.githubpreview.dev/reset-password.html?email=${email}">
          Click to reset your password</a>`, // html body
  });
  res.sendStatus(200);
});

router.get('/logout', function(req, res) { // new for logout
  req.session.user = null;
  res.sendStatus(200);
});


router.post('/login', function (req, res, next){ //edit profile

  const user =req.body;
  async function verify() { // new verify by google auth library
    if (user.isGoogle && user.token) {
      console.log(user);
      const ticket = await gClient.verifyIdToken({
        idToken: user.token,
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      user.username = payload['email'];
      user.email = payload['email'];
      user.name = payload['given_name'];
      user.lastname = payload['faily_name'];
      }
    }
  verify()
    .then(function() {
      req.pool.getConnection (function(error, connection){
        if (error) {
            res.sendStatus(500);
            console.log(error);
            return;
        }

        var isGoogle = user.isGoogle ? 1 : 0;
        if (!user.isGoogle && user.username.toLowerCase().endsWith('@gmail.com')){
          res.json({status: false, message: "Google accounts should Sign in Google!"});
        }

        connection.query("select * from User where username = ? and (user_password = ? or 1 = ?)", [user.username, user.password, isGoogle], function(error, data, fields){
            console.log(data);

            connection.release();
            if (error) {
                res.sendStatus(500);
                console.log(error);
                return;
            }
            if (data.length > 0){ // if data exists
              var user = {
                name: data[0].first_name,
                lastname: data[0].last_name,
                username: data[0].username,
                email: data[0].email,
                password: data[0].user_password,
                id: data[0].user_id,
                isAdmin: data[0].isAdmin
              };
              console.log(user);
              req.session.user = user;
              res.json({status: true});
            }
            else {
              if (user.isGoogle)
                res.json({status: false, user});
              else
                res.json({status: false, message: "Incorrect username or password!"});
            }
        })
      })
    })
    .catch(function(e)  {
      //res.sendStatus(403);
      console.log(e);
      res.json({status: false, message: "Incorrect google account!"});
    });
});

router.post('/add-user', function (req, res, next){
  req.pool.getConnection (function(error, connection){
    if (error) {
        res.sendStatus(500);
        console.log(error);
        return;
    }
    console.log(req.body);
    var user = req.body;
    connection.query("insert into User (first_name, last_name, username, user_password, email, isAdmin) values (?, ?, ?, ?, ?, 0)", [user.name, user.lastname, user.username, user.password, user.email], function(error, data){
        if (error) {
          res.status(500).send(error.sqlMessage);
          console.log(error);
          return;
        }

        console.log(data);
        user.id = data.insertId; // insertId is auto_increment value for inserting into User table
        req.session.user = user;
        connection.release();

        req.emailService.sendMail({
          from: 'Administrator" <admin@example.com>', // sender address
          to: user.email, // list of receivers
          subject: "Welcome to UOA Meetup", // Subject line
          text: `Hello ${user.name}`, // plain text body
          html: "<h3>You are signed up to UOA Meetup application successfully.</h3>", // html body
        });

        res.json(user);
    })
})
});

router.get('/current-user', function (req, res, next){  // retyrn current user logged-inn or signed-up
  console.log("in current-user");
  console.log(req.session.user);
  res.json(req.session.user?req.session.user:null);
});

//FOR SENDING TO GOOGLE CALENDAR
router.get('/c_event', function(req, res, next) {
  req.pool.getConnection(function(error, connection){
    if(error){
      res.sendStatus(500);
      return;
    }

    let query = "SELECT event_name AS title, address_1, address_2, address_3, event_description AS dStr, event_starttime AS timestart, event_endtime AS timeend, event_date FROM Event INNER JOIN Hostlist ON Event.event_id = Hostlist.event_id INNER JOIN User ON Hostlist.host_id = User.user_id;";
    // let query = "SELECT event_name AS title, address_1, address_2, address_3, event_description AS dStr, event_starttime AS timestart, event_endtime AS timeend, event_date FROM Event;";
    connection.query(query, function(error, rows, fields){
      connection.release();
      if (error){
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    })
  });
});

//FOR SENDING TO CALENDAR
router.get('/u_calendar', function(req, res, next) {
  req.pool.getConnection(function(error, connection){
    if(error){
      res.sendStatus(500);
      return;
    }
      // events: [
      //     { start: '2022-06-07 10:35', end: '2022-06-07 11:30', title: 'Doctor appointment' },
      //   ]

    let query = "SELECT event_starttime AS start, event_endtime AS end, event_name AS title, event_date FROM Event INNER JOIN Hostlist ON Event.event_id = Hostlist.event_id INNER JOIN User ON Hostlist.host_id = User.user_id;";
    // let query = "SELECT event_starttime AS start, event_endtime AS end, event_name AS title, event_date FROM Event;";
    connection.query(query, function(error, rows, fields){
      connection.release();
      if (error){
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    })
  });
});


module.exports = router;
