import { Router } from "express";
import { __dirname } from "../utils.js";
import { requireAuth, isAdmin } from "../config/authMiddleware.js"
import express from 'express';
import path from 'path';
import { setUserInLocals } from "../config/authMiddleware.js";
import { getProducts, getProductbyId, realtimeproducts } from '../service/products.service.js'
import {getCartById} from '../service/carts.service.js'
import {login, register, logout, failLogin, failedregister, home, chat} from '../service/users.service.js'

const router = Router()

// Usar el middleware en todas las rutas
router.use(setUserInLocals);
router.use('/productos', express.static(path.join(__dirname, 'public')));

router.get("/failedregister",failedregister)
router.get("/faillogin",failLogin)
router.get("/chat", chat)
router.get('/', home)
router.get('/login', login)
router.get('/register', register)
router.get('/logout', logout)
router.get("/productos", requireAuth, getProducts);
router.get("/realtimeproducts", requireAuth, isAdmin, realtimeproducts)
router.get("/cart", requireAuth, getCartById)
router.get("/:cid", requireAuth, getProductbyId)

export default router