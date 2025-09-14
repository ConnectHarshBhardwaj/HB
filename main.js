// ========================================
// Portfolio Management System
// ========================================

class PortfolioManager {
    constructor() {
        this.init();
        this.loadPortfolioData();
        this.loadProfileData();
    }

    init() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Set up event listeners
        this.setupEventListeners();
        this.setupNavigation();
        this.setupContactForm();
        this.setupAdminPanel();
        this.setupPortfolioFilters();
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
                hamburger?.classList.remove('active');
            });
        });

        // Scroll navbar effect
        window.addEventListener('scroll', this.handleNavbarScroll);

        // Hero image upload
        const heroImageContainer = document.getElementById('hero-image-container');
        if (heroImageContainer) {
            heroImageContainer.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => this.handleImageUpload(e, 'hero');
                input.click();
            });
        }
    }

    handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

        // Active navigation highlighting
        window.addEventListener('scroll', this.updateActiveNavLink);
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call (replace with actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            e.target.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    background: var(--bg-secondary);
                    border: 1px solid;
                    border-radius: 10px;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 3000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                    box-shadow: var(--shadow-dark);
                }
                .notification-success { border-color: var(--neon-accent); }
                .notification-error { border-color: var(--neon-secondary); }
                .notification button {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupPortfolioFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active filter
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter portfolio items
                const filter = btn.getAttribute('data-filter');
                this.filterPortfolioItems(filter);
            });
        });
    }

    filterPortfolioItems(filter) {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // ========================================
    // Admin Panel Management
    // ========================================

    setupAdminPanel() {
        // Admin tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                this.switchAdminTab(targetTab);
            });
        });

        // Project form
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', this.handleProjectSubmit.bind(this));
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileSubmit.bind(this));
        }

        // Load admin data
        this.loadAdminData();
    }

    switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
    }

    async handleProjectSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const project = {
            id: Date.now().toString(),
            title: formData.get('title') || document.getElementById('project-title').value,
            category: formData.get('category') || document.getElementById('project-category').value,
            description: formData.get('description') || document.getElementById('project-description').value,
            thumbnail: formData.get('thumbnail') || document.getElementById('project-thumbnail').value,
            video: formData.get('video') || document.getElementById('project-video').value,
            links: formData.get('links') || document.getElementById('project-links').value,
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!project.title || !project.category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            await this.addProject(project);
            this.showNotification('Project added successfully!', 'success');
            e.target.reset();
            this.loadPortfolioData();
            this.loadAdminProjects();
        } catch (error) {
            this.showNotification('Failed to add project', 'error');
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        const profileData = {
            photo: document.getElementById('profile-photo').value,
            tagline: document.getElementById('profile-tagline').value,
            description: document.getElementById('profile-description').value,
            social: {
                youtube: document.getElementById('social-youtube').value,
                instagram: document.getElementById('social-instagram').value,
                behance: document.getElementById('social-behance').value,
                linkedin: document.getElementById('social-linkedin').value
            }
        };

        try {
            await this.updateProfile(profileData);
            this.showNotification('Profile updated successfully!', 'success');
            this.loadProfileData();
        } catch (error) {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    // ========================================
    // Data Management (Local Storage)
    // ========================================

    async addProject(project) {
        const projects = this.getStoredProjects();
        projects.push(project);
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    }

    async updateProfile(profileData) {
        localStorage.setItem('portfolio_profile', JSON.stringify(profileData));
    }

    getStoredProjects() {
        const stored = localStorage.getItem('portfolio_projects');
        return stored ? JSON.parse(stored) : [];
    }

    getStoredProfile() {
        const stored = localStorage.getItem('portfolio_profile');
        return stored ? JSON.parse(stored) : {
            photo: '',
            tagline: 'Creative Video Editor & Graphic Designer',
            description: 'Transforming ideas into stunning visual experiences through innovative video editing, motion graphics, and creative design solutions.',
            social: {
                youtube: '',
                instagram: '',
                behance: '',
                linkedin: ''
            }
        };
    }

    async loadPortfolioData() {
        const projects = this.getStoredProjects();
        const portfolioGrid = document.getElementById('portfolio-grid');
        const portfolioEmpty = document.getElementById('portfolio-empty');

        if (!portfolioGrid) return;

        if (projects.length === 0) {
            portfolioGrid.innerHTML = '';
            portfolioEmpty?.style.setProperty('display', 'block');
            return;
        }

        portfolioEmpty?.style.setProperty('display', 'none');
        
        portfolioGrid.innerHTML = projects.map(project => this.createPortfolioHTML(project)).join('');
    }

    createPortfolioHTML(project) {
        const categoryLabels = {
            'video': 'Video Editing',
            'motion': 'Motion Graphics',
            'design': 'Graphic Design',
            'thumbnail': 'Thumbnails'
        };

        return `
            <div class="portfolio-item" data-category="${project.category}">
                <div class="portfolio-image">
                    ${project.thumbnail ? 
                        `<img src="${project.thumbnail}" alt="${project.title}">` :
                        `<div style="height: 250px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                            <i class="fas fa-image" style="font-size: 3rem;"></i>
                        </div>`
                    }
                    <div class="portfolio-overlay">
                        <div class="portfolio-links">
                            ${project.video ? `<a href="${project.video}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fas fa-play"></i> Watch
                            </a>` : ''}
                            ${project.links ? `<a href="${project.links}" target="_blank" class="btn btn-outline btn-sm">
                                <i class="fas fa-external-link-alt"></i> Links
                            </a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="portfolio-content">
                    <div class="portfolio-category">${categoryLabels[project.category] || project.category}</div>
                    <h3>${project.title}</h3>
                    ${project.description ? `<p>${project.description}</p>` : ''}
                </div>
            </div>
        `;
    }

    async loadProfileData() {
        const profile = this.getStoredProfile();
        
        // Update hero section
        const heroImage = document.getElementById('hero-image-container');
        const taglineElement = document.querySelector('.hero-tagline');
        const descriptionElement = document.querySelector('.hero-description');

        if (profile.photo && heroImage) {
            heroImage.innerHTML = `<img src="${profile.photo}" alt="Harsh Bhardwaj">`;
        }

        if (taglineElement) {
            taglineElement.textContent = profile.tagline;
        }

        if (descriptionElement) {
            descriptionElement.textContent = profile.description;
        }

        // Update social links
        this.updateSocialLinks(profile.social);
        
        // Update admin form values
        this.updateAdminProfileForm(profile);
    }

    updateSocialLinks(social) {
        document.querySelectorAll('.social-link').forEach(link => {
            const platform = link.getAttribute('data-platform');
            if (social[platform]) {
                link.href = social[platform];
                link.style.display = 'flex';
            } else {
                link.style.display = 'none';
            }
        });
    }

    updateAdminProfileForm(profile) {
        const elements = {
            'profile-photo': profile.photo,
            'profile-tagline': profile.tagline,
            'profile-description': profile.description,
            'social-youtube': profile.social.youtube,
            'social-instagram': profile.social.instagram,
            'social-behance': profile.social.behance,
            'social-linkedin': profile.social.linkedin
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value || '';
            }
        });
    }

    loadAdminData() {
        this.loadAdminProjects();
    }

    loadAdminProjects() {
        const projects = this.getStoredProjects();
        const adminProjectsList = document.getElementById('admin-projects-list');

        if (!adminProjectsList) return;

        if (projects.length === 0) {
            adminProjectsList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                    <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No projects added yet</p>
                </div>
            `;
            return;
        }

        adminProjectsList.innerHTML = projects.map(project => `
            <div class="admin-project-item" style="background: var(--bg-tertiary); padding: 1rem; margin-bottom: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h5 style="margin-bottom: 0.5rem; color: var(--text-primary);">${project.title}</h5>
                        <span style="color: var(--neon-primary); font-size: 0.9rem; text-transform: uppercase;">${project.category}</span>
                    </div>
                    <button onclick="portfolio.deleteProject('${project.id}')" 
                            style="background: var(--neon-secondary); color: white; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${project.description ? `<p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.9rem;">${project.description}</p>` : ''}
            </div>
        `).join('');
    }

    async deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const projects = this.getStoredProjects().filter(p => p.id !== projectId);
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            
            this.showNotification('Project deleted successfully!', 'success');
            this.loadPortfolioData();
            this.loadAdminProjects();
        } catch (error) {
            this.showNotification('Failed to delete project', 'error');
        }
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'hero') {
                const heroImage = document.getElementById('hero-image-container');
                heroImage.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
                
                // Update profile data
                const profile = this.getStoredProfile();
                profile.photo = e.target.result;
                this.updateProfile(profile);
            }
        };
        reader.readAsDataURL(file);
    }
}

// ========================================
// Global Functions
// ========================================

function toggleAdmin() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel?.classList.toggle('active');
}

// ========================================
// Initialize Application
// ========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize enhanced portfolio manager if available, otherwise use basic one
    if (window.EnhancedPortfolioManager) {
        window.portfolio = new EnhancedPortfolioManager();
    } else {
        window.portfolio = new PortfolioManager();
    }
    
    // Add some sample data if none exists
    const projects = window.portfolio.getStoredProjects();
    if (projects.length === 0) {
        // Add sample projects
        const sampleProjects = [
            {
                id: '1',
                title: 'Brand Commercial Edit',
                category: 'video',
                description: 'Dynamic commercial video with motion graphics and color grading for a tech startup.',
                thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=300&fit=crop',
                video: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
                links: 'https://behance.net/project',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Logo Animation',
                category: 'motion',
                description: 'Sleek 3D logo animation with particle effects and smooth transitions.',
                thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
                video: '',
                links: 'https://dribbble.com/shots/project',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'YouTube Thumbnails Pack',
                category: 'thumbnail',
                description: 'Eye-catching thumbnail designs that increased CTR by 150% for gaming channel.',
                thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
                video: '',
                links: 'https://instagram.com/post',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('portfolio_projects', JSON.stringify(sampleProjects));
        window.portfolio.loadPortfolioData();
    }
});

// ========================================
// Additional Smooth Animations
// ========================================

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroDecorations = document.querySelectorAll('.floating-element');
    
    heroDecorations.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Typing effect for hero tagline (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when section comes into view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.classList.contains('about')) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe the about section for counter animation
document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        observer.observe(aboutSection);
    }
});