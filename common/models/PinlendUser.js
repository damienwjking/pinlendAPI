var config = require('../../server/config.json');
var path = require('path');

module.exports = function(pinlendUser) {

  // Setup 
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hello@pummel.fit',
        pass: 'pummel1234'
    }
  });

  //send verification email after registration
  pinlendUser.afterRemote('create', function(context, user, next) {
    var verifyNum = Math.floor(100000 + Math.random() * 900000);
    user.updateAttributes({"verifyNumber": verifyNum, "createdAt": Date(), "updatedAt": Date()}, function(err, userUpdated) {
      if (!err) {
        next();
      }
    });
  });

  pinlendUser.sendVerifyCodeViaEmail = function(email, userId, cb) {
    pinlendUser.findOne({where: {id: userId}}, (err, user) => {
      if (err || !user) {
        cb(null,err)
      } else {
        var mailOptions = {
          from: 'hello@pummel.fit', // sender address
          to: email, // receiver
          subject: 'Welcome to Pinlend', // Subject 
          text: 'Please use this number to continue register: ' + user.verifyNumber + ' // Note: This email will be replace by an html later'
        };
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
          }else{
              cb(null, "Email has been sent")
          };
        });  
      }
    })
  };

  pinlendUser.remoteMethod(
        'sendVerifyCodeViaEmail', {
          http: {path: '/sendVerifyCodeViaEmail', verb: 'post'},
          accepts: [{arg: 'email', type: 'string', description: 'a@foo.com'},{arg: 'userId', type: "number", description: 1}],
          returns: {arg: 'results', type: '[PinlendUser]', root: true},
          description: 'Send verify code (6 digits) via email',
        }
  );

  pinlendUser.verifyCode = function(verifyCode, userId, cb) {
    pinlendUser.findOne({where: {id: userId}}, (err, user) => {
      console.log('> findone');
      if (err || !user) {
        cb(null,err)
      } else {
        if (user.verifyNumber == verifyCode) {
          user.updateAttributes({"emailverified": 1, "updatedAt": Date()}, function(err, userUpdated) {
            if (err) {
              cb(null, err)
            } else {
              cb(null, userUpdated)
            }
          });
        } else {
          cb(null, "Verify code was wrong")
        }
      }
    })
  };

  pinlendUser.remoteMethod(
        'verifyCode', {
          http: {path: '/verifyCode', verb: 'post'},
          accepts: [{arg: 'verifyCode', type: 'number', description: 123456},{arg: 'userId', type: "number", description: 1}],
          returns: {arg: 'results', type: '[PinlendUser]', root: true},
          description: 'Verify 6 digits',
        }
  );

  pinlendUser.sendVerifyCodeViaPhone = function(phoneNumber, userId, cb) {
    pinlendUser.findOne({where: {id: userId}}, (err, user) => {
      if (err || !user) {
        cb(null,err)
      } else {
        cb(null, "This api can be done quickly with TWILIO, need an TWILIO account")
      }
    })
  };

  pinlendUser.remoteMethod(
        'sendVerifyCodeViaPhone', {
          http: {path: '/sendVerifyCodeViaPhone', verb: 'post'},
          accepts: [{arg: 'phoneNumber', type: 'string', description: '123456'},{arg: 'userId', type: "number", description: 1}],
          returns: {arg: 'results', type: '[PinlendUser]', root: true},
          description: 'Send verify code (6 digits) via phone',
        }
  );

  pinlendUser.signUporLoginWithFacebook = function(fbId, email, cb) {
    pinlendUser.findOne({where: {email: email}}, (err, user) => {
      if (err) {
        cb(null,err)
      } else if (user) {
         // Check verify 
         if (user.emailverified == false) {
           cb(null, "Transit to verify screen")
         } else {
           user.login({
             "email": user.email,
             "password": user.password
           }, function(err, token) {
             cb(null, {"email": user.email,
             "accessToken": token.id})
           })
         }
      } else {
        pinlendUser.create()
      }
    })
  };

  pinlendUser.remoteMethod(
        'signUporLoginWithFacebook', {
          http: {path: '/signUporLoginWithFacebook', verb: 'post'},
          accepts: [{arg: 'phoneNumber', type: 'string', description: '123456'},{arg: 'userId', type: "number", description: 1}],
          returns: {arg: 'results', type: '[PinlendUser]', root: true},
          description: 'Login with fb Id & email',
        }
  );
};
