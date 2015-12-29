var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ChaffSites = require('./models/ChaffSites');
var ChaffEvents = require('./models/ChaffEvents');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use("/fonts",  express.static(__dirname + '/public/fonts'));
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/css",  express.static(__dirname + '/public/css'));

var startup = 1;
var currentEvent = "";
var currentSite = "";
var sitesVisited = 0;
var startTimestamp = new Date();
var chaffPower = "on";

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chaffmon');
mongoose.connection.once('open', function() {

  var chaffSitesRoute = app.route('/api/chaff-sites');

  chaffSitesRoute.post(function(req, res) {
    if (startup == 1) {
      startTimestamp = new Date();
      var chaffEvent = new ChaffEvents();
      chaffEvent.sites = 1;
      console.log("Saving...");
      chaffEvent.save(function(err, resp) {
        if (err)
          console.log("Error: "+err);

        currentEvent = resp.id;
        console.log("New Event: ["+currentEvent+"]");

        saveChaffSite(req, res);
      });
      startup = 0;
    } else {
      if (currentEvent != "") {
        ChaffEvents.findByIdAndUpdate(currentEvent, { $set: { end: Date.now() }, $inc: { sites: 1 } }, function(err, p) {
          if (err) {
            console.log("ERROR! Could not find ID in ChaffEvents."); 
          } else {
            saveChaffSite(req, res);
          }
        });
      }
    }
  });
  chaffSitesRoute.get(function(req, res) {
    if (currentEvent) {
      var q = ChaffSites.find({event: currentEvent},{url: 1}).sort({_id:-1}).limit(10);
      q.exec(function(err, chaff) {
        if (err) {
          res.send(err);
        } else {
          res.json(chaff);
        }
      });
    } else {
      res.json({});
    }
  });

  app.get('/api/sessions', function(req, res) {
    ChaffEvents.find(function(err, events) {
      if (err) {
        res.send(err);
      } else {
        res.json(events);
      }
    });
  });

  app.get('/api/chaff-status', function(req,res) {
   res.json({power: chaffPower});
  });

  app.post('/api/chaff-status', function(req, res) {
   if (req.body.power == "on") {
     chaffPower = "on";
   } else if (req.body.power == "off") {
     chaffPower = "off";
   }

   res.json({ message: 'Status updated.', data: req.body });
  });

  app.get('/api/current-session', function(req, res) {
    res.json({url: currentSite, sites: sitesVisited, start: startTimestamp});
  });

  app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });

  console.log('Listening on port 3000...');
  app.listen(3000);
});

function saveChaffSite(req, res) {
  var chaff = new ChaffSites();
  chaff.url = req.body.url;
  chaff.event = currentEvent;
  currentSite = chaff.url;
  sitesVisited++;

  chaff.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'URL added.', data: chaff });
  });
}
