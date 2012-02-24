
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , prestashop = require('./lib/prestashop')
  , everyauth = require('everyauth')
  , inspect = require('eyes').inspector({styles: {all: 'magenta'}});

console.log("env vars : FBAPPID - "+process.env.FACEBOOK_APP_ID+ " // FBSecr : "+process.env.FACEBOOK_SECRET);

everyauth.facebook
  .appId(process.env.FACEBOOK_APP_ID)
  .appSecret(process.env.FACEBOOK_SECRET)
  .scope('user_likes,user_photos,user_photo_video_tags')
  .entryPath('/')
  .redirectPath('/fbhome')
  .findOrCreateUser(function() {
    return({});
  });

everyauth.everymodule.findUserById( function (userId, callback) {
  return req.session.auth.facebook.user;
  // callback has the signature, function (err, user) {...}
});


//process.env.NODE_ENV = 'production';

var app = module.exports = express.createServer();


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


/**
 * product image
 */
app.get('/images/:productid/:imageid', routes.images);

/**
 * Facebook authorized page
 */
app.get('/fbhome', routes.api);

app.post('/',function(request,response){
    response.redirect('/');
});


var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
