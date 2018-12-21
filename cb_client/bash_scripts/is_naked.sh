#!/bin/bash
inputFile=$1
curl -s -F "file=@${inputFile}" 'http://watcher1.backend.chaturbae.tv:5000' | jq -r '.[]'
