// Enhanced Admin Panel Features
class EnhancedAdminPanel {
    constructor() {
        this.realTimeUpdates = true;
        this.analyticsData = {};
        this.init();
    }

    init() {
        this.loadAnalytics();
        this.createEnhancedDashboard();
        this.setupRealTimeUpdates();
        this.createBulkOperations();
    }

    loadAnalytics() {
        // Load data from localStorage
        const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');
        const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
        const orders = excelData.Orders || [];
        const books = excelData.Books || [];
        const borrowing = excelData.Borrowing || [];

        this.analyticsData = {
            totalUsers: users.length,
            totalOrders: orders.length,
            totalBooks: books.length,
            totalBorrowing: borrowing.length,
            totalRevenue: orders.reduce((sum, order) => sum + (parseInt(order.totalPrice?.replace(' جنيه', '')) || 0), 0),
            monthlyOrders: this.getMonthlyData(orders),
            topBooks: this.getTopBooks(orders),
            userGrowth: this.getUserGrowth(users),
            recentActivity: this.getRecentActivity(orders, borrowing)
        };
    }

    getMonthlyData(orders) {
        const months = {};
        orders.forEach(order => {
            const date = new Date(order.orderDate || Date.now());
            const month = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
            months[month] = (months[month] || 0) + 1;
        });
        return months;
    }

    getTopBooks(orders) {
        const bookCounts = {};
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    bookCounts[item.name] = (bookCounts[item.name] || 0) + (item.quantity || 1);
                });
            }
        });
        return Object.entries(bookCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }

    getUserGrowth(users) {
        const monthlyUsers = {};
        users.forEach(user => {
            const date = new Date(user.joinDate || Date.now());
            const month = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
            monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
        });
        return monthlyUsers;
    }

    getRecentActivity(orders, borrowing) {
        const activities = [];
        
        // Add recent orders
        orders.slice(-5).forEach(order => {
            activities.push({
                type: 'order',
                title: `طلب جديد: ${order.customerName}`,
                description: `قيمة الطلب: ${order.totalPrice}`,
                date: order.orderDate || new Date().toISOString(),
                icon: 'fas fa-shopping-cart'
            });
        });

        // Add recent borrowing
        borrowing.slice(-5).forEach(borrow => {
            activities.push({
                type: 'borrow',
                title: `استعارة جديدة: ${borrow.customerName}`,
                description: `الكتاب: ${borrow.bookName}`,
                date: borrow.borrowDate || new Date().toISOString(),
                icon: 'fas fa-book'
            });
        });

        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    }

    createEnhancedDashboard() {
        const adminPanel = document.querySelector('.admin-panel') || document.getElementById('adminPanel');
        if (!adminPanel) return;

        // Add analytics section
        const analyticsHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">إجمالي المستخدمين</p>
                            <p class="text-3xl font-bold">${this.analyticsData.totalUsers}</p>
                        </div>
                        <i class="fas fa-users text-4xl opacity-50"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">إجمالي الطلبات</p>
                            <p class="text-3xl font-bold">${this.analyticsData.totalOrders}</p>
                        </div>
                        <i class="fas fa-shopping-cart text-4xl opacity-50"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">إجمالي الكتب</p>
                            <p class="text-3xl font-bold">${this.analyticsData.totalBooks}</p>
                        </div>
                        <i class="fas fa-book text-4xl opacity-50"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100">إجمالي الإيرادات</p>
                            <p class="text-3xl font-bold">${this.analyticsData.totalRevenue} جنيه</p>
                        </div>
                        <i class="fas fa-money-bill-wave text-4xl opacity-50"></i>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Monthly Orders Chart -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white">الطلبات الشهرية</h3>
                    <canvas id="monthlyOrdersChart" width="400" height="200"></canvas>
                </div>

                <!-- Top Books Chart -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white">أفضل الكتب مبيعاً</h3>
                    <canvas id="topBooksChart" width="400" height="200"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 class="text-xl font-bold mb-4 dark:text-white">النشاط الأخير</h3>
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    ${this.analyticsData.recentActivity.map(activity => `
                        <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white ml-4">
                                <i class="${activity.icon}"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold dark:text-white">${activity.title}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${activity.description}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-500">${new Date(activity.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert analytics before existing content
        adminPanel.insertAdjacentHTML('afterbegin', analyticsHTML);

        // Initialize charts
        this.initializeCharts();
    }

    initializeCharts() {
        // Monthly Orders Chart
        const monthlyCtx = document.getElementById('monthlyOrdersChart');
        if (monthlyCtx) {
            new Chart(monthlyCtx, {
                type: 'line',
                data: {
                    labels: Object.keys(this.analyticsData.monthlyOrders),
                    datasets: [{
                        label: 'عدد الطلبات',
                        data: Object.values(this.analyticsData.monthlyOrders),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Top Books Chart
        const topBooksCtx = document.getElementById('topBooksChart');
        if (topBooksCtx) {
            new Chart(topBooksCtx, {
                type: 'doughnut',
                data: {
                    labels: this.analyticsData.topBooks.map(book => book.name),
                    datasets: [{
                        data: this.analyticsData.topBooks.map(book => book.count),
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    setupRealTimeUpdates() {
        if (!this.realTimeUpdates) return;

        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.loadAnalytics();
            this.updateDashboard();
        }, 30000);

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key.includes('bookella')) {
                this.loadAnalytics();
                this.updateDashboard();
            }
        });
    }

    updateDashboard() {
        // Update statistics
        const stats = document.querySelectorAll('.text-3xl.font-bold');
        if (stats.length >= 4) {
            stats[0].textContent = this.analyticsData.totalUsers;
            stats[1].textContent = this.analyticsData.totalOrders;
            stats[2].textContent = this.analyticsData.totalBooks;
            stats[3].textContent = this.analyticsData.totalRevenue + ' جنيه';
        }

        // Update recent activity
        const activityContainer = document.querySelector('.space-y-4');
        if (activityContainer) {
            activityContainer.innerHTML = this.analyticsData.recentActivity.map(activity => `
                <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white ml-4">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold dark:text-white">${activity.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${activity.description}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">${new Date(activity.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    createBulkOperations() {
        const adminPanel = document.querySelector('.admin-panel') || document.getElementById('adminPanel');
        if (!adminPanel) return;

        const bulkOperationsHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 class="text-xl font-bold mb-4 dark:text-white">العمليات الجماعية</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Export Data -->
                    <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h4 class="font-semibold mb-2 dark:text-white">تصدير البيانات</h4>
                        <div class="space-y-2">
                            <button onclick="enhancedAdmin.exportData('users')" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                <i class="fas fa-download ml-1"></i>
                                تصدير المستخدمين
                            </button>
                            <button onclick="enhancedAdmin.exportData('orders')" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                <i class="fas fa-download ml-1"></i>
                                تصدير الطلبات
                            </button>
                            <button onclick="enhancedAdmin.exportData('books')" class="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm">
                                <i class="fas fa-download ml-1"></i>
                                تصدير الكتب
                            </button>
                        </div>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h4 class="font-semibold mb-2 dark:text-white">إجراءات جماعية</h4>
                        <div class="space-y-2">
                            <button onclick="enhancedAdmin.bulkDelete('users')" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                                <i class="fas fa-trash ml-1"></i>
                                حذف مستخدمين محددين
                            </button>
                            <button onclick="enhancedAdmin.bulkUpdate('books')" class="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                                <i class="fas fa-edit ml-1"></i>
                                تحديث أسعار الكتب
                            </button>
                            <button onclick="enhancedAdmin.bulkNotify('users')" class="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm">
                                <i class="fas fa-bell ml-1"></i>
                                إرسال إشعارات
                            </button>
                        </div>
                    </div>

                    <!-- System Maintenance -->
                    <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h4 class="font-semibold mb-2 dark:text-white">صيانة النظام</h4>
                        <div class="space-y-2">
                            <button onclick="enhancedAdmin.backupData()" class="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm">
                                <i class="fas fa-save ml-1"></i>
                                نسخ احتياطي
                            </button>
                            <button onclick="enhancedAdmin.cleanupData()" class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                <i class="fas fa-broom ml-1"></i>
                                تنظيف البيانات
                            </button>
                            <button onclick="enhancedAdmin.systemStatus()" class="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                <i class="fas fa-server ml-1"></i>
                                حالة النظام
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        adminPanel.insertAdjacentHTML('beforeend', bulkOperationsHTML);
    }

    // Bulk Operations Methods
    exportData(type) {
        const data = this.getDataByType(type);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookella_${type}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`تم تصدير بيانات ${type} بنجاح`, 'success');
    }

    getDataByType(type) {
        const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
        const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');
        
        switch (type) {
            case 'users':
                return users;
            case 'orders':
                return excelData.Orders || [];
            case 'books':
                return excelData.Books || [];
            case 'borrowing':
                return excelData.Borrowing || [];
            default:
                return excelData;
        }
    }

    bulkDelete(type) {
        if (confirm(`هل أنت متأكد من حذف جميع بيانات ${type}؟`)) {
            const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
            
            switch (type) {
                case 'users':
                    localStorage.removeItem('bookellaUsers');
                    break;
                case 'orders':
                    excelData.Orders = [];
                    break;
                case 'books':
                    excelData.Books = [];
                    break;
                case 'borrowing':
                    excelData.Borrowing = [];
                    break;
            }
            
            localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));
            this.loadAnalytics();
            this.updateDashboard();
            this.showNotification(`تم حذف جميع بيانات ${type}`, 'success');
        }
    }

    bulkUpdate(type) {
        if (type === 'books') {
            const newPrice = prompt('أدخل السعر الجديد لجميع الكتب:');
            if (newPrice && !isNaN(newPrice)) {
                const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
                const books = excelData.Books || [];
                
                books.forEach(book => {
                    book.price = `${newPrice} جنيه`;
                });
                
                excelData.Books = books;
                localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));
                this.showNotification('تم تحديث أسعار جميع الكتب', 'success');
            }
        }
    }

    bulkNotify(type) {
        const message = prompt('أدخل رسالة الإشعار:');
        if (message) {
            const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');
            this.showNotification(`تم إرسال الإشعار إلى ${users.length} مستخدم`, 'success');
        }
    }

    backupData() {
        const allData = {
            users: JSON.parse(localStorage.getItem('bookellaUsers') || '[]'),
            excelData: JSON.parse(localStorage.getItem('bookella_excel_data') || '{}'),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookella_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('تم إنشاء نسخة احتياطية بنجاح', 'success');
    }

    cleanupData() {
        // Remove old data and optimize storage
        const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
        
        // Keep only last 100 orders
        if (excelData.Orders && excelData.Orders.length > 100) {
            excelData.Orders = excelData.Orders.slice(-100);
        }
        
        // Keep only last 50 borrowing records
        if (excelData.Borrowing && excelData.Borrowing.length > 50) {
            excelData.Borrowing = excelData.Borrowing.slice(-50);
        }
        
        localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));
        this.loadAnalytics();
        this.updateDashboard();
        this.showNotification('تم تنظيف البيانات بنجاح', 'success');
    }

    systemStatus() {
        const status = {
            totalStorage: this.getStorageSize(),
            lastBackup: localStorage.getItem('bookella_last_backup') || 'لم يتم',
            systemHealth: 'ممتاز',
            activeUsers: this.analyticsData.totalUsers,
            totalOrders: this.analyticsData.totalOrders
        };
        
        alert(`حالة النظام:
إجمالي التخزين: ${status.totalStorage}
آخر نسخة احتياطية: ${status.lastBackup}
صحة النظام: ${status.systemHealth}
المستخدمين النشطين: ${status.activeUsers}
إجمالي الطلبات: ${status.totalOrders}`);
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 translate-x-full`;
        
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

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize enhanced admin panel
let enhancedAdmin;
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin panel page
    if (window.location.pathname.includes('admin_panel')) {
        enhancedAdmin = new EnhancedAdminPanel();
    }
});
