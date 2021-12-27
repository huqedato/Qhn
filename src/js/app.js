const app = new Vue({
    el: '#app',
    data() {
        return {
            allIDs: [],
            alldata: [],
            show: false,
            msg: null
        };
    },
    created() {
        const that = this;
        axios.get('https://hacker-news.firebaseio.com/v0/topstories.json')
            .then(function (response) {
                that.pushAll(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    },
    methods: {
        pushAll: function (response) {
            if (this.allIDs.length == 0)
                this.allIDs = response; //.slice(0, 10) //- pt test;
        },
        getHostName: function (url) {
            var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
            if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
                return match[2];
            } else {
                return null;
            }
        },
        getDomain: function (url) {
            const hostName = this.getHostName(url);
            let domain = hostName;

            if (hostName != null) {
                var parts = hostName.split('.').reverse();

                if (parts != null && parts.length > 1) {
                    domain = parts[1] + '.' + parts[0];

                    if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                        domain = parts[2] + '.' + domain;
                    }
                }
            }

            return domain;
        }
    },
    watch: {
        allIDs: function () {
            const that = this;
            /* this.allIDs.forEach(element => {
                 axios.get(`https://hacker-news.firebaseio.com/v0/item/${element}.json?print=pretty`)
                     .then(function (response) {
                         that.alldata.push(response.data)
                     })
                     .catch(function (error) {
                         console.log(error);
                     });
             });*/

            function makeRequestsFromArray(arr) {
                let index = 0;

                function request() {
                    return axios.get(`https://hacker-news.firebaseio.com/v0/item/${arr[index]}.json`)
                        .then((response) => {
                            if (response.data.title.startsWith("Ask HN:")) {
                                response.data.url = `https://news.ycombinator.com/item?id=${response.data.id}`;
                                response.data.domain = "HN";
                            } else
                            if (response.data.type == "story")
                                try {
                                    response.data.domain = that.getDomain(response.data.url);
                                }
                            catch (e) {
                                response.data.url = `https://news.ycombinator.com/item?id=${response.data.id}`;
                                response.data.domain = "HN";
                                console.log("domain fetch error. No pb.");
                            }
                            that.alldata.push(response.data);
                            index++;
                            if (index >= arr.length) {
                                console.log("Done!");
                                console.log(index);
                                that.msg = "Done. " + index;
                                that.show = true;
                                setTimeout(() => that.show = false, 7000);
                                return;

                            }

                            return request();
                        })
                        .catch(function (error) {
                            console.log(error);
                        });


                }
                return request();
            }

            makeRequestsFromArray(that.allIDs);
        }
    }
});