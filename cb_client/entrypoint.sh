#!/bin/bash
echo '{"chaturbae-init": "npm install typescript - log /var/log/chaturbae/npm_install.log"}'
npm install -g typescript @types/node >> /var/log/chaturbae/npm_install.log
echo '{"chaturbae-init": "npm install typescript complete"}'
echo '{"chaturbae-init": "npm install deps - log /var/log/chaturbae/npm_install.log"}'
npm install >> /var/log/chaturbae/npm_install.log
echo '{"chaturbae-init": "npm install deps complete"}'
echo '{"chaturbae-init": "starting nginx - /var/log/chaturbae/supervisor.log"}'
service nginx start > /var/log/chaturbae/supervisor.log 2>&1 &
echo '{"chaturbae-init": "starting supervisord - /var/log/chaturbae/supervisor.log"}'
/usr/bin/supervisord > /var/log/chaturbae/supervisor.log 2>&1 &
sleep 3
echo '{"chaturbae-init": "complete"}'
tail -f /var/log/chaturbae/cb_*.log
#tail -f /dev/null
