TRUNCATE TABLE products RESTART IDENTITY CASCADE;

INSERT INTO products
(product_name, price, stock_amount, image_url, total_buyers, avg_rating, description, category)
VALUES

    ('iPhone 15 Pro', 129999, 12,
     'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
     0, 0.0,
     'Flagship Apple smartphone with A17 Pro chip',
     'Mobile'),

    ('Samsung Galaxy S24 Ultra', 119999, 9,
     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
     0, 0.0,
     'Premium Samsung smartphone with powerful camera setup',
     'Mobile'),

    ('Sony WH-1000XM5 Headphones', 29999, 20,
     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
     0, 0.0,
     'Industry-leading wireless noise cancelling headphones',
    'Electronics'),

    ('Nike Air Max Pulse', 8999, 25,
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
     0, 0.0,
     'Comfortable lifestyle sneakers for daily wear',
     'Fashion'),

    ('Dell XPS 15 Laptop', 164999, 6,
     'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
     0, 0.0,
     'High-performance laptop for creators and developers',
     'Electronics'),

    ('Wooden Study Table', 14999, 15,
     'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
     0, 0.0,
     'Minimal modern wooden study desk',
     'Household'),

    ('Canon EOS R50 Camera', 78999, 8,
     'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
     0, 0.0,
     'Compact mirrorless camera for photography enthusiasts',
     'Electronics'),

    ('Puma Sports Hoodie', 3499, 40,
     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
     0, 0.0,
     'Comfortable cotton blend sports hoodie',
     'Fashion'),

    ('Apple Watch Series 9', 45999, 18,
     'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
     0, 0.0,
     'Advanced smartwatch with fitness tracking',
     'Electronics'),

    ('Gaming Mechanical Keyboard', 5499, 30,
     'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
     0, 0.0,
     'RGB mechanical keyboard with tactile switches',
     'Electronics'),

    ('Adidas Football', 1999, 50,
     'https://images.unsplash.com/photo-1517466787929-bc90951d0974',
     0, 0.0,
     'Professional training football for outdoor matches',
    'Equipment'),

    ('LG OLED Smart TV 55-inch', 89999, 5,
     'https://images.unsplash.com/photo-1593784991095-a205069470b6',
     0, 0.0,
     '4K Ultra HD OLED Smart Television',
     'Electronics'),

    ('Instant Coffee Jar', 499, 100,
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
     0, 0.0,
     'Premium instant coffee powder',
    'Household'),

    ('HP Wireless Mouse', 1299, 75,
     'https://images.unsplash.com/photo-1527814050087-3793815479db',
     0, 0.0,
     'Ergonomic wireless mouse for office use',
     'Electronics'),

    ('Levis Denim Jacket', 4999, 22,
     'https://images.unsplash.com/photo-1523398002811-999ca8dec234',
     0, 0.0,
     'Classic blue denim jacket for casual outfits',
     'Fashion');