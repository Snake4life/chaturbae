var request = require('request');
var cheerio = require('cheerio');
var io = require('socket.io-client')
var socket = io('http://localhost:8098');
const username = process.argv[2];
var pattern = /^_/g;
const url = 'https://chaturbate.com/tag/18/f/';
var dashRxp = new RegExp("^_", "g");
request(url, function(error, response, html){
  var userList = []
    if(!error){
      //console.log(html);
      const $ = cheerio.load(html);
      $('li.room_list_room').each(function(elem){

        var username = $(this).attr('data-sl');

        var noLeading = username.replace(pattern, '');
        var noUnder = noLeading.replace(/_/g, '-')
        var noDouble = noUnder.replace(/--/g, '-');
        var noPost = noDouble.replace(/-$/g, '')
        //console.log(result).
        userList.push({username: `${username}`, username_sanitized: `${noPost}`})
        //console.log(`${username} ${noPost}`);
      });
      console.log(JSON.stringify(userList))
      process.exit(0);
    }

});
