// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menu = document.querySelector('.menu');
    const searchIcon = document.querySelector('.search-icon');
    const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
    
    if (!hamburgerMenu || !menu) return;

    hamburgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close search if it's open
        if (mobileSearchOverlay && mobileSearchOverlay.classList.contains('mobile-search-open')) {
            mobileSearchOverlay.classList.remove('mobile-search-open');
            if (searchIcon) searchIcon.classList.remove('search-active');
        }
        
        menu.classList.toggle('mobile-menu-open');
        hamburgerMenu.classList.toggle('hamburger-active');
    });

    // Close menu when clicking on menu links
    const menuLinks = document.querySelectorAll('.menu ul li a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('mobile-menu-open');
            hamburgerMenu.classList.remove('hamburger-active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !menu.contains(event.target)) {
            if (menu.classList.contains('mobile-menu-open')) {
                menu.classList.remove('mobile-menu-open');
                hamburgerMenu.classList.remove('hamburger-active');
            }
        }
    });
});

// Mobile Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchIcon = document.querySelector('.search-icon');
    const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menu = document.querySelector('.menu');
    
    if (!searchIcon || !mobileSearchOverlay) return;

    searchIcon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close menu if it's open
        if (menu && menu.classList.contains('mobile-menu-open')) {
            menu.classList.remove('mobile-menu-open');
            if (hamburgerMenu) hamburgerMenu.classList.remove('hamburger-active');
        }
        
        mobileSearchOverlay.classList.toggle('mobile-search-open');
        searchIcon.classList.toggle('search-active');
        
        // Focus on input when opened
        if (mobileSearchOverlay.classList.contains('mobile-search-open')) {
            setTimeout(() => {
                const searchInput = mobileSearchOverlay.querySelector('input');
                if (searchInput) searchInput.focus();
            }, 300);
        }
    });

    // Close search when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchIcon.contains(event.target) && !mobileSearchOverlay.contains(event.target)) {
            if (mobileSearchOverlay.classList.contains('mobile-search-open')) {
                mobileSearchOverlay.classList.remove('mobile-search-open');
                searchIcon.classList.remove('search-active');
            }
        }
    });
});
