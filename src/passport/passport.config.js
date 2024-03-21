import passport from "passport";
import local from 'passport-local'
import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidatePassword } from "./bcrypt.js";
import CartManager from "../dao/mongomanagers/cartManagerMongo.js"
const LocalStrategy = local.Strategy;
const cmanager = new CartManager();


const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'username' }, async (req, username, password, done) => {
            const { name, lastname, tel } = req.body;
            try {
                const userExist = await userModel.findOne({ username });
                if (userExist) {
                    return done(null, false, 'Username already exists');
                }
                const newCart = await cmanager.createCart()
                let newUser = await userModel.create({ 
                    username,
                    password: createHash(password),
                    name,
                    lastname,
                    tel,
                    cartId: newCart._id
                });

                if (username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                    newUser.rol = 'admin'
                }
                return done(null, newUser);
            } catch (error) {
                return done('Error creating user: ' + error);
            }
        }
    ));

    passport.use('login', new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            const user = await userModel.findOne({ username });
            if (!user) {
                console.log("User doesn't exist");
                return done(null, false);
            }

            // Validar la contraseña de forma asincrónica
            const isValidPassword = await isValidatePassword(user, password);
            if (!isValidPassword) {
                console.log("Invalid password");
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));


    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser((id, done) => {
        userModel.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(error => {
                done(error);
            });
    });

}

export default initializePassport;