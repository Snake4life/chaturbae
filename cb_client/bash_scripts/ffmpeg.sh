USERNAME=$1
datetime=$2
ffmpeg -loglevel panic -ss 00:00:01 -i "${USERNAME}-${datetime}.mkv" -vframes 1 -q:v 2 "${USERNAME}-${datetime}.jpg"
