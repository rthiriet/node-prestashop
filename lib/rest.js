/**
 * Created by JetBrains PhpStorm.
 * User: raphaelthiriet
 * Date: 27/01/12
 * Time: 11:44
 * To change this template use File | Settings | File Templates.
 */

var sys = require('util'),
    rest = require('restler');



var RESTClient = new Object();
    RESTClient.getRest = function(method) {
        rest.get('http://superstar.f6.de/prestashop/api/' + method).on('complete', function(data) {
            console.log('in getREST');
            return data;
        });
    };

module.exports = RESTClient;