// ==================== ĐẠT TESLA MOTORS - Main JavaScript ====================

// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem('tesla_cart')) || [];
const API_URL = '';

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(num);
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const createSlug = (str) => {
    return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// ==================== THEME TOGGLE ====================
const initTheme = () => {
    const theme = localStorage.getItem('tesla_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('tesla_theme', newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
};

// ==================== HEADER SCROLL ====================
const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// ==================== SCROLL TO TOP ====================
const initScrollTop = () => {
    const scrollBtn = document.querySelector('.scroll-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('active');
        } else {
            scrollBtn.classList.remove('active');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// ==================== MOBILE MENU ====================
const initMobileMenu = () => {
    const toggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu-close');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
};

// ==================== SEARCH ====================
const initSearch = () => {
    const searchBox = document.querySelector('.search-box');
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');

    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', () => {
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                searchInput.focus();
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
};

// ==================== ACCOUNT MENU ====================
const escapeHtml = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const initAccountMenu = async () => {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || document.querySelector('.account-menu')) return;

    const accountWrap = document.createElement('div');
    accountWrap.className = 'account-menu';
    accountWrap.innerHTML = `
        <button class="account-btn" title="Tài khoản">
            <i class="fas fa-user"></i>
        </button>
        <div class="account-dropdown">
            <div class="account-header">
                <div class="account-name">Khách</div>
                <div class="account-role">Chưa đăng nhập</div>
            </div>
            <div class="account-actions">
                <a href="/login.html" class="account-action account-login-link">
                    <i class="fas fa-sign-in-alt"></i> Đăng nhập
                </a>
                <a href="/register.html" class="account-action account-register-link">
                    <i class="fas fa-user-plus"></i> Đăng ký
                </a>
                <button class="account-action account-profile-btn" style="display:none;">
                    <i class="fas fa-id-card"></i> Thông tin tài khoản
                </button>
                <button class="account-action account-password-btn" style="display:none;">
                    <i class="fas fa-key"></i> Đổi mật khẩu
                </button>
                <button class="account-action account-logout-btn" style="display:none;">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
            </div>
        </div>
    `;

    const themeBtn = navActions.querySelector('.theme-toggle');
    navActions.insertBefore(accountWrap, themeBtn || null);

    const accountBtn = accountWrap.querySelector('.account-btn');
    const dropdown = accountWrap.querySelector('.account-dropdown');
    const nameEl = accountWrap.querySelector('.account-name');
    const roleEl = accountWrap.querySelector('.account-role');
    const loginLink = accountWrap.querySelector('.account-login-link');
    const registerLink = accountWrap.querySelector('.account-register-link');
    const profileBtn = accountWrap.querySelector('.account-profile-btn');
    const passwordBtn = accountWrap.querySelector('.account-password-btn');
    const logoutBtn = accountWrap.querySelector('.account-logout-btn');

    let profileData = null;

    const openProfileModal = () => {
        if (!profileData) return;
        const modal = document.createElement('div');
        modal.className = 'account-modal-overlay';
        modal.innerHTML = `
            <div class="account-modal">
                <div class="account-modal-title">Thông tin tài khoản</div>
                <div class="account-info-row"><span>Họ tên:</span><strong>${escapeHtml(profileData.full_name || '')}</strong></div>
                <div class="account-info-row"><span>Tên đăng nhập:</span><strong>${escapeHtml(profileData.username || '')}</strong></div>
                <div class="account-info-row"><span>Vai trò:</span><strong>${escapeHtml(profileData.role || '')}</strong></div>
                <div class="account-modal-actions">
                    <button class="btn btn-outline account-close-btn">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.account-close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    };

    const openPasswordModal = () => {
        const modal = document.createElement('div');
        modal.className = 'account-modal-overlay';
        modal.innerHTML = `
            <div class="account-modal">
                <div class="account-modal-title">Đổi mật khẩu</div>
                <form class="account-password-form">
                    <div class="form-group">
                        <label>Mật khẩu hiện tại</label>
                        <input type="password" name="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Mật khẩu mới</label>
                        <input type="password" name="newPassword" minlength="6" required>
                    </div>
                    <div class="form-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <input type="password" name="confirmPassword" minlength="6" required>
                    </div>
                    <div class="account-modal-actions">
                        <button type="button" class="btn btn-outline account-close-btn">Hủy</button>
                        <button type="submit" class="btn btn-primary">Lưu</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.account-close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        modal.querySelector('.account-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const currentPassword = String(fd.get('currentPassword') || '');
            const newPassword = String(fd.get('newPassword') || '');
            const confirmPassword = String(fd.get('confirmPassword') || '');

            if (newPassword !== confirmPassword) {
                showToast('Mật khẩu mới không khớp', 'error');
                return;
            }

            try {
                const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await res.json();
                if (!data.success) {
                    showToast(data.message || 'Đổi mật khẩu thất bại', 'error');
                    return;
                }
                showToast('Đổi mật khẩu thành công', 'success');
                modal.remove();
            } catch (err) {
                showToast('Không thể kết nối máy chủ', 'error');
            }
        });
    };

    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!accountWrap.contains(e.target)) dropdown.classList.remove('active');
    });

    try {
        const authRes = await fetch('/api/auth/check', { credentials: 'include' });
        const authData = await authRes.json();

        if (!authData.success) return;

        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        profileBtn.style.display = 'flex';
        passwordBtn.style.display = 'flex';
        logoutBtn.style.display = 'flex';

        const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
        const profileJson = await profileRes.json();
        if (profileJson.success) {
            profileData = profileJson.data;
            nameEl.textContent = profileData.full_name || profileData.username || 'Người dùng';
            roleEl.textContent = profileData.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
        }

        profileBtn.addEventListener('click', openProfileModal);
        passwordBtn.addEventListener('click', openPasswordModal);
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login.html';
        });
    } catch (error) {
        console.error('Account menu init error:', error);
    }
};

// ==================== CART FUNCTIONS ====================
const updateCartCount = () => {
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }
};

const saveCart = () => {
    localStorage.setItem('tesla_cart', JSON.stringify(cart));
    updateCartCount();
};

const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    showToast('Đã thêm vào giỏ hàng!', 'success');
};

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
};

const updateQuantity = (productId, change) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
};

const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const clearCart = () => {
    cart = [];
    saveCart();
};

// ==================== RENDER CART PAGE ====================
const renderCart = () => {
    const cartItemsEl = document.querySelector('.cart-items');
    const cartSummaryEl = document.querySelector('.cart-summary');
    
    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm xe vào giỏ hàng của bạn</p>
                <a href="/products" class="btn btn-primary">Xem sản phẩm</a>
            </div>
        `;
        if (cartSummaryEl) {
            cartSummaryEl.style.display = 'none';
        }
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image || '/images/placeholder-car.jpg'}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Tesla Electric Vehicle</p>
                <div class="quantity-control">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <div>
                <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
                <div class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Xóa
                </div>
            </div>
        </div>
    `).join('');

    // Update summary
    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    if (cartSummaryEl) {
        cartSummaryEl.style.display = 'block';
        cartSummaryEl.innerHTML = `
            <h3>Tổng đơn hàng</h3>
            <div class="summary-row">
                <span>Tạm tính (${cart.length} sản phẩm)</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
            </div>
            <div class="summary-row total">
                <span>Tổng cộng</span>
                <span>${formatCurrency(total)}</span>
            </div>
            <a href="/checkout" class="btn btn-primary">
                <i class="fas fa-credit-card"></i> Tiến hành thanh toán
            </a>
            <a href="/products" class="btn btn-outline" style="margin-top: 12px;">
                Tiếp tục mua sắm
            </a>
        `;
    }
};

// ==================== TOAST NOTIFICATIONS ====================
const showToast = (message, type = 'info') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ==================== LOAD PRODUCTS ====================
const loadProducts = async (options = {}) => {
    try {
        let url = `${API_URL}/api/products`;
        if (options.featured) {
            url = `${API_URL}/api/products/featured`;
        }
        if (options.search) {
            url = `${API_URL}/api/search?q=${encodeURIComponent(options.search)}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
};

const renderProducts = (products, container) => {
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-car"></i></div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Vui lòng thử lại với từ khóa khác</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-aos="fade-up">
            <div class="product-card-image">
                <img src="${product.image || '/images/placeholder-car.jpg'}" alt="${product.name}">
                ${product.is_featured ? '<span class="product-badge">Nổi bật</span>' : ''}
                <div class="product-actions">
                    <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" title="Thêm vào giỏ">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                    <button onclick="window.location.href='/product/${product.slug}'" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-card-content">
                <div class="product-card-category">${product.category_name || 'Tesla'}</div>
                <h3 class="product-card-title">${product.name}</h3>
                <div class="product-card-specs">
                    ${product.range_km ? `<span class="spec-item"><i class="fas fa-road"></i> ${product.range_km} km</span>` : ''}
                    ${product.acceleration ? `<span class="spec-item"><i class="fas fa-tachometer-alt"></i> ${product.acceleration}s</span>` : ''}
                    ${product.top_speed ? `<span class="spec-item"><i class="fas fa-bolt"></i> ${product.top_speed} km/h</span>` : ''}
                </div>
                <div class="product-card-price">
                    ${product.sale_price ? `<span class="price-old">${formatCurrency(product.price)}</span>` : ''}
                    <span class="price">${formatCurrency(product.sale_price || product.price)}</span>
                    <a href="/product/${product.slug}" class="btn btn-primary btn-icon">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
};

// ==================== LOAD PRODUCT DETAIL ====================
const loadProductDetail = async () => {
    const productInfoEl = document.querySelector('.product-info');
    const productGalleryEl = document.querySelector('.product-gallery');
    const relatedEl = document.getElementById('relatedProducts');
    
    if (!productInfoEl || !productGalleryEl) return;

    // Get slug from URL
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    try {
        const response = await fetch(`${API_URL}/api/products/slug/${slug}`);
        const result = await response.json();

        if (!result.success || !result.data) {
            window.location.href = '/products';
            return;
        }

        const product = result.data;
        document.title = `${product.name} - ĐẠT TESLA MOTORS`;

        productGalleryEl.innerHTML = `
            <div class="product-main-image">
                <img src="${product.image || '/images/placeholder-car.jpg'}" alt="${product.name}">
            </div>
        `;

        productInfoEl.innerHTML = `
            <div class="product-info-category">Premium Performance</div>
            <h1>${product.name}</h1>
            <div class="product-info-price">
                ${product.sale_price ? `<span class="price-old" style="font-size: 1.2rem; margin-right: 12px;">${formatCurrency(product.price)}</span>` : ''}
                ${formatCurrency(product.sale_price || product.price)}
            </div>
            <p class="product-info-desc">${product.description || 'Beyond the limits of engineering. The Model S is built from the ground up as an electric vehicle, with high-strength architecture and a floor-mounted battery pack for incredible occupant protection and low rollover risk.'}</p>
            
            <div class="product-specs">
                <div class="spec-box">
                    <div class="spec-box-value">${product.acceleration || '2.1'}s</div>
                    <div class="spec-box-label">0-100 km/h</div>
                </div>
                <div class="spec-box">
                    <div class="spec-box-value">${product.range_km || '652'} km</div>
                    <div class="spec-box-label">Range</div>
                </div>
                <div class="spec-box">
                    <div class="spec-box-value">${product.top_speed || '322'} km/h</div>
                    <div class="spec-box-label">Top Speed</div>
                </div>
            </div>
            
            <div class="product-actions-detail">
                <button class="btn btn-primary" onclick="window.location.href='/checkout'">
                    <i class="fas fa-bolt"></i> Mua ngay
                </button>
                <button class="btn btn-outline" onclick='addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})'>
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>
            </div>
        `;

        if (relatedEl) {
            const products = await loadProducts({});
            const related = products.filter(item => item.id !== product.id).slice(0, 3);
            if (related.length === 0) {
                relatedEl.innerHTML = '<div class="empty-state"><h3>Chưa có sản phẩm liên quan</h3></div>';
            } else {
                relatedEl.innerHTML = related.map(item => `
                    <div class="product-card">
                        <div class="product-card-image">
                            <img src="${item.image || '/images/placeholder-car.jpg'}" alt="${item.name}">
                            <span class="product-badge">NỔI BẬT</span>
                        </div>
                        <div class="product-card-content">
                            <div class="product-card-category">TESLA</div>
                            <h3 class="product-card-title">${item.name}</h3>
                            <div class="product-card-specs">
                                ${item.range_km ? `<span class="spec-item"><i class="fas fa-road"></i> ${item.range_km}km</span>` : ''}
                                ${item.acceleration ? `<span class="spec-item"><i class="fas fa-tachometer-alt"></i> ${item.acceleration}s</span>` : ''}
                            </div>
                            <div class="product-card-price">
                                <span class="price">${formatCurrency(item.sale_price || item.price)}</span>
                                <a href="/product/${item.slug}" class="btn btn-primary btn-icon"><i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
};

// ==================== LOAD NEWS ====================
const loadNews = async () => {
    const newsContainer = document.querySelector('.news-grid');
    if (!newsContainer) return;

    try {
        const response = await fetch(`${API_URL}/api/news`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            newsContainer.innerHTML = result.data.map(news => `
                <div class="news-card">
                    <div class="news-card-image">
                        <img src="${news.thumbnail || '/images/placeholder-news.jpg'}" alt="${news.title}">
                    </div>
                    <div class="news-card-content">
                        <div class="news-card-date"><i class="far fa-calendar"></i> ${formatDate(news.created_at)}</div>
                        <h3 class="news-card-title">${news.title}</h3>
                        <p class="news-card-excerpt">${news.content ? news.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''}</p>
                        <a href="/news/${news.slug}" class="btn btn-outline" style="margin-top: 16px;">Đọc thêm</a>
                    </div>
                </div>
            `).join('');
        } else {
            newsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-newspaper"></i></div>
                    <h3>Chưa có tin tức</h3>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
};

// ==================== CHECKOUT ====================
const initCheckout = () => {
    const checkoutForm = document.querySelector('.checkout-form form');
    const orderSummaryEl = document.querySelector('.order-summary');
    
    if (!checkoutForm || !orderSummaryEl) return;

    // Render order items
    if (cart.length === 0) {
        window.location.href = '/cart';
        return;
    }

    const subtotal = getCartTotal();
    
    orderSummaryEl.innerHTML = `
        <h3>Đơn hàng của bạn</h3>
        ${cart.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image || '/images/placeholder-car.jpg'}" alt="${item.name}">
                </div>
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>Số lượng: ${item.quantity}</p>
                </div>
                <div class="order-item-price">${formatCurrency(item.price * item.quantity)}</div>
            </div>
        `).join('')}
        <div style="padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px;">
            <div class="summary-row">
                <span>Tạm tính</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
            </div>
            <div class="summary-row total">
                <span>Tổng cộng</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
        </div>
    `;

    // Handle form submit
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');

        const formData = new FormData(checkoutForm);
        const orderData = {
            customer: {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address')
            },
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: subtotal,
            note: formData.get('note')
        };

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Show success modal
                showCheckoutSuccess(result.order_code);
                clearCart();
            } else {
                showToast('Đặt hàng thất bại: ' + result.message, 'error');
            }
        } catch (error) {
            showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
        } finally {
            submitBtn.classList.remove('loading');
        }
    });
};

const showCheckoutSuccess = (orderCode) => {
    const modal = document.createElement('div');
    modal.className = 'checkout-success';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Mã đơn hàng của bạn: <strong>${orderCode}</strong></p>
            <p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p>
            <a href="/" class="btn btn-primary" style="margin-top: 20px;">
                Về trang chủ
            </a>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 100);
};

// ==================== HOMEPAGE INIT ====================
const initHomepage = async () => {
    // Load featured products
    const featuredContainer = document.querySelector('.products-grid');
    if (featuredContainer) {
        featuredContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
        const products = await loadProducts({ featured: true });
        renderProducts(products, featuredContainer);
    }

    // Load news
    await loadNews();
};

// ==================== PRODUCTS PAGE INIT ====================
const initProductsPage = async () => {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;

    // Check for search query
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    productsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    const products = await loadProducts({ search: searchQuery });
    renderProducts(products, productsContainer);

    // Update page title if searching
    if (searchQuery) {
        const pageTitle = document.querySelector('.page-header h1');
        if (pageTitle) {
            pageTitle.textContent = `Kết quả tìm kiếm: "${searchQuery}"`;
        }
    }
};

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize common features
    initTheme();
    initHeaderScroll();
    initScrollTop();
    initMobileMenu();
    initSearch();
    initAccountMenu();
    updateCartCount();

    // Theme toggle button
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // Page specific initialization
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        initHomepage();
    } else if (path === '/products' || path === '/products.html') {
        initProductsPage();
    } else if (path.startsWith('/product/')) {
        loadProductDetail();
    } else if (path === '/cart' || path === '/cart.html') {
        renderCart();
    } else if (path === '/checkout' || path === '/checkout.html') {
        initCheckout();
    } else if (path === '/news' || path === '/news.html') {
        loadNews();
    }
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleTheme = toggleTheme;
