#!/bin/bash
npm install -g typescript @types/node >> /var/log/chaturbae/npm_install.log 2>&1 &
npm install >> /var/log/chaturbae/npm_install.log 2>&1 &
service nginx start > /var/log/chaturbae/supervisor.log 2>&1 &
/usr/bin/supervisord > /var/log/chaturbae/supervisor.log 2>&1 &
sleep 3
tail -f /var/log/chaturbae/cb_*.log
#tail -f /dev/null
