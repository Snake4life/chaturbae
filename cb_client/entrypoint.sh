#!/bin/bash
#/usr/bin/supervisord > /var/log/chaturbae/supervisor.log 2>&1 &
#sleep 3
#tail -f /var/log/chaturbae/cb_*.log
service nginx start
tail -f /dev/null
