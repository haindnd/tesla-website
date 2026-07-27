const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/views', express.static('views'));
app.use('/images', express.static('public/images'))

// Session
app.use(session({
    secret: 'dat-tesla-motors-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
const requireAuth = (req, res, next) => {
    if (req.path === '/login.html') {
        return next();
    }
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login.html');
    }
};


// Public login pages
app.get('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.use('/admin', requireAuth, express.static('admin'));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dat_tesla_motors',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Multer config for image upload
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        const dir = path.join(__dirname, 'public', 'images', 'uploads');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }

});
const upload = multer({ storage });

// Helper function to format currency
const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const verifyPassword = async (inputPassword, storedPassword) => {
    if (typeof storedPassword !== 'string') return false;
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
    if (isBcryptHash) {
        return bcrypt.compare(inputPassword, storedPassword);
    }
    return inputPassword === storedPassword;
};


// ==================== API ROUTES ====================

// --- Products API ---
app.get('/api/products', async (req, res) => {
    try {
        // 👉 lấy page từ URL
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        // 👉 lấy sản phẩm theo trang
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = TRUE 
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        // 👉 đếm tổng sản phẩm
        const [[totalResult]] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM products 
            WHERE is_active = TRUE
        `);

        res.json({
            success: true,
            data: rows,
            page: page,
            total: totalResult.total,
            totalPages: Math.ceil(totalResult.total / limit)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM products 
            WHERE is_active = TRUE AND is_featured = TRUE 
            ORDER BY created_at DESC 
            LIMIT 6
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/products/slug/:slug', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.slug = ?
        `, [req.params.slug]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category_id, price, sale_price, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const image = req.file ? '/images/uploads/' + req.file.filename : null;

        const [result] = await pool.query(`
            INSERT INTO products (name, slug, category_id, price, sale_price, image, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, slug, category_id, price, sale_price || null, image, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured === 'true' || is_featured === true]);

        res.json({ success: true, message: 'Product added successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, category_id, price, sale_price, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured, is_active } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        let query = `
            UPDATE products SET 
            name = ?, slug = ?, category_id = ?, price = ?, sale_price = ?, 
            description = ?, specifications = ?, range_km = ?, top_speed = ?, 
            acceleration = ?, horsepower = ?, is_featured = ?, is_active = ?
        `;
        let params = [name, slug, category_id, price, sale_price || null, description, specifications, range_km, top_speed, acceleration, horsepower, is_featured === 'true' || is_featured === true, is_active !== 'false' && is_active !== false];

        if (req.file) {
            query += `, image = ?`;
            params.push('/images/uploads/' + req.file.filename);
        }
        
        query += ` WHERE id = ?`;
        params.push(req.params.id);

        await pool.query(query, params);
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Categories API ---
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Orders API ---
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.id 
            ORDER BY o.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const [orderRows] = await pool.query(`
            SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.id 
            WHERE o.id = ?
        `, [req.params.id]);

        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const [itemRows] = await pool.query(`
            SELECT oi.*, p.name as product_name, p.image as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [req.params.id]);

        res.json({ success: true, data: { ...orderRows[0], items: itemRows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { customer, items, total_amount, note } = req.body;
        
        // Insert customer
        const [customerResult] = await connection.query(`
            INSERT INTO customers (full_name, email, phone, address)
            VALUES (?, ?, ?, ?)
        `, [customer.full_name, customer.email, customer.phone, customer.address]);

        // Generate order code
        const orderCode = 'DT' + Date.now().toString().slice(-8);

        // Insert order
        const [orderResult] = await connection.query(`
            INSERT INTO orders (order_code, customer_id, total_amount, note)
            VALUES (?, ?, ?, ?)
        `, [orderCode, customerResult.insertId, total_amount, note]);

        // Insert order items
        for (const item of items) {
            await connection.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [orderResult.insertId, item.product_id, item.quantity, item.price]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Order created successfully', order_code: orderCode });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- News API ---
app.get('/api/news', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news WHERE is_active = TRUE ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/news/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/news', upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const thumbnail = req.file ? '/images/uploads/' + req.file.filename : null;

        const [result] = await pool.query(`
            INSERT INTO news (title, slug, thumbnail, content)
            VALUES (?, ?, ?, ?)
        `, [title, slug, thumbnail, content]);

        res.json({ success: true, message: 'News added successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/news/:id', upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, content, is_active } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        let query = 'UPDATE news SET title = ?, slug = ?, content = ?, is_active = ?';
        let params = [title, slug, content, is_active !== 'false' && is_active !== false];

        if (req.file) {
            query += ', thumbnail = ?';
            params.push('/images/uploads/' + req.file.filename);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await pool.query(query, params);
        res.json({ success: true, message: 'News updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Settings API ---
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = ?
            `, [key, value, value]);
        }
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // ===== KIỂM TRA ADMIN =====
        const [adminRows] = await pool.query(
            'SELECT * FROM admins WHERE username = ?', 
            [username]
        );

        console.log("Admin rows:", adminRows);

        if (adminRows.length > 0) {
            const admin = adminRows[0];
            const isMatch = password === admin.password;

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
            }

            req.session.admin = {
                id: admin.id,
                username: admin.username,
                full_name: admin.full_name,
                role: "admin"
            };

            req.session.save(() => {
                res.json({
                    success: true,
                    role: "admin"
                });
            });
            return;
        }


        // ===== KIỂM TRA USER =====
        const [userRows] = await pool.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const user = userRows[0];
        const isMatchUser = await verifyPassword(password, user.password);

        if (!isMatchUser) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }


        req.session.user = {
            id: user.id,
            username: user.username,
            full_name: user.full_name || user.username,
            role: "user"
        };

        req.session.save((err) => {

            if (err) {
                console.log("SESSION ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "Session error"
                });
            }

            console.log("ĐĂNG NHẬP USER THÀNH CÔNG:", req.session.user);

            return res.json({
                success: true,
                role: "user"
            });

        });

    } catch (error) {
        console.error("Auth error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, full_name } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
        }

        if (String(password).length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const [existingRows] = await pool.query(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await pool.query(
                'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)',
                [username, hashedPassword, full_name || username]
            );
        } catch (insertError) {
            if (insertError.code === 'ER_BAD_FIELD_ERROR') {
                await pool.query(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [username, hashedPassword]
                );
            } else {
                throw insertError;
            }
        }

        return res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/auth/profile', async (req, res) => {
    try {
        if (req.session.user) {
            const [rows] = await pool.query(
                'SELECT id, username, full_name, created_at FROM users WHERE id = ? LIMIT 1',
                [req.session.user.id]
            );
            const user = rows[0] || req.session.user;
            return res.json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name || user.username,
                    role: 'user',
                    created_at: user.created_at || null
                }
            });
        }

        if (req.session.admin) {
            const [rows] = await pool.query(
                'SELECT id, username, full_name, created_at FROM admins WHERE id = ? LIMIT 1',
                [req.session.admin.id]
            );
            const admin = rows[0] || req.session.admin;
            return res.json({
                success: true,
                data: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name || admin.username,
                    role: 'admin',
                    created_at: admin.created_at || null
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        if (req.session.user) {
            const [rows] = await pool.query('SELECT id, password FROM users WHERE id = ? LIMIT 1', [req.session.user.id]);
            if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

            const user = rows[0];
            const ok = await verifyPassword(currentPassword, user.password);
            if (!ok) return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });

            const hashed = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
            return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
        }

        if (req.session.admin) {
            const [rows] = await pool.query('SELECT id, password FROM admins WHERE id = ? LIMIT 1', [req.session.admin.id]);
            if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

            const admin = rows[0];
            const ok = await verifyPassword(currentPassword, admin.password);
            if (!ok) return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });

            const hashed = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hashed, admin.id]);
            return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
        }

        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout error' });
        }
        res.json({ success: true });
    });
});

app.get('/api/auth/check', (req, res) => {

    if(req.session.admin){
        return res.json({
            success: true,
            logged: true,
            role: "admin",
            admin: req.session.admin
        });
    }

    if(req.session.user){
        return res.json({
            success: true,
            logged: true,
            role: "user",
            user: req.session.user
        });
    }

    res.json({ success: false, logged: false });

});

// --- Dashboard Stats API ---
app.get('/api/stats', async (req, res) => {
    try {
        const [productsCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
        const [ordersCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [pendingOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
        const [totalRevenue] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'");
        const [newsCount] = await pool.query('SELECT COUNT(*) as count FROM news WHERE is_active = TRUE');

        res.json({
            success: true,
            data: {
                products: productsCount[0].count,
                orders: ordersCount[0].count,
                pendingOrders: pendingOrders[0].count,
                revenue: totalRevenue[0].total,
                news: newsCount[0].count
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Search API ---
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        const [rows] = await pool.query(`
            SELECT * FROM products 
            WHERE is_active = TRUE AND (name LIKE ? OR description LIKE ?)
            ORDER BY created_at DESC
        `, [`%${q}%`, `%${q}%`]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== PAGE ROUTES ====================

// User pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'products.html'));
});
// Admin pages (phải đăng nhập mới vào được)
app.get('/admin/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/product/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product-detail.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'news.html'));
});

app.get('/why-tesla', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'why-tesla.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║                                                  ║
    ║       ĐẠT TESLA MOTORS - Server Started          ║
    ║                                                  ║
    ║       http://localhost:${PORT}                      ║
    ║                                                  ║
    ╚══════════════════════════════════════════════════╝
    `);
});

app.put("/api/news/:id", upload.single("thumbnail"), async (req,res)=>{

    const {title,content}=req.body
    const id=req.params.id

    let sql="UPDATE news SET title=?,content=?"
    let params=[title,content]

    if(req.file){
        sql+=",thumbnail=?"
        params.push("/images/uploads/"+req.file.filename)
    }

    sql+=" WHERE id=?"
    params.push(id)

    await pool.query(sql,params)

    res.json({success:true})

});
const cors = require('cors');
app.use(cors());