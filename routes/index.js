var prestashop = require('../lib/prestashop'),
    inspect = require('eyes').inspector({styles: {all: 'magenta'}}),
    fbgraph = require('fbgraph'),
    prestashopImage = require('../lib/prestashopimages');

var fboptions = {
    timeout:  3000
  , pool:     { maxSockets:  Infinity }
  , headers:  { connection:  "keep-alive" }
};

fbgraph.setOptions(fboptions);
/*
 * GET home page.
 */

exports.index = function(req, res){
  //inspect(req.session);
  res.render('index', { title: 'Express' })
};


function sortInvited(a,b,userId){
    //TODO
    /*if(a.id == userId)
        return 0;
    if(a.rsvp_status == 'attending')
        return 0;
    if(b.rsvp_status == 'attending')
        return 1;
    if(b.rsvp_status == 'attending')
        return 1;*/
}

/*
 * GET FB homepage.
 */

exports.fbshop= function(req,res){
    //inspect(req.session);
    var prestashopInst = new prestashop();
    var categories = prestashopInst.categoryList();
    var products = prestashopInst.productList();
    console.log('productList requested');
    console.log('FB user id : ' + req.session.auth.facebook.user.id);
    inspect(req.session.auth.facebook);
    categories.
        on('categoryListReceived',function(categoryList){
            products
                .on('productListReceived',function(data){
                    //res.render('test2',{ title: 'test'});
                console.log('about to go to render');
                    res.render('fbstore', { products: data, categories : categoryList });
                        })
                .on('error',function(data){
                    res.send(data);
                        })
                })
        .on('error',function(data){
                            res.send(data);
                                }
        )
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

exports.createEvent= function(req,res){
    console.log(req.params.userid + ' ' + req.params.productid);
    inspect(req.query);
    console.log('ids to invite: ' + req.query['ids']);
    var now = new Date();
    var eventStartTime = now.toJSON();
    console.log(eventStartTime);
    now.setMonth(now.getMonth() + 1);
    var eventEndTime = now.toJSON();
    var eventParams={name:'['+process.env.FACEBOOKSHOPNAME+'] '+ req.params.productname,start_time:eventStartTime,end_time:eventEndTime,location:process.env.FACEBOOKSHOPURL,privacy_type:'SECRET'};
    inspect(eventParams);
    fbgraph
        .setAccessToken(req.session.auth.facebook.accessToken)
        //retrieve all events for the user
        .post('/'+req.params.userid+'/events', eventParams, function(error, response) {
            if(!error){
                console.log('no error, event created');
                console.log(response);
                // an event has been created for the user,
                // now invite friends -- req.query['ids']
                fbgraph.post('/'+response.id+'/invited?users='+req.query['ids'],function(error,FBresponse){
                    if(!error){
                        console.log('no error, users invited to event');
                        console.log(FBresponse);
                        console.log("eventid: " + response.id + "ids : " + req.query['ids'])
                        //render the group part bloc with success message
                        res.redirect('/socialize/'+req.params.userid+'/'+req.params.productid+'/'+ req.params.productname+'?create=true');
                    }
                    else{
                        console.log('error : ');
                        inspect(error);
                        res.render('showevent', { eventid:response.id, invited:req.query['ids'], msg:error, layout:false });
                    }
                })
            }
            // error with FB API
            else{
                console.log('error : ');
                inspect(error);
                res.send(error);
            }
        });
    };

exports.inviteToEvent= function(req,res){
    inspect(req.query);
    console.log('ids to invite: ' + req.query['ids']);
    fbgraph
        .setAccessToken(req.session.auth.facebook.accessToken)
        //retrieve all events for the user
        .post('/'+req.params.eventid+'/invited?users='+req.query['ids'],function(error,FBresponse){
            if(!error){
                console.log('no error, users invited to event');
                console.log(FBresponse);
                //render the group part bloc with success message
                res.redirect('/socialize/'+req.params.userid+'/'+req.params.productid+'/'+ req.params.productname);
            }
            else{
                console.log('error : ');
                inspect(error);
                res.render('showevent', { eventid:req.params.eventid, invited:req.query['ids'], msg:error, layout:false });
            }
        });
    };



exports.socialize= function(req,response){
    console.log('userid : '+req.params.userid);
    fbgraph
        .setAccessToken(req.session.auth.facebook.accessToken)
        //retrieve all events for the user
        //retrieve more infos about the event
        .get('/'+req.params.userid+'/events', function(err, res) {
          if(!err){
              console.log('no error on calling FB');
              // the user is registered for at least 1 event
              if(res.data.length > 0 ){
                  console.log(res.data.length + ' events for the current user');
                  var eventRegistered=0;
                  var eventId;
                  // check if one event is registered for the current product
                  for (var event in res.data){
                      if(res.data[event].name == ('['+process.env.FACEBOOKSHOPNAME+'] '+req.params.productname) && res.data[event].location == process.env.FACEBOOKSHOPURL){
                          // user is part of an event for this product
                          console.log('user is part of an event for this product -- displaying it');
                          eventRegistered++;
                          eventId=res.data[event].id;
                      }
                      else console.log('event not matching this product');
                  }
                  if(eventRegistered>0){
                      //get the list of invited people
                      fbgraph.get('/'+eventId+'/invited', function(err,invited){
                          if(!err){
                              // TODO order the invited list by rsvp_status 1st me, 2nd attending, 3rd unsure, 4th declined
                              // invited.data.sort(sortInvited(a,b,req.params.userid));
                              var msg;
                              req.param('create') ? msg = 'success' : msg = '';
                              response.render('showevent',{eventid:eventId, invited:invited.data, msg:msg, confirmMinToOrder:process.env.CONFIRMMINTOORDER, productid:req.params.productid,productname:req.params.productname,confirmStatusToOrder:process.env.STATUSMINTOORDER, layout:false});
                          }
                          else response.send(err);
                      })
                  }
                  else {
                      response.render('socialize', { uid: req.params.userid, productid : req.params.productid, productname : req.params.productname, layout:false });
                  }
              }
              // no event existing for the user, proposing to create a social event for this product
              else{
                  response.render('socialize', { uid: req.params.userid, productid : req.params.productid, productname : req.params.productname, layout:false });
              }
          }
          // error with FB API
          else{
              console.log('error : ' + err);
              response.render(err);
          }
        });
}