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
var USERNAME = process.env.CB_USERNAME;
var AWSKEY = process.env.AWSKEY
var AWSSECRET = process.env.AWSSECRET
var pIP = ""
var logger = require('pino')()
var server_log = logger.child({ event: 'logging:chaturbae-client' })
var cb_room_log = logger.child({ event: 'logging:chaturbae-room', cb_username: USERNAME})
var nudity_log = logger.child({ event: 'logging:chaturbae-nude}' })
var ai_log = logger.child({ event: 'logging:chaturbae-nude' })
AWS.config.update({ accessKeyId: `${AWSKEY}`, secretAccessKey: `${AWSSECRET}` });
var s3 = new AWS.S3();
var s3_bucket = "chaturbae-images"
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
  cb_room_log.info(prettyjson.render(e))
  if(e.amount > 1000){
    socketIRC.emit('tip', e.user.username + ` tipped a LARGE amount - ${e.amount} -- http://www.chaturbate.com/${USERNAME}`);
  }
  cb_room_log.info(`${e.user.username} tipped ${e.amount} tokens`);
});

socket.on('room_message', (e) => {
  cb_chat_log = logger.child({ event: 'logging:chaturbae-message', chat_user: `${e.user.username}`, cb_username: `${USERNAME}` })
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
var spawn = require('child_process').spawn;
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
    var child = spawn('bash', ['streamlink.sh', `${USERNAME}`, `${datetime}`])
    child.on('error', err => nudity_log.error('Error:', err));
    child.on('exit', () => {
      nudity_log.info(`background nudity worker exited gracefully`);
      child.stdout.on('data', data => nudity_log.info(data.toString()));
      try {
        var ffmpeg = spawn('ffmpeg', ['-ss', '00:00:01', '-i', `${USERNAME}-${datetime}.mkv`, '-vframes', '1', '-q:v', `2`, `${USERNAME}-${datetime}.jpg`]);
        ffmpeg.on('error', err => nudity_log.info('Error:', err));
        ffmpeg.on('exit', () => {
          fs.readFile(`${USERNAME}-${datetime}.jpg`, function (err, data) {
              ai_debug('pip' + pIP)
            //console.log(pIP);
            const formData = {
              file: fs.createReadStream(`${USERNAME}-${datetime}.jpg`)
            }
              request.post({
                url: `http://${servicesIP}:5000`,
                formData: formData
              }, function callback(err, httpResponse, body) {
                if (err) {
                    ai_debug('request failed:', err);
                    return;
                }
                var response = JSON.parse(body);
                //detect_nudity_debug(prettyjson.render(response))
                nsfwScore = response.score * 100
                ai_log.info(`AI Detected a NSFW Score of ${nsfwScore}%`);
                fs.unlinkSync(`${USERNAME}-${datetime}.mkv`)
                fs.unlinkSync(`${USERNAME}-${datetime}.jpg`)
                if(nsfwScore > 51){
                  naked_logger = logger.child({event: 'logging:chaturbae-naked', is_naked: 'true', nsfw_score: `${nsfwScore}`});
                  naked_logger.info(`${USERNAME} appears to be naked`);
                  if(firstNaked < 1){
                    ai_log.info(`First time seen naked: ${firstNaked}`);
                    var roundedPercent = " artificial inteligance suggests she's "
                  socketIRC.emit('naked', USERNAME + " APPEARS TO BE NAKED!!!!! http://www.chaturbate.com/"+USERNAME+" artificial inteligance suggests she's "+Math.round(nsfwScore)+"% naked");
                  }
                  else{
                    //ai_log.child({ is_naked: 'false' })
                    ai_log.info(`${USERNAME} - Seen naked recently: ${firstNaked}`);
                  }
                  firstNaked += 1;
                }
                else{
                  not_naked_logger = logger.child({event: 'logging:chaturbae-not-naked', is_naked: 'false' });
                  not_naked_logger.info(`${USERNAME} does not appear to be naked`);
                  if(firstNaked > 10){
                      ai_log.info(`irc post timeout reached for ${USERNAME}. Resetting counter`);
                    firstNaked = 0;
                  }
                }
              });
          });
        });
        ffmpeg.stdout.on('data', data => nudity_log.info(data.toString()));
      } catch (e) {
        nudity_log.error('Cannot kill process');
      }
    });
  }
  else{
    cb_room_log.info(`${USERNAME} does not appear to be in her room`)
  }
  }, the_interval);
