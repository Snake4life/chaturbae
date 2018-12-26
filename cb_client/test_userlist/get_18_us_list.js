var request = require('request');
var cheerio = require('cheerio');
const username = process.argv[2];
var pattern = /^_/g;
const url = 'https://chaturbate.com/tag/18/';
var dashRxp = new RegExp("^_", "g");
request(url, function(error, response, html){
  var userList = []
    if(!error){
      //console.log(html);
      const $ = cheerio.load(html);
      var count = 0;
      $('li.room_list_room').each(function(elem){
        if(count < 5){
        var username = $(this).attr('data-sl');
        var noLeading = username.replace(pattern, '');
        var noUnder = noLeading.replace(/_/g, '-')
        var noDouble = noUnder.replace(/--/g, '-');
        var noPost = noDouble.replace(/-$/g, '')
        //console.log(result).
        userList.push({username: `${username}`, username_sanitized: `${noPost}`})
        //console.log(`${username} ${noPost}`);
        count = count + 1
      }
      });
      userList = userList.slice(1, userList.length);
      console.log(JSON.stringify(userList))
      process.exit(0);
    }

});
