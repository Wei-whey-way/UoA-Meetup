var vueinst = new Vue({
  el: '#app',
  //router,
  data: {
      // showModal: false,
      profile: {
          name: '',
          lastname: '',
          username:'',
          email:'',
          password: '',
          id: 0,
          isGoogle: false,  //new
          isAdmin: false
      },
      errorMessage:'',
      isNew: false,
      saveTitle: '',
      editing: false,
      createEventMode: false,

      eventName: '',
      eventMonth: '',
      eventDay: '',
      eventYear: '',
      eventAddress: 'Yeet',
      eventAddress2: 'Yeet2',
      eventAddressCity: 'Yote',

      eventStartTimeHour: '',
      eventStartTimeMinute: '',
      eventStartTimePeriod: '',
      eventEndTimeHour: '',
      eventEndTimeMinute: '',
      eventEndTimePeriod: '',
      eventDescription: 'IDK',

      userList: [],
      updatedUserList: [],
      addPeopleMode: false,
      invitedList: [],

      eventID: -1,
      myEventsList: [],
      invitedEventsList: [],
      myEventsIsEmpty: true,
      invitedEventsIsEmpty: true,
      addPeopleButtonColour: '#0d63fd',
      addPeopleButtonTextColour: 'white',

      usersList: []
  },
  mounted() {
    if (window.location.href.includes('profile.html')) {
      this.profile_mount()
    }
    else {
    var vueInst = this;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var user = JSON.parse(this.responseText);
        if (user && user.username) {
          if (user.username.toLowerCase().endsWith('@gmail.com'))
            user.isGoogle = true;
          vueInst.profile = user;
          if (window.location.href.includes('events.html')){
            vueInst.events_mount();
          }
        }
        else {
          window.location.href = `/index.html?return-url=${window.location.href}`;
        }
      }
    };

    xhttp.open("GET", "/current-user", true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

    xhttp.send();
    }
  },
  methods: {
    sendEmailToEventGuests: function(event_id) {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4){
          if (this.status == 200)
            alert("Sent emails to event guests successfully.");
          else
            alert("Sending emails to sent to event guests failed!");
        }
      };

      xhttp.open("GET", "/users/send-email-event-guests/"+event_id, true);
      xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhttp.send();
    },
    makeTime: function (parts) {
      let h = parseInt(parts.h);
      if (h !== 12 && parts.p === "PM")
      h += 12;
     else if (h === 12 && parts.p === "AM")
      h = 0;
     return h.toString().padStart(2,'0')+":"+parts.m.toString().padStart(2,'0')+":00";
    },
    formatTime: function(t){
      const parts = this.getParts(t);
      return parts.h.toString().padStart(2,'0')+":"+parts.m.toString().padStart(2,'0')+" " + parts.p;
    },
    getParts:function(t){
      let h = parseInt(t.substr(0,2));
      const p = h >= 12 ? "PM" : "AM";
      if ( h === 0)
        h = 12;
      else if ( h  > 12 )
        h -= 12;
      return {
        h,
        m: parseInt(t.substr(3,2)),
        p
      }
    },
    editTime: function(item){
      item.editing=!item.editing;
      item.timeParts = this.getParts(item.available_time);
    },
    saveTime: function(item){
      var vueInst = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          item.available_time = vueInst.makeTime(item.timeParts);
          item.editing=!item.editing;
        }
      };

      xhttp.open("POST", "/users/guest-time", true);
      xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhttp.send(JSON.stringify(item));
    },
    setIsGoing: function(item,flag){
      if (item.is_going === flag)
        return;

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ){
          if ( this.status == 200) {
          }
          else{ // undo the change
            item.is_going = !item.is_going;
          }
        }
      };
      item.is_going = flag;
      xhttp.open("POST", "/users/set-isgoing", true);
      xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhttp.send(JSON.stringify(item));
    },
    profile_mount: function() {
      const params = new URLSearchParams(window.location.search);
      const page = params.get("page");
      const isGoogle = params.get("isGoogle");
      this.isNew = page === "sign-up";
      if (this.isNew) {
        this.saveTitle = 'Save';
        this.editing = true;
      }
      else
        this.saveTitle = 'Edit Profile';

      const userIdParam = params.get("userId"); // new
      if (userIdParam)
        this.userId = parseInt(userIdParam);

      console.log("userIdParam:" + userIdParam);

      if (!this.isNew) {
        var vueInst = this;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var user = JSON.parse(this.responseText);
            if (user.username && user.username.toLowerCase().endsWith('@gmail.com'))
              user.isGoogle = true;
            vueInst.profile = user;

          }
        };

        if (this.userId)
          xhttp.open("GET", `/users/user/${this.userId}`, true);
        else
          xhttp.open("GET", "/current-user", true);
        xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

        xhttp.send();
      }
      else if (isGoogle){
        this.profile = {
          name: params.get("name"),
          lastname: params.get("lname"),
          username: params.get("username"),
          email: params.get("username"),
          password: '',
          isGoogle: true,
          id: 0
        };
      }

    },
    events_mount: function() {
	    this.updateMyEventsList();
    	this.updateInvitedEventsList();
    },

    users_mount: function() {
      var vueInst = this;
      vueInst.usersList = [];
      var tempList = [];

      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              // alert("Users list updated successfully");
              tempList = JSON.parse(this.responseText);
              for (let i=0; i<tempList.length; i++) {
                if (tempList[i].user_id != vueInst.profile.id) {
                  let initials = (tempList[i].first_name)[0] + (tempList[i].last_name)[0];
                  tempList[i].initials = initials;

                  vueInst.usersList.push(tempList[i]);
                }
              }
              console.log("UsersList:", vueInst.usersList);
          } else if (this.readyState == 4 && this.status >= 400) {
              alert("Failed to get userslist");
          }
      };

      xhttp.open("GET", "/users/getUsers");
      xhttp.send();
    },

    parseJwt: function (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    },
    save: function (e) {
          if (this.editing){
            if ( this.isNew ) {  //inserting profile (sign-up)
              addUser(this,
                (id) => {
                  this.profile.id = id; // through this collect user id
                  console.log('setProfileId is called:' + this.profile.id);
                }
              );
              }
              else {  // editing profile
                updateUser(this.profile);
              }
              if (!this.errorMessage){
                this.isNew = false;
                this.editing = false;
                this.saveTitle = 'Edit Profile';
              }
          }
          else {
              this.editing = true;
              this.saveTitle = 'Save';
          }
      },

      confirmEvent: function() {
        this.createEventMode = false;
        var vueInst = this;
        // alert("debu1");
        let month;
        let day = this.eventDay;
        if (day.length == 1) {
          day = "0" + day;
        }
        if (this.eventMonth == "Jan") {
            month = "01"
        } else if (this.eventMonth == "Feb") {
            month = "02";
        } else if (this.eventMonth == "Mar") {
            month = "03";
        } else if (this.eventMonth == "Apr") {
            month = "04";
        } else if (this.eventMonth == "May") {
            month = "05";
        } else if (this.eventMonth == "Jun") {
            month = "06";
        } else if (this.eventMonth == "Jul") {
            month = "07";
        } else if (this.eventMonth == "Aug") {
            month = "08";
        } else if (this.eventMonth == "Sep") {
            month = "09";
        } else if (this.eventMonth == "Oct") {
            month = "10";
        } else if (this.eventMonth == "Nov") {
            month = "11";
        } else if (this.eventMonth == "Dec") {
            month = "12";
        }
        let eventDate = `${this.eventYear}-${month}-${day}`;


        let startHour = this.eventStartTimeHour;
        let startMinute = this.eventStartTimeMinute;
        if (this.eventStartTimePeriod == "PM") {
          startHour = parseInt(startHour) + 12;
        }
        if (startHour.length < 2) {
          startHour = "0" + startHour;
        }
        let eventStartTime = `${startHour}:${startMinute}`;

        let endHour = this.eventEndTimeHour;
        let endMinute = this.eventEndTimeMinute;
        if (this.eventEndTimePeriod == "PM") {
          endHour = parseInt(endHour) + 12;
        }
        if (endHour.length < 2) {
          endHour = "0" + endHour;
        }
        let eventEndTime = `${endHour}:${endMinute}`;

        let eventObj = {
          eventName: this.eventName,
          eventDate: eventDate,
          eventStartTime: eventStartTime,
          eventEndTime: eventEndTime,
          eventAddress: this.eventAddress,
          eventAddress2: this.eventAddress2,
          eventAddressCity: this.eventAddressCity,
          eventDescription: this.eventDescription,
        }

        console.log("event obj: ", eventObj);

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert("Event created successfully");
                vueInst.getEventID();
                // vueInst.backendAddPeople();
                // vueInst.eventGuestListUpdate();
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to create Event");
            }
        };

        xhttp.open("POST", "/users/createEvent");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(eventObj));
      },

      eventAddPeople: function() {
        var vueInst = this;
        // vueInst.addPeopleButtonColour = "white";
        // vueInst.addPeopleButtonTextColour = "black";
        vueInst.addPeopleMode = true;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              // console.log("Cur User ID: ", vueInst.profile.id);
              vueInst.userList = [];
              // console.log("DEbug");
              vueInst.updatedUserList = [];
              vueInst.userList = JSON.parse(this.responseText);
              // console.log(userList);
              for (let i=0; i<vueInst.userList.length; i++) {
                if (vueInst.userList[i].user_id != vueInst.profile.id) {
                  let curUID = vueInst.userList[i].user_id;
                  // console.log(curUID);
                  vueInst.updatedUserList.push(vueInst.userList[i]);
                }
              }
              // console.log(vueInst.updatedUserList);

            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to get People");
            }
        };

        xhttp.open("GET", "/users/eventGetPeople");
        xhttp.send();
      },

      backendAddPeople: function() {
        this.addPeopleMode = false;

        this.invitedList = [];
        let usersBox = document.getElementById("usersBox");
        // console.log("usersBox length: ", usersBox.children.length);
        let index = 0;
        while(usersBox.children.length > 0) {
          if (usersBox.children[0].children[0].checked) {
            // console.log("found checked at: ", index);
            this.invitedList.push(this.updatedUserList[index].user_id);
          }
          usersBox.children[0].remove();
          index++;
        }

        // console.log(this.invitedList);
      },

      eventGuestListUpdate: function() {
        var vueInst = this;
        // console.log("invitedList length is: ", this.invitedList.length);
        // console.log("evnetID is: ", this.eventID);
        for (let i=0; i<this.invitedList.length; i++) {
          let guestObj = {guestID: this.invitedList[i], eventID: this.eventID};
          let xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  // Add function here
                  vueInst.updateInvitedEventsList();
                  alert("GuestList added successfully");
              } else if (this.readyState == 4 && this.status >= 400) {
                  alert("Failed to add guestlist");
              }
          };

          xhttp.open("POST", "/users/eventGuestListUpdate");
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.send(JSON.stringify(guestObj));
        }
      },

      eventHostListUpdate: function() {
        console.log("host id is: ", this.profile.id);
        let hostObj = {eventID: this.eventID};
        var vueInst = this;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Add function here
                vueInst.updateMyEventsList();
                alert("HostList added successfully");
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to add hostlist");
            }
        };

        xhttp.open("POST", "/users/eventHostListUpdate");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(hostObj));
      },

      getEventID: function() {
        let xhttp = new XMLHttpRequest();
        var vueInst = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                vueInst.eventID = JSON.parse(this.responseText)[0].event_id;
                // console.log(vueInst.eventID);
                vueInst.eventGuestListUpdate();
                vueInst.eventHostListUpdate();

            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to get Event ID");
            }
        };

        xhttp.open("GET", "/users/getEventID");
        // xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
      },
      loadEventGuestList: function (event) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              event.guestlist = JSON.parse(this.responseText);
          }
        };

        xhttp.open("GET", `/users/eventGuestList/${event.event_id}`);
        xhttp.send();
      },
      updateMyEventsList: function() {
        let xhttp = new XMLHttpRequest();
        var vueInst = this;
        console.log("in updateMyEevntsList:", vueInst.profile.id);
        let unfilteredList = [];
        vueInst.myEventsList = [];
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                unfilteredList = JSON.parse(this.responseText);
                console.log("unfiltered list is", unfilteredList);
                for (let i=0; i<unfilteredList.length; i++) {
                  if (unfilteredList[i].host_id == vueInst.profile.id) {
                    vueInst.loadEventGuestList(unfilteredList[i]);
                    unfilteredList[i].finalStartTime = '';
                    unfilteredList[i].finalEndTime = '';
                    unfilteredList[i].finalPeriod = '';
                    unfilteredList[i].editing = false;
                    unfilteredList[i].showDesc = true;
                    unfilteredList[i].confirmedStartTime = {h: '', m: '', p: ''};
                    unfilteredList[i].confirmedEndTime = {h: '', m: '', p: ''};
                    vueInst.myEventsList.push(unfilteredList[i]);
                  }
                }
                console.log(vueInst.myEventsList);
                if(vueInst.myEventsList.length > 0) {
                  vueInst.myEventsIsEmpty = false;
                }
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to get my events list");
            }
        };

        xhttp.open("GET", "/users/updateMyEventsList");
        // xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
      },

      updateInvitedEventsList: function() {
        let xhttp = new XMLHttpRequest();
        var vueInst = this;
        console.log("in updateInvitedEevntsList:", vueInst.profile.id);
        let unfilteredList = [];
        vueInst.invitedEventsList = [];
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                unfilteredList = JSON.parse(this.responseText);
                console.log("unfiltered list is", unfilteredList);
                for (let i=0; i<unfilteredList.length; i++) {
                  if (unfilteredList[i].guest_id == vueInst.profile.id) {
                    // unfilteredList[i].username = vueInst.profile.username;
                    const invEvent = Object.assign({editing: false}, unfilteredList[i]);
                    vueInst.loadEventGuestList(invEvent);
                    vueInst.invitedEventsList.push(invEvent);                  }
                }
                console.log(vueInst.invitedEventsList);
                if(vueInst.invitedEventsList.length > 0) {
                  vueInst.invitedEventsIsEmpty = false;
                }
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to get invited events list");
            }
        };

        xhttp.open("GET", "/users/updateInvitedEventsList");
        // xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
      },

      addPrivileges: function(id) {
        let vueInst = this;
        let xhttp = new XMLHttpRequest();
        var UID = {user_id: id};
        console.log("Users page: UID = ", id);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Add function here
                vueInst.users_mount();
                alert("privilege added successfully");
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to update privilege");
            }
        };

        xhttp.open("POST", "/users/usersPrivilegeUpdate");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(UID));
      },

      editMyEvent: function(item) {
        item.editing = true;
        item.showDesc = false;
      },

      confirmMyEvent: function(item) {
        item.editing = false;
        item.showDesc = true;

        this.myEventFinaliseTIme(item);
      },

      myEventFinaliseTIme: function(item) {
        var vueInst = this;
        if (item.confirmedStartTime.p == "PM") {
          item.confirmedStartTime.h = parseInt(item.confirmedStartTime.h) + 12;
        }
        if (item.confirmedStartTime.h.length < 2) {
          item.confirmedStartTime.h = "0" + item.confirmedStartTime.h;
        }
        let eventStartTime = `${item.confirmedStartTime.h}:${item.confirmedStartTime.m}`;

        if (item.confirmedEndTime.p == "PM") {
          item.confirmedEndTime.h = parseInt(item.confirmedEndTime.h) + 12;
        }
        if (item.confirmedEndTime.h.length < 2) {
          item.confirmedEndTime.h = "0" + item.confirmedEndTime.h;
        }
        let eventEndTime = `${item.confirmedEndTime.h}:${item.confirmedEndTime.m}`;

        let xhttp = new XMLHttpRequest();
        var finalTime = {start: eventStartTime, end: eventEndTime, id: item.event_id};
        console.log("final time:", finalTime);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                vueInst.updateMyEventsList();
                handleAuthClick();
                alert("final time added successfully");
            } else if (this.readyState == 4 && this.status >= 400) {
                alert("Failed to update privilege");
            }
        };

        xhttp.open("POST", "/users/myEventsFinalTime");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(finalTime));
      }
  },
  computed: {
    notGoingBackground: function() {
      if(this.isGoing == false) return "#32cd32";
      return "#000000";
    },

    goingBackground: function() {
        if(this.isGoing == true) return "#32cd32";
        return "#000000";
    }
  },
});

// Vue.component('modal', {
// template: `
// <transition name="modal">
//   <div class="modal-mask">
//     <div class="modal-wrapper">
//       <div class="modal-container">
//         <div class="modal-body">
//           <slot name="body">
//           </slot>
//         </div>

//         <div class="modal-footer">
//           <slot name="footer">
//             <button class="modal-default-button" @click="$emit('close')">
//               OK
//             </button>
//           </slot>
//         </div>
//       </div>
//     </div>
//   </div>
// </transition>
// `
// });

function addUser(vue, setProfileId) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var new_user = JSON.parse(this.responseText);
        console.log(new_user);
        setProfileId(new_user.id);
        vue.errorMessage = '';
      }
      else /*if (this.status == 500)*/ {
        vue.errorMessage = `Status code: ${this.status} ${this.responseText}`;
      }
    }
  };

  xhttp.open("POST", "/add-user", true);
  let post = JSON.stringify(vue.profile)
  xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8')

  xhttp.send(post);
  };

  function updateUser(profile) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200){
        vue.errorMessage = '';
      }
      else /*if (this.status == 500)*/ {
        vue.errorMessage = `Status code: ${this.status} ${this.responseText}`;
      }
    }
  };

  xhttp.open("POST", "/users/update-user", true);
  let post = JSON.stringify(profile)
  xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8')

  xhttp.send(post);
  };



/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
// const CLIENT_ID = '80995453411-gcpjlgvmb4o4a4oiotge2spqcn8co78r.apps.googleusercontent.com';
// const API_KEY = 'AIzaSyC5nq5855pwZYwSMUuVQAvkmk7Q9msFlOM';

// Discovery doc URL for APIs used by the quickstart
// const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// let tokenClient;
// let gapiInited = false;
// let gisInited = false;

// document.getElementById('authorize_button').style.visibility = 'visible';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
await gapi.client.init({
  apiKey: API_KEY,
  discoveryDocs: [DISCOVERY_DOC],
});
gapiInited = true;
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: CLIENT_ID,
  scope: SCOPES,
  callback: '', // defined later
});
gisInited = true;
// maybeEnableButtons();
}

//For google calendar API
/**
 * Enables user interaction after all libraries are loaded.
 */
// function maybeEnableButtons() {
// if (gapiInited && gisInited) {
//   document.getElementById('authorize_button').style.visibility = 'visible';
// }
// }

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
tokenClient.callback = async (resp) => {
  if (resp.error !== undefined) {
    throw (resp);
  }
  // document.getElementById('authorize_button').innerText = 'Refresh';
  await get_c_event();
};

if (gapi.client.getToken() === null) {
  // Prompt the user to select a Google Account and ask for consent to share their data
  // when establishing a new session.
  tokenClient.requestAccessToken({prompt: 'consent'});
} else {
  // Skip display of account chooser and consent dialog for an existing session.
  tokenClient.requestAccessToken({prompt: ''});
}
}

//Get event from client side for google calendar
async function get_c_event(){

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          event_list = JSON.parse(this.responseText);
          console.log(event_list);
          // console.log(event_list[0].title);
          // console.log(event_list[0].dStr);

          //Getting values from parsed json
          var title = event_list[0].title;
          var location = event_list[0].address_1 + ", " + event_list[0].address_2 + ", " + event_list[0].address_3;
          var desc = event_list[0].dStr;
          var date = event_list[0].event_date;
          date = date.substring(0, 11);
          var start = date + event_list[0].timestart + ".0";
          var end = date + event_list[0].timeend + ".0"
          var guestList = [{"email": "weilongsg@gmail.com"}];
          console.log(title);
          console.log(location);
          console.log(desc);
          // console.log(date);
          console.log(start);
          console.log(end);


          let new_e = {
            "summary": title,
            "location": location,
            "description": desc,
            "end": {
              "dateTime": end,
              "timeZone": "Australia/Adelaide"
            },
            "start": {
              "dateTime": start,
              "timeZone": "Australia/Adelaide"
            },
            "attendees": guestList
          }

          addEvent(new_e);
      }
  };

  xhttp.open("GET", "/c_event"); // Aligns with the /posts in index.js
  xhttp.send();

}

function addEvent(new_e) {
  console.log("attempting to add event");

  return gapi.client.calendar.events.insert({
    "calendarId": "primary",
    "resource": new_e
  })
      .then(function(response) {
              // Handle the results here (response.result has the parsed body).
              console.log("Response", response);
            },
            function(err) { console.error("Execute error", err); });
}