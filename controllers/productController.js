const {
    create,
    getAll,
    remove,
    update,
    findById
} = require('../models/productModel');

const {
  createLog
} = require('../models/historyModel');

const CATEGORIES = new Set([
  'Beverages',
  'Food & Consumables',
  'Pharmaceuticals',
  'Cosmetics & Personal Care',
  'Electronics',
  'Packaging',
  'Textiles',
  'Chemicals',
  'Automotive Parts',
  'Raw Materials',
  'Other',
]);

const ProductController = {
async createProduct(req, res) {
    try {
        const { brand_id, name, category, stock } = req.body;

        if (!brand_id || !name || !category) {
            return res.status(400).json({
                message: 'brand_id, name and category are required.'
            });
        }

        if (!CATEGORIES.has(category)) {
            return res.status(400).json({
                message: 'Invalid category.',
                allowedCategories: [...CATEGORIES]
            });
        }

        const product = await create({
            brand_id,
            name,
            category,
            stock
        });

        const subject = `Created product "${name}" under category "${category}" with an initial stock of ${stock}.`
        
        await createLog(req.user.id, "Create", subject );
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Failed to create product.'
        });
    }
},

    async getAllProducts(req, res) {
        try {
            const products = await getAll(req.user.id);
            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Failed to fetch products.'
            });
        }
    },

    async getOneProduct(req, res) {
        try {
            const product = await findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

            res.json(product);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Failed to fetch product.'
            });
        }
    },

async updateProduct(req, res) {
    try {
        if (
            req.body.category !== undefined &&
            !CATEGORIES.has(req.body.category)
        ) {
            return res.status(400).json({
                message: 'Invalid category.',
                allowedCategories: [...CATEGORIES]
            });
        }


        const updated = await update(
            req.params.id,
            req.body
        );

        if (!updated) {
            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        
       const subject = `Updated stock for product "${updated.name}" in category "${updated.category}" to ${updated.stock}.`;
        await createLog(req.user.id, "Update", subject )

        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Failed to update product.'
        });
    }
},

    async deleteProduct(req, res) {
        try {
            const deleted = await remove(req.params.id);


            if (!deleted) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

          const subject = `Deleted product "${deleted.name}" from category "${deleted.category}".`;
        await createLog(req.user.id, "Delete", subject );

            res.status(204).json({
                message: 'Product deleted successfully.'
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Failed to delete product.'
            });
        }
    }
};

module.exports = ProductController;