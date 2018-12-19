#!/bin/bash
npm install -g typescript @types/node
npm install
service nginx start
/usr/bin/supervisord > /var/log/chaturbae/supervisor.log 2>&1 &
sleep 3
tail -f /var/log/chaturbae/cb_*.log
#tail -f /dev/null
