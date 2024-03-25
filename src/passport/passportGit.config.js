import passport from "passport";
import github from "passport-github2";
import userManager from "../dao/mongomanagers/userManagerMongo.js"
import { userModel } from "../dao/models/user.model.js";
import CartManager from "../dao/mongomanagers/cartManagerMongo.js";

const usmanager = new userManager()
const cmanager = new CartManager()

export const initPassportGit =()=>{
    passport.use("github", new github.Strategy(
        {
            clientID:"Iv1.118a2fac2f5d0c85",
            clientSecret:"5984393646d8a7333a7bc4c0bf5dc507f5634d90",
            callbackURL:"http://localhost:8080/sessions/callbackGithub"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let { name, email } = profile._json;
                if (email === null) {
                    const emailgit = profile.id + profile.username + "@users.noreply.github.com"
                    console.log(emailgit)
                    let user = await usmanager.getUsers(emailgit);
                    if (!user){
                        const newCart = await cmanager.createCart()
                        const user = await userModel.create({ username: emailgit, name: name, email:emailgit, cartId: newCart._id });
                    }
                    return done(null, user)
                } else {
                    let user = await usmanager.getUsers(email);
                    if (!user) {
                        const newCart = await cmanager.createCart()
                        user = await userModel.create({ username: email, name: name, email:email, cartId: newCart._id});
                    }
                    return done(null, user)
                }

            }catch (error) {
                return done(error)
            }
    }
    ))
}//fin initPassportGit

passport.serializeUser((user,done)=>{
    done(null, user)
}); //funcion que guardara el usuario en la sesión

 passport.deserializeUser((user, done)=>{
    done(null, user)
 }) 

