var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var url = 'http://test.infobus.eu/server/curl/get_points.php';

var auth = {
    login: 'etravels',
    password: 'test'
};

/*
 * Коннектимся к ресурсу по заданному url с помощью модуля "request".
 * Для получения доступа нам понадобится ввести login и password,
 * так же мы можем передать дополнительные параметры:
 * - trans: 'train'
 * - viev: 'get_country'
 * - viev: 'group_country'
 */
request.post({
    url: url,
    form: {
        login: auth.login,
        password: auth.password,
        //trans: 'train'
        //viev: 'get_country'
        //viev: 'group_country'
    }
}, function(error, res, body) {
    if (!error && res.statusCode === 200) {

        /*
         * Используем модуль "cheerio" для работы с полученными данными (body),
         * используя синтаксис, аналогичный jQuery
         */
        var $ = cheerio.load(body);
        var $Item = $('root').find('item');
        var fileName = 'result.csv';
        var itemParse = {};
        var rowArr = [];
        var pattern = /<[a-zA-Z_]+?>/gi;

        /*
         * При каждом запуске приложения, если файл не существует то создаем,
         * если файл существует то делаем полную очистку его содержимого
         */
        fs.writeFile(fileName, '', function(error) {
            if (error) {
                console.error(error);
            } else {

                /*
                 * Парсим данные отдельно по каждому елементу "item"
                 * полученному из сервера и записываем их в файл "result.csv"
                 */
                $Item.each(function(index, element) {
                    var $element = $(element);

                    /*
                     * С помощью регулярного выражения сохраненного в переменной "pattern"
                     * в полученном ответе ($Item) в цикле, поэлементно ($element) вытаскиваем имена
                     * интересующих нас тегов и наполняем объект "itemParse" соответсвующими
                     * данными
                     */
                    while (match = pattern.exec($element.html())) {
                        var tagName = match[0].replace('<', '').replace('>', '');
                        itemParse[tagName] =  $element.find(tagName).text();
                    }

                    /*
                     * Полученный раннее из цикла объект "itemParse" пропускаем через
                     * цикл for..in и копируем значения его свойств в массив "rowArr"
                     */
                    for (var property in itemParse) {
                        rowArr.push(itemParse[property]);
                    }

                    /*
                     * При каждом цикле ($Item.each()) добавляем соответствующую строку данных в файл "result.csv"
                     * путем преобразования массива в строку ([a, b, c].toString() => a,b,c)
                     */
                    fs.appendFile(fileName, rowArr.toString() + '\n', 'utf8', function(error) {
                        if (error) {
                            console.error(error);
                        }
                    });

                    // Делаем очистку массива "rowArr" и объекта "itemParse" для следующей итерации цикла
                    rowArr = [];
                    itemParse = {};
                });
            }
        });
    } else {
        console.error(error);
    }
});