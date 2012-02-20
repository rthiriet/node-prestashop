/**
 * Created by JetBrains PhpStorm.
 * User: raphaelthiriet
 * Date: 02/02/12
 * Time: 11:51
 * To change this template use File | Settings | File Templates.
 */
var prestashop = require('./prestashop'),
    events = require('events');


module.exports = products = function(){
    events.EventEmitter.call(this);
    this.super_ = events.EventEmitter;
}

products.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: prestashop,
        enumerable: false
    }
});

products.prototype.receivedAndProcessed= function(event,data,method){
        var self = this;
        self.emit(event,data);
    }


products.getProducts() = new function(){
    prestashop();

            var productsList = products.productList();
            productsList.on('productListReceived',function(data){
                self.receivedAndProcessed('productsReady',JSON.stringify(data));
                //res.render('index',{ title: JSON.stringify(data) });
            }).on('error',function(data){
                res.send(data);
                });

     return self;

}