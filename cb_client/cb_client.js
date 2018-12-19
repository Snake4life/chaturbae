var servicesIP =  process.env.SERVICE_IP
var io = require('socket.io-client')
var socket = io(`http://localhost:8080`);
var socketIRC = io(`http://${servicesIP}:8081`);
var fs = require('fs');
var AWS = require('aws-sdk');
var request = require('request');
var inRoom = true;
var prettyjson = require('prettyjson');
var server_debug = require('debug')('chaturbae:server')
var cb_room_debug = require('debug')('chaturbae:room')
var detect_nudity_debug = require('debug')('chaturbae:nude')
var ai_debug = require('debug')('chaturbae:ai')
var USERNAME = process.env.CB_USERNAME;
var AWSKEY = process.env.AWSKEY
var AWSSECRET = process.env.AWSSECRET
var pIP = ""
//var USERNAME = process.argv[2];
console.log(USERNAME);
AWS.config.update({ accessKeyId: `${AWSKEY}`, secretAccessKey: `${AWSSECRET}` });
var s3 = new AWS.S3();
var s3_bucket = "chaturbae-images"
socket.on('connect', () => {
  server_debug ('connected to cb_server at http://localhost:8080')
  request.get({
    url: `http://rancher-metadata/2015-12-19/self/container/primary_ip`
  }, function callback(err, httpResponse, body) {
    if (err) {
        server_debug ('request failed:', err);
        return;
    } else {
      var pIP = body;
      server_debug (`pIP from connect socket ${pIP}`)
    }

  });
  // tell the backend to load this profile
  socket.emit('init', USERNAME);
});

socket.on('init', (e) => {
  server_debug(prettyjson.render(e));
  server_debug(`Welcome to ${e.room}'s room!`);
  server_debug(`Current room subject is: ${e.subject}`);
});

socket.on('room_entry', (e) => {
  if(e.user.username == USERNAME) {
    cb_room_debug(`Host entered the room`);
    inRoom = true;
    socketIRC.emit('message', USERNAME + " has joined her CB room http://www.chaturbate.com/"+USERNAME);
  }
  cb_room_debug(`${e.user.username} has joined the room`);
});

socket.on('room_leave', (e) => {
  if(e.user.username == USERNAME) {
    cb_room_debug(`Host left the room`);
    inRoom = false;
    socketIRC.emit('left', USERNAME + " has left her CB room http://www.chaturbate.com/"+USERNAME);
  }
  console.log(`${e.user.username} has left the room`);
});

socket.on('tip', (e) => {
  cb_room_debug(prettyjson.render(e))
  if(e.amount > 1000){
    socketIRC.emit('tip', e.user.username + ` tipped a LARGE amount - ${e.amount} -- http://www.chaturbate.com/${USERNAME}`);
  }
  cb_room_debug(`${e.user.username} tipped ${e.amount} tokens`);
});

socket.on('room_message', (e) => {
  cb_room_debug(`${e.user.username}: ${e.message}`);

});

socket.on('disconnect', () => {
  server_debug('disconnect')
});
socket.on('refresh_panel', (e) => {
  cb_room_debug('refresh goal');
  cb_room_debug(prettyjson.render(e))
  try {
    message = `New Goal reached. Current goal #${e.goal.goalCurrent} - Remaining goals: ${e.goal.goalRemaining} - -- http://www.chaturbate.com/${USERNAME}`;
    //socketIRC.emit('goal', message)
  }
  catch (e){
    cb_room_debug('no goal set')
  }


});
//var minutes = 60, the_interval = minutes  * 1000;
var minutes = 5, the_interval = minutes * 60 * 1000;
var firstNaked = 0;
setInterval(function() {
  if(inRoom){
    var spawn = require('child_process').spawn;
    var datetime = (new Date).getTime();
    //var datetime = new Date().toISOString().replace(/:/,'_');
    var child = spawn('streamlink', [`http://www.chaturbate.com/${USERNAME}`, 'best', '-o', `${USERNAME}-${datetime}.mkv`], {detached: true});
    var stopped;
    var timeout = setTimeout(() => {
      detect_nudity_debug('Timeout');
      try {
        process.kill(-child.pid, 'SIGKILL');
        var ffmpeg = spawn('ffmpeg', ['-ss', '00:00:01', '-i', `${USERNAME}-${datetime}.mkv`, '-vframes', '1', '-q:v', `2`, `${USERNAME}-${datetime}.jpg`], {detached: true});
        ffmpeg.on('error', err => console.log('Error:', err));
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
                ai_debug(`AI Detected a NSFW Score of ${nsfwScore}%`);
                fs.unlinkSync(`${USERNAME}-${datetime}.mkv`)
                fs.unlinkSync(`${USERNAME}-${datetime}.jpg`)
                if(nsfwScore > 51){
                  if(firstNaked < 1){
                    detect_nudity_debug(`First time seen naked: ${firstNaked}`);
                  socketIRC.emit('naked', USERNAME + " APPEARS TO BE NAKED!!!!! http://www.chaturbate.com/"+USERNAME+" artificial inteligance suggests she's "+nsfwScore+"% naked");
                  }
                  else{
                    detect_nudity_debug(`Seen naked recently: ${firstNaked}`);
                  }
                  firstNaked += 1;
                }
                else{
                  detect_nudity_debug(`Model does not appear to be naked`);
                  if(firstNaked > 10){
                    detect_nudity_debug(`Haven't posted about model recently. Resetting counter`);
                    firstNaked = 0;
                  }

                  //socketIRC.emit('messages', USERNAME + " does not appear to be naked, artificial inteligance suggests she's "+nsfwScore+"% naked");
                }
              });
          });
        });
        ffmpeg.stdout.on('data', data => console.log(data.toString()));
      } catch (e) {
        detect_nudity_debug('Cannot kill process');
      }
    }, 5*1000);
    child.on('error', err => detect_nudity_debug('Error:', err));
    child.on('exit', () => { detect_nudity_debug('Stopped'); clearTimeout(timeout); });
    child.stdout.on('data', data => detect_nudity_debug(data.toString()));
  }
  else{
    cb_room_debug('not in room')
  }
  }, the_interval);
