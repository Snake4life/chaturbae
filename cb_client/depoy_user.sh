sample=$(node get_18_us_list.js)
#sample='[{"name":"foo"},{"name":"bar"}]'
for row in $(echo "${sample}" | jq -r '.[] | @base64'); do
    _jq() {
     echo ${row} | base64 --decode | jq -r ${1}
    }

   echo $(_jq '.username')
done
