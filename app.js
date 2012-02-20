
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , prestashop = require('./lib/prestashop')
  , everyauth = require('everyauth')
  , fbgraph = require('fbgraph')
  , inspect = require('eyes').inspector({styles: {all: 'magenta'}});

everyauth.facebook
  .appId('291938840860900')
  .appSecret('ef14c6ac15a0116a69705f55eb80c5b3')
  .scope('user_likes,user_photos,user_photo_video_tags')
  .entryPath('/')
  .redirectPath('/apiTest')
  .findOrCreateUser(function() {
    return({});
  });

everyauth.everymodule.findUserById( function (userId, callback) {
  return req.session.auth.facebook.user;
  // callback has the signature, function (err, user) {...}
});


process.env.NODE_ENV = 'production';

var app = module.exports = express.createServer();


//helpers

app.helpers({
    getPictures: function(productid, imageid){
        // api request for pictures
        console.log('in helper');
        var prestashop = new prestashop();
          prestashop.getImage(productid,imageid).on('imageReady',function(data){return data});
        }
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'prestashopsecret'}));
  app.use(function(request, response, next) {
      inspect(request.headers);
      var method = request.headers['x-forwarded-proto'] || 'http';
      everyauth.facebook.myHostname(method + '://' + request.headers.host);
      next();
    });
  app.use(everyauth.middleware());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


everyauth.debug=true;
everyauth.helpExpress(app);
// Routes


app.get('/indexer', routes.index);

//app.get('/test2', routes.test);

/**
 * working client request
 */

/*app.get('/test',
    function (req, res) {
        var username = 'TUS5R6QL1D7V0VDEE5ZLFXBH30VOVQ6Z';
        var password = '';
        var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        var http = require('http');
        var google = http.createClient(80, 'www.google.de');
        var request = google.request('GET', '/prestashop/api/products',
          {'host': 'superstar.f6.de', 'Authorization': auth});
        console.log(request);
        request.end();
        request.on('response', function (response) {
          console.log('STATUS: ' + response.statusCode);
          console.log('HEADERS: ' + JSON.stringify(response.headers));
          response.setEncoding('utf8');
          response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            res.send(chunk);
          });
        });
    });*/


/**
 * REST GET PRODUCTS
 *
 * TODO : view oriented programming
 */

app.get('/api', function (req, res) {
        var prestashopInst = new prestashop();
        var products = prestashopInst.productList();
        products.on('productListReceived',function(data){
            var x;
            for (x in data.products.product) {
                inspect(data.products.product[x]['@'].id);
            }
            res.render('index',{ title: JSON.stringify(data) });
        }).on('error',function(data){
            res.send(data);
            })
    }
    );

app.get('/apiTest', routes.api);

app.post('/',function(request,response){
    response.redirect('/');
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
