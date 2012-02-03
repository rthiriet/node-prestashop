var prestashop = require('../lib/prestashop');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.api= function(req,res){
    var prestashopInst = new prestashop();
    var products = prestashopInst.productList();
    products
        .on('productListReceived',function(data){
            //res.render('test2',{ title: 'test'});
            res.send(data.products);
                })
        .on('error',function(data){
            res.send(data);
                })
    }