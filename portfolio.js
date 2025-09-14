// ========================================
// Simplified Portfolio Management System
// ========================================

class SimplePortfolioManager {
    constructor() {
        this.init();
        this.loadData();
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

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Store message locally for demo
            const messageData = {
                id: Date.now().toString(),
                name: formData.get('name'),
                email: formData.get('email'),
                service: formData.get('service'),
                budget: formData.get('budget'),
                message: formData.get('message'),
                status: 'new',
                created_at: new Date().toISOString()
            };
            
            const messages = this.getStoredMessages();
            messages.push(messageData);
            localStorage.setItem('portfolio_messages', JSON.stringify(messages));
            
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            e.target.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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
        
        const project = {
            id: Date.now().toString(),
            title: document.getElementById('project-title').value,
            category: document.getElementById('project-category').value,
            description: document.getElementById('project-description').value,
            thumbnail: document.getElementById('project-thumbnail').value,
            video_url: document.getElementById('project-video').value,
            external_links: document.getElementById('project-links').value,
            tags: document.getElementById('project-tags')?.value.split(',').map(t => t.trim()).filter(t => t) || [],
            featured: false,
            created_at: new Date().toISOString()
        };

        // Validate required fields
        if (!project.title || !project.category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            const projects = this.getStoredProjects();
            projects.push(project);
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            
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
            name: document.getElementById('profile-name')?.value || 'Harsh Bhardwaj',
            photo_url: document.getElementById('profile-photo').value,
            tagline: document.getElementById('profile-tagline').value,
            bio: document.getElementById('profile-description').value,
            email: document.getElementById('profile-email')?.value || 'harsh.bhardwaj@example.com',
            phone: document.getElementById('profile-phone')?.value || '+91 9876543210',
            location: document.getElementById('profile-location')?.value || 'Mumbai, India',
            youtube_url: document.getElementById('social-youtube').value,
            instagram_url: document.getElementById('social-instagram').value,
            behance_url: document.getElementById('social-behance').value,
            linkedin_url: document.getElementById('social-linkedin').value,
            updated_at: new Date().toISOString()
        };

        try {
            localStorage.setItem('portfolio_profile', JSON.stringify(profileData));
            this.showNotification('Profile updated successfully!', 'success');
            this.loadProfileData();
        } catch (error) {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    // ========================================
    // Data Management
    // ========================================

    getStoredProjects() {
        const stored = localStorage.getItem('portfolio_projects');
        return stored ? JSON.parse(stored) : this.getDefaultProjects();
    }

    getStoredProfile() {
        const stored = localStorage.getItem('portfolio_profile');
        return stored ? JSON.parse(stored) : this.getDefaultProfile();
    }

    getStoredMessages() {
        const stored = localStorage.getItem('portfolio_messages');
        return stored ? JSON.parse(stored) : [];
    }

    getDefaultProjects() {
        return [
            {
                id: '1',
                title: 'Brand Commercial Edit',
                category: 'video',
                description: 'Dynamic commercial video with motion graphics and color grading for a tech startup. Featured advanced compositing, sound design, and seamless transitions.',
                thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=300&fit=crop',
                video_url: '',
                external_links: 'https://behance.net/project',
                tags: ['commercial', 'motion-graphics', 'color-grading'],
                featured: true,
                created_at: '2024-01-10T08:00:00Z'
            },
            {
                id: '2',
                title: 'Logo Animation Package',
                category: 'motion',
                description: 'Sleek 3D logo animation with particle effects, smooth transitions, and multiple format deliverables for social media and web use.',
                thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
                video_url: '',
                external_links: 'https://dribbble.com/shots/project',
                tags: ['logo', '3d', 'animation', 'branding'],
                featured: true,
                created_at: '2024-01-12T14:30:00Z'
            },
            {
                id: '3',
                title: 'YouTube Thumbnails Pack',
                category: 'thumbnail',
                description: 'Eye-catching thumbnail designs that increased CTR by 150% for gaming channel. Includes A/B testing variations and brand consistency guidelines.',
                thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
                video_url: '',
                external_links: 'https://instagram.com/post',
                tags: ['youtube', 'gaming', 'ctr-optimization'],
                featured: false,
                created_at: '2024-01-14T16:45:00Z'
            },
            {
                id: '4',
                title: 'Restaurant Brand Identity',
                category: 'design',
                description: 'Complete brand identity package including logo design, menu layouts, social media templates, and packaging design for a modern restaurant chain.',
                thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
                video_url: '',
                external_links: 'https://behance.net/restaurant-brand',
                tags: ['branding', 'restaurant', 'identity', 'packaging'],
                featured: true,
                created_at: '2024-01-08T11:20:00Z'
            }
        ];
    }

    getDefaultProfile() {
        return {
            name: 'Harsh Bhardwaj',
            tagline: 'Creative Video Editor & Graphic Designer',
            bio: 'A passionate Video Editor and Graphic Designer with over 5 years of experience creating compelling visual content. I specialize in bringing stories to life through dynamic video editing, eye-catching motion graphics, and stunning visual design.',
            photo_url: '',
            email: 'harsh.bhardwaj@example.com',
            phone: '+91 9876543210',
            location: 'Mumbai, India',
            youtube_url: '',
            instagram_url: '',
            behance_url: '',
            linkedin_url: ''
        };
    }

    loadData() {
        this.loadPortfolioData();
        this.loadProfileData();
    }

    loadPortfolioData() {
        const projects = this.getStoredProjects();
        this.renderPortfolioGrid(projects);
    }

    renderPortfolioGrid(projects) {
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
            <div class="portfolio-item" data-category="${project.category}" data-aos="fade-up" data-aos-delay="100">
                <div class="portfolio-image">
                    ${project.thumbnail ? 
                        `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy">` :
                        `<div style="height: 250px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                            <i class="fas fa-image" style="font-size: 3rem;"></i>
                        </div>`
                    }
                    <div class="portfolio-overlay">
                        <div class="portfolio-links">
                            ${project.video_url ? `<a href="${project.video_url}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fas fa-play"></i> Watch
                            </a>` : ''}
                            ${project.external_links ? `<a href="${project.external_links}" target="_blank" class="btn btn-outline btn-sm">
                                <i class="fas fa-external-link-alt"></i> View
                            </a>` : ''}
                        </div>
                    </div>
                    ${project.featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                </div>
                <div class="portfolio-content">
                    <div class="portfolio-category">${categoryLabels[project.category] || project.category}</div>
                    <h3>${project.title}</h3>
                    ${project.description ? `<p>${project.description}</p>` : ''}
                    ${project.tags && project.tags.length > 0 ? `
                        <div class="portfolio-tags">
                            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    loadProfileData() {
        const profile = this.getStoredProfile();
        this.renderProfileData(profile);
    }

    renderProfileData(profile) {
        // Update hero section
        const heroImage = document.getElementById('hero-image-container');
        const taglineElement = document.querySelector('.hero-tagline');
        const descriptionElement = document.querySelector('.hero-description');

        if (profile.photo_url && heroImage) {
            heroImage.innerHTML = `<img src="${profile.photo_url}" alt="${profile.name}">`;
        }

        if (taglineElement && profile.tagline) {
            taglineElement.textContent = profile.tagline;
        }

        if (descriptionElement && profile.bio) {
            descriptionElement.textContent = profile.bio;
        }

        // Update social links
        const socialLinks = {
            youtube: profile.youtube_url,
            instagram: profile.instagram_url,
            behance: profile.behance_url,
            linkedin: profile.linkedin_url
        };

        this.updateSocialLinks(socialLinks);
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
            'profile-name': profile.name,
            'profile-tagline': profile.tagline,
            'profile-description': profile.bio,
            'profile-photo': profile.photo_url,
            'profile-email': profile.email,
            'profile-phone': profile.phone,
            'profile-location': profile.location,
            'social-youtube': profile.youtube_url,
            'social-instagram': profile.instagram_url,
            'social-behance': profile.behance_url,
            'social-linkedin': profile.linkedin_url
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
        this.renderAdminProjectsList(projects);
    }

    renderAdminProjectsList(projects) {
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
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <h5 style="margin: 0; color: var(--text-primary);">${project.title}</h5>
                            ${project.featured ? '<span style="background: var(--neon-accent); color: var(--bg-primary); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">FEATURED</span>' : ''}
                        </div>
                        <span style="color: var(--neon-primary); font-size: 0.9rem; text-transform: uppercase;">${project.category}</span>
                        ${project.tags && project.tags.length > 0 ? `
                            <div style="margin-top: 0.5rem;">
                                ${project.tags.map(tag => `<span style="background: rgba(0,245,255,0.1); color: var(--neon-primary); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; margin-right: 0.5rem;">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="portfolio.toggleFeatured('${project.id}', ${!project.featured})" 
                                style="background: ${project.featured ? 'var(--neon-accent)' : 'rgba(57,255,20,0.2)'}; color: ${project.featured ? 'var(--bg-primary)' : 'var(--neon-accent)'}; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                            <i class="fas fa-star"></i>
                        </button>
                        <button onclick="portfolio.deleteProject('${project.id}')" 
                                style="background: var(--neon-secondary); color: white; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${project.description ? `<p style="color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 0; font-size: 0.9rem;">${project.description}</p>` : ''}
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

    async toggleFeatured(projectId, featured) {
        try {
            const projects = this.getStoredProjects();
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.featured = featured;
                localStorage.setItem('portfolio_projects', JSON.stringify(projects));
                
                this.showNotification(`Project ${featured ? 'featured' : 'unfeatured'} successfully!`, 'success');
                this.loadPortfolioData();
                this.loadAdminProjects();
            }
        } catch (error) {
            this.showNotification('Failed to update project', 'error');
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
                profile.photo_url = e.target.result;
                localStorage.setItem('portfolio_profile', JSON.stringify(profile));
            }
        };
        reader.readAsDataURL(file);
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
    // Initialize portfolio manager
    window.portfolio = new SimplePortfolioManager();
    
    // Additional smooth animations
    initializeAdditionalAnimations();
});

function initializeAdditionalAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroDecorations = document.querySelectorAll('.floating-element');
        
        heroDecorations.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Counter animation for stats
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
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        observer.observe(aboutSection);
    }
}

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