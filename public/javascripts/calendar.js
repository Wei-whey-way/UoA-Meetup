new Vue({
    components: { 'vue-cal': vuecal },
    el: '#cal',
    data: {
        events: []
    //   events: [
    //     { start: '2022-06-07 10:35', end: '2022-06-07 11:30', title: 'Doctor appointment' },
    //     { start: "2022-06-09 12:00", end: "2022-06-09 14:00", title: "LUNCH" },
    //     { start: "2022-06-11 12:00", end: "2022-06-11 14:00", title: "LUNCH" }
    //   ]
    },
    mounted:function(){
        this.get_u_events();
    },
    methods: {
        //Get event from client side
        get_u_events: function(){
            var vueInst = this;
            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    new_events = JSON.parse(this.responseText);
                    console.log(new_events);
                    // clear_event();
                    for(event in new_events){
                        var date = new_events[event].event_date;
                        date = date.substring(0, 10);
                        console.log(date);

                        var start = new_events[event].start;
                        start = start.substring(0,5);
                        start = date + " " + start;
                        console.log(start);

                        var end = new_events[event].end;
                        end = end.substring(0,5);
                        end = date + " " + end;
                        console.log(end);

                        let new_event = {
                            "start": start,
                            "end": end,
                            "title": new_events[event].title
                        };
                        console.log(new_event);

                        vueInst.events.push( new_event );
                    }

                }
            };

            xhttp.open("GET", "/u_calendar"); // Aligns with the /posts in index.js in routes
            xhttp.send();

        }
    }
  });


