#!/bin/bash

pid=0
USERNAME=$1
datetime=$2
function finish {
    [ ${pid} -gt 0 ] && kill ${pid} 2>/dev/null
}
trap finish EXIT

streamlink -Q "http://www.chaturbate.com/${USERNAME}" 480p -o "${USERNAME}-${datetime}.mkv" &
pid=$!

sleep "5"
finish
