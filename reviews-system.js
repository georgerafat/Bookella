// Review and Rating System
class ReviewSystem {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('bookella_reviews') || '[]');
        this.pendingReviews = JSON.parse(localStorage.getItem('bookella_pending_reviews') || '[]');
        this.init();
    }

    init() {
        this.createReviewInterface();
        this.setupEventListeners();
        this.loadReviews();
    }

    createReviewInterface() {
            // Add review section to book cards
            const bookCards = document.querySelectorAll('.book-card');
            bookCards.forEach(card => {
                        if (!card.querySelector('.review-section')) {
                            const reviewSection = document.createElement('div');
                            reviewSection.className = 'review-section mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';
                            reviewSection.innerHTML = `
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-bold dark:text-white">التقييمات</h4>
                        <button onclick="reviewSystem.showReviewModal('${card.dataset.bookId || 'book1'}')" class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <i class="fas fa-star ml-1"></i>
                            أضف تقييم
                        </button>
                    </div>
                    
                    <div class="rating-summary mb-3">
                        <div class="flex items-center">
                            <div class="flex items-center mr-2">
                                ${this.generateStars(4.2)}
                            </div>
                            <span class="text-sm text-gray-600 dark:text-gray-400">4.2 من 5 (12 تقييم)</span>
                        </div>
                    </div>
                    
                    <div class="reviews-list max-h-32 overflow-y-auto">
                        ${this.getBookReviews(card.dataset.bookId || 'book1').slice(0, 2).map(review => `
                            <div class="review-item border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="flex items-center mr-2">
                                            ${this.generateStars(review.rating)}
                                        </div>
                                        <span class="text-sm font-semibold dark:text-white">${review.userName}</span>
                                    </div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">${this.formatDate(review.date)}</span>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${review.comment}</p>
                                <div class="flex items-center mt-2">
                                    <button onclick="reviewSystem.toggleHelpful('${review.id}')" class="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                        <i class="fas fa-thumbs-up ml-1"></i>
                                        مفيد (${review.helpfulVotes || 0})
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${this.getBookReviews(card.dataset.bookId || 'book1').length > 2 ? `
                        <button onclick="reviewSystem.showAllReviews('${card.dataset.bookId || 'book1'}')" class="text-blue-500 hover:text-blue-700 text-sm font-medium">
                            عرض جميع التقييمات (${this.getBookReviews(card.dataset.bookId || 'book1').length})
                        </button>
                    ` : ''}
                `;
                card.appendChild(reviewSection);
            }
        });
    }

    setupEventListeners() {
        // Listen for review submissions
        document.addEventListener('reviewSubmitted', (e) => {
            this.addReview(e.detail);
        });
    }

    showReviewModal(bookId) {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        if (!currentUser.email) {
            alert('يجب تسجيل الدخول لإضافة تقييم');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'reviewModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-bold dark:text-white">أضف تقييمك</h3>
                    <button onclick="this.closest('#reviewModal').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form onsubmit="reviewSystem.submitReview(event, '${bookId}')" class="p-6">
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 font-bold mb-2">التقييم</label>
                        <div class="flex items-center space-x-2 space-x-reverse">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <button type="button" onclick="reviewSystem.setRating(${star})" class="rating-star text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${star}">
                                    <i class="fas fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">اضغط على النجوم لتقييم الكتاب</p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 font-bold mb-2">التعليق</label>
                        <textarea id="reviewComment" required class="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" rows="4" placeholder="اكتب تعليقك عن الكتاب..."></textarea>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all">
                            <i class="fas fa-paper-plane ml-2"></i>
                            إرسال التقييم
                        </button>
                        <button type="button" onclick="this.closest('#reviewModal').remove()" class="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    setRating(rating) {
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
        
        // Store rating for form submission
        document.getElementById('reviewModal').dataset.rating = rating;
    }

    submitReview(event, bookId) {
        event.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const rating = parseInt(document.getElementById('reviewModal').dataset.rating) || 0;
        const comment = document.getElementById('reviewComment').value;
        
        if (rating === 0) {
            alert('يرجى اختيار تقييم');
            return;
        }
        
        const review = {
            id: Date.now().toString(),
            bookId: bookId,
            userId: currentUser.email,
            userName: currentUser.name,
            rating: rating,
            comment: comment,
            date: new Date().toISOString(),
            helpfulVotes: 0,
            status: 'pending', // pending, approved, rejected
            moderatedBy: null,
            moderatedAt: null
        };
        
        // Add to pending reviews for admin moderation
        this.pendingReviews.push(review);
        localStorage.setItem('bookella_pending_reviews', JSON.stringify(this.pendingReviews));
        
        // Close modal
        document.getElementById('reviewModal').remove();
        
        // Show success message
        this.showNotification('تم إرسال تقييمك بنجاح! سيتم مراجعته قريباً', 'success');
        
        // Trigger event
        document.dispatchEvent(new CustomEvent('reviewSubmitted', { detail: review }));
    }

    getBookReviews(bookId) {
        return this.reviews.filter(review => review.bookId === bookId && review.status === 'approved');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-yellow-400"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-yellow-400"></i>';
        }
        
        return starsHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    toggleHelpful(reviewId) {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        if (!currentUser.email) {
            alert('يجب تسجيل الدخول للتصويت');
            return;
        }
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpfulVotes = (review.helpfulVotes || 0) + 1;
            localStorage.setItem('bookella_reviews', JSON.stringify(this.reviews));
            this.showNotification('تم تسجيل تصويتك!', 'success');
        }
    }

    showAllReviews(bookId) {
        const bookReviews = this.getBookReviews(bookId);
        
        const modal = document.createElement('div');
        modal.id = 'allReviewsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-bold dark:text-white">جميع التقييمات</h3>
                    <button onclick="this.closest('#allReviewsModal').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    ${bookReviews.length > 0 ? bookReviews.map(review => `
                        <div class="review-item border-b border-gray-200 dark:border-gray-600 pb-4 mb-4 last:border-b-0">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center">
                                    <div class="flex items-center mr-3">
                                        ${this.generateStars(review.rating)}
                                    </div>
                                    <span class="font-semibold dark:text-white">${review.userName}</span>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400">${this.formatDate(review.date)}</span>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 mb-3">${review.comment}</p>
                            <div class="flex items-center justify-between">
                                <button onclick="reviewSystem.toggleHelpful('${review.id}')" class="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                    <i class="fas fa-thumbs-up ml-1"></i>
                                    مفيد (${review.helpfulVotes || 0})
                                </button>
                                ${review.moderatedBy ? `
                                    <span class="text-xs text-green-600 dark:text-green-400">
                                        <i class="fas fa-check-circle ml-1"></i>
                                        مراجع من الإدارة
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8">
                            <i class="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600 dark:text-gray-400">لا توجد تقييمات لهذا الكتاب بعد</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Admin moderation functions
    showModerationPanel() {
        const modal = document.createElement('div');
        modal.id = 'moderationModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-bold dark:text-white">مراجعة التقييمات</h3>
                    <button onclick="this.closest('#moderationModal').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    ${this.pendingReviews.length > 0 ? this.pendingReviews.map(review => `
                        <div class="review-item border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center">
                                    <div class="flex items-center mr-3">
                                        ${this.generateStars(review.rating)}
                                    </div>
                                    <span class="font-semibold dark:text-white">${review.userName}</span>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400">${this.formatDate(review.date)}</span>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">${review.comment}</p>
                            <div class="flex gap-2">
                                <button onclick="reviewSystem.moderateReview('${review.id}', 'approved')" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                    <i class="fas fa-check ml-1"></i>
                                    موافقة
                                </button>
                                <button onclick="reviewSystem.moderateReview('${review.id}', 'rejected')" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                                    <i class="fas fa-times ml-1"></i>
                                    رفض
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8">
                            <i class="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
                            <p class="text-gray-600 dark:text-gray-400">لا توجد تقييمات تنتظر المراجعة</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    moderateReview(reviewId, status) {
        const currentUser = JSON.parse(localStorage.getItem('bookella_current_user') || '{}');
        const reviewIndex = this.pendingReviews.findIndex(r => r.id === reviewId);
        
        if (reviewIndex !== -1) {
            const review = this.pendingReviews[reviewIndex];
            review.status = status;
            review.moderatedBy = currentUser.email;
            review.moderatedAt = new Date().toISOString();
            
            if (status === 'approved') {
                this.reviews.push(review);
                localStorage.setItem('bookella_reviews', JSON.stringify(this.reviews));
            }
            
            this.pendingReviews.splice(reviewIndex, 1);
            localStorage.setItem('bookella_pending_reviews', JSON.stringify(this.pendingReviews));
            
            this.showNotification(`تم ${status === 'approved' ? 'الموافقة على' : 'رفض'} التقييم`, 'success');
            
            // Refresh moderation panel
            document.getElementById('moderationModal').remove();
            this.showModerationPanel();
        }
    }

    loadReviews() {
        // Load reviews from localStorage
        this.reviews = JSON.parse(localStorage.getItem('bookella_reviews') || '[]');
        this.pendingReviews = JSON.parse(localStorage.getItem('bookella_pending_reviews') || '[]');
    }

    getReviewStats() {
        const approvedReviews = this.reviews.filter(r => r.status === 'approved');
        const pendingReviews = this.pendingReviews.length;
        
        return {
            total: this.reviews.length + this.pendingReviews.length,
            approved: approvedReviews.length,
            pending: pendingReviews,
            averageRating: approvedReviews.length > 0 
                ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
                : 0
        };
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

// Initialize review system
let reviewSystem;
document.addEventListener('DOMContentLoaded', () => {
    reviewSystem = new ReviewSystem();
});

// Add moderation button to admin panel
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin_panel')) {
        const adminPanel = document.querySelector('.admin-panel') || document.getElementById('adminPanel');
        if (adminPanel) {
            const moderationButton = document.createElement('button');
            moderationButton.className = 'bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-all shadow-lg';
            moderationButton.innerHTML = '<i class="fas fa-comments ml-2"></i> مراجعة التقييمات';
            moderationButton.onclick = () => reviewSystem.showModerationPanel();
            
            // Insert after existing buttons
            const existingButtons = adminPanel.querySelectorAll('button');
            if (existingButtons.length > 0) {
                existingButtons[existingButtons.length - 1].parentNode.insertBefore(moderationButton, existingButtons[existingButtons.length - 1].nextSibling);
            }
        }
    }
});