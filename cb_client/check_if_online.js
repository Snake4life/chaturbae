var request = require('request');
var cheerio = require('cheerio');
var io = require('socket.io-client')
var socket = io('http://localhost:8098');
const username = process.argv[2];
const url = 'https://chaturbate.com/'+username+'/';
var online = false;
  request(url, function(error, response, html){
      if(!error){
        //console.log(html);
        if(html.includes('Room is currently offline')){
          console.log('false')
          process.exit(1);
        }
        else {
          console.log('true')
          process.exit(0);
        }
      }

  });
