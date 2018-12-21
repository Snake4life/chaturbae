USERNAME=$1
datetime=$2
./bash_scripts/streamlink.sh $USERNAME $datetime >/dev/null 2>&1
./bash_scripts/ffmpeg.sh $USERNAME $datetime
./bash_scripts/is_naked.sh "${USERNAME}-${datetime}.jpg"
rm -f "${USERNAME}-${datetime}.jpg"
rm -f "${USERNAME}-${datetime}.mkv"
