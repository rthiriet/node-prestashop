/**
 * Created by JetBrains PhpStorm.
 * User: raphaelthiriet
 * Date: 27/01/12
 * Time: 11:44
 * To change this template use File | Settings | File Templates.
 */

var sys = require('util'),
    rest = require('./rest'),
    events = require('events'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'},maxLength: 2024});


var prestashopimages = function(){
    events.EventEmitter.call(this);
    this.super_ = events.EventEmitter;

}

prestashopimages.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: prestashopimages,
        enumerable: false
    }
});

prestashopimages.prototype.receivedAndProcessed= function(event,data){
        var self = this;
        //console.log('prestashop about to emit: ' + event + '\n on this data :\n');
        //inspect(data)
        self.emit(event,data);
    }

prestashopimages.prototype.getImage = function(productId,imageId){
        var self = this;
        var client = new rest();
        client.getRest('images/products/'+productId+'/'+imageId,'image').on('successimages/products/'+productId+'/'+imageId,function(data){
                self.receivedAndProcessed(productId+'/'+imageId+'ImageReceived',data);
            }
        );

        return self;
        }

module.exports = prestashopimages;