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
    events = require('events');

var RESTapi = function(operation){
    events.EventEmitter.call(this);
    this.super_ = events.EventEmitter;

}

RESTapi.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: RESTapi,
        enumerable: false
    }
});


RESTapi.prototype.ResterFn = function(method,operation,instance) {
    var self = this;
    if (typeof(instance) == 'undefined' || instance == ''){
        console.log('using superstar');
        apiurl='http://superstar.f6.de/prestashop/api/';
    }
    else {
        console.log('not superstar : ' + instance);
        apiurl=instance;
    }

    // Type of method :
    // TODO : implement
    //

    /*var restmethod = 'get';
    switch(method){
        case 'put':
            restmethod='put';
            break;
        default:
            restmethod='get';
    }
    */

    self.operation=operation;


    /**
     *
     * This function is used to handle the business
     *
     * @param event : event handler, should be received or error
     * @param data
     * @param method : products to return a product list object
     */

    self.receivedAndProcessed= function(event,data,method){
        console.log('about to emit: ' + event + '\n on this data :\n' + data);
        self.emit(event,data);
    }


    self.productList = function(data){
        console.log('productList');
        var x;
        var products={}
                    for (x in data.products.product) {
                        /*self.product(data.products.product[x]['@'].id).on('ready', function(dataProduct){
                            console.log(dataProduct);
                        });*/
                        console.log('product : ' + data.products.product[x]['@'].id)
                    }
        self.receivedAndProcessed('received',data, method);
        }



    self.product= function(id){
        console.log('id : ' + id);
        rest.get(apiurl + 'products/' + id, {parser:rest.parsers.xml}).on('success', function(data) {
                    self.emit('ready',data);
                })
                    .on('error', function(data) {
                        console.log('error happened');
                        console.log(data);
                        self.receivedAndProcessed('error',data)
                    });
            }

    /**
     * Prestashop API handler
     */

    self.APIrester = function(operation) {
        rest.get(apiurl + operation, {parser:rest.parsers.xml}).on('success', function(data) {
            self.productList(data);
        })
            .on('error', function(data) {
                console.log('error happened');
                console.log(data);
                self.receivedAndProcessed('error',data)
            });
    }



    self.APIrester(self.operation);



    return self;
    }




module.exports = RESTapi;