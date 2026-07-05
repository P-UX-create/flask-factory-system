const {
    create,
    update,
    deleteBrands,
    displayBrands
} = require("../models/brandModel");

const {
  createLog
} = require('../models/historyModel');

const BrandFunction = {

    async createBrand(req, res) {
        try {
            const { name } = req.body;
            const user = req.user;

            if (!name) {
                return res.status(400).json({
                    message: "Required field missing"
                });
            }

            const brand = await create({
                name,
                userId: user.id
            });

        const subject = `Created brand "${name}"`
        
        await createLog(req.user.id, "Create", subject );
            return res.status(201).json(brand);

        } catch (error) {
            console.error(`Error creating brand: ${error.message}`);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    },

    async updateBrand(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!id || !name) {
                return res.status(400).json({
                    message: "Required field missing"
                });
            }

            const brand = await update({
                id,
                name,
                userId: req.user.id
            });

            if (!brand) {
                return res.status(404).json({
                    message: "Brand not found"
                });
            }
        const subject = `Updated brand name to "${name}"`
        
        await createLog(req.user.id, "Update", subject );
            return res.status(200).json(brand);

        } catch (error) {
            console.error(`Error updating brand: ${error.message}`);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    },

    async deleteBrand(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: "Required field missing"
                });
            }

         const deleted = await deleteBrands(id, req.user.id);

         const subject = `Deleted brand "${deleted.name}".`;
        await createLog(req.user.id, "Delete", subject );

            return res.sendStatus(204);

        } catch (error) {
            console.error(`Error deleting brand: ${error.message}`);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    },

    async showBrand(req, res) {
        try {
            const brands = await displayBrands(req.user.id);

            return res.status(200).json(brands);

        } catch (error) {
            console.error(`Error fetching brands: ${error.message}`);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
};

module.exports = BrandFunction;