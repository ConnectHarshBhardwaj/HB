// ========================================
// API Integration for Portfolio Website
// ========================================

class PortfolioAPI {
    constructor() {
        this.baseURL = '/tables'; // RESTful API base URL
        this.retryCount = 3;
        this.retryDelay = 1000;
    }

    // ========================================
    // Generic API Methods
    // ========================================

    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const mergedOptions = { ...defaultOptions, ...options };

        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                const response = await fetch(url, mergedOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Handle empty responses (like DELETE)
                if (response.status === 204) {
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error(`API request failed (attempt ${attempt}):`, error);
                
                if (attempt === this.retryCount) {
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    // ========================================
    // Projects API
    // ========================================

    async getProjects(page = 1, limit = 100, search = '', sort = 'created_at') {
        const params = new URLSearchParams({ page, limit, search, sort });
        return await this.apiRequest(`${this.baseURL}/projects?${params}`);
    }

    async getProject(id) {
        return await this.apiRequest(`${this.baseURL}/projects/${id}`);
    }

    async createProject(projectData) {
        return await this.apiRequest(`${this.baseURL}/projects`, {
            method: 'POST',
            body: JSON.stringify({
                ...projectData,
                created_at: new Date().toISOString()
            })
        });
    }

    async updateProject(id, projectData) {
        return await this.apiRequest(`${this.baseURL}/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...projectData,
                updated_at: new Date().toISOString()
            })
        });
    }

    async deleteProject(id) {
        return await this.apiRequest(`${this.baseURL}/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // ========================================
    // Profile API
    // ========================================

    async getProfile() {
        try {
            const response = await this.apiRequest(`${this.baseURL}/profile?limit=1`);
            return response.data && response.data.length > 0 ? response.data[0] : null;
        } catch (error) {
            console.error('Failed to get profile:', error);
            return null;
        }
    }

    async updateProfile(profileData) {
        try {
            const existingProfile = await this.getProfile();
            
            if (existingProfile) {
                return await this.apiRequest(`${this.baseURL}/profile/${existingProfile.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        ...profileData,
                        updated_at: new Date().toISOString()
                    })
                });
            } else {
                // Create new profile
                return await this.apiRequest(`${this.baseURL}/profile`, {
                    method: 'POST',
                    body: JSON.stringify({
                        ...profileData,
                        updated_at: new Date().toISOString()
                    })
                });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    }

    // ========================================
    // Contact Messages API
    // ========================================

    async getContactMessages(page = 1, limit = 50) {
        const params = new URLSearchParams({ page, limit, sort: 'created_at' });
        return await this.apiRequest(`${this.baseURL}/contact_messages?${params}`);
    }

    async createContactMessage(messageData) {
        return await this.apiRequest(`${this.baseURL}/contact_messages`, {
            method: 'POST',
            body: JSON.stringify({
                ...messageData,
                status: 'new',
                created_at: new Date().toISOString()
            })
        });
    }

    async updateMessageStatus(id, status) {
        return await this.apiRequest(`${this.baseURL}/contact_messages/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // ========================================
    // Utility Methods
    // ========================================

    async getProjectsByCategory(category) {
        const response = await this.getProjects(1, 100, category);
        return response.data ? response.data.filter(project => project.category === category) : [];
    }

    async getFeaturedProjects() {
        const response = await this.getProjects(1, 100);
        return response.data ? response.data.filter(project => project.featured) : [];
    }

    // Image upload helper (for future file upload integration)
    async uploadImage(file, type = 'project') {
        // This would integrate with a file upload service
        // For now, we'll use a placeholder that returns a data URL
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    // Validation helpers
    validateProject(project) {
        const required = ['title', 'category'];
        const missing = required.filter(field => !project[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        const validCategories = ['video', 'motion', 'design', 'thumbnail'];
        if (!validCategories.includes(project.category)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        return true;
    }

    validateProfile(profile) {
        const required = ['name', 'tagline'];
        const missing = required.filter(field => !profile[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate email format if provided
        if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
            throw new Error('Invalid email format');
        }

        return true;
    }

    validateContactMessage(message) {
        const required = ['name', 'email', 'message'];
        const missing = required.filter(field => !message[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
            throw new Error('Invalid email format');
        }

        return true;
    }
}

// ========================================
// Enhanced Portfolio Manager with API Integration
// ========================================

class EnhancedPortfolioManager {
    constructor() {
        this.api = new PortfolioAPI();
        this.loadingState = false;
        
        this.init();
        this.initAPI();
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

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'hero') {
                const heroImage = document.getElementById('hero-image-container');
                heroImage.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
            }
        };
        reader.readAsDataURL(file);
    }

    loadAdminData() {
        this.loadAdminProjects();
    }

    initAPI() {
        // Load data from API on initialization
        this.loadPortfolioDataFromAPI();
        this.loadProfileDataFromAPI();
    }

    // ========================================
    // API-Enhanced Portfolio Methods
    // ========================================

    async loadPortfolioDataFromAPI() {
        try {
            this.setLoadingState(true);
            const response = await this.api.getProjects();
            const projects = response.data || [];
            
            this.renderPortfolioGrid(projects);
            this.setLoadingState(false);
        } catch (error) {
            console.error('Failed to load portfolio data:', error);
            this.showNotification('Failed to load portfolio data. Using local data.', 'error');
            // Fallback to local storage
            super.loadPortfolioData();
            this.setLoadingState(false);
        }
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
                    ${project.featured ? '<div class="featured-badge"><i class="fas fa-star"></i></div>' : ''}
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

    async loadProfileDataFromAPI() {
        try {
            const profile = await this.api.getProfile();
            if (profile) {
                this.renderProfileData(profile);
            } else {
                console.log('No profile found, using default data');
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
            // Fallback to local storage
            super.loadProfileData();
        }
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

        // Update contact information
        const contactEmail = document.querySelector('.contact-text p');
        if (contactEmail && profile.email) {
            contactEmail.textContent = profile.email;
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

    // ========================================
    // Enhanced Admin Panel Methods
    // ========================================

    async handleProjectSubmit(e) {
        e.preventDefault();
        
        try {
            this.setLoadingState(true);
            
            const formData = new FormData(e.target);
            const project = {
                title: formData.get('title') || document.getElementById('project-title').value,
                category: formData.get('category') || document.getElementById('project-category').value,
                description: formData.get('description') || document.getElementById('project-description').value,
                thumbnail: formData.get('thumbnail') || document.getElementById('project-thumbnail').value,
                video_url: formData.get('video') || document.getElementById('project-video').value,
                external_links: formData.get('links') || document.getElementById('project-links').value,
                featured: false,
                tags: []
            };

            // Validate project data
            this.api.validateProject(project);

            // Process tags if provided
            const tagsInput = document.getElementById('project-tags');
            if (tagsInput && tagsInput.value) {
                project.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            }

            // Create project via API
            await this.api.createProject(project);
            
            this.showNotification('Project added successfully!', 'success');
            e.target.reset();
            
            // Reload portfolio data
            await this.loadPortfolioDataFromAPI();
            await this.loadAdminProjects();
            
        } catch (error) {
            console.error('Failed to add project:', error);
            this.showNotification(error.message || 'Failed to add project', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        try {
            this.setLoadingState(true);
            
            const profileData = {
                name: document.getElementById('profile-name')?.value || 'Harsh Bhardwaj',
                tagline: document.getElementById('profile-tagline').value,
                bio: document.getElementById('profile-description').value,
                photo_url: document.getElementById('profile-photo').value,
                email: document.getElementById('profile-email')?.value || 'harsh.bhardwaj@example.com',
                phone: document.getElementById('profile-phone')?.value || '+91 9876543210',
                location: document.getElementById('profile-location')?.value || 'Mumbai, India',
                youtube_url: document.getElementById('social-youtube').value,
                instagram_url: document.getElementById('social-instagram').value,
                behance_url: document.getElementById('social-behance').value,
                linkedin_url: document.getElementById('social-linkedin').value
            };

            // Validate profile data
            this.api.validateProfile(profileData);

            // Update profile via API
            await this.api.updateProfile(profileData);
            
            this.showNotification('Profile updated successfully!', 'success');
            
            // Reload profile data
            await this.loadProfileDataFromAPI();
            
        } catch (error) {
            console.error('Failed to update profile:', error);
            this.showNotification(error.message || 'Failed to update profile', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        try {
            this.setLoadingState(true);
            
            const formData = new FormData(e.target);
            const messageData = {
                name: formData.get('name'),
                email: formData.get('email'),
                service: formData.get('service'),
                budget: formData.get('budget'),
                message: formData.get('message')
            };

            // Validate contact message
            this.api.validateContactMessage(messageData);

            // Submit via API
            await this.api.createContactMessage(messageData);
            
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            e.target.reset();
            
        } catch (error) {
            console.error('Failed to send message:', error);
            this.showNotification(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            this.setLoadingState(true);
            
            await this.api.deleteProject(projectId);
            
            this.showNotification('Project deleted successfully!', 'success');
            
            // Reload data
            await this.loadPortfolioDataFromAPI();
            await this.loadAdminProjects();
            
        } catch (error) {
            console.error('Failed to delete project:', error);
            this.showNotification('Failed to delete project', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async loadAdminProjects() {
        try {
            const response = await this.api.getProjects();
            const projects = response.data || [];
            
            this.renderAdminProjectsList(projects);
        } catch (error) {
            console.error('Failed to load admin projects:', error);
        }
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

    async toggleFeatured(projectId, featured) {
        try {
            await this.api.updateProject(projectId, { featured });
            this.showNotification(`Project ${featured ? 'featured' : 'unfeatured'} successfully!`, 'success');
            
            // Reload data
            await this.loadPortfolioDataFromAPI();
            await this.loadAdminProjects();
        } catch (error) {
            console.error('Failed to toggle featured status:', error);
            this.showNotification('Failed to update project', 'error');
        }
    }

    // ========================================
    // Utility Methods
    // ========================================

    setLoadingState(loading) {
        this.loadingState = loading;
        
        // Update UI loading indicators
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(element => {
            element.style.display = loading ? 'block' : 'none';
        });

        // Disable forms during loading
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select, button');
            inputs.forEach(input => {
                input.disabled = loading;
            });
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
}

// Export for use in main.js
window.EnhancedPortfolioManager = EnhancedPortfolioManager;
window.PortfolioAPI = PortfolioAPI;