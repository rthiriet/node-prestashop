/**
 * Created by JetBrains PhpStorm.
 * User: raphaelthiriet
 * Date: 27/01/12
 * Time: 11:44
 * To change this template use File | Settings | File Templates.
 */

var sys = require('util'),
    rest = require('./rest'),
    xml2js = require('xml2js'),
    events = require('events'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'}});


var prestashop = function(operation){
    events.EventEmitter.call(this);
    this.super_ = events.EventEmitter;

}

prestashop.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: prestashop,
        enumerable: false
    }
});

prestashop.prototype.receivedAndProcessed= function(event,data,method){
        var self = this;
        console.log('prestashop about to emit: ' + event + '\n on this data :\n');
        inspect(data)
        self.emit(event,data);
    }

prestashop.prototype.productList = function(){
        var self = this;
        //var products = {};
        console.log('productList');
        var client = new rest();
        client.getRest('products').on('success',function(productsRaw){
                self.productsRaw = productsRaw;
                console.log('here is am');
                inspect(self.productsRaw);
                self.products={};
                var x;
                for(x in self.productsRaw.products.product){
                    client.getRest('products/'+x)
                        .on('success',function(product){
                            console.log('produit : ' + x);
                            inspect(product);
                            self.products += product;
                        })
                        .on('error', function(err){
                            console.log(err);
                        });
                console.log('product n°' + x);
                }
                inspect(self.products);
                self.receivedAndProcessed('productListReceived',self.productsRaw);
            }
        );

        /*var x;
        var products=rest.ResterFn('get','products');
                    for (x in data.products.product) {
                        //self.product(data.products.product[x]['@'].id).on('ready', function(dataProduct){
                        //console.log(dataProduct);
                        //});
                        console.log('product : ' + data.products.product[x]['@'].id)
                    }*/
        //self.receivedAndProcessed('productListReceived',data, method);

        return self;
        }



prestashop.prototype.product= function(id){
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

/*

//prestashop.APIrester(self.operation);


*/

module.exports = prestashop;