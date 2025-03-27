// 📌 Este script pobla la base de datos con datos iniciales automáticamente al iniciar el backend
const pool = require('./config/db');

async function populateDatabase() {
    try {
        console.log('📌 Datenbank wird gefüllt...');


        // ===========================
        // 1. CATEGORIES
        // ===========================
        await pool.query(`
            INSERT INTO categories (category_id, name)
            VALUES (1, 'Getränke'), (2, 'Snacks'), (3, 'Tiefkühlprodukte')
                ON CONFLICT (category_id) DO NOTHING;

        `);

        // ===========================
        // 2. MANUFACTURERS
        // ===========================
        await pool.query(`
            INSERT INTO manufacturers (manufacturer_id, name, address, country)
            VALUES
                (1, 'Coca-Cola Company', 'Atlanta, GA, USA', 'USA'),
                (2, 'Nestle', 'Vevey, Schweiz', 'Schweiz'),
                (3, 'Unilever', 'London, UK', 'UK')
                ON CONFLICT (manufacturer_id) DO NOTHING;
        `);

        // ===========================
        // 3. INGREDIENTS
        // ===========================
        await pool.query(`
            INSERT INTO ingredients (name)
            VALUES
                ('Wasser'), ('Zucker'), ('Salz'), ('Milchpulver'),
                ('Kakaopulver'), ('Vanille'), ('Milch'),
                ('Weizenmehl'), ('Honig'), ('Kohlenhydrate')
        `);

        // ===========================
        // 4. PRODUCTS
        // ===========================
        const products = [
            [1, 1, 1, '1234567890123', "Coca-Cola", "Erfrischungsgetränk", 1.50, 1.20, 0, 500, 0, 0, 0, 0.25, "https://m.media-amazon.com/images/I/51v8nyxSOYL._SL1500_.jpg"],
            [2, 2, 2, '9876543210987', "KitKat", "Schokoladenriegel", 1.00, 0.90, 45, 0, 0, 0, 0, 0, "https://privatgrossisten.se/cdn/shop/files/KitKat_Mini_6_68_KG.jpg?v=1735914470&width=1445"],
            [3, 3, 3, '4567890123456', "Magnum Eis", "Vanilleeis mit Schokolade", 2.50, 2.20, 120, 0, 0, 0, 0, 0, "https://assets.unileversolutions.com/v1/117691546.jpg"],
            [4, 1, 1, '3216549873210', "Fanta", "Orangenlimonade", 1.30, 1.10, 0, 330, 0, 0, 0, 0.25, "https://outofhome.se/media/catalog/product/cache/30/image/17f82f742ffe127f42dca9de82fb58b1/f/a/fanta-orange-pet_50cl_283600.jpg"],
            [5, 2, 2, '8529637412580', "Lion", "Schokoriegel mit Karamell", 1.20, 1.00, 50, 0, 0, 0, 0, 0, "https://cdn02.plentymarkets.com/mgt7h3rmbzvp/item/images/1199913242/full/1199913242-Nestle-Lion--Schokolade--42g-Riegel_1.jpg"],
            [6, 3, 3, '9638527412580', "Cornetto", "Eiswaffel mit Schokoladenfüllung", 2.00, 1.80, 110, 0, 0, 0, 0, 0, "https://varsego.se/storage/D1218D1011426445E6F5565D0C12F63CF5F25C05B202A0745FAFC6CE53F881FF/c220da5dcd4c4bf385c9925b91af8be2/png/media/f7bb822bfdf74540b7c00d51135cf969/13794%20Cornetto%20Soft%20Cookie_Chocolate%20.png"],
            [7, 1, 1, '7412589638520', "Sprite", "Zitronenlimonade", 1.50, 1.20, 0, 330, 0, 0, 0, 0.25, "https://gottebiten.se/media/catalog/product/cache/image/1000x1320/e9c3970ab036de70892d86c6d221abfe/s/p/sprite-burk_1.jpg"],
            [8, 2, 2, '6547891234560', "Smarties", "Schokolinsen", 1.00, 0.85, 35, 0, 0, 0, 0, 0, "https://gottebiten.se/media/catalog/product/cache/image/1000x1320/e9c3970ab036de70892d86c6d221abfe/7/6/7613034754424.jpg"],
            [9, 3, 3, '1478523690123', "Ben & Jerry's", "Schokoladeneis mit Keksstücken", 3.00, 2.80, 500, 0, 0, 0, 0, 0, "https://www.benjerry.se/files/live/sites/systemsite/files/EU%20Specific%20Assets/Flavors/Product%20Assets/Cookie%20Vermont-ster%20Sundae/37678_AT-BE-CH-DE-FR-NL_IC_Cookie-Vermont-ster-Sundae_427ml_Open_Brand-1920px_8711327539624.png"],
            [10, 1, 1, '9876543210123', "Mezzo Mix", "Cola mit Orangen-Geschmack", 1.50, 1.20, 0, 330, 0, 0, 0, 0.25, "https://snamix.se/2068-thickbox_default/mezzo-mix.jpg"]
        ];

        for (const product of products) {
            await pool.query(`
                INSERT INTO products (
                    product_id, category_id, manufacturer_id, ean_gtin, name, description,
                    price_delivery, price_pickup, net_weight_g, net_volume_l,
                    gross_weight_g, alcohol_volume, caffeine_mg, deposit_amount, image_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (ean_gtin) DO NOTHING
            `, product);
        }

        // ===========================
        // 5. PRODUCT_INGREDIENTS
        // ===========================
        const productIngredients = [
            [1, 'Wasser'], [1, 'Zucker'],
            [2, 'Zucker'], [2, 'Milchpulver'], [2, 'Kakaopulver'],
            [3, 'Milch'], [3, 'Vanille'], [3, 'Kakaopulver'],
            [4, 'Wasser'], [4, 'Zucker'],
            [5, 'Zucker'], [5, 'Weizenmehl'], [5, 'Kakaopulver'],
            [6, 'Milch'], [6, 'Vanille'],
            [7, 'Wasser'], [7, 'Zucker'],
            [8, 'Zucker'], [8, 'Kohlenhydrate'],
            [9, 'Milch'], [9, 'Honig'],
            [10, 'Wasser'], [10, 'Zucker']
        ];

        for (const [productId, ingredientName] of productIngredients) {
            const ingredientResult = await pool.query(`SELECT ingredient_id FROM ingredients WHERE name = $1;`, [ingredientName]);
            if (ingredientResult.rows.length > 0) {
                const ingredientId = ingredientResult.rows[0].ingredient_id;
                await pool.query(`INSERT INTO product_ingredients (product_id, ingredient_id) VALUES ($1, $2);`, [productId, ingredientId]);
            }
        }
        // ===========================
        // 5. NUTRITIONAL INFO
        // ===========================
        const nutritionInfo = [
            [1, 180, 0, 0, 0, 44, 44, 0, 0],
            [2, 220, 3, 11, 7, 29, 24, 1, 40],
            [3, 280, 4, 18, 10, 25, 20, 0, 70],
            [4, 170, 0, 0, 0, 42, 42, 0, 0],
            [5, 250, 4, 14, 9, 30, 25, 2, 60],
            [6, 270, 5, 15, 8, 28, 23, 0, 90],
            [7, 190, 0, 0, 0, 47, 47, 0, 0],
            [8, 210, 2, 12, 8, 28, 24, 1, 50],
            [9, 310, 5, 20, 12, 35, 30, 0, 100],
            [10, 185, 0, 0, 0, 45, 45, 0, 0]
        ];

        for (const info of nutritionInfo) {
            await pool.query(`
                INSERT INTO nutrition_info (product_id, energy_kcal, protein_g, fat_g, saturated_fat_g, carbohydrates_g, sugar_g, fiber_g, sodium_mg)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            `, info);
        }

        console.log('✅ Datenbank erfolgreich gefüllt.');
    } catch (error) {
        console.error('❌ Fehler beim Füllen der Datenbank:', error);
    }
}

module.exports = populateDatabase;
