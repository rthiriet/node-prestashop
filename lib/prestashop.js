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


var prestashop = function(){
    events.EventEmitter.call(this);
    this.super_ = events.EventEmitter;

}

prestashop.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: prestashop,
        enumerable: false
    }
});

prestashop.prototype.receivedAndProcessed= function(event,data){
        var self = this;
        self.emit(event,data);
    }

prestashop.prototype.productList = function(){
        var self = this;
        //console.log('productList');
        var client = new rest();
        client.getRest('products','xml')
            .on('successproducts',function(productsRaw){
                self.productsRaw = productsRaw;
                console.log('productsRaw: ');
                self.products={};
                var x=0,y=0;
                var z= new Array();
                //init du tableau de callbacks
                for(x in self.productsRaw.products.product){
                    z[x]=0;
                }
                x=0;
                async.whilst(
                    function () {return self.productsRaw.products.product.length > x; },
                    function (callback) {
                        // dans la fn whilst
                        // check si l'appel a déjà été passé pour le produit en cours
                        if(z[x]==0){
                            client.getRest('products/'+ self.productsRaw.products.product[x]['@'].id,'xml')
                                                    .on('successproducts/'+self.productsRaw.products.product[x]['@'].id,function(product){
                                                        self.products[x] = product;
                                                        // self.products[x].product_url = product.
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
                        self.receivedAndProcessed('productListReceived',self.products);
                    }
                );
            })
            .on('error',function(err){
                console.log('error' + err);
                res.send(err);
            });
        return self;
        }

module.exports = prestashop;