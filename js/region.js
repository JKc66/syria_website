// Mobile menu functionality
function initializeMobileMenu() {
    const menuButton = document.querySelector('.dropdown-menu-button');
    const navMenu = document.querySelector('nav ul');
    
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            navMenu.classList.toggle('show');
        });
    }
    
    // Close menu when clicking links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            menuButton.classList.remove('active');
        });
    });
}

// Back to top button functionality
function initializeBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    const scrollThreshold = 300;
    
    const handleScroll = () => {
        if (window.pageYOffset > scrollThreshold) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Enhanced image lazy loading with fade effect
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        lazyImages.forEach(loadImage);
    }
}

function loadImage(img) {
    const src = img.getAttribute('src');
    const tempImg = new Image();
    
    tempImg.onload = () => {
        img.classList.add('loaded');
        img.style.opacity = '1';
    };
    
    tempImg.onerror = () => {
        img.src = '../images/placeholder.webp';
        img.classList.add('loaded');
        img.style.opacity = '1';
    };
    
    tempImg.src = src;
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeBackToTop();
    initializeLazyLoading();
    initializeSmoothScroll();
});