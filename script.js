// متغيرات عامة
let cart = [];
let cartTotal = 0;

// Excel Data Management Functions
function saveUserToExcel(user) {
    // Get existing Excel data or create new structure
    let excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');

    if (!excelData.Users) {
        excelData.Users = [];
    }

    // Add new user to Users sheet
    const userRecord = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: user.password, // In real app, this should be hashed
        points: user.points,
        level: user.level,
        joinDate: user.joinDate,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent
    };

    // Check if user already exists (by email)
    const existingUserIndex = excelData.Users.findIndex(u => u.email === user.email);
    if (existingUserIndex !== -1) {
        excelData.Users[existingUserIndex] = userRecord;
    } else {
        excelData.Users.push(userRecord);
    }

    // Save to localStorage (simulating Excel storage)
    localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));

    // In a real implementation, this would save to actual Excel file
    console.log('User saved to Excel structure:', userRecord);
}

function saveOrderToExcel(order) {
    let excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');

    if (!excelData.Orders) {
        excelData.Orders = [];
    }

    const orderRecord = {
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerPhoneAlt: order.customerPhoneAlt,
        customerAddress: order.customerAddress,
        bookCount: order.bookCount,
        bookNames: order.bookNames,
        totalPrice: order.totalPrice,
        discountCode: order.discountCode || '',
        orderDate: order.orderDate,
        status: 'pending'
    };

    excelData.Orders.push(orderRecord);
    localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));

    console.log('Order saved to Excel structure:', orderRecord);
}

function saveBookToExcel(book) {
    let excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');

    if (!excelData.Books) {
        excelData.Books = [];
    }

    const bookRecord = {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        category: book.category,
        description: book.description || '',
        imageUrl: book.imageUrl || '',
        isNew: book.isNew || false,
        isBestSeller: book.isBestSeller || false
    };

    // Check if book already exists
    const existingBookIndex = excelData.Books.findIndex(b => b.id === book.id);
    if (existingBookIndex !== -1) {
        excelData.Books[existingBookIndex] = bookRecord;
    } else {
        excelData.Books.push(bookRecord);
    }

    localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));

    console.log('Book saved to Excel structure:', bookRecord);
}

function saveBorrowingToExcel(borrowing) {
    let excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');

    if (!excelData.Borrowing) {
        excelData.Borrowing = [];
    }

    const borrowingRecord = {
        id: borrowing.id,
        customerName: borrowing.customerName,
        customerPhone: borrowing.customerPhone,
        serviceType: borrowing.serviceType, // 'study', 'vacation', 'large_books'
        duration: borrowing.duration,
        price: borrowing.price,
        borrowDate: borrowing.borrowDate,
        returnDate: borrowing.returnDate,
        status: 'active'
    };

    excelData.Borrowing.push(borrowingRecord);
    localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));

    console.log('Borrowing service saved to Excel structure:', borrowingRecord);
}

// Initialize Excel data with admin user
function initializeExcelData() {
    const adminUser = {
        id: 1,
        name: "George Rafat",
        phone: "+201508168771",
        email: "georgerafat255@gmail.com",
        password: "Georgerafat@30903302601911",
        points: 1000,
        level: "Admin",
        joinDate: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0
    };

    let excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');

    // Initialize sheets if they don't exist
    if (!excelData.Users) {
        excelData.Users = [adminUser];
    } else if (!excelData.Users.find(u => u.email === adminUser.email)) {
        excelData.Users.push(adminUser);
    }

    if (!excelData.Books) {
        excelData.Books = [];
    }

    if (!excelData.Orders) {
        excelData.Orders = [];
    }

    if (!excelData.Borrowing) {
        excelData.Borrowing = [];
    }

    localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));
    console.log('Excel data initialized with admin user');
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeExcelData();
    checkAuth();
});

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('bookella_current_user');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showUserInfo(user);
    } else {
        showLoginSection();
    }
}

// Show user information
function showUserInfo(user) {
    // Desktop
    const userSection = document.getElementById('userSection');
    const loginSection = document.getElementById('loginSection');
    const userName = document.getElementById('userName');
    const userPoints = document.getElementById('userPoints');
    const adminSection = document.getElementById('adminSection');

    if (userSection && loginSection && userName && userPoints) {
        userSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
        userName.textContent = user.name;
        userPoints.textContent = `${user.points} نقطة`;

        // Check if user is admin
        if (user.email === 'georgerafat255@gmail.com') {
            if (adminSection) {
                adminSection.classList.remove('hidden');
            }
        }
    }

    // Mobile
    const mobileUserSection = document.getElementById('mobileUserSection');
    const mobileLoginSection = document.getElementById('mobileLoginSection');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserPoints = document.getElementById('mobileUserPoints');
    const mobileAdminSection = document.getElementById('mobileAdminSection');

    if (mobileUserSection && mobileLoginSection && mobileUserName && mobileUserPoints) {
        mobileUserSection.classList.remove('hidden');
        mobileLoginSection.classList.add('hidden');
        mobileUserName.textContent = user.name;
        mobileUserPoints.textContent = `${user.points} نقطة`;

        // Check if user is admin
        if (user.email === 'georgerafat255@gmail.com') {
            if (mobileAdminSection) {
                mobileAdminSection.classList.remove('hidden');
            }
        }
    }
}

// Show login section
function showLoginSection() {
    const userSection = document.getElementById('userSection');
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const mobileUserSection = document.getElementById('mobileUserSection');
    const mobileLoginSection = document.getElementById('mobileLoginSection');
    const mobileAdminSection = document.getElementById('mobileAdminSection');

    if (userSection && loginSection) {
        userSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        if (adminSection) {
            adminSection.classList.add('hidden');
        }
    }

    if (mobileUserSection && mobileLoginSection) {
        mobileUserSection.classList.add('hidden');
        mobileLoginSection.classList.remove('hidden');
        if (mobileAdminSection) {
            mobileAdminSection.classList.add('hidden');
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('bookella_current_user');
    showLoginSection();
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    updateCartDisplay();

    // إضافة مستمع لحدث البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }

    // إضافة مستمع لحدث إرسال رسالة التواصل
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // إضافة مستمع لحدث إتمام الطلب
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutForm);
    }
});

// إضافة منتج إلى السلة
function addToCart(name, price, type) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            price: price,
            type: type
        });
    }

    // إذا كان نوع المنتج استعارة، احفظه في Excel
    if (type === 'rental') {
        const borrowingData = {
            id: Date.now(),
            customerName: 'مستخدم جديد', // سيتم تحديثه عند إتمام الطلب
            customerPhone: '',
            serviceType: name.includes('دراسة') ? 'study' : name.includes('إجازة') ? 'vacation' : 'large_books',
            duration: name.includes('دراسة') ? 'أسبوعين' : name.includes('إجازة') ? '7-10 أيام' : 'أسبوعين',
            price: price,
            borrowDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + (name.includes('دراسة') ? 14 : name.includes('إجازة') ? 10 : 14) * 24 * 60 * 60 * 1000).toISOString()
        };

        // حفظ في Excel structure
        saveBorrowingToExcel(borrowingData);
    }

    updateCartTotal();
    updateCartDisplay();
    saveCartToStorage();

    // رسالة تأكيد
    showNotification(`تم إضافة "${name}" إلى السلة`, 'success');
}

// إزالة منتج من السلة
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartTotal();
    updateCartDisplay();
    saveCartToStorage();

    showNotification('تم إزالة المنتج من السلة', 'success');
}

// تحديث كمية المنتج
function updateQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = newQuantity;
            updateCartTotal();
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// تحديث إجمالي السلة
function updateCartTotal() {
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const mobileCartBadge = document.getElementById('mobileCartBadge');

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">السلة فارغة</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.type === 'rental' ? 'استعارة' : 'شراء'}</p>
                            <p class="text-green-600 font-bold">${item.price} جنيه</p>
                        </div>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" 
                                    class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                                -
                            </button>
                            <span class="w-8 text-center font-semibold">${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" 
                                    class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                                +
                            </button>
                            <button onclick="removeFromCart(${item.id})" 
                                    class="text-red-500 hover:text-red-700 transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // تحديث عداد السلة
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartBadge) cartBadge.textContent = totalItems;
    if (mobileCartBadge) mobileCartBadge.textContent = totalItems;

    // تحديث إجمالي السعر
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        cartTotalElement.textContent = `${cartTotal} جنيه`;
    }
}

// فتح نافذة السلة
function openCart() {
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'info');
        return;
    }

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
    }
}

// إغلاق نافذة السلة
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// فتح نافذة إتمام الطلب
function openCheckout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'error');
        return;
    }

    // ملء البيانات التلقائية
    fillCheckoutForm();

    // إغلاق نافذة السلة
    closeCart();

    // فتح نافذة إتمام الطلب
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
    }
}

// إغلاق نافذة إتمام الطلب
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

// ملء نموذج إتمام الطلب
function fillCheckoutForm() {
    const bookCount = document.getElementById('bookCount');
    const bookNames = document.getElementById('bookNames');
    const totalPrice = document.getElementById('totalPrice');

    if (bookCount) {
        bookCount.value = cart.reduce((total, item) => total + item.quantity, 0);
    }

    if (bookNames) {
        bookNames.value = cart.map(item => `${item.name} (${item.quantity})`).join('\n');
    }

    if (totalPrice) {
        totalPrice.value = `${cartTotal} جنيه`;
    }
}

// معالجة نموذج إتمام الطلب
function handleCheckoutForm(e) {
    e.preventDefault();

    // جمع البيانات
    const formData = {
        id: Date.now(),
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerPhoneAlt: document.getElementById('customerPhoneAlt').value,
        bookCount: document.getElementById('bookCount').value,
        bookNames: document.getElementById('bookNames').value,
        customerAddress: document.getElementById('customerAddress').value,
        totalPrice: document.getElementById('totalPrice').value,
        discountCode: document.getElementById('discountCode').value,
        cartItems: cart,
        orderDate: new Date().toISOString(),
        orderId: generateOrderId()
    };

    // حفظ الطلب في localStorage
    saveOrder(formData);

    // حفظ العميل كـ user جديد
    saveCustomerAsUser(formData);

    // حفظ الطلب في Excel structure
    saveOrderToExcel(formData);

    // رسالة نجاح
    showNotification('تم إرسال طلبك بنجاح! تم حفظ البيانات في ملف Excel', 'success');

    // إفراغ السلة
    clearCart();

    // إغلاق النافذة
    closeCheckout();

    // إعادة تعيين النموذج
    e.target.reset();
}

// معالجة نموذج التواصل
function handleContactForm(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value,
        date: new Date().toISOString()
    };

    // حفظ رسالة التواصل
    saveContactMessage(formData);

    // رسالة نجاح
    showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');

    // إعادة تعيين النموذج
    e.target.reset();
}

// إفراغ السلة
function clearCart() {
    cart = [];
    cartTotal = 0;
    updateCartDisplay();
    saveCartToStorage();
    showNotification('تم إفراغ السلة', 'success');
}

// حفظ السلة في التخزين المحلي
function saveCartToStorage() {
    localStorage.setItem('bookellaCart', JSON.stringify(cart));
}

// تحميل السلة من التخزين المحلي
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('bookellaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartTotal();
    }
}

// حفظ الطلب
function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('bookellaOrders') || '[]');
    orders.push(orderData);
    localStorage.setItem('bookellaOrders', JSON.stringify(orders));
}

// حفظ رسالة التواصل
function saveContactMessage(messageData) {
    const messages = JSON.parse(localStorage.getItem('bookellaMessages') || '[]');
    messages.push(messageData);
    localStorage.setItem('bookellaMessages', JSON.stringify(messages));
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// حفظ العميل كـ user جديد
function saveCustomerAsUser(orderData) {
    const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');

    // التحقق من عدم وجود العميل مسبقاً
    const existingUser = users.find(user => user.phone === orderData.customerPhone);

    if (!existingUser) {
        // إنشاء بريد إلكتروني صحيح للعميل
        const cleanName = orderData.customerName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const timestamp = Date.now();
        const customerEmail = `${cleanName}${timestamp}@bookella.com`;

        const newUser = {
            id: Date.now(),
            name: orderData.customerName,
            phone: orderData.customerPhone,
            phoneAlt: orderData.customerPhoneAlt,
            address: orderData.customerAddress,
            email: customerEmail,
            points: 0,
            joinDate: new Date().toISOString(),
            totalOrders: 1,
            totalSpent: parseInt(orderData.totalPrice.replace(' جنيه', '')) || 0
        };

        users.push(newUser);
        localStorage.setItem('bookellaUsers', JSON.stringify(users));
    } else {
        // تحديث بيانات المستخدم الموجود
        existingUser.totalOrders += 1;
        existingUser.totalSpent += parseInt(orderData.totalPrice.replace(' جنيه', '')) || 0;
        existingUser.points += Math.floor((parseInt(orderData.totalPrice.replace(' جنيه', '')) || 0) / 10);

        const updatedUsers = users.map(user =>
            user.phone === orderData.customerPhone ? existingUser : user
        );
        localStorage.setItem('bookellaUsers', JSON.stringify(updatedUsers));
    }
}

// إنشاء معرف فريد للطلب
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// تصدير الطلب إلى Excel
function exportToExcel(orderData) {
    // إنشاء بيانات CSV
    const csvData = [
        ['معرف الطلب', 'التاريخ', 'الاسم', 'الهاتف', 'هاتف بديل', 'عدد الكتب', 'أسماء الكتب', 'العنوان', 'إجمالي السعر', 'كوبون الخصم'],
        [
            orderData.orderId,
            new Date(orderData.orderDate).toLocaleDateString('ar-EG'),
            orderData.customerName,
            orderData.customerPhone,
            orderData.customerPhoneAlt,
            orderData.bookCount,
            orderData.bookNames.replace(/\n/g, '; '),
            orderData.customerAddress,
            orderData.totalPrice,
            orderData.discountCode || 'لا يوجد'
        ]
    ];

    // تحويل البيانات إلى نص CSV
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // إنشاء ملف CSV
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `طلب_${orderData.orderId}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// البحث
function performSearch(query) {
    if (!query.trim()) {
        showNotification('يرجى إدخال كلمة بحث', 'warning');
        return;
    }

    // هنا يمكن إضافة منطق البحث الفعلي
    showNotification(`البحث عن: ${query}`, 'info');
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    // إزالة الإشعارات السابقة
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // إنشاء الإشعار الجديد
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 translate-x-full`;

    // تحديد لون الإشعار حسب النوع
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // إخفاء الإشعار تلقائياً
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// تبديل القائمة المتحركة
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// التمرير إلى قسم الخدمات
function scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// إغلاق النوافذ عند النقر خارجها
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');

    if (event.target === cartModal) {
        closeCart();
    }

    if (event.target === checkoutModal) {
        closeCheckout();
    }
}

// إغلاق النوافذ عند الضغط على ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCart();
        closeCheckout();
    }
});

// تحديث عداد السلة عند تحميل الصفحة
window.addEventListener('load', function() {
    updateCartDisplay();
});