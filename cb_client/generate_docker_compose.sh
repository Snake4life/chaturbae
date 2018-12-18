#!/bin/bash

#cb-client:
#  image: patt1293/chaturbae-client:latest
#  environment:
#    CB_USERNAME: "${CB_USERNAME}"
#    AWSKEY: "${AWSKEY}"
#    AWSSECRET: "${AWSSECRET}"
#    SERVICE_IP: "172.26.5.97"
#    DEBUG: "chaturbae:*"
dOut=""
while read p; do
    nameMinusWorker=$(echo $p | sed 's|-worker||g')
    nameReplaceDash=$(echo $nameMinusWorker | sed 's|-|_|g')
    dTemplate=$(cat docker-compose.template | sed -e "s|##CB_USERNAME##|$nameReplaceDash|g" -e "s|##CLEAN_USERNAME##|$nameMinusWorker|g")
    #echo $nameReplaceDash
    dOut="$dOut\n  $dTemplate"
done < base_list.txt
    printf "version: '2'\nservices:$dOut" > docker-compose.yml
