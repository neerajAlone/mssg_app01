const app = require('express')();
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const exphs = require('express-handlebars');
const path = require('path');
const socket = require('socket.io');

const key = require('../key');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
require('./passportAuth')(passport);
app.use('/server', require('./route'));
app.engine('hbs', exphs({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, '../public/views'),
  defaultLayout: 'index'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../public/views'));
app.use(require('express').static(path.join(__dirname, '../public/statics')));

app.get('/', (req, res)=>{
  res.render('HOME', { STATIC: 'HOME' });
});
app.get('/user', (req, res)=>{
  res.render('USER', { STATIC: 'USER' });
});

mongoose.connect(
  `mongodb+srv://${key.MONGODB_USER}:${key.MONGODB_PASS}@mssgapp01-cyv4g.mongodb.net/test?retryWrites=true&w=majority`,
  err=> {
    if(!err) {
      const appServer = app.listen(process.env.PORT||8500, ()=>{
        console.log(`port at http://localhost:8500`);
      });
      const io = socket(appServer);
      io.on('connection', resSocket=>{
        resSocket.on('clientMssg', data=>{
          io.sockets.emit('returnMssg', data);
        })
        console.log('SOCKET CONNECTED WITH SERVER !!!');
      });
    } else console.log('DATABASE ERROR!!!!: ', err)
  }
);