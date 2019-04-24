const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { SECRET_KEY } = require('../key');

module.exports =passport=>{
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
  }, (jwtPayload, done)=>{
    const tokenExpiresTime = jwtPayload.exp*1000;
    done(null, {id: jwtPayload.data._id, tokenExpiresTime });
  }))
}