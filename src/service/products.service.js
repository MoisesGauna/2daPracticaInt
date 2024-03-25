import { productsModel } from "../dao/models/products.model.js";

export const  getProducts = async (req, res) => {
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
        
        res.render('productos', products);
    } catch (error) {
        console.log('Error al leer los productos', error);
        res.status(500).json({ error: 'error al leer los productos' });
    }
}

export const getProductbyId = async  (req, res) => {
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
}

export const realtimeproducts = async (req, res) =>{
    res.render('realtimeproducts')
}