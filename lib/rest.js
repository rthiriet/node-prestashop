/**
 * Created by JetBrains PhpStorm.
 * User: raphaelthiriet
 * Date: 27/01/12
 * Time: 11:44
 * To change this template use File | Settings | File Templates.
 */

var sys = require('util'),
    rest = require('restler'),
    xml2js = require('xml2js'),
    EventEmitter = require('events').EventEmitter;

module.exports = RESTapi;

function RESTapi(operation){
    EventEmitter.call(this);
    this.super_ = EventEmitter;

}

RESTapi.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: RESTapi,
        enumerable: false
    }
});


RESTapi.prototype.getRest = function(operation,instance) {
    var self = this;
    if (typeof(instance) == 'undefined' || instance == ''){
        console.log('using superstar');
        apiurl='http://superstar.f6.de/prestashop/api/' + operation;
    }
    else {
        console.log('not superstar : ' + instance);
        apiurl=instance + operation + '.xml';
    }

    self.receivedAndProcessed= function(event,data){
        console.log('rest about to emit: ' + event);
        self.emit(event,data);
    }


    /**
     * Prestashop API handler
     */

    self.APIrester = function(operation) {
        rest.get(apiurl, {parser:rest.parsers.xml}).on('success', function(data) {
            self.receivedAndProcessed('success'+operation,data)
        })
            .on('error', function(data) {
                console.log('error happened');
                console.log(data);
                self.receivedAndProcessed('error',data)
            });
    }



    self.APIrester(operation);



    return self;
    }


RESTapi.getSyncRest = function(operation,instance) {
    //var self = this;
    if (typeof(instance) == 'undefined' || instance == ''){
        console.log('using superstar');
        apiurl='http://superstar.f6.de/prestashop/api/';
    }
    else {
        console.log('not superstar : ' + instance);
        apiurl=instance;
    }


    /**
     * Prestashop API handler
     */
    self.status=false;
    rest.get(apiurl + operation, {parser:rest.parsers.xml}).on('success', function(data) {
            self.status=true;
            return data;
        })
            .on('error', function(data) {
                self.status=ok;
                console.log('error happened');
                console.log(data);
                return data;
            });

    return self.status;
    }