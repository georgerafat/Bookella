// Enhanced Search System
class EnhancedSearch {
    constructor() {
        this.searchHistory = JSON.parse(localStorage.getItem('bookella_search_history') || '[]');
        this.suggestions = [];
        this.init();
    }

    init() {
        this.createSearchInterface();
        this.setupEventListeners();
        this.loadSearchHistory();
    }

    createSearchInterface() {
        const searchContainer = document.querySelector('.search-container') || document.getElementById('searchSection');
        if (!searchContainer) return;

        // Enhanced search input
        const enhancedSearchHTML = `
            <div class="relative max-w-2xl mx-auto">
                <div class="relative">
                    <input type="text" 
                           id="enhancedSearchInput" 
                           class="w-full px-4 py-3 pr-12 pl-16 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                           placeholder="ابحث عن الكتب، المؤلفين، الفئات..."
                           autocomplete="off">
                    
                    <!-- Voice Search Button -->
                    <button id="voiceSearchBtn" 
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            title="البحث الصوتي">
                        <i class="fas fa-microphone"></i>
                    </button>
                    
                    <!-- Search Button -->
                    <button id="searchBtn" 
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <!-- Search Suggestions -->
                <div id="searchSuggestions" class="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 hidden z-50">
                    <div id="suggestionsList" class="max-h-64 overflow-y-auto"></div>
                </div>

                <!-- Advanced Filters -->
                <div class="mt-4 flex flex-wrap gap-4 justify-center">
                    <select id="categoryFilter" class="px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">جميع الفئات</option>
                        <option value="arabic">كتب عربية</option>
                        <option value="english">كتب إنجليزية</option>
                        <option value="novels">روايات</option>
                        <option value="science">كتب علمية</option>
                        <option value="history">كتب تاريخية</option>
                    </select>

                    <select id="priceFilter" class="px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">جميع الأسعار</option>
                        <option value="0-50">أقل من 50 جنيه</option>
                        <option value="50-100">50 - 100 جنيه</option>
                        <option value="100-200">100 - 200 جنيه</option>
                        <option value="200+">أكثر من 200 جنيه</option>
                    </select>

                    <select id="ratingFilter" class="px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">جميع التقييمات</option>
                        <option value="5">5 نجوم</option>
                        <option value="4">4+ نجوم</option>
                        <option value="3">3+ نجوم</option>
                    </select>
                </div>

                <!-- Search History -->
                <div id="searchHistory" class="mt-4 hidden">
                    <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">سجل البحث:</h4>
                    <div id="historyList" class="flex flex-wrap gap-2"></div>
                </div>
            </div>
        `;

        searchContainer.innerHTML = enhancedSearchHTML;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('enhancedSearchInput');
        const voiceBtn = document.getElementById('voiceSearchBtn');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
            searchInput.addEventListener('focus', () => this.showSearchHistory());
            searchInput.addEventListener('blur', () => setTimeout(() => this.hideSuggestions(), 200));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceSearch());
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        // Filter change listeners
        ['categoryFilter', 'priceFilter', 'ratingFilter'].forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    handleSearchInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        this.generateSuggestions(query);
        this.showSuggestions();
    }

    generateSuggestions(query) {
        // Mock suggestions - in real app, this would come from backend
        const allSuggestions = [
            'روايات عربية', 'كتب إنجليزية', 'كتب علمية', 'كتب تاريخية',
            'روايات رومانسية', 'كتب تطوير الذات', 'كتب الأطفال',
            'أحمد خالد توفيق', 'نجيب محفوظ', 'طه حسين', 'جلال الدين الرومي'
        ];

        this.suggestions = allSuggestions.filter(suggestion => 
            suggestion.includes(query) || suggestion.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        this.renderSuggestions();
    }

    renderSuggestions() {
        const suggestionsList = document.getElementById('suggestionsList');
        if (!suggestionsList) return;

        suggestionsList.innerHTML = this.suggestions.map(suggestion => `
            <div class="suggestion-item px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                 onclick="enhancedSearch.selectSuggestion('${suggestion}')">
                <i class="fas fa-search text-gray-400 ml-2"></i>
                ${suggestion}
            </div>
        `).join('');
    }

    selectSuggestion(suggestion) {
        document.getElementById('enhancedSearchInput').value = suggestion;
        this.hideSuggestions();
        this.performSearch();
    }

    showSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) suggestions.classList.remove('hidden');
    }

    hideSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) suggestions.classList.add('hidden');
    }

    showSearchHistory() {
        const history = document.getElementById('searchHistory');
        if (history && this.searchHistory.length > 0) {
            history.classList.remove('hidden');
            this.renderSearchHistory();
        }
    }

    renderSearchHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = this.searchHistory.slice(0, 5).map(item => `
            <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onclick="enhancedSearch.selectSuggestion('${item}')">
                ${item} <i class="fas fa-times text-gray-500 hover:text-red-500" onclick="event.stopPropagation(); enhancedSearch.removeFromHistory('${item}')"></i>
            </span>
        `).join('');
    }

    removeFromHistory(item) {
        this.searchHistory = this.searchHistory.filter(h => h !== item);
        localStorage.setItem('bookella_search_history', JSON.stringify(this.searchHistory));
        this.renderSearchHistory();
    }

    loadSearchHistory() {
        this.searchHistory = JSON.parse(localStorage.getItem('bookella_search_history') || '[]');
    }

    performSearch() {
        const query = document.getElementById('enhancedSearchInput')?.value;
        if (!query || query.trim() === '') return;

        // Add to search history
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
            localStorage.setItem('bookella_search_history', JSON.stringify(this.searchHistory));
        }

        // Apply filters
        const filters = this.getActiveFilters();
        
        // Perform search with filters
        this.executeSearch(query, filters);
        
        this.hideSuggestions();
    }

    getActiveFilters() {
        return {
            category: document.getElementById('categoryFilter')?.value || '',
            price: document.getElementById('priceFilter')?.value || '',
            rating: document.getElementById('ratingFilter')?.value || ''
        };
    }

    applyFilters() {
        const query = document.getElementById('enhancedSearchInput')?.value;
        if (query) {
            this.performSearch();
        }
    }

    executeSearch(query, filters) {
        // Mock search results - in real app, this would call backend
        console.log('Searching for:', query, 'with filters:', filters);
        
        // Show loading state
        this.showSearchResults([
            { title: 'نتائج البحث عن: ' + query, type: 'header' },
            { title: 'كتاب 1', author: 'مؤلف 1', price: '50 جنيه', rating: 4.5 },
            { title: 'كتاب 2', author: 'مؤلف 2', price: '75 جنيه', rating: 4.2 },
            { title: 'كتاب 3', author: 'مؤلف 3', price: '100 جنيه', rating: 4.8 }
        ]);
    }

    showSearchResults(results) {
        // Create or update search results container
        let resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'searchResults';
            resultsContainer.className = 'mt-8';
            document.querySelector('.search-container')?.parentNode?.appendChild(resultsContainer);
        }

        resultsContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4 dark:text-white">نتائج البحث</h3>
                <div class="space-y-4">
                    ${results.map(result => result.type === 'header' 
                        ? `<h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300">${result.title}</h4>`
                        : `
                            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <h5 class="font-semibold dark:text-white">${result.title}</h5>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${result.author}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-green-600 dark:text-green-400">${result.price}</p>
                                    <div class="flex items-center">
                                        <span class="text-yellow-500">★</span>
                                        <span class="text-sm text-gray-600 dark:text-gray-400 mr-1">${result.rating}</span>
                                    </div>
                                </div>
                            </div>
                        `
                    ).join('')}
                </div>
            </div>
        `;
    }

    startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('البحث الصوتي غير مدعوم في هذا المتصفح');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ar-EG';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            document.getElementById('voiceSearchBtn').innerHTML = '<i class="fas fa-stop"></i>';
            document.getElementById('voiceSearchBtn').classList.add('bg-red-500');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('enhancedSearchInput').value = transcript;
            this.performSearch();
        };

        recognition.onend = () => {
            document.getElementById('voiceSearchBtn').innerHTML = '<i class="fas fa-microphone"></i>';
            document.getElementById('voiceSearchBtn').classList.remove('bg-red-500');
        };

        recognition.start();
    }
}

// Initialize enhanced search
let enhancedSearch;
document.addEventListener('DOMContentLoaded', () => {
    enhancedSearch = new EnhancedSearch();
});
