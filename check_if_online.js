var request = require('request');
var cheerio = require('cheerio');
var io = require('socket.io-client')
var socket = io('http://localhost:8098');
const username = process.argv[2];
const url = 'https://chaturbate.com/'+username+'/';
//var minutes = 1, the_interval = minutes * 60 * 1000;
var seconds = 15, the_interval = seconds * 1000;
var online = false;
setInterval(function() {
  console.log(`checking if ${username} is online every minute`);
  request(url, function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request

      if(!error){
        //console.log(html);
        if(! html.includes('Room is currently offline')){
          socket.emit("message", "host went online");
        }
        else {
          socket.emit("message", "host is offline");
        }
      }

  });
}, the_interval);
