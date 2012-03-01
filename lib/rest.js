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


RESTapi.prototype.getRest = function(operation,parserToUse,instance) {
    var self = this;

    //check instance
    if (typeof(instance) == 'undefined' || instance == ''){
        console.log('using environment default : '+ process.env.PRESTASHOPURL);
        apiurl=process.env.PRESTASHOPURL+'/api/' + operation;
    }
    else {
        console.log('not superstar : ' + instance);
        apiurl=instance + operation + '.xml';
    }

    //set parser to use
    switch (parserToUse) {
     case 'image':
         self.APIoptions={decoding:"buffer"};

     break;
     case 'xml':
         self.APIoptions={parser:rest.parsers.xml};
     break;
     default:
         self.APIoptions={parser:rest.parsers.xml};
     break;
    }

    self.receivedAndProcessed= function(event,data){
        //console.log('rest about to emit: ' + event);
        self.emit(event,data);
    }


    /**
     * Prestashop API handler
     */

    self.APIrester = function(operation) {
        rest.get(apiurl, self.APIoptions).on('success', function(data) {
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


