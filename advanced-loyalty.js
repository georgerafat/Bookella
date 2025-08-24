// Advanced Loyalty System
class AdvancedLoyaltySystem {
    constructor() {
        this.achievements = this.loadAchievements();
        this.referralCodes = JSON.parse(localStorage.getItem('bookella_referral_codes') || '{}');
        this.leaderboard = JSON.parse(localStorage.getItem('bookella_leaderboard') || '[]');
        this.seasonalChallenges = this.loadSeasonalChallenges();
        this.init();
    }

    init() {
        this.createLoyaltyInterface();
        this.setupEventListeners();
        this.updateLeaderboard();
        this.checkAchievements();
    }

    loadAchievements() {
        return [{
                id: 'first_order',
                title: 'أول طلب',
                description: 'أكمل أول طلب في Bookella',
                icon: 'fas fa-star',
                points: 50,
                condition: (user) => user.totalOrders >= 1,
                unlocked: false
            },
            {
                id: 'bookworm',
                title: 'قارئ نهم',
                description: 'اشترِ 10 كتب',
                icon: 'fas fa-book',
                points: 100,
                condition: (user) => user.totalOrders >= 10,
                unlocked: false
            },
            {
                id: 'loyal_customer',
                title: 'عميل مخلص',
                description: 'أكمل 20 طلب',
                icon: 'fas fa-heart',
                points: 200,
                condition: (user) => user.totalOrders >= 20,
                unlocked: false
            },
            {
                id: 'big_spender',
                title: 'مشتري كبير',
                description: 'أنفق 1000 جنيه',
                icon: 'fas fa-money-bill-wave',
                points: 300,
                condition: (user) => user.totalSpent >= 1000,
                unlocked: false
            },
            {
                id: 'referral_master',
                title: 'سيد الإحالة',
                description: 'أحل 5 أصدقاء',
                icon: 'fas fa-users',
                points: 500,
                condition: (user) => (user.referrals || 0) >= 5,
                unlocked: false
            },
            {
                id: 'monthly_champion',
                title: 'بطل الشهر',
                description: 'أكمل 5 طلبات في شهر واحد',
                icon: 'fas fa-trophy',
                points: 400,
                condition: (user) => this.getMonthlyOrders(user) >= 5,
                unlocked: false
            },
            {
                id: 'early_bird',
                title: 'طائر مبكر',
                description: 'سجل في أول 100 مستخدم',
                icon: 'fas fa-sun',
                points: 150,
                condition: (user) => user.id <= 100,
                unlocked: false
            },
            {
                id: 'reviewer',
                title: 'ناقد محترف',
                description: 'اكتب 10 تقييمات',
                icon: 'fas fa-pen',
                points: 250,
                condition: (user) => (user.reviews || 0) >= 10,
                unlocked: false
            }
        ];
    }

    loadSeasonalChallenges() {
        const currentMonth = new Date().getMonth();
        const challenges = {
            0: { // January
                title: 'تحدي العام الجديد',
                description: 'اشترِ 5 كتب في يناير',
                icon: 'fas fa-calendar',
                points: 300,
                condition: (user) => this.getMonthlyOrders(user, 0) >= 5
            },
            5: { // June
                title: 'تحدي الصيف',
                description: 'اقرأ 3 كتب في يونيو',
                icon: 'fas fa-sun',
                points: 250,
                condition: (user) => this.getMonthlyOrders(user, 5) >= 3
            },
            11: { // December
                title: 'تحدي الشتاء',
                description: 'اشترِ 7 كتب في ديسمبر',
                icon: 'fas fa-snowflake',
                points: 400,
                condition: (user) => this.getMonthlyOrders(user, 11) >= 7
            }
        };

        return challenges[currentMonth] || null;
    }

    createLoyaltyInterface() {
        const loyaltyContainer = document.querySelector('.loyalty-container') || document.getElementById('loyaltySection');
        if (!loyaltyContainer) return;

        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const userPoints = currentUser.points || 0;
        const userLevel = this.calculateLevel(userPoints);

        const loyaltyHTML = `
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold mb-2">نظام النقاط المتقدم</h2>
                    <p class="text-purple-100">ارتقِ بمستواك واحصل على مكافآت حصرية</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                        <i class="fas fa-star text-4xl mb-3"></i>
                        <h3 class="text-xl font-bold mb-2">النقاط الحالية</h3>
                        <p class="text-3xl font-bold">${userPoints}</p>
                    </div>
                    
                    <div class="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                        <i class="fas fa-crown text-4xl mb-3"></i>
                        <h3 class="text-xl font-bold mb-2">المستوى</h3>
                        <p class="text-3xl font-bold">${userLevel}</p>
                    </div>
                    
                    <div class="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                        <i class="fas fa-gift text-4xl mb-3"></i>
                        <h3 class="text-xl font-bold mb-2">المكافآت المتاحة</h3>
                        <p class="text-3xl font-bold">${this.getAvailableRewards(userPoints).length}</p>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-sm mb-2">
                        <span>المستوى ${userLevel}</span>
                        <span>المستوى ${userLevel + 1}</span>
                    </div>
                    <div class="w-full bg-white bg-opacity-30 rounded-full h-3">
                        <div class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width: ${this.getProgressPercentage(userPoints)}%"></div>
                    </div>
                    <p class="text-center text-sm mt-2">${this.getPointsToNextLevel(userPoints)} نقطة للوصول للمستوى التالي</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-8">
                <div class="flex flex-wrap gap-2 mb-6">
                    <button onclick="advancedLoyalty.showTab('achievements')" class="tab-btn active bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all">
                        <i class="fas fa-trophy ml-2"></i>
                        الإنجازات
                    </button>
                    <button onclick="advancedLoyalty.showTab('rewards')" class="tab-btn bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all">
                        <i class="fas fa-gift ml-2"></i>
                        المكافآت
                    </button>
                    <button onclick="advancedLoyalty.showTab('referral')" class="tab-btn bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all">
                        <i class="fas fa-users ml-2"></i>
                        برنامج الإحالة
                    </button>
                    <button onclick="advancedLoyalty.showTab('leaderboard')" class="tab-btn bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all">
                        <i class="fas fa-medal ml-2"></i>
                        لوحة المتصدرين
                    </button>
                    <button onclick="advancedLoyalty.showTab('challenges')" class="tab-btn bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all">
                        <i class="fas fa-fire ml-2"></i>
                        التحديات الموسمية
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="tabContent" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    ${this.renderAchievementsTab()}
                </div>
            </div>
        `;

        loyaltyContainer.innerHTML = loyaltyHTML;
    }

    showTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        const tabContent = document.getElementById('tabContent');
        switch (tabName) {
            case 'achievements':
                tabContent.innerHTML = this.renderAchievementsTab();
                break;
            case 'rewards':
                tabContent.innerHTML = this.renderRewardsTab();
                break;
            case 'referral':
                tabContent.innerHTML = this.renderReferralTab();
                break;
            case 'leaderboard':
                tabContent.innerHTML = this.renderLeaderboardTab();
                break;
            case 'challenges':
                tabContent.innerHTML = this.renderChallengesTab();
                break;
        }
    }

    renderAchievementsTab() {
            const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
            const unlockedAchievements = this.checkAchievements();

            return `
            <div>
                <h3 class="text-2xl font-bold mb-6 dark:text-white">الإنجازات</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.achievements.map(achievement => `
                        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 transition-all duration-300 ${achievement.unlocked ? 'border-green-500 bg-green-50 dark:bg-green-900' : 'border-gray-200 dark:border-gray-600'}">
                            <div class="text-center">
                                <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}">
                                    <i class="${achievement.icon} text-2xl"></i>
                                </div>
                                <h4 class="font-bold text-lg mb-2 dark:text-white">${achievement.title}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${achievement.description}</p>
                                <div class="flex items-center justify-center">
                                    <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        +${achievement.points} نقطة
                                    </span>
                                    ${achievement.unlocked ? '<i class="fas fa-check text-green-500 mr-2"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 text-center">
                    <p class="text-gray-600 dark:text-gray-400">
                        الإنجازات المفتوحة: ${unlockedAchievements.length} من ${this.achievements.length}
                    </p>
                </div>
            </div>
        `;
    }

    renderRewardsTab() {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const userPoints = currentUser.points || 0;
        const availableRewards = this.getAvailableRewards(userPoints);

        return `
            <div>
                <h3 class="text-2xl font-bold mb-6 dark:text-white">المكافآت المتاحة</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${availableRewards.map(reward => `
                        <div class="reward-card bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                            <div class="text-center">
                                <i class="${reward.icon} text-4xl mb-4"></i>
                                <h4 class="font-bold text-xl mb-2">${reward.title}</h4>
                                <p class="text-green-100 mb-4">${reward.description}</p>
                                <div class="flex items-center justify-between">
                                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                        ${reward.pointsRequired} نقطة
                                    </span>
                                    <button onclick="advancedLoyalty.claimReward('${reward.id}')" class="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors">
                                        استبدال
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${availableRewards.length === 0 ? `
                    <div class="text-center py-8">
                        <i class="fas fa-gift text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 dark:text-gray-400">لا توجد مكافآت متاحة حالياً</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderReferralTab() {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const referralCode = this.generateReferralCode(currentUser.email);
        const referrals = currentUser.referrals || 0;

        return `
            <div>
                <h3 class="text-2xl font-bold mb-6 dark:text-white">برنامج الإحالة</h3>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-6">
                    <div class="text-center">
                        <i class="fas fa-users text-4xl mb-4"></i>
                        <h4 class="text-xl font-bold mb-2">أحل أصدقاءك واحصل على نقاط</h4>
                        <p class="text-purple-100 mb-4">احصل على 100 نقطة لكل صديق يسجل باستخدام كودك</p>
                        
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                            <p class="text-sm text-purple-100 mb-2">كود الإحالة الخاص بك:</p>
                            <div class="flex items-center justify-center">
                                <input type="text" value="${referralCode}" readonly class="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-center w-48">
                                <button onclick="advancedLoyalty.copyReferralCode('${referralCode}')" class="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold mr-2 hover:bg-purple-50 transition-colors">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <p class="text-2xl font-bold">${referrals}</p>
                                <p class="text-sm text-purple-100">الأصدقاء المحالون</p>
                            </div>
                            <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <p class="text-2xl font-bold">${referrals * 100}</p>
                                <p class="text-sm text-purple-100">النقاط المكتسبة</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 class="font-bold text-lg mb-4 dark:text-white">كيف يعمل برنامج الإحالة؟</h4>
                    <div class="space-y-3">
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                            <p class="text-gray-600 dark:text-gray-400">انسخ كود الإحالة الخاص بك</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                            <p class="text-gray-600 dark:text-gray-400">شارك الكود مع أصدقائك</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                            <p class="text-gray-600 dark:text-gray-400">احصل على 100 نقطة عند تسجيلهم</p>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                            <p class="text-gray-600 dark:text-gray-400">استبدل النقاط بمكافآت حصرية</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeaderboardTab() {
        return `
            <div>
                <h3 class="text-2xl font-bold mb-6 dark:text-white">لوحة المتصدرين</h3>
                
                <div class="space-y-4">
                    ${this.leaderboard.slice(0, 10).map((user, index) => `
                        <div class="leaderboard-item flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-500 text-white' :
                                'bg-blue-500 text-white'
                            }">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold dark:text-white">${user.name}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">المستوى ${this.calculateLevel(user.points)}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-green-600 dark:text-green-400">${user.points} نقطة</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${user.totalOrders} طلب</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.leaderboard.length === 0 ? `
                    <div class="text-center py-8">
                        <i class="fas fa-medal text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 dark:text-gray-400">لا توجد بيانات متاحة حالياً</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderChallengesTab() {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const challenge = this.seasonalChallenges;

        return `
            <div>
                <h3 class="text-2xl font-bold mb-6 dark:text-white">التحديات الموسمية</h3>
                
                ${challenge ? `
                    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-8 text-center">
                        <i class="${challenge.icon} text-6xl mb-4"></i>
                        <h4 class="text-2xl font-bold mb-2">${challenge.title}</h4>
                        <p class="text-red-100 mb-6">${challenge.description}</p>
                        
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-between">
                                <span>التقدم</span>
                                <span>${this.getMonthlyOrders(currentUser, new Date().getMonth())} / ${challenge.condition.toString().match(/\d+/)[0]}</span>
                            </div>
                            <div class="w-full bg-white bg-opacity-30 rounded-full h-3 mt-2">
                                <div class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width: ${Math.min(100, (this.getMonthlyOrders(currentUser, new Date().getMonth()) / parseInt(challenge.condition.toString().match(/\d+/)[0])) * 100)}%"></div>
                            </div>
                        </div>
                        
                        <div class="bg-white bg-opacity-20 rounded-lg p-4">
                            <p class="text-3xl font-bold">+${challenge.points} نقطة</p>
                            <p class="text-sm text-red-100">مكافأة التحدي</p>
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-8">
                        <i class="fas fa-fire text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 dark:text-gray-400">لا توجد تحديات موسمية حالياً</p>
                        <p class="text-sm text-gray-500 dark:text-gray-500">عد في الشهر القادم!</p>
                    </div>
                `}
            </div>
        `;
    }

    setupEventListeners() {
        // Listen for order completion
        document.addEventListener('orderCompleted', (e) => {
            this.addPoints(e.detail.points);
            this.checkAchievements();
            this.updateLeaderboard();
        });
    }

    calculateLevel(points) {
        return Math.floor(points / 100) + 1;
    }

    getProgressPercentage(points) {
        const level = this.calculateLevel(points);
        const pointsInCurrentLevel = points % 100;
        return pointsInCurrentLevel;
    }

    getPointsToNextLevel(points) {
        const pointsInCurrentLevel = points % 100;
        return 100 - pointsInCurrentLevel;
    }

    getAvailableRewards(userPoints) {
        const rewards = [
            {
                id: 'discount_10',
                title: 'خصم 10%',
                description: 'خصم 10% على الطلب التالي',
                icon: 'fas fa-percentage',
                pointsRequired: 200
            },
            {
                id: 'free_shipping',
                title: 'شحن مجاني',
                description: 'شحن مجاني للطلب التالي',
                icon: 'fas fa-shipping-fast',
                pointsRequired: 300
            },
            {
                id: 'discount_20',
                title: 'خصم 20%',
                description: 'خصم 20% على الطلب التالي',
                icon: 'fas fa-percentage',
                pointsRequired: 500
            },
            {
                id: 'free_book',
                title: 'كتاب مجاني',
                description: 'كتاب مجاني من اختيارك',
                icon: 'fas fa-book',
                pointsRequired: 1000
            }
        ];

        return rewards.filter(reward => userPoints >= reward.pointsRequired);
    }

    checkAchievements() {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        let newAchievements = 0;

        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition(currentUser)) {
                achievement.unlocked = true;
                this.addPoints(achievement.points);
                this.showAchievementNotification(achievement);
                newAchievements++;
            }
        });

        return this.achievements.filter(a => a.unlocked);
    }

    addPoints(points) {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        currentUser.points = (currentUser.points || 0) + points;
        localStorage.setItem('bookella_current_user', JSON.stringify(currentUser));

        // Update user in users list
        const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].points = currentUser.points;
            localStorage.setItem('bookellaUsers', JSON.stringify(users));
        }

        // Update Excel data
        const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
        const excelUsers = excelData.Users || [];
        const excelUserIndex = excelUsers.findIndex(u => u.email === currentUser.email);
        if (excelUserIndex !== -1) {
            excelUsers[excelUserIndex].points = currentUser.points;
            excelData.Users = excelUsers;
            localStorage.setItem('bookella_excel_data', JSON.stringify(excelData));
        }
    }

    generateReferralCode(email) {
        if (!this.referralCodes[email]) {
            const code = 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();
            this.referralCodes[email] = code;
            localStorage.setItem('bookella_referral_codes', JSON.stringify(this.referralCodes));
        }
        return this.referralCodes[email];
    }

    copyReferralCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('تم نسخ كود الإحالة', 'success');
        });
    }

    claimReward(rewardId) {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const reward = this.getAvailableRewards(currentUser.points).find(r => r.id === rewardId);
        
        if (reward) {
            this.addPoints(-reward.pointsRequired);
            this.showNotification(`تم استبدال مكافأة: ${reward.title}`, 'success');
            
            // Add reward to user's claimed rewards
            currentUser.claimedRewards = currentUser.claimedRewards || [];
            currentUser.claimedRewards.push({
                id: rewardId,
                title: reward.title,
                claimedAt: new Date().toISOString()
            });
            localStorage.setItem('bookella_current_user', JSON.stringify(currentUser));
        }
    }

    updateLeaderboard() {
        const users = JSON.parse(localStorage.getItem('bookellaUsers') || '[]');
        this.leaderboard = users
            .filter(user => user.points > 0)
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 50);
        
        localStorage.setItem('bookella_leaderboard', JSON.stringify(this.leaderboard));
    }

    getMonthlyOrders(user, month = null) {
        const excelData = JSON.parse(localStorage.getItem('bookella_excel_data') || '{}');
        const orders = excelData.Orders || [];
        
        if (!month) {
            return orders.filter(order => order.customerEmail === user.email).length;
        }
        
        return orders.filter(order => {
            const orderDate = new Date(order.orderDate || Date.now());
            return order.customerEmail === user.email && orderDate.getMonth() === month;
        }).length;
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${achievement.icon} text-2xl mr-3"></i>
                <div>
                    <h4 class="font-bold">إنجاز جديد!</h4>
                    <p class="text-sm">${achievement.title} - +${achievement.points} نقطة</p>
                </div>
            </div>
        `;
        
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
        }, 5000);
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

// Initialize advanced loyalty system
let advancedLoyalty;
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on loyalty system page
    if (window.location.pathname.includes('loyalty_system')) {
        advancedLoyalty = new AdvancedLoyaltySystem();
    }
});