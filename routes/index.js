var prestashop = require('../lib/prestashop'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'}}),
    mongoapi = require('../controllers/api'),
    prestashopImage = require('../lib/prestashopimages');


/*
 * GET home page.
 */

exports.index = function(req, res){
  //inspect(req.session);
  res.render('index', { title: 'Express' })
};

/*
 * GET FB homepage.
 */

exports.fbshop= function(req,res){
    //inspect(req.session);
    var prestashopInst = new prestashop();
    var products = prestashopInst.productList();
    console.log('productList requested');
    console.log('FB user id : ' + req.session.auth.facebook.user.id);
    inspect(req.session.auth.facebook.user);
    //mongoapi.createUser(req.session.auth.facebook.user.id,req.session.auth.facebook.user.first_name,req.session.auth.facebook.user.last_name);
    var user = mongoapi.findUser(req.session.auth.facebook.user.id + 1);
    products
        .on('productListReceived',function(data){
            //res.render('test2',{ title: 'test'});
        console.log('about to go to render');
            res.render('fbstore', { products: data });
                })
        .on('error',function(data){
            res.send(data);
                })
    };

/*
 * GET product images.
 */

exports.images= function(req,res){
    var prestashopImgInst = new prestashopImage();
    var image = prestashopImgInst.getImage(req.params.productid,req.params.imageid);
    image.on(req.params.productid+'/'+req.params.imageid+'ImageReceived',function(data){
        console.log('productId: '+req.params.productid+' imgId: '+req.params.imageid);
        res.contentType('image/jpeg');
        res.send(data);
        //res.render('image', {image:base64Image});
        });
    };