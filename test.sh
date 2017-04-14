# ./cas-get.sh http://localhost:3000/api/v1/me dmliao "teuh'uiauamorphous"

# curl -c newcookies.txt -b newcookies.txt  -i  -X GET -H "Content-Type:application/json" http://localhost:3000/ -d '{}'
curl -b newcookies.txt -i  -L -X GET -H "Content-Type:application/json" http://localhost:3000/api/v1/me