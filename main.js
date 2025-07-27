// API Configuration
const OMDB_API_KEY = '48e2fe9e';

// Movie Class
class Movie {
    constructor(data) {
        this.title = data.Title || data.title || 'Unknown';
        this.year = data.Year || data.year || 'Unknown';
        this.genre = data.Genre || data.genre || 'Unknown';
        this.poster = data.Poster || data.poster || './Assets/image 1.png';
        this.imdbID = data.imdbID || data.imdbId || null;
        this.plot = data.Plot || data.plot || 'No plot available';
        this.rating = data.imdbRating || data.rating || null;
    }

    get displayRating() {
        return this.rating ? `⭐ ${this.rating}` : '';
    }

    get displayGenre() {
        return this.genre + (this.displayRating ? ` • ${this.displayRating}` : '');
    }
}

// API Service Class
class MovieAPIService {
    static async fetchMovieByTitle(title) {
        try {
            const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.Response === 'True' ? new Movie(data) : null;
        } catch (error) {
            return null;
        }
    }

    static async fetchMovieDetails(imdbID) {
        try {
            const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.Response === 'True' ? new Movie(data) : null;
        } catch (error) {
            return null;
        }
    }

    static async searchMovies(query) {
        try {
            const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.Response === 'True' && data.Search) {
                return data.Search.map(item => new Movie(item));
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    static async fetchPopularMovies() {
        const popularTitles = [
            'Oppenheimer', 'Barbie', 'John Wick', 'Spider-Man', 'Avatar', 'Dune', 'Joker', 'Black Panther',
            'Inception', 'The Matrix', 'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Godfather', 'The Shawshank Redemption', 'Gladiator',
            'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office', 'Friends', 'The Mandalorian', 'The Witcher', 'Loki'
        ];

        const movies = [];
        for (const title of popularTitles) {
            const movie = await this.fetchMovieByTitle(title);
            if (movie) movies.push(movie);
        }
        return movies;
    }
}

// My List Manager Class
class MyListManager {
    constructor() {
        this.myList = JSON.parse(localStorage.getItem('myList')) || [];
        this.init();
    }

    init() {
        this.renderMyList();
        this.setupEventListeners();
    }

    addToMyList(movie) {
        if (!this.isInMyList(movie.imdbID)) {
            this.myList.push(movie);
            this.saveToStorage();
            this.renderMyList();
            this.updateAllAddButtons();
        }
    }

    removeFromMyList(imdbID) {
        if (!imdbID) return;
        
        this.myList = this.myList.filter(movie => movie.imdbID !== imdbID);
        this.saveToStorage();
        this.renderMyList();
        this.updateAllAddButtons();
    }

    clearMyList() {
        this.myList = [];
        this.saveToStorage();
        this.renderMyList();
        this.updateAllAddButtons();
    }

    isInMyList(imdbID) {
        return this.myList.some(movie => movie.imdbID === imdbID);
    }

    saveToStorage() {
        localStorage.setItem('myList', JSON.stringify(this.myList));
    }

    renderMyList() {
        const container = document.querySelector('#my-list .cardcontainer');
        if (!container) return;

        if (this.myList.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No movies in your list. Movies you add will appear here.</p>';
            return;
        }

        container.innerHTML = this.myList.map(movie => `
            <div class="moviecard" data-imdb-id="${movie.imdbID}">
                <img src="${movie.poster}" alt="${movie.title}">
                <button class="add-to-list-btn remove">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="remove-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                </button>
                <div class="text-overlay">
                    <h2>${movie.title}</h2>
                    <p>${movie.displayGenre}</p>
                </div>
            </div>
        `).join('');
    }

    updateAllAddButtons() {
        const allButtons = document.querySelectorAll('.add-to-list-btn');
        
        allButtons.forEach(button => {
            const movieCard = button.closest('.moviecard');
            if (!movieCard) return;
            
            const imdbID = movieCard.getAttribute('data-imdb-id');
            
            if (imdbID && this.isInMyList(imdbID)) {
                button.classList.add('remove');
                const icon = button.querySelector('.add-icon');
                if (icon) {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />';
                }
            } else {
                button.classList.remove('remove');
                const icon = button.querySelector('.add-icon');
                if (icon) {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />';
                }
            }
        });
        
        this.updateModalButton();
        
        // Update hero button if heroManager exists
        if (heroManager) {
            heroManager.updateHeroAddButton();
        }
    }

    updateModalButton() {
        const modal = document.querySelector('.movie-modal');
        if (!modal || !modal.classList.contains('active')) return;
        
        const imdbID = modal.getAttribute('data-current-imdb-id');
        const addBtn = modal.querySelector('.modal-add-btn');
        
        if (addBtn && imdbID) {
            if (this.isInMyList(imdbID)) {
                addBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="remove-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                    Remove from List
                `;
            } else {
                addBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="add-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add to List
                `;
            }
        }
    }

    setupEventListeners() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler);
        }
        
        let lastClickTime = 0;
        
        this.globalClickHandler = (e) => {
            const button = e.target.closest('.add-to-list-btn');
            if (!button) return;
            
            const now = Date.now();
            if (now - lastClickTime < 1000) return;
            lastClickTime = now;
            
            e.preventDefault();
            e.stopPropagation();
            
            const movieCard = button.closest('.moviecard');
            if (!movieCard) return;
            
            const imdbID = movieCard.getAttribute('data-imdb-id');
            if (!imdbID) return;
            
            if (this.isInMyList(imdbID)) {
                this.removeFromMyList(imdbID);
            } else {
                const movieData = {
                    title: movieCard.querySelector('h2')?.textContent || 'Unknown',
                    year: 'Unknown',
                    genre: movieCard.querySelector('p')?.textContent || 'Unknown',
                    poster: movieCard.querySelector('img')?.src || '',
                    imdbID: imdbID,
                    plot: 'No plot available'
                };
                this.addToMyList(new Movie(movieData));
            }
        };
        
        document.addEventListener('click', this.globalClickHandler);
    }
}

// Modal Manager Class
class ModalManager {
    constructor() {
        this.modal = document.querySelector('.movie-modal');
        this.closeBtn = document.querySelector('.modal-close-btn');
        this.overlay = document.querySelector('.modal-overlay');
        this.setupEventListeners();
    }

    async openModal(movie, imdbID = null) {
        if (!this.modal) return;

        // Fetch detailed data if we have an IMDB ID
        if (imdbID) {
            const detailedMovie = await MovieAPIService.fetchMovieDetails(imdbID);
            if (detailedMovie) {
                movie = detailedMovie;
            }
        }

        this.populateModal(movie, imdbID);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    populateModal(movie, imdbID) {
        const elements = {
            title: this.modal.querySelector('.modal-title'),
            year: this.modal.querySelector('.modal-year'),
            genre: this.modal.querySelector('.modal-genre'),
            rating: this.modal.querySelector('.modal-rating'),
            plot: this.modal.querySelector('.modal-plot'),
            poster: this.modal.querySelector('.modal-poster-img')
        };

        elements.title.textContent = movie.title;
        elements.year.textContent = movie.year;
        elements.genre.textContent = movie.genre;
        elements.rating.textContent = movie.displayRating || '⭐ 8.5';
        elements.plot.textContent = movie.plot;
        elements.poster.src = movie.poster;
        elements.poster.alt = movie.title;

        this.modal.setAttribute('data-current-imdb-id', imdbID || '');
        this.updateModalButton();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateModalButton() {
        const addBtn = this.modal?.querySelector('.modal-add-btn');
        const imdbID = this.modal?.getAttribute('data-current-imdb-id');
        
        if (addBtn && imdbID && myListManager) {
            if (myListManager.isInMyList(imdbID)) {
                addBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="remove-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                    Remove from List
                `;
            } else {
                addBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="add-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add to List
                `;
            }
        }
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeModal());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });

        const watchBtn = this.modal?.querySelector('.modal-watch-btn');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                alert('Starting movie playback...');
            });
        }

        const addBtn = this.modal?.querySelector('.modal-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleModalAddButton());
        }
    }

    handleModalAddButton() {
        const imdbID = this.modal.getAttribute('data-current-imdb-id');
        if (!imdbID || !myListManager) return;

        const movieData = {
            title: this.modal.querySelector('.modal-title').textContent,
            year: this.modal.querySelector('.modal-year').textContent,
            genre: this.modal.querySelector('.modal-genre').textContent,
            poster: this.modal.querySelector('.modal-poster-img').src,
            plot: this.modal.querySelector('.modal-plot').textContent,
            imdbID: imdbID
        };

        if (myListManager.isInMyList(imdbID)) {
            myListManager.removeFromMyList(imdbID);
        } else {
            myListManager.addToMyList(new Movie(movieData));
        }
        
        this.updateModalButton();
    }
}

// Search Manager Class
class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('.search input');
        this.searchDropdown = document.querySelector('.search-results-dropdown');
        this.mobileSearchInput = document.querySelector('.mobile-search-input');
        this.mobileSearchResults = document.querySelector('.mobile-search-results');
        this.desktopDebounceTimeout = null;
        this.mobileDebounceTimeout = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                if (this.desktopDebounceTimeout) clearTimeout(this.desktopDebounceTimeout);
                this.desktopDebounceTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value, 'desktop');
                }, 350);
            });
        }

        if (this.mobileSearchInput) {
            this.mobileSearchInput.addEventListener('input', (e) => {
                if (this.mobileDebounceTimeout) clearTimeout(this.mobileDebounceTimeout);
                this.mobileDebounceTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value, 'mobile');
                }, 350);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-result-item')) {
                this.handleSearchResultClick(e.target.closest('.search-result-item'), 'desktop');
            }
            if (e.target.closest('.mobile-search-result-item')) {
                this.handleSearchResultClick(e.target.closest('.mobile-search-result-item'), 'mobile');
            }
        });
    }

    async handleSearch(query, type) {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            this.clearResults(type);
            return;
        }

        const movies = await MovieAPIService.searchMovies(trimmedQuery);
        this.displayResults(movies, type);
    }

    displayResults(movies, type) {
        const container = type === 'mobile' ? this.mobileSearchResults : this.searchDropdown;
        if (!container) return;

        if (movies.length === 0) {
            container.innerHTML = '<div class="search-result-item">No results found.</div>';
            return;
        }

        container.innerHTML = movies.map(movie => `
            <div class="search-result-item" data-imdb-id="${movie.imdbID}">
                <img class="search-result-thumb" src="${movie.poster}" alt="${movie.title}">
                <div class="search-result-info">
                    <div class="search-result-title">${movie.title}</div>
                    <div class="search-result-genre">${movie.year} • ${movie.genre}</div>
                </div>
            </div>
        `).join('');

        if (type === 'desktop') {
            this.searchDropdown.classList.add('active');
        }
    }

    clearResults(type) {
        const container = type === 'mobile' ? this.mobileSearchResults : this.searchDropdown;
        if (container) {
            container.innerHTML = '';
        }
        if (type === 'desktop' && this.searchDropdown) {
            this.searchDropdown.classList.remove('active');
        }
    }

    handleSearchResultClick(resultItem, type) {
        const imdbID = resultItem.dataset.imdbId;
        const title = resultItem.querySelector('.search-result-title')?.textContent;
        const year = resultItem.querySelector('.search-result-genre')?.textContent.split(' • ')[0];
        const genre = resultItem.querySelector('.search-result-genre')?.textContent.split(' • ')[1];
        const poster = resultItem.querySelector('.search-result-thumb')?.src;

        const movie = new Movie({
            title: title || 'Unknown',
            year: year || 'Unknown',
            genre: genre || 'Unknown',
            poster: poster || './Assets/image 1.png',
            imdbID: imdbID
        });

        modalManager.openModal(movie, imdbID);

        if (type === 'desktop') {
            this.searchDropdown.classList.remove('active');
        } else {
            const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
            if (mobileSearchOverlay) {
                mobileSearchOverlay.classList.remove('mobile-search-open');
            }
        }
    }
}

// UI Manager Class
class UIManager {
    constructor() {
        this.setupMobileMenu();
        this.setupMovieCardListeners();
    }

    setupMobileMenu() {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const menu = document.querySelector('.menu');
        const searchIcon = document.querySelector('.search-icon');
        const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
        const profile = document.querySelector('.profile');
        const profileDropdown = document.querySelector('.profile-dropdown');

        if (hamburgerMenu && menu) {
            hamburgerMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (mobileSearchOverlay?.classList.contains('mobile-search-open')) {
                    mobileSearchOverlay.classList.remove('mobile-search-open');
                    searchIcon?.classList.remove('search-active');
                }
                
                if (profileDropdown?.classList.contains('profile-dropdown-open')) {
                    profileDropdown.classList.remove('profile-dropdown-open');
                }
                
                menu.classList.toggle('mobile-menu-open');
                hamburgerMenu.classList.toggle('hamburger-active');
            });
        }

        const menuLinks = document.querySelectorAll('.menu ul li a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu?.classList.remove('mobile-menu-open');
                hamburgerMenu?.classList.remove('hamburger-active');
            });
        });

        document.addEventListener('click', (event) => {
            if (!hamburgerMenu?.contains(event.target) && !menu?.contains(event.target)) {
                if (menu?.classList.contains('mobile-menu-open')) {
                    menu.classList.remove('mobile-menu-open');
                    hamburgerMenu?.classList.remove('hamburger-active');
                }
            }
        });

        if (searchIcon && mobileSearchOverlay) {
            searchIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (menu?.classList.contains('mobile-menu-open')) {
                    menu.classList.remove('mobile-menu-open');
                    hamburgerMenu?.classList.remove('hamburger-active');
                }
                
                if (profileDropdown?.classList.contains('profile-dropdown-open')) {
                    profileDropdown.classList.remove('profile-dropdown-open');
                }
                
                mobileSearchOverlay.classList.toggle('mobile-search-open');
                searchIcon.classList.toggle('search-active');
                
                if (mobileSearchOverlay.classList.contains('mobile-search-open')) {
                    const mobileSearchInput = document.querySelector('.mobile-search-input');
                    mobileSearchInput?.focus();
                }
            });
        }

        if (profile && profileDropdown) {
            profile.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (menu?.classList.contains('mobile-menu-open')) {
                    menu.classList.remove('mobile-menu-open');
                    hamburgerMenu?.classList.remove('hamburger-active');
                }
                
                if (mobileSearchOverlay?.classList.contains('mobile-search-open')) {
                    mobileSearchOverlay.classList.remove('mobile-search-open');
                    searchIcon?.classList.remove('search-active');
                }
                
                profileDropdown.classList.toggle('profile-dropdown-open');
            });
        }

        document.addEventListener('click', (event) => {
            if (!profile?.contains(event.target)) {
                profileDropdown?.classList.remove('profile-dropdown-open');
            }
            if (!searchIcon?.contains(event.target)) {
                mobileSearchOverlay?.classList.remove('mobile-search-open');
                searchIcon?.classList.remove('search-active');
            }
        });

        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                alert('Logging out...');
            });
        }
    }

    setupMovieCardListeners() {
        document.addEventListener('click', (e) => {
            const movieCard = e.target.closest('.moviecard');
            if (!movieCard || e.target.closest('.add-to-list-btn')) return;

            const imdbID = movieCard.getAttribute('data-imdb-id');
            if (!imdbID) return;

            const movie = new Movie({
                title: movieCard.querySelector('h2')?.textContent || 'Unknown',
                year: 'Unknown',
                genre: movieCard.querySelector('p')?.textContent || 'Unknown',
                poster: movieCard.querySelector('img')?.src || './Assets/image 1.png',
                imdbID: imdbID,
                plot: 'No plot available'
            });

            modalManager.openModal(movie, imdbID);
        });
    }

    updateMovieCards(movies, sectionId) {
        const section = document.querySelector(`#${sectionId} .cardcontainer`);
        if (!section) return;

        const cards = section.querySelectorAll('.moviecard');
        cards.forEach((card, i) => {
            if (movies[i]) {
                const movie = movies[i];
                const img = card.querySelector('img');
                const title = card.querySelector('h2');
                const genre = card.querySelector('p');

                if (img) img.src = movie.poster;
                if (title) title.textContent = movie.title;
                if (genre) genre.textContent = movie.displayGenre;
                card.setAttribute('data-imdb-id', movie.imdbID);
            }
        });
    }
}

// Hero Manager Class
class HeroManager {
    constructor() {
        this.heroWatchBtn = document.getElementById('hero-watch-btn');
        this.heroAddBtn = document.getElementById('hero-add-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.heroWatchBtn) {
            this.heroWatchBtn.addEventListener('click', () => {
                alert('Starting movie playback...');
            });
        }

        if (this.heroAddBtn) {
            this.heroAddBtn.addEventListener('click', () => {
                this.handleHeroAddButton();
            });
        }
    }

    handleHeroAddButton() {
        const heroMovie = new Movie({
            title: 'Garfield: The Movie',
            year: '2004',
            genre: 'Animation, Comedy, Family',
            poster: './Assets/hero image1.png',
            imdbID: 'tt0356634', // Garfield's IMDB ID
            plot: 'The lazy, lasagna-loving cat is back in a wild new adventure and this time, the couch won\'t save him.'
        });

        if (myListManager && myListManager.isInMyList(heroMovie.imdbID)) {
            myListManager.removeFromMyList(heroMovie.imdbID);
            this.heroAddBtn.textContent = 'Add to List';
        } else {
            myListManager.addToMyList(heroMovie);
            this.heroAddBtn.textContent = 'Remove from List';
        }
    }

    updateHeroAddButton() {
        if (this.heroAddBtn && myListManager) {
            const heroIMDBID = 'tt0356634'; // Garfield's IMDB ID
            if (myListManager.isInMyList(heroIMDBID)) {
                this.heroAddBtn.textContent = 'Remove from List';
            } else {
                this.heroAddBtn.textContent = 'Add to List';
            }
        }
    }
}

// Global instances
let myListManager, modalManager, searchManager, uiManager, heroManager;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    
    // Initialize managers in correct order
    modalManager = new ModalManager();
    searchManager = new SearchManager();
    uiManager = new UIManager();
    myListManager = new MyListManager();
    heroManager = new HeroManager();

    // Clear any existing My List
    myListManager.clearMyList();

    // Fetch and populate movie cards
    try {
        const popularMovies = await MovieAPIService.fetchPopularMovies();
        
        uiManager.updateMovieCards(popularMovies.slice(0, 8), 'trending');
        uiManager.updateMovieCards(popularMovies.slice(8, 16), 'movies');
        uiManager.updateMovieCards(popularMovies.slice(16, 24), 'tv-shows');
        
    } catch (error) {
        console.error('Error loading movies:', error);
    }

    // Update button states
    myListManager.updateAllAddButtons();
    heroManager.updateHeroAddButton();
});
