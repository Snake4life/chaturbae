var servicesIP =  process.env.SERVICE_IP
var debugTime = process.env.DEBUG_TIME
var io = require('socket.io-client')
var socket = io(`http://localhost:8080`);
var socketIRC = io(`http://${servicesIP}:8081`);
var fs = require('fs');
var AWS = require('aws-sdk');
var request = require('request');
var inRoom = false;
var prettyjson = require('prettyjson');
var server_debug = require('debug')('chaturbae:server')
var cb_room_debug = require('debug')('chaturbae:room')
var detect_nudity_debug = require('debug')('chaturbae:nude')
var ai_debug = require('debug')('chaturbae:ai')
var USERNAME = process.env.MODEL_USERNAME;
var AWSKEY = process.env.AWSKEY
var AWSSECRET = process.env.AWSSECRET
var pIP = ""
var logger = require('pino')()
var server_log = logger.child({ event: 'logging:chaturbae-client', site: 'chaturbate', model_username: `${USERNAME}` })
var cb_room_log = logger.child({ event: 'logging:chaturbae-room', site: 'chaturbate', model_username: `${USERNAME}` })
var nudity_log = logger.child({ event: 'logging:chaturbae-nude', site: 'chaturbate', model_username: `${USERNAME}` })
var ai_log = logger.child({ event: 'logging:chaturbae-ai', site: 'chaturbate', model_username: `${USERNAME}` })
AWS.config.update({ accessKeyId: `${AWSKEY}`, secretAccessKey: `${AWSSECRET}` });
var s3 = new AWS.S3();
var s3_bucket = "chaturbae-images"
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
socket.on('connect', () => {
  server_log.info('connected to cb_server at http://localhost:8080');
  server_log.info(`got username from environment - ${USERNAME}`);
  // tell the backend to load this profile
  socket.emit('init', USERNAME);
});

socket.on('init', (e) => {
  server_log.info(e);
  server_log.info(`Welcome to ${e.room}'s room!`);
  server_log.info(`Current room subject is: ${e.subject}`);
});

socket.on('room_entry', (e) => {
  if(e.user.username == USERNAME) {
    cb_room_log.info(`Host entered the room`);
    socketIRC.emit('message', USERNAME + " has joined her CB room http://www.chaturbate.com/"+USERNAME);
  }
  cb_room_log.info(`${e.user.username} has joined the room`);
});

socket.on('room_leave', (e) => {
  if(e.user.username == USERNAME) {
    cb_room_log.info(`Host left the room`);
    socketIRC.emit('left', USERNAME + " has left her CB room http://www.chaturbate.com/"+USERNAME);
  }
  cb_room_log.info(`${e.user.username} has left the room`);
});

socket.on('tip', (e) => {

  var datetime = (new Date).getTime();

  //var child = spawn('bash', ['bash_scripts/all.sh', `${USERNAME}`, `${datetime}`])
  //child.on('error', err => nudity_log.error('Error:', err));
  //child.on('exit', (data) => {
  var command = `bash bash_scripts/all.sh ${USERNAME} ${datetime}`
    var child = exec(command,
      function(error, stdout, stderr){
        cb_room_log.info('all.sh exited, checking for return value')
        var score = stdout.toString();
        cb_room_log.info(`string score ${score}`);
        score = score*100
        cb_room_log.info(`string score * 100 - ${score}`);
        nsfwScore = parseInt(score);
        cb_room_log.info(`nsfwScore returned ${nsfwScore}`);
        if(nsfwScore > 51){
          cb_room_log.info(`nsfwScore > 51`);
          var tip_log = logger.child({ event: 'logging:chaturbae-tip', tip_amount: parseInt(e.amount), tipper: `${e.user.username}`, is_naked: 'true', nsfw_score: nsfwScore, site: 'chaturbate', model_username: `${USERNAME}`})
        }
        else{
          var tip_log = logger.child({ event: 'logging:chaturbae-tip', tip_amount: parseInt(e.amount), tipper: `${e.user.username}`, is_naked: 'false', site: 'chaturbate', model_username: `${USERNAME}`, nsfw_score: nsfwScore})
        }
        cb_room_log.info(prettyjson.render(e))
        tip_log.info(`${e.user.username} tipped ${e.amount} tokens`);
        if(e.amount > 1000){
          socketIRC.emit('tip', e.user.username + ` tipped a LARGE amount - ${e.amount} -- http://www.chaturbate.com/${USERNAME}`);
        }
    });

//  });

});

socket.on('room_message', (e) => {
  cb_chat_log = logger.child({ event: 'logging:chaturbae-message', chat_user: `${e.user.username}`, site: 'chaturbate', model_username: `${USERNAME}` })
  cb_chat_log.info(`${e.message}`);

});

socket.on('disconnect', () => {
  server_debug('disconnect')
});
socket.on('refresh_panel', (e) => {
  cb_room_log.info('Goal refreshed');
  cb_room_log.info(e)
  try {
    message = `New Goal reached. Current goal #${e.goal.goalCurrent} - Remaining goals: ${e.goal.goalRemaining} - -- http://www.chaturbate.com/${USERNAME}`;
    //socketIRC.emit('goal', message)
  }
  catch (e){
    cb_room_log.info('no goal set to refresh')
  }


});
ranSecond = Math.floor(Math.random() * 150) + 30
minutes = 1;
//var minutes = .25;

if(debugTime == "true"){
   var the_interval = 10 * 1000;
}
else {
  var the_interval = minutes * 60 * 1000;
}
//var minutes = 60, the_interval = minutes  * 1000;

var firstNaked = 0;
setInterval(function() {
  var isOnline = spawn('node',  ['check_if_online.js', `${USERNAME}`]);
  isOnline.on('close', function (code) {
      if(code == 0){
        inRoom=true
        server_log.info(`${USERNAME} is online - check_if_online.js`)
      }
      else{
        inRoom=false
        server_log.info(`${USERNAME} is offline - check_if_online.js`)
      }
  });
  if(inRoom){
    var datetime = (new Date).getTime();
    //var child = spawn('streamlink', ['-Q', `http://www.chaturbate.com/${USERNAME}`, 'best', '-o', `${USERNAME}-${datetime}.mkv`], {detached: true});
    var child = spawn('bash', ['bash_scripts/all.sh', `${USERNAME}`, `${datetime}`])
    child.on('error', err => nudity_log.error('Error:', err));
    child.on('exit', () => {
      nudity_log.info(`background nudity worker exited gracefully`);
      child.stdout.on('data', (data) => {
        score = data.toString();
        score = score*100
        nsfwScore = parseInt(score);
        ai_log.info(`AI Detected a NSFW Score of ${nsfwScore}%`);
        if(nsfwScore > 51){
          naked_logger = logger.child({event: 'logging:chaturbae-naked', is_naked: 'true', nsfw_score: `${nsfwScore}`, site: 'chaturbate', model_username: `${USERNAME}` });
          naked_logger.info(`${USERNAME} appears to be naked`);
          if(firstNaked < 1){
            ai_log.info(`First time seen naked: ${firstNaked}`);
            var roundedPercent = " artificial inteligance suggests she's "
          socketIRC.emit('naked', USERNAME + " APPEARS TO BE NAKED!!!!! http://www.chaturbate.com/"+USERNAME+" artificial inteligance suggests she's "+nsfwScore+"% naked");
          }
          else{
            //ai_log.child({ is_naked: 'false' })
            ai_log.info(`${USERNAME} - Seen naked recently: ${firstNaked}`);
          }
          firstNaked += 1;
        }
        else{
          not_naked_logger = logger.child({event: 'logging:chaturbae-not-naked', is_naked: 'false' , site: 'chaturbate', model_username: `${USERNAME}` });
          not_naked_logger.info(`${USERNAME} does not appear to be naked`);
          if(firstNaked > 10){
              ai_log.info(`irc post timeout reached for ${USERNAME}. Resetting counter`);
            firstNaked = 0;
          }
        }
      });
      //child.stdout.on('data', data => nudity_log.info(data));
    });
 } else {
    cb_room_log.info(`${USERNAME} does not appear to be in her room`)
  }
  }, the_interval);
