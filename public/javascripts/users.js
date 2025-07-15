var app = new Vue({
    el: '#vue',
    data: {
        message: 'Header I guess',
        current_name: '',
        current_uname: '',
        current_email: '',
        current_initial: '',
        current_priviliges: false,

        user_list: [
            { name: "Bob Idk", username: "Bob123", email: "bob@gmail.com", initial: "BI", isAdmin: true },
            { name: "Chris Hemsworth", username: "Chris12", email: "ch12@gmail.com", initial: "CH", isAdmin: false }
        ]
    },
    methods: {
        addPrivileges: function(index){
            console.log('Adding admin privileges');
            Vue.set(this.user_list, index, {
                name: this.user_list[index].name,
                username: this.user_list[index].username,
                email: this.user_list[index].email,
                initial: this.user_list[index].initial,
                isAdmin: true
            });
        },
        removePrivileges: function(index){
            console.log('Removing admin privileges');
            Vue.set(this.user_list, index, {
                name: this.user_list[index].name,
                username: this.user_list[index].username,
                email: this.user_list[index].email,
                initial: this.user_list[index].initial,
                isAdmin: false
            });
        },
        get_users: function(){
            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    user_list = JSON.parse(this.responseText);
                    update_users();
                }
            };

            xhttp.open("GET", "/users"); // Aligns with the /posts in index.js
            xhttp.send();
        },
        update_users: function(){
            this.reset_users();

            for (let user of this.user_list) {
                this.add_user(user.name,user.username,user.email, user.initial, user.isAdmin);
            }
        },
        reset_users: function(){
            let container = document.getElementsByClassName('friends-container')[0];
            // console.log(container);
            while(container.children.length > 0){
                container.children[0].remove();
            }
        },
        add_user: function(name,username,email,initial,isAdmin) {
            let my_user = document.createElement('DIV');
            my_user.classList.add("friends-item");

            let picture = document.createElement('DIV');
            picture.classList.add("friends-picture");
            let picture1 = document.createElement('DIV');
            picture1.classList.add("rounded-picture");
            let picture_i = document.createElement('P');
            picture_i.innerHTML = `${initial}`;

            picture.appendChild(picture1);
            picture1.appendChild(picture_i);

            let info = document.createElement('DIV');
            info.classList.add("friends-info");
            info.innerHTML = `<p><a href="post">Name: ${name}</a></p>
            <p>Username: ${username}</p>
            <p>Email: ${email}</p>`;

            let info1 = document.createElement('DIV');
            info1.classList.add("friends-info");
            info1.innerHTML = `<p>Admin: ${isAdmin}</p>`
            let adminButton = document.createElement('BUTTON');
            if (isAdmin == false){
                let admin_add = document.createElement('BUTTON');
                admin_add.innerText = 'Make admin';
                // document.getElementsByTagName('button')[0].addEventListener("click",this.addPrivileges());
                admin_add.onclick = function(){this.addPrivileges(index)};
                info1.appendChild(admin_add);
            }
            else{
                let admin_rmv = document.createElement('BUTTON');
                admin_rmv.innerText = 'Remove admin';
                // document.getElementsByTagName('button')[0].addEventListener("click",this.removePrivileges());
                admin_rmv.onclick = function(){this.removePrivileges(index)};
                info1.appendChild(admin_rmv);
            }
            // info1.appendChild(adminButton);

            my_user.appendChild(picture);
            my_user.appendChild(info);
            my_user.appendChild(info1);

            document.getElementsByClassName('friends-container')[0].appendChild(my_user);

        }
    }
});