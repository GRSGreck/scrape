var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var url = 'http://test.infobus.eu/server/curl/get_points.php';

var auth = {
    login: 'etravels',
    password: 'test'
};

request.post({
    url: url,
    form: {
        login: auth.login,
        password: auth.password,
        //trans: 'train'
    }
}, function(error, res, body) {
    if (!error && res.statusCode === 200) {
        var $ = cheerio.load(body);
        var $Item = $('root').find('item');
        var fileName = 'result.csv';
        var rowArr = [];
        var pattern = /\<[a-zA-Z_]+?\>/gi;

        fs.writeFile(fileName, '', function(error) {
            if (error) {
                console.error(error.message);
            } else {
                $Item.each(function(index, element) {
                    var $element = $(element);

                    //console.log($element.html().match(pattern));
                    //while (match = pattern.exec($element.html())) {
                    //    console.log(match[0]);
                    //}
                    //console.log('');
                    //console.log(pattern.exec($element.html())[0]);
                    //console.log($element.html());

                    var itemParse = {
                        pointId: $element.find('point_id').text(),
                        pointLatinName: $element.find('point_latin_name').text(),
                        pointRuName: $element.find('point_ru_name').text(),
                        pointUaName: $element.find('point_ua_name').text(),
                        countryName: $element.find('country_name').text(),
                        countryKod: $element.find('country_kod').text(),
                        countryKodTwo: $element.find('country_kod_two').text(),
                        countryId: $element.find('country_id').text(),
                        latitude: $element.find('latitude').text(),
                        longitude: $element.find('longitude').text()
                    };

                    for (var property in itemParse) {
                        rowArr.push(itemParse[property]);
                    }

                    fs.appendFile(fileName, rowArr.toString() + '\n', 'utf8', function(error) {
                        if (error) {
                            console.error(error);
                        }
                    });
                    rowArr = [];

                });

                console.log('>> Полученные данные записаны в файл "' + fileName + '".');
                console.log('>> Cодержимое файла "' + fileName + '":\n');
                var readStreamFile = fs.createReadStream(fileName, {encoding: 'utf-8'});

                readStreamFile.on('readable', function() {
                    var data = readStreamFile.read();

                    if (data !== null) {
                        console.log(data);
                    }
                });

                readStreamFile.on('end', function() {
                    console.log('>> Чтение файла закончено!!!');
                });

                readStreamFile.on('error', function(err) {
                    if (error.code === 'ENOENT') {
                        console.log('Файл не найден...');
                    } else {
                        console.error(error);
                    }
                });
            }
        });
    } else {
        console.error(error);
    }
});