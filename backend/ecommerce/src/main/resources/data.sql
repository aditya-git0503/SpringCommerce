TRUNCATE TABLE products RESTART IDENTITY CASCADE;

INSERT INTO products
(product_name, price, stock_amount, image_url, total_buyers, avg_rating, description)
VALUES

    ('iPhone 15 Pro', 129999, 12,
     'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
     5421, 4.8,
     'Flagship Apple smartphone with A17 Pro chip'),

    ('Samsung Galaxy S24 Ultra', 119999, 9,
     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
     4210, 4.7,
     'Premium Samsung smartphone with powerful camera setup'),

    ('Sony WH-1000XM5 Headphones', 29999, 20,
     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
     1875, 4.6,
     'Industry-leading wireless noise cancelling headphones'),

    ('Nike Air Max Pulse', 8999, 25,
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
     990, 4.3,
     'Comfortable lifestyle sneakers for daily wear'),

    ('Dell XPS 15 Laptop', 164999, 6,
     'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
     721, 4.5,
     'High-performance laptop for creators and developers'),

    ('Wooden Study Table', 14999, 15,
     'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
     312, 4.1,
     'Minimal modern wooden study desk'),

    ('Canon EOS R50 Camera', 78999, 8,
     'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
     458, 4.4,
     'Compact mirrorless camera for photography enthusiasts'),

    ('Puma Sports Hoodie', 3499, 40,
     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
     1340, 4.2,
     'Comfortable cotton blend sports hoodie'),

    ('Apple Watch Series 9', 45999, 18,
     'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
     2210, 4.7,
     'Advanced smartwatch with fitness tracking'),

    ('Gaming Mechanical Keyboard', 5499, 30,
     'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
     845, 4.3,
     'RGB mechanical keyboard with tactile switches'),

    ('Adidas Football', 1999, 50,
     'https://images.unsplash.com/photo-1517466787929-bc90951d0974',
     430, 4.0,
     'Professional training football for outdoor matches'),

    ('LG OLED Smart TV 55-inch', 89999, 5,
     'https://images.unsplash.com/photo-1593784991095-a205069470b6',
     650, 4.8,
     '4K Ultra HD OLED Smart Television'),

    ('Instant Coffee Jar', 499, 100,
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
     1540, 4.1,
     'Premium instant coffee powder'),

    ('HP Wireless Mouse', 1299, 75,
     'https://images.unsplash.com/photo-1527814050087-3793815479db',
     2150, 4.4,
     'Ergonomic wireless mouse for office use'),

    ('Levis Denim Jacket', 4999, 22,
     'https://images.unsplash.com/photo-1523398002811-999ca8dec234',
     765, 4.2,
     'Classic blue denim jacket for casual outfits');