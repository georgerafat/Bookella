// Dark Mode Management
class DarkModeManager {
    constructor() {
        this.isDarkMode = localStorage.getItem('bookella_dark_mode') === 'true';
        this.init();
    }

    init() {
        this.applyTheme();
        this.createToggleButton();
        this.addSystemThemeListener();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    toggle() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('bookella_dark_mode', this.isDarkMode);
        this.applyTheme();
        this.updateToggleButton();
    }

    createToggleButton() {
        // Create toggle button if it doesn't exist
        if (!document.getElementById('darkModeToggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'darkModeToggle';
            toggle.className = 'fixed bottom-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-yellow-400 dark:to-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110';
            toggle.innerHTML = this.isDarkMode ? '☀️' : '🌙';
            toggle.title = this.isDarkMode ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن';
            toggle.onclick = () => this.toggle();
            
            document.body.appendChild(toggle);
        }
    }

    updateToggleButton() {
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.innerHTML = this.isDarkMode ? '☀️' : '🌙';
            toggle.title = this.isDarkMode ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن';
            toggle.className = this.isDarkMode 
                ? 'fixed bottom-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110'
                : 'fixed bottom-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110';
        }
    }

    addSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (!localStorage.getItem('bookella_dark_mode')) {
                    this.isDarkMode = e.matches;
                    this.applyTheme();
                    this.updateToggleButton();
                }
            });
        }
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeManager();
});

// Export for use in other files
window.DarkModeManager = DarkModeManager;
