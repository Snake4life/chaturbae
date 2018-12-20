#!/bin/bash
node generate_log.js init "npm install deps started"
npm install >> /var/log/chaturbae/npm_install.log 2>&1
node generate_log.js init "npm install deps complete"
node generate_log.js init "starting nginx - /var/log/chaturbae/supervisor.log"

npm install -g typescript @types/node >> /var/log/chaturbae/npm_install.log
node generate_log.js init "npm install typescript complete"
node generate_log.js init "npm install deps - log /var/log/chaturbae/npm_install.log"

service nginx start > /var/log/chaturbae/supervisor.log 2>&1 &
node generate_log.js init "starting supervisord - /var/log/chaturbae/supervisor.log"
/usr/bin/supervisord > /var/log/chaturbae/supervisor.log 2>&1 &
sleep 3
node generate_log.js init "complete"
tail -f /var/log/chaturbae/cb_client-output.log
#tail -f /dev/null
