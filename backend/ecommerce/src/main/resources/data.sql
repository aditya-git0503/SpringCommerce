ALTER TABLE product_ratings
DROP CONSTRAINT IF EXISTS product_ratings_user_id_product_id_key;

ALTER TABLE product_ratings
DROP CONSTRAINT IF EXISTS ukc04atldbsnfhinkgdytimcpt5;

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_ratings_order_item_id
ON product_ratings(order_item_id);

INSERT INTO products
(product_id, product_name, price, stock_amount, image_url, total_buyers, avg_rating, rating_count, description, category)
VALUES
    (1, 'iPhone 15 Pro', 129999, 12, '/images/products/iphone_15_pro.svg', 0, 0.0, 0, 'Flagship Apple smartphone with A17 Pro chip', 'Mobile'),
    (2, 'Samsung Galaxy S24 Ultra', 119999, 9, '/images/products/samsung_galaxy.svg', 0, 0.0, 0, 'Premium Samsung smartphone with powerful camera setup', 'Mobile'),
    (3, 'Sony WH-1000XM5 Headphones', 29999, 20, '/images/products/sony_headphones.svg', 0, 0.0, 0, 'Industry-leading wireless noise cancelling headphones', 'Electronics'),
    (4, 'Nike Air Max Pulse', 8999, 25, '/images/products/nike_airmax.svg', 0, 0.0, 0, 'Comfortable lifestyle sneakers for daily wear', 'Fashion'),
    (5, 'Dell XPS 15 Laptop', 164999, 6, '/images/products/dell_laptop.svg', 0, 0.0, 0, 'High-performance laptop for creators and developers', 'Electronics'),
    (6, 'Wooden Study Table', 14999, 15, '/images/products/wooden_table.svg', 0, 0.0, 0, 'Minimal modern wooden study desk', 'Household'),
    (7, 'Canon EOS R50 Camera', 78999, 8, '/images/products/canon_camera.svg', 0, 0.0, 0, 'Compact mirrorless camera for photography enthusiasts', 'Electronics'),
    (8, 'Puma Sports Hoodie', 3499, 40, '/images/products/puma_hoodie.svg', 0, 0.0, 0, 'Comfortable cotton blend sports hoodie', 'Fashion'),
    (9, 'Apple Watch Series 9', 45999, 18, '/images/products/apple_watch.svg', 0, 0.0, 0, 'Advanced smartwatch with fitness tracking', 'Electronics'),
    (10, 'Gaming Mechanical Keyboard', 5499, 30, '/images/products/gaming_keyboard.svg', 0, 0.0, 0, 'RGB mechanical keyboard with tactile switches', 'Electronics'),
    (11, 'Adidas Football', 1999, 50, '/images/products/adidas_football.svg', 0, 0.0, 0, 'Professional training football for outdoor matches', 'Equipment'),
    (12, 'LG OLED Smart TV 55-inch', 89999, 5, '/images/products/lg_tv.svg', 0, 0.0, 0, '4K Ultra HD OLED Smart Television', 'Electronics'),
    (13, 'Instant Coffee Jar', 499, 100, '/images/products/coffee_jar.svg', 0, 0.0, 0, 'Premium instant coffee powder', 'Household'),
    (14, 'HP Wireless Mouse', 1299, 75, '/images/products/hp_wireless_mouse.svg', 0, 0.0, 0, 'Ergonomic wireless mouse for office use', 'Electronics'),
    (15, 'Levis Denim Jacket', 4999, 22, '/images/products/levis_denim_jacket.svg', 0, 0.0, 0, 'Classic blue denim jacket for casual outfits', 'Fashion')
ON CONFLICT (product_id) DO NOTHING;

UPDATE products
SET image_url = CASE product_id
    WHEN 1 THEN '/images/products/iphone_15_pro.svg'
    WHEN 2 THEN '/images/products/samsung_galaxy.svg'
    WHEN 3 THEN '/images/products/sony_headphones.svg'
    WHEN 4 THEN '/images/products/nike_airmax.svg'
    WHEN 5 THEN '/images/products/dell_laptop.svg'
    WHEN 6 THEN '/images/products/wooden_table.svg'
    WHEN 7 THEN '/images/products/canon_camera.svg'
    WHEN 8 THEN '/images/products/puma_hoodie.svg'
    WHEN 9 THEN '/images/products/apple_watch.svg'
    WHEN 10 THEN '/images/products/gaming_keyboard.svg'
    WHEN 11 THEN '/images/products/adidas_football.svg'
    WHEN 12 THEN '/images/products/lg_tv.svg'
    WHEN 13 THEN '/images/products/coffee_jar.svg'
    WHEN 14 THEN '/images/products/hp_wireless_mouse.svg'
    WHEN 15 THEN '/images/products/levis_denim_jacket.svg'
    ELSE image_url
END
WHERE product_id BETWEEN 1 AND 15;

UPDATE order_items
SET image_url = CASE image_url
    WHEN '/images/products/iphone-15-pro.svg' THEN '/images/products/iphone_15_pro.svg'
    WHEN '/images/products/galaxy-s24-ultra.svg' THEN '/images/products/samsung_galaxy.svg'
    WHEN '/images/products/sony-wh-1000xm5.svg' THEN '/images/products/sony_headphones.svg'
    WHEN '/images/products/nike-air-max-pulse.svg' THEN '/images/products/nike_airmax.svg'
    WHEN '/images/products/dell-xps-15.svg' THEN '/images/products/dell_laptop.svg'
    WHEN '/images/products/wooden-study-table.svg' THEN '/images/products/wooden_table.svg'
    WHEN '/images/products/canon-eos-r50.svg' THEN '/images/products/canon_camera.svg'
    WHEN '/images/products/puma-sports-hoodie.svg' THEN '/images/products/puma_hoodie.svg'
    WHEN '/images/products/apple-watch-series-9.svg' THEN '/images/products/apple_watch.svg'
    WHEN '/images/products/gaming-keyboard.svg' THEN '/images/products/gaming_keyboard.svg'
    WHEN '/images/products/adidas-football.svg' THEN '/images/products/adidas_football.svg'
    WHEN '/images/products/lg-oled-tv.svg' THEN '/images/products/lg_tv.svg'
    WHEN '/images/products/instant-coffee-jar.svg' THEN '/images/products/coffee_jar.svg'
    WHEN '/images/products/hp-wireless-mouse.svg' THEN '/images/products/hp_wireless_mouse.svg'
    WHEN '/images/products/levis-denim-jacket.svg' THEN '/images/products/levis_denim_jacket.svg'
    ELSE image_url
END
WHERE image_url IN (
    '/images/products/iphone-15-pro.svg',
    '/images/products/galaxy-s24-ultra.svg',
    '/images/products/sony-wh-1000xm5.svg',
    '/images/products/nike-air-max-pulse.svg',
    '/images/products/dell-xps-15.svg',
    '/images/products/wooden-study-table.svg',
    '/images/products/canon-eos-r50.svg',
    '/images/products/puma-sports-hoodie.svg',
    '/images/products/apple-watch-series-9.svg',
    '/images/products/gaming-keyboard.svg',
    '/images/products/adidas-football.svg',
    '/images/products/lg-oled-tv.svg',
    '/images/products/instant-coffee-jar.svg',
    '/images/products/hp-wireless-mouse.svg',
    '/images/products/levis-denim-jacket.svg'
);

SELECT setval(
    pg_get_serial_sequence('products', 'product_id'),
    COALESCE((SELECT MAX(product_id) FROM products), 1),
    true
);
