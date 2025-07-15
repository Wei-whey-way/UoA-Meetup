USE events_db;
create table User(
    user_id INT(11) NOT NULL auto_increment ,
    first_name VARCHAR(100) NOT NULL ,
    last_name VARCHAR(100) NOT NULL ,
    username VARCHAR(50) NOT NULL ,
    user_password VARCHAR(10) NOT NULL ,
    email VARCHAR(100) NOT NULL ,
    isAdmin TINYINT NOT NULL ,
    PRIMARY KEY (user_id) ,
    UNIQUE idx_username (username)
);

create table Event(
    event_id INT(11) NOT NULL auto_increment ,
    event_name VARCHAR(100) NOT NULL ,
    event_date DATE NOT NULL ,
    event_starttime TIME NOT NULL ,
    event_endtime TIME NOT NULL ,
    address_1 VARCHAR(255) ,
    address_2 VARCHAR(255) ,
    address_3 VARCHAR(255) ,
    event_description VARCHAR(1000) ,

    PRIMARY KEY (event_id)
);


create table Guestlist(
    guest_id INT(11) NOT NULL REFERENCES User(user_id) ,
    event_id INT(11) NOT NULL REFERENCES Event(event_id),
    is_going BOOLEAN NOT NULL ,
    available_time TIME NOT NULL
);


create table Hostlist(
    host_id INT(11) NOT NULL ,
    event_id INT(11) NOT NULL ,
    -- isGoing TINYINT NOT NULL ,
    -- availableTime TIME NOT NULL ,
    FOREIGN KEY (host_id) REFERENCES User(user_id) ,
    FOREIGN KEY (event_id) REFERENCES Event(event_id)
);

-- test sqls
/*
insert into Event (
    event_name,
    event_date,
    event_time,
    address_1,
    event_description)
values ( 'TestEvent', '2022-05-20', '10:00', 'Adelaide show ground', 'This is a test Event.' );
*/

-- Test User

    INSERT INTO User (first_name, last_name, username, user_password, email, isAdmin)
    VALUES ("Gordon",
        "Hamsay",
        "Gham",
        "1234567",
        "Gham@gmail.com",
        false
    );


INSERT INTO Event (event_name, event_date, event_time, address_1, address_2, address_3, event_description) VALUES ('CTF', '02/06/22', '15:00', 'Uni Of Adelaide', '', '', '');

INSERT INTO Guestlist (user_id, event_id, is_going, available_time) VALUES (1, 1, false, 00:00:00);