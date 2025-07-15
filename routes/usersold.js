var express = require('express');
var router = express.Router();
// const HOST='https://niki81519-code50-80305592-pjgqg5wrg29p79-8080.githubpreview.dev'
const HOST='http://127.0.0.1:3000'

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var tempUser = {
  name: 'Daniel',
  lastname: 'Chong',
  username: 'DChong',
  email: 'danielchong@gmail.com',
  password: '123',
  id: 1
};

router.use('/', function(req, res, next) {
  if (!('user' in req.session)) {
    console.log("user not authed");
    res.sendStatus(403);
    return;
  } else {
    console.log("user authed");
    // console.log(req.session.user);
    return next();
  }
});


router.post('/update-user', function (req, res, next){ //edit profile
  req.pool.getConnection (function(error, connection){
    if (error) {
        res.sendStatus(500);
        console.log(error);
        return;
    }
    console.log(req.body);
    var user = req.body;
    connection.query("update User set first_name = ?, last_name = ?, user_password = ?, email = ? where user_id = ?", [user.name, user.lastname, user.password, user.email, user.id], function(error, data){
        console.log(data);
        //data.affectedCount;
        if (req.session.user) {  // new
          var sUser = req.session.user;
          if (user.id === sUser.id) { // [NEW] for Admin editing users
            sUser.name = user.name;
            sUser.lastname = user.lastname;
            sUser.email = user.email;
            sUser.password = user.password;
          }
        }
        connection.release();
        if (error) {
            res.sendStatus(500);
            console.log(error);
            return;
        }
        res.sendStatus(200);
    })
})
});


router.get('/user/:userId', function (req, res, next){  // new get user info for admin page uses route parameter userId
  const userId = req.params.userId;

  req.pool.getConnection (function(error, connection){
    if (error) {
        res.sendStatus(500);
        console.log(error);
        return;
    }
    connection.query("select * from User where user_id = ?", [userId], function(error, data, fields){
        connection.release();
        if (error) {
            res.sendStatus(500);
            console.log(error);
            return;
        }
        if (data.length){ // if data exists
          var user = {
            name: data[0].first_name,
            lastname: data[0].last_name,
            username: data[0].username,
            email: data[0].email,
            password: data[0].user_password,
            id: data[0].user_id
          };
          res.json(user);
        }
        else {
          res.json({status: false, message: `User with user id ${userId} not found!`});
        }
    })
})
});

router.post('/createEvent', function(req, res, nexr) {
  // console.log(req.body);

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "INSERT INTO Event (event_name, event_date, event_starttime, event_endtime, address_1, address_2, address_3, event_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
    connection.query(query, [req.body.eventName, req.body.eventDate, req.body.eventStartTime, req.body.eventEndTime, req.body.eventAddress, req.body.eventAddress2, req.body.eventAddressCity, req.body.eventDescription], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      console.log("event queried");
      res.end();
    });
  });

  // next();
});

router.post('/eventGuestListUpdate', function(req, res, nexr) {
  console.log(req.body);

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "INSERT INTO Guestlist (guest_id, event_id, is_going, available_time) VALUES (?, ?, false, '00:00:00');"
    connection.query(query, [req.body.guestID, req.body.eventID], function(error, rows, fields) {
      //connection.release();   //new
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      let query = "SELECT first_name, last_name, email FROM User WHERE user_id = ?";  //new
      connection.query(query, [req.body.guestID], function(error, rows, fields) {
        connection.release();
        if (error) {
          console.log(error);
          res.end();
          return;
        }

        // Send email to user email
        const email = rows[0].email;
        const name = rows[0].first_name;
        const lname = rows[0].last_name;

        const link = `${HOST}/events.html`;
        console.log('sending email to: ' + email);
        req.emailService.sendMail({
          from: 'Administrator" <admin@example.com>', // sender address
          to: email, // list of receivers
          subject: "Event invitation", // Subject line
          text: `Hello ${name} ${lname}`, // plain text body
          html: `<h3>You are invited to event. Please specify your availability by clicking on the
          <a href=${link}>link</a></h3>`, // html body
        }, (err, info) => {
          if ( err ) {
            console.log(err);
          }
      });
      res.end();
    });
  });
});
});

router.post('/eventHostListUpdate', function(req, res, next) {
  console.log("in event hostlist");
  console.log(req.body);

  const user = req.session.user;
  if (!user){
    res.status(403).send("User not authenticated!");
    return;
  }

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }
    let query = "INSERT INTO Hostlist (host_id, event_id) VALUES (?, ?);"
    connection.query(query, [user.id, req.body.eventID], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      // console.log(req.session.user);
      res.end();
    });
  });
})

router.get('/getEventID', function(req, res, next) {

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT event_id FROM Event ORDER BY event_id DESC LIMIT 1";
    connection.query(query, function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      // console.log(req.session.user);
      // console.log(rows);
      res.send(rows);
    });
  });
});



router.get('/getMyEvents', function(req, res, next) {

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT * FROM Event INNER JOIN ";
    connection.query(query, [], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.end();
    });
  });
})

router.get('/updateMyEventsList', function(req, res, next) {
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT * FROM Event INNER JOIN Hostlist ON Event.event_id = Hostlist.event_id INNER JOIN User ON Hostlist.host_id = User.user_id;";
    connection.query(query, function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.send(rows);
      res.end();
    });
  });
})

router.get('/send-email-event-guests/:event_id', function(req, res, next) {
  const event_id = req.params.event_id;
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT * FROM Event INNER JOIN Guestlist INNER JOIN User ON user_id = guest_id ON Event.event_id = Guestlist.event_id WHERE Event.event_id  = ?;";
    connection.query(query, [event_id], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }
      const link = `${HOST}/events.html`;
      console.log(link);
      rows.forEach((row) => {
        req.emailService.sendMail({
          from: 'Administrator" <admin@example.com>', // sender address
          to: row.email, // list of receivers
          subject: `Event ${row.event_name} confirmation`, // Subject line
          text: `Hello ${row.first_name} ${row.last_name}`, // plain text body
          html: `<h3>Event <a href=${link} >${row.event_name} </a> confirmed</h3>
                <p>
                  Description: ${row.event_description}
                  <br /> Location: ${row.address_1} ${row.address_2} ${row.address_3}
                  <br /> Date: ${row.event_date}
                  <br /> Start time: ${row.event_starttime}
                  <br /> End time: ${row.event_endtime}
                </p>`, // html body
          },
          (err, info) => {
            if ( err )
              console.log(err);
          });
        });
      res.sendStatus(200);
    });
  });
})

router.get('/eventGuestList/:event_id', function(req, res, next) {
  const event_id = req.params.event_id;
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT * FROM User INNER JOIN Guestlist ON user_id = guest_id WHERE event_id  = ?;";
    connection.query(query, [event_id], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.status(200).send(rows);
    });
  });
})

router.get('/updateInvitedEventsList', function(req, res, next) {
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT * FROM Event INNER JOIN Guestlist ON Event.event_id = Guestlist.event_id INNER JOIN Hostlist ON Hostlist.event_id = Event.event_id INNER JOIN User ON User.user_id = Hostlist.host_id;";
    connection.query(query, function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.send(rows);
      res.end();
    });
  });
})

router.get('/eventGetPeople', function(req, res, next) {

  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT user_id, first_name, last_name FROM User";
    connection.query(query, [], function(error, rows, fields) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      console.log(rows);
      res.json(rows);
      res.end();
    });
  });
})


router.post('/guest-time', function(req, res, nexr) {
  const user = req.session.user;
  if (!user){
    res.status(403).send("User not authenticated!");
    return;
  }
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    const item = req.body;
    const timeParts = item.timeParts;
    let h = parseInt(timeParts.h.toString());
    if (timeParts.p.toUpperCase() === "PM" && h !== 12){
      h += 12;
    } else if (timeParts.p.toUpperCase() === "AM" && h === 12) {
      h = 0;
    }
    const time = h.toString().padStart(2, '0') + ":" + timeParts.m.toString().padStart(2, '0') + ":00";
    let query = "UPDATE Guestlist SET available_time = ? WHERE guest_id = ? AND event_id = ?";
    connection.query(query, [time, user.id, item.event_id], function(error, rows) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      console.log(`Guestlist updated affected count: ${rows.affectedCount}`);
      res.end();
    });
  });

});

//set-isgoing
router.post('/set-isgoing', function(req, res) {
  const user = req.session.user;
  if (!user){
    res.status(403).send("User not authenticated!");
    return;
  }
  req.pool.getConnection(function(error, connection) {
    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    const item = req.body;

    let query = "UPDATE Guestlist SET is_going = ? WHERE guest_id = ? AND event_id = ?";
    connection.query(query, [item.is_going, user.id, item.event_id], function(error, rows) {
      connection.release();
      if (error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      console.log(`Guestlist updated affected count: ${rows.affectedCount}`);
      res.end();
    });
  });

});

module.exports = router;