const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// get all products
router.get("/", async (req, res) => {
    try {
        const productsQuery = `
            SELECT
                p.product_id,
                p.ean_gtin,
                p.sku_plu,
                p.name,
                p.description,
                p.image_url,
                p.price_delivery,
                p.price_pickup,
                p.net_weight_g,
                p.net_volume_l,
                p.gross_weight_g,
                p.alcohol_volume,
                p.caffeine_mg,
                p.deposit_amount,
                c.category_id,
                c.name AS category_name,
                m.manufacturer_id,
                m.name AS manufacturer_name,
                m.address AS manufacturer_address,
                m.country AS manufacturer_country,
                -- 🔹Group ingredients in one list separate with commas
                COALESCE(string_agg(DISTINCT i.name, ', '), '') AS ingredient_names,
                n.energy_kcal,
                n.protein_g,
                n.fat_g,
                n.saturated_fat_g,
                n.carbohydrates_g,
                n.sugar_g,
                n.fiber_g,
                n.sodium_mg
            FROM
                products p
                    LEFT JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
                    LEFT JOIN product_ingredients pi ON p.product_id = pi.product_id
                    LEFT JOIN ingredients i ON pi.ingredient_id = i.ingredient_id
                    LEFT JOIN nutrition_info n ON p.product_id = n.product_id
            GROUP BY p.product_id, c.category_id, m.manufacturer_id,
                     n.energy_kcal, n.protein_g, n.fat_g, n.saturated_fat_g,
                     n.carbohydrates_g, n.sugar_g, n.fiber_g, n.sodium_mg;
        `;

        const productsResult = await pool.query(productsQuery);
        const products = productsResult.rows;

        const formattedProducts = products.map(product => {
            const ingredients = products.filter(p => product.product_id === p.product_id)
                .map(p => ({ name: p.ingredient_name }));

            const nutritionInfo = {
                energy_kcal: product.energy_kcal,
                protein_g: product.protein_g,
                fat_g: product.fat_g,
                saturated_fat_g: product.saturated_fat_g,
                carbohydrates_g: product.carbohydrates_g,
                sugar_g: product.sugar_g,
                fiber_g: product.fiber_g,
                sodium_mg: product.sodium_mg
            };

            return {
                product_id: product.product_id,
                ean_gtin: product.ean_gtin,
                sku_plu: product.sku_plu,
                name: product.name,
                description: product.description,
                image_url: product.image_url,
                price_delivery: product.price_delivery,
                price_pickup: product.price_pickup,
                net_weight_g: product.net_weight_g,
                net_volume_l: product.net_volume_l,
                gross_weight_g: product.gross_weight_g,
                alcohol_volume: product.alcohol_volume,
                caffeine_mg: product.caffeine_mg,
                deposit_amount: product.deposit_amount,
                // 🔹 Convertir la cadena de ingredientes en un array
                ingredients: product.ingredient_names ? product.ingredient_names.split(', ').map(name => ({ name })) : [],
                nutritionInfo,
                category_id: product.category_id,
                category_name: product.category_name,
                manufacturer: {
                    manufacturer_id: product.manufacturer_id,
                    name: product.manufacturer_name,
                    address: product.manufacturer_address,
                    country: product.manufacturer_country
                }
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error("Fehler beim Abrufen der Produkte:", error);
        res.status(500).json({ error: "Interner Serverfehler." });
    }
});

//get only categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT category_id, name FROM categories');
        res.json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Kategorien:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Kategorien' });
    }
});

//get one product
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const productQuery = `
            SELECT 
                p.product_id, 
                p.ean_gtin, 
                p.sku_plu, 
                p.name, 
                p.description, 
                p.image_url,
                p.price_delivery, 
                p.price_pickup, 
                p.net_weight_g, 
                p.net_volume_l, 
                p.gross_weight_g, 
                p.alcohol_volume, 
                p.caffeine_mg, 
                p.deposit_amount,
                c.category_id, 
                c.name AS category_name,
                m.manufacturer_id, 
                m.name AS manufacturer_name, 
                m.address AS manufacturer_address, 
                m.country AS manufacturer_country,
                i.name AS ingredient_name,
                n.energy_kcal, 
                n.protein_g, 
                n.fat_g, 
                n.saturated_fat_g, 
                n.carbohydrates_g, 
                n.sugar_g, 
                n.fiber_g, 
                n.sodium_mg
            FROM 
                products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN product_ingredients pi ON p.product_id = pi.product_id
            LEFT JOIN ingredients i ON pi.ingredient_id = i.ingredient_id
            LEFT JOIN nutrition_info n ON p.product_id = n.product_id
            WHERE p.product_id = $1;
        `;

        const productResult = await pool.query(productQuery, [id]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: "Produkt nicht gefunden" });
        }

        const product = productResult.rows[0];

        const ingredients = productResult.rows.map(row => ({ name: row.ingredient_name }));

        const nutritionInfo = {
            energy_kcal: product.energy_kcal,
            protein_g: product.protein_g,
            fat_g: product.fat_g,
            saturated_fat_g: product.saturated_fat_g,
            carbohydrates_g: product.carbohydrates_g,
            sugar_g: product.sugar_g,
            fiber_g: product.fiber_g,
            sodium_mg: product.sodium_mg
        };

        res.json({
            product_id: product.product_id,
            ean_gtin: product.ean_gtin,
            sku_plu: product.sku_plu,
            name: product.name,
            description: product.description,
            image_url: product.image_url,
            price_delivery: product.price_delivery,
            price_pickup: product.price_pickup,
            net_weight_g: product.net_weight_g,
            net_volume_l: product.net_volume_l,
            gross_weight_g: product.gross_weight_g,
            alcohol_volume: product.alcohol_volume,
            caffeine_mg: product.caffeine_mg,
            deposit_amount: product.deposit_amount,
            ingredients,
            nutritionInfo,
            category_id: product.category_id,
            category_name: product.category_name,
            manufacturer: {
                manufacturer_id: product.manufacturer_id,
                name: product.manufacturer_name,
                address: product.manufacturer_address,
                country: product.manufacturer_country
            }
        });
    } catch (error) {
        console.error("Fehler beim Abrufen des Produkts:", error);
        res.status(500).json({ error: "Interner Serverfehler." });
    }
});

//create a product
router.post("/", async (req, res) => {
    console.log("🌟 Request body recibido:", req.body);  // 🔍 Verificar `category_id`
    const {
        category_id,
        ean_gtin,
        sku_plu,
        name,
        description = "",
        image_url = "",
        price_delivery = 0,
        price_pickup = 0,
        net_weight_g = 0,
        net_volume_l = 0,
        gross_weight_g = 0,
        alcohol_volume = 0,
        caffeine_mg = 0,
        deposit_amount = 0,
        ingredients = [],
        nutrition_info = {},
        manufacturer = {}
    } = req.body;

    if (!ean_gtin || !name) {
        return res.status(400).json({ error: "Sowohl 'name' als auch 'ean_gtin' sind erforderlich." });
    }

    try {
        let manufacturer_id = null;

        // 🔍 Verificar si el EAN ya existe
        const existingProduct = await pool.query(
            `SELECT product_id FROM products WHERE ean_gtin = $1;`, [ean_gtin]
        );
        if (existingProduct.rowCount > 0) {
            return res.status(400).json({ error: "Produkt mit diesem EAN/GTIN existiert bereits." });
        }

        if (manufacturer.name) {
            const manufacturerResult = await pool.query(
                `INSERT INTO manufacturers (name, address, country)
                 VALUES ($1, $2, $3)
                 RETURNING manufacturer_id;`,
                [manufacturer.name, manufacturer.address || '', manufacturer.country || '']
            );
            manufacturer_id = manufacturerResult.rows[0].manufacturer_id;
        }

        const productResult = await pool.query(
            `INSERT INTO products
             (category_id, manufacturer_id, ean_gtin, sku_plu, name, description,
              image_url, price_delivery, price_pickup, net_weight_g, net_volume_l,
              gross_weight_g, alcohol_volume, caffeine_mg, deposit_amount)
             VALUES
                 ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                 RETURNING product_id;`,
            [category_id, manufacturer_id, ean_gtin, sku_plu, name, description,
                image_url, price_delivery, price_pickup, net_weight_g, net_volume_l,
                gross_weight_g, alcohol_volume, caffeine_mg, deposit_amount]
        );

        const product_id = productResult.rows[0].product_id;

        if (ingredients.length > 0) {
            for (const ingredient of ingredients) {
                const ingredientName = ingredient.name;

                const ingredientResult = await pool.query(
                    `SELECT ingredient_id FROM ingredients WHERE name = $1;`, [ingredientName]
                );

                let ingredient_id;
                if (ingredientResult.rowCount > 0) {
                    ingredient_id = ingredientResult.rows[0].ingredient_id;
                } else {
                    const insertIngredientResult = await pool.query(
                        `INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id;`, [ingredientName]
                    );
                    ingredient_id = insertIngredientResult.rows[0].ingredient_id;
                }


                try {
                    await pool.query(
                        `INSERT INTO product_ingredients (product_id, ingredient_id)
                 VALUES ($1, $2);`,
                        [product_id, ingredient_id]
                    );
                } catch (error) {
                    // Si ya existe la relación, simplemente ignoramos el error
                    if (error.code === '23505') { // Código de error para conflicto de clave duplicada
                        console.log(`⚠️ La relación entre el producto y el ingrediente '${ingredientName}' ya existe.`);
                    } else {
                        console.error("❌ Fehler beim Einfügen des Ingredients:", error);
                        return res.status(500).json({ error: "Interner Serverfehler beim Einfügen des Ingredients." });
                    }
                }
            }
        }

        if (Object.keys(nutrition_info).length > 0) {
            await pool.query(
                `INSERT INTO nutrition_info (product_id, energy_kcal, protein_g, fat_g, saturated_fat_g,
                                             carbohydrates_g, sugar_g, fiber_g, sodium_mg)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [product_id,
                    nutrition_info.energy_kcal || 0,
                    nutrition_info.protein_g || 0,
                    nutrition_info.fat_g || 0,
                    nutrition_info.saturated_fat_g || 0,
                    nutrition_info.carbohydrates_g || 0,
                    nutrition_info.sugar_g || 0,
                    nutrition_info.fiber_g || 0,
                    nutrition_info.sodium_mg || 0]
            );
        }

        res.status(201).json({ message: "Produkt erfolgreich erstellt.", product_id: product_id });
    } catch (error) {
        console.error("Fehler beim Erstellen des Produkts:", error);
        res.status(500).json({ error: "Interner Serverfehler." });
    }
});

//update a product
router.put("/:id", async (req, res) => {
    console.log("Contenido de req.body recibido en el servidor:", req.body);  // 🔍 Verificar si llegan category_id, manufacturer y ingredients
    const {
        category_id,
        manufacturer_name,
        manufacturer_address,
        manufacturer_country,
        ean_gtin,
        sku_plu,
        name,
        description = "",
        image_url = "",
        price_delivery = 0,
        price_pickup = 0,
        net_weight_g = 0,
        net_volume_l = 0,
        gross_weight_g = 0,
        alcohol_volume = 0,
        caffeine_mg = 0,
        deposit_amount = 0,
        ingredients = [],
        nutrition_info = {}
    } = req.body;

    if (!ean_gtin || !name) {
        return res.status(400).json({ error: "Sowohl 'name' als auch 'ean_gtin' sind erforderlich." });
    }

    if (!category_id) {
        return res.status(400).json({ error: "Kategorie-ID ist erforderlich." });
    }


    try {
        let manufacturer_id = null;

        const existingProduct = await pool.query(
            `SELECT product_id FROM products WHERE product_id = $1;`, [req.params.id]
        );
        if (existingProduct.rowCount === 0) {
            return res.status(400).json({ error: "Produkt nicht gefunden." });
        }

        if (req.body.manufacturer) {  // ✅ Comprueba si existe un objeto `manufacturer`
            const { name: manufacturer_name, address: manufacturer_address, country: manufacturer_country } = req.body.manufacturer;

            if (manufacturer_name) { // ✅ Asegúrate que hay un nombre antes de intentar insertar
                const manufacturerResult = await pool.query(
                    `INSERT INTO manufacturers (name, address, country)
             VALUES ($1, $2, $3)
             RETURNING manufacturer_id;`,
                    [manufacturer_name, manufacturer_address, manufacturer_country]
                );
                manufacturer_id = manufacturerResult.rows[0].manufacturer_id;
            }
        }

        const productResult = await pool.query(
            `UPDATE products
             SET category_id = COALESCE($1, category_id), manufacturer_id = COALESCE($2, manufacturer_id),
                 ean_gtin = COALESCE($3, ean_gtin), sku_plu = COALESCE($4, sku_plu),
                 name = COALESCE($5, name), description = COALESCE($6, description),
                 image_url = COALESCE($7, image_url), price_delivery = COALESCE($8, price_delivery),
                 price_pickup = COALESCE($9, price_pickup), net_weight_g = COALESCE($10, net_weight_g),
                 net_volume_l = COALESCE($11, net_volume_l), gross_weight_g = COALESCE($12, gross_weight_g),
                 alcohol_volume = COALESCE($13, alcohol_volume), caffeine_mg = COALESCE($14, caffeine_mg),
                 deposit_amount = COALESCE($15, deposit_amount)
             WHERE product_id = $16
             RETURNING product_id;`,
            [category_id, manufacturer_id, ean_gtin, sku_plu, name, description, image_url,
                price_delivery, price_pickup, net_weight_g, net_volume_l, gross_weight_g, alcohol_volume,
                caffeine_mg, deposit_amount, req.params.id]
        );

        const product_id = productResult.rows[0].product_id;

        if (ingredients.length > 0) {
            await pool.query(`DELETE FROM product_ingredients WHERE product_id = $1;`, [product_id]);

            for (const ingredient of ingredients) {
                let ingredientName = ingredient;

                if (typeof ingredient === 'object' && ingredient.name) {
                    ingredientName = ingredient.name;
                }

                try {
                    const parsed = JSON.parse(ingredientName);
                    ingredientName = parsed.name || ingredientName;
                } catch (e) {
                }

                const ingredientResult = await pool.query(
                    `SELECT ingredient_id FROM ingredients WHERE name = $1;`, [ingredientName]
                );

                let ingredient_id;
                if (ingredientResult.rowCount > 0) {
                    ingredient_id = ingredientResult.rows[0].ingredient_id;
                } else {
                    const insertIngredientResult = await pool.query(
                        `INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id;`, [ingredientName]
                    );
                    ingredient_id = insertIngredientResult.rows[0].ingredient_id;
                }

                await pool.query(
                    `INSERT INTO product_ingredients (product_id, ingredient_id)
             VALUES ($1, $2);`,
                    [product_id, ingredient_id]
                );
            }
        }


        if (Object.keys(nutrition_info).length > 0) {
            await pool.query(
                `INSERT INTO nutrition_info (product_id, energy_kcal, protein_g, fat_g, saturated_fat_g,
                                     carbohydrates_g, sugar_g, fiber_g, sodium_mg)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (product_id) 
         DO UPDATE 
         SET 
             energy_kcal = EXCLUDED.energy_kcal,
             protein_g = EXCLUDED.protein_g,
             fat_g = EXCLUDED.fat_g,
             saturated_fat_g = EXCLUDED.saturated_fat_g,
             carbohydrates_g = EXCLUDED.carbohydrates_g,
             sugar_g = EXCLUDED.sugar_g,
             fiber_g = EXCLUDED.fiber_g,
             sodium_mg = EXCLUDED.sodium_mg;`,
                [product_id,
                    nutrition_info.energy_kcal || 0,
                    nutrition_info.protein_g || 0,
                    nutrition_info.fat_g || 0,
                    nutrition_info.saturated_fat_g || 0,
                    nutrition_info.carbohydrates_g || 0,
                    nutrition_info.sugar_g || 0,
                    nutrition_info.fiber_g || 0,
                    nutrition_info.sodium_mg || 0]
            );
        }


        res.status(200).json({ message: "Produkt erfolgreich aktualisiert.", product_id: product_id });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Produkts:", error);
        res.status(500).json({ error: "Interner Serverfehler." });
    }
});

// DELETE all data from the database
router.delete("/reset", async (req, res) => {
    try {
        // Borrar todas las relaciones producto-ingredientes
        await pool.query(`DELETE FROM product_ingredients;`);

        // Borrar toda la información nutricional
        await pool.query(`DELETE FROM nutrition_info;`);

        // Borrar todos los productos
        await pool.query(`DELETE FROM products;`);

        // Borrar categorías, fabricantes e ingredientes
        await pool.query(`DELETE FROM categories;`);
        await pool.query(`DELETE FROM manufacturers;`);
        await pool.query(`DELETE FROM ingredients;`);

        res.status(200).json({ message: "✅ Datenbank erfolgreich zurückgesetzt." });
    } catch (error) {
        console.error("Fehler beim Zurücksetzen der Datenbank:", error);
        res.status(500).json({ error: "Fehler beim Zurücksetzen der Datenbank." });
    }
});

//delete a product
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Zuerst alle Beziehungen zu Produkt-Zutaten löschen
        await pool.query(
            `DELETE FROM product_ingredients WHERE product_id = $1;`,
            [id]
        );

        const result = await pool.query(
            `DELETE FROM products WHERE product_id = $1 RETURNING product_id;`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Produkt nicht gefunden" });
        }

        res.status(200).json({ message: "Produkt gelöscht", product_id: id });
    } catch (error) {
        console.error("Fehler beim Löschen des Produkts:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});
module.exports = router;