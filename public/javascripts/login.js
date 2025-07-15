// --> This is router to go to mainpage after login, but code did not respond well so just using window.location.href <-- //
// const routes = [
//   { path: '/home', redirect: '/mainpage.html' },
// ];

// const router = new VueRouter({
//   routes // short for `routes: routes`
// });

var vueinst = new Vue({
  el: '#app',
  // router,
  data: {
    username:'',
    password:'',
    message: '',
    emailSent: false,
    email: '',
    name: '',
    lastname: '',
    isGoogle: false, // new
    returnUrl: ''
  },
  mounted() {
    // todo: check if has already logged-in back home page
    const params = new URLSearchParams(window.location.search);
    this.returnUrl = params.get("return-url");
  },
  methods: {
    parseJwt: function (token) { // new
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    },
    handleCredentialResponse: function (data){ // new
      const gToken = data.credential;
      //const gUser = this.parseJwt(gToken);
      this.isGoogle = true;
      //this.email = gUser.email;
      //this.name = gUser.given_name;
      //this.lastname = gUser.family_name;
      this.gToken = gToken;
      this.login();
    },
    setEmail: function() { // new
      const params = new URLSearchParams(window.location.search);
      this.email = params.get("email");
    },
    resetPassword: function(){ // new
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          window.location.href = "/index.html";
        }
      };
      xhttp.open("POST", "/reset-password", true);
      let post = JSON.stringify({email: this.email, password: this.password});
      xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

      xhttp.send(post);
    },
    goToSignIn: function() { // new
      window.location.href = "/index.html";
    },
    forgotPassword: function() { // [NEW] for forgot password
      var vueInst = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          vueInst.emailSent = true;
          //window.location.href = "/index.html";
        }
      };
      xhttp.open("GET", `/forgot-password?email=${vueInst.email}`, true);

      xhttp.send();
    },
    logout: function() { // [NEW] for logout
      console.log('logout func');
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          window.location.href = "/index.html";
        }
      };

      xhttp.open("GET", "/logout", true);

      xhttp.send();
    },
    appLogin: function(e) {
      this.isGoogle = false;
      this.login();
    },
    login: function () {
      var vueInst = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var login_status = JSON.parse(this.responseText);
          console.log(login_status);
          if (login_status.status){
            // goto home page
            if (vueInst.returnUrl)
              window.location.href = vueInst.returnUrl;
            else
              window.location.href = "/profile.html";
          }
          else if (vueInst.isGoogle){
            const user = login_status.user;
            window.location.href = `/profile.html?page=sign-up&username=${user.username}&name=${user.name}&lname=${user.lastname}&isGoogle=1`;
          }
          else{
            vueInst.message = login_status.message;
          }
        }
      };

      xhttp.open("POST", "/login", true);
      const post = this.isGoogle
        ? JSON.stringify({token: this.gToken, isGoogle: true})                                      // if is Google
        : JSON.stringify({username: this.username, password: this.password, isGoogle: false});  // if not Google
      xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

      xhttp.send(post);
    }
  },
  computed: {
  },
});

function handleCredentialResponse(data){
vueinst.handleCredentialResponse(data);
}