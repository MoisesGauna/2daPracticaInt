import { Router } from "express";
import { __dirname } from "../utils.js";
import { requireAuth } from "../config/authMiddleware.js"
import express from 'express';
import path from 'path';
import passport from "passport";
import {logindb} from '../service/users.service.js'
import { addToCart, deleteCart, emptyCart } from "../service/carts.service.js";

const router = Router()

const setUserInLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};
router.use(setUserInLocals);
router.use('/productos', express.static(path.join(__dirname, 'public')));

router.post('/register', passport.authenticate('register',{failureRedirect:'/failedregister'}), async(req,res)=>{
    res.redirect('/login')
})
router.post('/login', logindb );
router.delete('/empty-cart', requireAuth, emptyCart);
router.delete('/delete-to-cart', requireAuth, deleteCart);
router.post('/add-to-cart', requireAuth, addToCart);

export default router