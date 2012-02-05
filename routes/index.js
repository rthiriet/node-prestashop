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
    console.log('productList requested')
    products
        .on('productListReceived',function(data){
            //res.render('test2',{ title: 'test'});
        console.log('about to go to render');
            res.send(data);
                })
        .on('error',function(data){
            res.send(data);
                })
    }