import { userModel } from "../models/user.model.js";

export default class userManager {

    getUsers = async (username)=>{
        const user = await userModel.findOne({username})
        return user;
    }

    regUser = async (username,name, lastname,tel, email, password) => {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const newUser = await userModel.create({ username,name, lastname,tel, email, password });
        return newUser;
    }

    logInUser = async (username, password)=> {
        const user = await userModel.findOne({ username, password })
        if(!user){
            throw new Error("Invalid credentials");
        }
        return user;
    }



}