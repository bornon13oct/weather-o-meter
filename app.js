var express = require("express");
var app = express();

var request = require("request");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("home");
});

app.get("/search", function(req, res){
    var cityname = req.query.city;
    var toreq = "http://maps.googleapis.com/maps/api/geocode/json?address="+cityname+"&sensor=false";
    request(toreq, function(error ,response ,body){
        if(!error&&response.statusCode == 200){
            var parsed = JSON.parse(body);
            var loc = parsed.results[0].geometry.location;
            var lat = loc.lat;
            var lon = loc.lng;
            var data = "https://api.darksky.net/forecast/c8edec2cdc029c0e23ae20fc04c57c6e/"+lat+","+lon;
            request(data, {"rejectUnauthorized": false}, function(error ,response ,body){
                 if(!error&&response.statusCode == 200){
                     var wparsed = JSON.parse(body);
                     var timezone = wparsed.timezone;
                     var curr = "https://script.google.com/macros/s/AKfycbyd5AcbAnWi2Yn0xhFRbyzS4qMq1VucMVgVvhul5XqS9HkAyJY/exec?tz="+timezone;
                     var time;
                     var parsing;
                     var hours;
                     var amorpm = "am";
                     var hourly = wparsed.hourly;
                     request(curr, {"rejectUnauthorized": false}, function(error ,response ,body){
                         var date = JSON.parse(body);
                         var week = date.dayofweekName;
                         request(curr, {"rejectUnauthorized": false}, function(error, response, body){
                             if(!error&&response.statusCode == 200){
                                 parsing = JSON.parse(body);
                                 hours = parsing.hours;
                                 if(hours>=12){
                                     if(hours>12){
                                         hours -=12;
                                     }
                                     amorpm = "pm";
                                 }
                                 res.render("results",{ hourly:hourly ,hours:hours ,amorpm:amorpm ,day:week});
                             }
                             else
                                 console.log(error);
                         });
                     });
                 }
                else
                    console.log(error);
            });
        }
        else
            console.log(error);
    });
});

app.listen(process.env.PORT,process.env.IP, function(){
    console.log("server has started");
});