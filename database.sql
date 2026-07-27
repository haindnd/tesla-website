-- Tạo database
CREATE DATABASE IF NOT EXISTS dat_tesla_motors;
USE dat_tesla_motors;

-- Bảng admin
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh mục sản phẩm
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm (xe Tesla)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    category_id INT,
    price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    image VARCHAR(500),
    gallery TEXT,
    description TEXT,
    specifications TEXT,
    range_km INT,
    top_speed INT,
    acceleration DECIMAL(3,1),
    horsepower INT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Bảng khách hàng
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đơn hàng
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Bảng tin tức
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    thumbnail VARCHAR(500),
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng cài đặt website
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu

-- Admin mặc định (password: admin123)
INSERT INTO admins (username, password, full_name) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');

-- Danh mục
INSERT INTO categories (name, description) VALUES 
('Sedan', 'Xe sedan cao cấp'),
('SUV', 'Xe SUV đa dụng'),
('Truck', 'Xe bán tải điện');

-- Sản phẩm mẫu
INSERT INTO products (name, slug, category_id, price, image, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured) VALUES 
('Tesla Model S', 'tesla-model-s', 1, 2500000000, '/images/model-s.jpg', 'Tesla Model S là sedan hạng sang thuần điện với hiệu suất vượt trội và công nghệ tiên tiến nhất.', '{"battery": "100 kWh", "seats": 5, "cargo": "793L"}', 652, 322, 2.1, 1020, TRUE),
('Tesla Model 3', 'tesla-model-3', 1, 1200000000, '/images/model-3.jpg', 'Tesla Model 3 mang đến trải nghiệm xe điện cao cấp với mức giá hợp lý hơn.', '{"battery": "82 kWh", "seats": 5, "cargo": "561L"}', 547, 261, 3.3, 450, TRUE),
('Tesla Model X', 'tesla-model-x', 2, 2800000000, '/images/model-x.jpg', 'Tesla Model X là SUV điện với cửa cánh chim falcon ấn tượng và không gian rộng rãi.', '{"battery": "100 kWh", "seats": 7, "cargo": "2180L"}', 576, 262, 2.6, 1020, TRUE),
('Tesla Model Y', 'tesla-model-y', 2, 1500000000, '/images/model-y.jpg', 'Tesla Model Y kết hợp hoàn hảo giữa tính thực dụng của SUV và hiệu suất của xe điện.', '{"battery": "75 kWh", "seats": 7, "cargo": "2158L"}', 505, 217, 3.7, 450, TRUE),
('Tesla Cybertruck', 'tesla-cybertruck', 3, 2000000000, '/images/cybertruck.jpg', 'Tesla Cybertruck với thiết kế đột phá và khả năng off-road mạnh mẽ.', '{"battery": "123 kWh", "seats": 6, "cargo": "2832L"}', 547, 209, 2.9, 845, TRUE),
('Tesla Roadster', 'tesla-roadster', 1, 5000000000, '/images/roadster.jpg', 'Tesla Roadster thế hệ mới - siêu xe điện nhanh nhất thế giới.', '{"battery": "200 kWh", "seats": 4, "cargo": "150L"}', 1000, 400, 1.9, 1200, TRUE);

-- Tin tức mẫu
INSERT INTO news (title, slug, thumbnail, content) VALUES 
('Tesla ra mắt Model S Plaid mới tại Việt Nam', 'tesla-ra-mat-model-s-plaid-moi-tai-viet-nam', '/images/news-1.jpg', '<p>Tesla vừa chính thức ra mắt phiên bản Model S Plaid tại thị trường Việt Nam với nhiều cải tiến đáng chú ý...</p>'),
('Công nghệ pin mới giúp xe Tesla đi xa hơn 30%', 'cong-nghe-pin-moi-giup-xe-tesla-di-xa-hon-30', '/images/news-2.jpg', '<p>Tesla công bố công nghệ pin thế hệ mới 4680 có thể tăng phạm vi hoạt động lên đến 30%...</p>'),
('Trạm sạc Supercharger đầu tiên tại Hà Nội', 'tram-sac-supercharger-dau-tien-tai-ha-noi', '/images/news-3.jpg', '<p>ĐẠT TESLA MOTORS khai trương trạm sạc Supercharger đầu tiên tại Hà Nội với 20 trụ sạc...</p>');

-- Cài đặt website
INSERT INTO settings (setting_key, setting_value) VALUES 
('site_name', 'ĐẠT TESLA MOTORS'),
('site_description', 'Đại lý xe Tesla chính hãng tại Việt Nam'),
('phone', '1900 1234'),
('email', 'contact@dattesla.vn'),
('address', '123 Nguyễn Văn Linh, Quận 7, TP.HCM'),
('facebook', '[facebook.com](https://facebook.com/dattesla)'),
('instagram', '[instagram.com](https://instagram.com/dattesla)'),
('youtube', '[youtube.com](https://youtube.com/dattesla)'),
('header_banner', 'Miễn phí giao xe toàn quốc - Bảo hành 8 năm'),
('footer_text', '© 2024 ĐẠT TESLA MOTORS. All rights reserved.');
