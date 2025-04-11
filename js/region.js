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
            rootMargin: '50px',
            threshold: 0.1
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
        
        // Add subtle animation when image loads
        img.style.animation = 'imageFadeIn 0.5s ease forwards';
    };
    
    tempImg.onerror = () => {
        img.src = '../images/Aleppo/placeholder.webp';
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
                window.scrollTo({
                    top: target.offsetTop - 70, // Adjust for sticky nav
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Sticky navigation with scroll effect
function initializeStickyNav() {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    
    if (!nav || !header) return;
    
    const headerHeight = header.offsetHeight;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > headerHeight) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Section animations on scroll
function initializeSectionAnimations() {
    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('section:not(.intro)');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.15
        });
        
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            sectionObserver.observe(section);
        });
    }
}

// Add hover effects to gallery items
function initializeGalleryEffects() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('.gallery-item-title').style.transform = 'translateY(0)';
        });
        
        item.addEventListener('mouseleave', function() {
            // Only apply if not on mobile
            if (window.innerWidth > 768) {
                this.querySelector('.gallery-item-title').style.transform = 'translateY(100%)';
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
    initializeStickyNav();
    initializeSectionAnimations();
    initializeGalleryEffects();
    
    // Add custom imageFadeIn animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes imageFadeIn {
            from { opacity: 0; transform: scale(1.05); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});