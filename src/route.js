const _route = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const { User, userDataBase } = require('./model');
const { SECRET_KEY } = require('../key');

_route.post('/add_user', (req, res)=>{
  User.find({$or: [{name: req.body.name}, {email: req.body.email}]}, (err, data)=>{
    if(data.length === 0){
      bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(req.body.password, salt, (err2, hash)=>{
          User.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hash,
            mssg_box: []
          }).then(()=>{
            res.json({mssg: 'SUCCESSFUL', done: true});
          }).catch(()=>{
            res.json({mssg: 'DATABASE ERROR', done: false});
          })
        })
      });
    } else res.json({mssg: 'NAME OR EMAIL EXISTS', done: false});
  })
});
_route.post('/user_login', (req, res)=>{
  User.findOne({email: req.body.email}, (err, data)=>{
    if(data) {
      bcrypt.compare(req.body.password, data.password, (err1, matched)=>{
        if(matched) {
          let _token = jwt.sign({data}, SECRET_KEY, {expiresIn: 12*60*60});
          res.json({mssg: 'MATCHED', _id: data._id, _token, done: true});
        } else res.json({mssg: 'PASSWORD NOT MATCHED', done: false});
      })
    } else res.json({mssg: 'USER NOT EXITS', done: false});
  })
});

_route.get(
  '/user/:userId',
  passport.authenticate('jwt', {session: false}),
  (req, res)=>{
    if(req.user.id === req.params.userId) {
      User.findById(req.params.userId, (err, data)=>{
        if(err){
          res.json({mssg: 'DATABASE ERROR', done: false});
        } else if(!data) {
          res.json({mssg: 'USER DATA NOT EXISTS IN DATABASE', done: false});
        } else{
          res.json({data: {...data._doc, password: null},
            tokenExpiresAt: req.user.tokenExpiresTime,
            done: true});
        }
      })
    } else res.json({mssg: 'AUTHENTICATION ERROR', done: false});
  }
);

_route.get(
  '/userDataBase/:dateString',
  passport.authenticate('jwt', {session: false}),
  (req, res)=>{
    userDataBase.findOne({PERIOD: req.params.dateString}, (err, data)=>{
      if(data) res.json({data, done: true})
        else res.json({mssg: `${req.params.dateString} DATA NOT EXISTS`, done: false});
    })
  }
)

_route.post(
  '/userDataBase',
  passport.authenticate('jwt', {session: false}),
  (req, res)=>{
    userDataBase.findOne({PERIOD: req.body.PERIOD}, (err, data)=>{
      if(data) {
        data.MSSGBOX = [...req.body.MSSGBOX]
        data.save().then(()=>res.json({mssg: 'UPDATED', done: true}))
      } else {
        userDataBase.create({
          PERIOD: req.body.PERIOD,
          MSSGBOX: req.body.MSSGBOX
        }).then(()=>res.json({mssg: 'CREATED', done: true}));
      }
    })
  }
)


module.exports = _route;