var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
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
        trans: 'train'
        //viev: 'get_country'
        //viev: 'group_country'
    }
}, function(error, res, body) {
    if (!error && res.statusCode === 200) {
        var $ = cheerio.load(body);
        var $Item = $('root').find('item');
        var fileName = 'result.csv';
        var itemParse = {};
        var rowArr = [];
        var pattern = /\<[a-zA-Z_]+?\>/gi;

        fs.writeFile(fileName, '', function(error) {
            if (error) {
                console.error(error.message);
            } else {

                $Item.each(function(index, element) {
                    var $element = $(element);

                    while (match = pattern.exec($element.html())) {
                        var tagName = match[0].replace('<', '').replace('>', '');
                        itemParse[tagName] =  $element.find(tagName).text();
                    }

                    for (var property in itemParse) {
                        rowArr.push(itemParse[property]);
                    }

                    fs.appendFile(fileName, rowArr.toString() + '\n', 'utf8', function(error) {
                        if (error) {
                            console.error(error);
                        }
                    });
                    rowArr = [];
                    itemParse = {};
                });
            }
        });
    } else {
        console.error(error);
    }
});