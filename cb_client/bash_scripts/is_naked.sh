#!/bin/bash
inputFile=$1
curl -F "file=@${inputFile}" http://watcher1.backend.chaturbae.tv:5000
