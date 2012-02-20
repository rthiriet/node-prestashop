var prestashop = require('../lib/prestashop'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'}});

/*
 * GET home page.
 */

exports.index = function(req, res){
  inspect(req.session);
  res.render('index', { title: 'Express' })
};

exports.api= function(req,res){
    inspect(req.session);
    var prestashopInst = new prestashop();
    var products = prestashopInst.productList();
    console.log('productList requested');
    console.log('FB user id : ' + req.session.auth.facebook.user.id);
    products
        .on('productListReceived',function(data){
            //res.render('test2',{ title: 'test'});
        console.log('about to go to render');
            res.render('fbstore', { products: data });
                })
        .on('error',function(data){
            res.send(data);
                })
    }