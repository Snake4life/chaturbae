var io = require("socket.io").listen(8081);
const c = require('irc-colors');
var irc_debug = require('debug')('chaturbae:irc')
io.sockets.on("connection", function (socket) {
    console.log('A Client has Connected to this Server');
    //Let Everyone Know I just Joined
    socket.on("joined", function (data) {
      warn = c.bold.red.bgyellow;
      bot.say(config.channels[0], warn(data));
      console.log(data);
    });
    socket.on("left", function (data) {
      bot.say(config.channels[0], c.yellow.bgblack(data));
      console.log(data);
    });
    socket.on("messages", function (data) {
      bot.say(config.channels[0], c.white.bgblack(data));
      console.log(data);
    });
    socket.on("goal", function (data) {
      bot.say(config.channels[0], c.white.bgblack(data));
      console.log(data);
    });
    socket.on("naked", function (data) {
      warn = c.bold.red.bgyellow;
      bot.say(config.channels[0], warn(data));
      console.log(data);
    });
    socket.on("disconnect", function (data) {
      console.log("disconnecting ");
    });
});
var config = {
  sasl:true,
  userName: "whackin_it-bot",
  password: "randompassword123",
	channels: ["#chaturbae"],
	server: "irc.freenode.net",
	nick: "whackin_it-bot"
};
// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.nick, config, {
	channels: config.channels
});
bot.say('nickserv', 'identify randompassword123');
bot.addListener('error', function(message) {
    console.log('error: ', message);
});

bot.addListener('ping', function(message) {
    irc_debug('IRC Server ping\'d, sending PONG response' );
});
bot.addListener('join', function(channel, nick, message) {
    irc_debug(`Someone joined our channel! ${message}`);
});
bot.addListener('registered', function(message) {
    irc_debug(`Bot recieved connection confirmation`);
});
bot.addListener('message', function(nick, to, text, message) {
    irc_debug(`Message posted in channel - ${message}`);
});
