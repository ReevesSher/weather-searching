var request = require("request");
var config = require("./lib/config");
var print = require("./lib/print");

module.exports = function (word) {
    if(!word){
        // get ip
        request.get(config.ipURL, function (error, response, body) {
            var ipResult = JSON.parse(body);
            var options = {
                url: config.ipToCityNameURL + ipResult.ip,
                headers: {
                    "apikey": config.ipToCityNameApiKey
                }
            };
            request.get(options, function (error, response, body) {
                var cityNameResult = JSON.parse(body);
                getDataByCityName(cityNameResult.retData.city);
            });
        });
    } else {
        getDataByCityName(word);
    }
};

function getDataByCityName(word){

    word = encodeURIComponent(word);

    if (word.indexOf("%") != 0) {

        var promise = new Promise(function(resolve, reject){

            var options = {

                url: config.weatherURLByLetters + word,

                headers: {

                    "apikey": config.weatherURLByLettersApikey
                }
            };

            request.get(options,function(error,response,body){

                if (!error && response.statusCode == 200) {

                    var result = JSON.parse(body);

                    if (result.errNum == 0) {

                        resolve(encodeURIComponent(result.retData.city));

                    } else {

                        reject(result.errMsg.red);
                    }
                }else{

                    reject(" seems something wrong : " + error)
                }
            })

        });

        promise.then(function(value){

            getData(value);

        },function(reason){

            console.log(reason.red);
        })
        
    }else{

        getData(word);
    }
}

function getData(word){

    var cityNameOptions = {

        url: config.cityURL+word,

        headers: {

            "apikey": config.cityApikey
        }
    };

    request.get(cityNameOptions, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var cityResult = JSON.parse(body);

            if (cityResult.errNum == 0) {

                var options = {

                    url: config.weatherURL + cityResult.retData.cityCode,

                    headers: {

                        "apikey": config.weatherApikey
                    }
                };

                request.get(options, function (error, response, body) {

                    if (!error && response.statusCode == 200) {

                        print.print(JSON.parse(body));
                    }
                });

            } else {
                
                console.log(cityResult.retMsg.red);
            }
        }
    });
}
