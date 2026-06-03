const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const config = require('../config');

module.exports = function() {
    let strategy = new Strategy({
       secretOrKey: config.JWT_SECRET,
       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() 
    }, async (payload, done) => {
        try {  
            // 🌟 DÜZELTME: findById kullanımını düzelttik
            let user = await Users.findById(payload.id);

            if (user) {
                // Kullanıcının rollerini buluyoruz
                let userRoles = await UserRoles.find({ user_id: payload.id });

                // Roller üzerinden tüm yetkileri (privileges) çekiyoruz
                let rolePrivileges = await RolePrivileges.find({ 
                    role_id: { $in: userRoles.map(ur => ur.role_id) } 
                });

                // 🌟 DÜZELTME: Eksik virgüller tamamlandı, hatalı exp alanı kaldırıldı
                done(null, {
                    id: user._id,
                    roles: rolePrivileges,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                });
              
            } else {
                done(null, false, { message: "User not found" });
            }

        } catch (err) {
            // 🌟 DÜZELTME: try kapatılmadığı için catch çalışmıyordu, düzeltildi
            done(err, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate('jwt', { session: false });
        }
    }

};