import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { requireAuth, isAdmin } from "../config/authMiddleware.js"
import userManager from "../dao/mongomanagers/userManagerMongo.js";
import express from 'express';
import path from 'path';
import passport from "passport";

const cmanager = new CartManager();
const pmanager = new ProductManager()
const usmanager = new userManager();

const router = Router()

// Middleware para pasar el objeto user a las vistas
const setUserInLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Usar el middleware en todas las rutas
router.use(setUserInLocals);

router.use('/productos', express.static(path.join(__dirname, 'public')));


router.post('/register', passport.authenticate('register',{failureRedirect:'/failedregister'}), async(req,res)=>{
    //res.send({status:'success', message:'User registered'})
    res.redirect('/login')
})

// router.post('/register', async (req, res) => {
//     const { username,name, lastname,tel, email, password } = req.body;

//     try {
//         const newUser = await usmanager.regUser(username,name, lastname,tel, email, password);

//         req.session.user = newUser;

//         console.log(newUser);
//         res.redirect('/login');
//     } catch (error) {
//         if (error.message === 'Email already in use') {
//             // Manejar el caso en el que el correo electrónico ya está en uso
//             console.log('El correo electrónico ya está en uso' , error);
//             res.render('register', { error: 'El correo electrónico ya está en uso'});
//         } else {
//             // Manejar otros errores
//             console.log('Error al registrar usuario:', error);
//             res.render('register', { error: 'Error al registrar usuario' });
//         }
//     }
// });

// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const user = await usmanager.logInUser(username, password)

//         req.session.user = user;

//         res.redirect('/productos');
//     } catch (error) {
//         console.log('Invalid credentials', error);
//         res.render('login', { error: 'Credenciales inválidas' });
//     }
// });

// router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res) => {
//     if (!req.user) return res.status(400).send({status:"error", error:"Invalid credentials"})
//     req.session.user = {
//         username:req.user.username,
//         name:req.user.name,
//         tel:req.user.tel,
//         lastname:req.user.lastname,
//     }
// });

router.post('/login', (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).send({ status: "error", error: "Invalid credentials" });
            }
            req.login(user, async (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                req.session.user = {
                    username: user.username,
                    name: user.name,
                    tel: user.tel,
                    lastname: user.lastname,
                };
                return res.redirect('/productos')
                // return res.send({ status: "success", message: "Login successful" });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});


router.delete('/empty-cart', requireAuth, async (req, res) => {
    try {
        const logUser = req.session.user;
        const user= await usmanager.getUsers(logUser.username)
        const cartId = user.cartId


        const cart = await cmanager.removeallProductFromCart(cartId);

        res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

router.delete('/delete-to-cart', requireAuth, async (req, res) => {
    try {
        const { productId } = req.body;
        const logUser = req.session.user;
        const user= await usmanager.getUsers(logUser.username)
        const cartId = user.cartId
        const removeCartProduct = await cmanager.removeProductFromCart(cartId, productId);

        // En lugar de enviar un script con alert y redirección, puedes enviar un mensaje JSON de éxito
        res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

router.post('/add-to-cart', requireAuth, async (req, res) => {
    try {
        const { productId, quantity } = req.body; // Obtener la cantidad del cuerpo de la solicitud
        const logUser = req.session.user;
        const user= await usmanager.getUsers(logUser.username)
        const cartId = user.cartId

        const cart = await cmanager.getCartById(cartId);

        if (productId) {
            const id = productId;
            const productDetails = await pmanager.getProductById(productId);
            const addedProduct = await cmanager.addProductInCart(cartId, productDetails, id, quantity); // Pasar la cantidad al método addProductInCart
        }

        res.json({ success: true, message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

export default router