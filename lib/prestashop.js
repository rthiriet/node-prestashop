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
    async=require('async'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'},maxLength: 2024});


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
        //console.log('prestashop about to emit: ' + event + '\n on this data :\n');
        //inspect(data)
        self.emit(event,data);
    }

prestashop.prototype.productList = function(){
        var self = this;
        //console.log('productList');
        var client = new rest();
        client.getRest('products').on('successproducts',function(productsRaw){
                self.productsRaw = productsRaw;
                console.log('productsRaw: ');
                self.products={};
                //console.log('type : ' + typeof(self.products));
                //console.log('taille : ' + self.productsRaw.products.product.length);
                var x=0,y=0;
                var z= new Array();
                //inspect(self.productsRaw.products);
                //init du tableau de callbacks
                for(x in self.productsRaw.products.product){
                    z[x]=0;
                    //console.log('init loop : current x: ' + x + ' and z['+x+']: ' + z[x]);
                    //inspect(self.productsRaw.products.product[x]['@'].id);
                }
                x=0;
                async.whilst(
                    function () {return self.productsRaw.products.product.length > x; },
                    function (callback) {
                        // dans la fn whilst
                        //console.log('truth test passed, current z['+x+'] = ' + z[x]);
                        // check si l'appel a déjà été passé pour le produit en cours
                        if(z[x]==0){
                            client.getRest('products/'+ self.productsRaw.products.product[x]['@'].id)
                                                    .on('successproducts/'+self.productsRaw.products.product[x]['@'].id,function(product){
                                                        //console.log('produit : ' + self.productsRaw.products.product[x]['@'].id);
                                                        self.products[x] = product;
                                                        z[x]= 1;
                                                        x++;
                                                        callback();
                                                    })
                                                    .on('error', function(err){
                                                        console.log('error' + err);
                                                        callback(err);
                                                    });
                        }
                    },
                    function (err) {
                        // dans le callback
                        //console.log("callback");
                        //console.log(JSON.stringify(self.products));
                        self.receivedAndProcessed('productListReceived',self.products);
                        //z[x]= 1;
                        //x++;
                    }
                );
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

prestashop.getImage= function(productid,imageid){
        console.log('imageid : ' + imageid);
        console.log('productid : ' + productid);
        rest.get(apiurl + 'images/products/' + productid + '/' + imageid, {parser:rest.parsers.xml}).on('success', function(data) {
                    self.emit('imageReady',data);
                })
                    .on('error', function(data) {
                        console.log('error happened');
                        console.log(data);
                        self.receivedAndProcessed('error',data)
                    });
            }

module.exports = prestashop;