import { Router } from "express";
import { __dirname } from "../utils.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { productsModel } from '../dao/models/products.model.js';
import { requireAuth, isAdmin } from "../config/authMiddleware.js"
import express from 'express';

import path from 'path';

const cmanager = new CartManager();

const router = Router()

// Middleware para pasar el objeto user a las vistas
const setUserInLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Usar el middleware en todas las rutas
router.use(setUserInLocals);

router.use('/productos', express.static(path.join(__dirname, 'public')));

router.get("/failedregister", (req, res) => {
    res.send({error:"Failed Strategy"})
})

router.get("/faillogin",  (req, res) => {
    res.send({error:"Failed login Strategy"})
})

router.get("/chat", requireAuth, (req, res) => {
    res.render("chat")
})

router.get('/', async (req, res) => {
    res.render('home')
})

router.get('/login', async (req, res) => {
    res.render('login')
})

router.get('/register', async (req, res) => {
    res.render('register')
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) res.send('Failed Logout')
        res.redirect('/')
    })
})

router.get("/productos", requireAuth, async (req, res) => {
    try {
        let pageNum = parseInt(req.query.page) || 1;
        let itemsPorPage = parseInt(req.query.limit) || 10;
        let sortByPrice = req.query.sort === 'asc' ? 'price' : req.query.sort === 'desc' ? '-price' : null;
        let category = req.query.category ? { category: req.query.category } : {};

        const query = {};

        if (sortByPrice) {
            query.sort = sortByPrice;
        }

        const products = await productsModel.paginate(category, { page: pageNum, limit: itemsPorPage, sort: query.sort, lean: true });

        products.prevLink = products.hasPrevPage ? `?limit=${itemsPorPage}&page=${products.prevPage}` : '';
        products.nextLink = products.hasNextPage ? `?limit=${itemsPorPage}&page=${products.nextPage}` : '';

        products.page = products.page;
        products.totalPages = products.totalPages;
        console.log(products)
        res.render('productos', products);
    } catch (error) {
        console.log('Error al leer los productos', error);
        res.status(500).json({ error: 'error al leer los productos' });
    }
});

router.get("/realtimeproducts", requireAuth, isAdmin, (req, res) => {
    res.render("realtimeproducts")
})

router.get("/cart", requireAuth, async (req, res) => {
    const productsInCart = await cmanager.getCartById("65c28522c1483aaada1fb25c")
    const productList = Object.values(productsInCart.products)
    res.render("partials/cart", { productList })
})

router.get("/:cid", requireAuth, async (req, res) => {
    try {
        const id = req.params.cid
        const result = await productsModel.findById(id).lean().exec()

        if (result === null) {
            return res.status(404).json({ status: 'error', error: 'product not found' })
        }
        res.render('partials/productDetail', result)
    } catch (error) {
        res.status(500).json({ error: 'error al leer el producto' })
    }
})

export default router