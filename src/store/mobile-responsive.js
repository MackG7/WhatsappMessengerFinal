// ================================================
// 🎯 RESPONSIVE MANAGER MEJORADO - 0px to 2000px+
// ================================================

class ResponsiveManager {
    constructor() {
        this.sidebar = document.querySelector('.wa-sidebar');
        this.menuBtn = null;
        this.overlay = null;
        this.isMobile = window.innerWidth <= 768;
        this.currentBreakpoint = this.getBreakpoint();
        
        this.init();
    }
    
    init() {
        this.createMobileElements();
        this.bindEvents();
        this.handleResize();
        this.applyResponsiveFixes();
        
        console.log('🚀 ResponsiveManager mejorado iniciado');
        console.log('📱 Breakpoint actual:', this.currentBreakpoint);
    }
    
    getBreakpoint() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        if (width <= 1200) return 'desktop';
        if (width <= 1440) return 'large-desktop';
        if (width <= 1600) return 'xl-desktop';
        if (width <= 2000) return 'xxl-desktop';
        return 'ultra-wide';
    }
    
    createMobileElements() {
        // Crear overlay si no existe
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'sidebar-overlay';
            document.body.appendChild(this.overlay);
        }
        
        // Crear botón menú móvil si no existe y estamos en móvil
        if (this.isMobile) {
            this.createMobileMenuButton();
        }
    }
    
    createMobileMenuButton() {
        const chatHeader = document.querySelector('.wa-chat-header');
        if (chatHeader && !this.menuBtn) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '☰';
            menuBtn.setAttribute('aria-label', 'Abrir menú lateral');
            
            const chatHeaderLeft = chatHeader.querySelector('.wa-chat-header-left');
            if (chatHeaderLeft) {
                chatHeaderLeft.prepend(menuBtn);
                this.menuBtn = menuBtn;
            }
        }
    }
    
    bindEvents() {
        // Menú móvil
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mobile-menu-btn')) {
                this.toggleSidebar();
            }
        });
        
        // Overlay
        this.overlay.addEventListener('click', () => this.closeSidebar());
        
        // Resize optimizado
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });
        
        // Cerrar al hacer clic en enlaces del sidebar
        this.sidebar?.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        if (this.sidebar?.classList.contains('mobile-open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        this.sidebar?.classList.add('mobile-open');
        this.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSidebar() {
        this.sidebar?.classList.remove('mobile-open');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        const oldBreakpoint = this.currentBreakpoint;
        
        this.isMobile = window.innerWidth <= 768;
        this.currentBreakpoint = this.getBreakpoint();
        
        // Solo ejecutar cambios si el breakpoint cambió
        if (oldBreakpoint !== this.currentBreakpoint) {
            console.log('🔄 Cambio de breakpoint:', oldBreakpoint, '→', this.currentBreakpoint);
            this.applyResponsiveFixes();
        }
        
        // Si cambió de móvil a desktop
        if (wasMobile && !this.isMobile) {
            this.closeSidebar();
            if (this.sidebar) {
                this.sidebar.style.display = 'flex';
            }
        }
        
        // Si cambió a móvil, crear botón si no existe
        if (this.isMobile && !this.menuBtn) {
            this.createMobileMenuButton();
        }
    }
    
    applyResponsiveFixes() {
        // Aplicar fixes específicos según el breakpoint
        switch (this.currentBreakpoint) {
            case 'mobile':
                this.applyMobileFixes();
                break;
            case 'tablet':
                this.applyTabletFixes();
                break;
            case 'large-desktop':
                this.applyLargeDesktopFixes();
                break;
            case 'xxl-desktop':
            case 'ultra-wide':
                this.applyUltraWideFixes();
                break;
        }
        
        // Fix universal: eliminar fondos blancos
        this.removeWhiteBackgrounds();
    }
    
    applyMobileFixes() {
        console.log('📱 Aplicando fixes para móvil');
    }
    
    applyTabletFixes() {
        console.log('📟 Aplicando fixes para tablet');
    }
    
    applyLargeDesktopFixes() {
        console.log('🖥️ Aplicando fixes para desktop grande');
    }
    
    applyUltraWideFixes() {
        console.log('🎯 Aplicando fixes para pantallas ultra wide');
    }
    
    removeWhiteBackgrounds() {
        // Buscar y eliminar elementos con fondo blanco
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            
            // Si el fondo es blanco o casi blanco, cambiarlo
            if (bgColor.includes('255, 255, 255') || 
                bgColor === 'rgb(255, 255, 255)' ||
                bgColor === '#ffffff' ||
                bgColor === '#fff') {
                el.style.backgroundColor = 'var(--bg-darker)';
            }
        });
    }
    
    // Métodos públicos
    openMobileSidebar() {
        if (this.isMobile) {
            this.openSidebar();
        }
    }
    
    closeMobileSidebar() {
        this.closeSidebar();
    }
    
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveManager = new ResponsiveManager();
});

// También inicializar cuando la página esté completamente cargada
window.addEventListener('load', () => {
    // Re-aplicar fixes por si hay elementos que se cargan después
    if (window.responsiveManager) {
        setTimeout(() => {
            window.responsiveManager.applyResponsiveFixes();
        }, 100);
    }
});

// Exportar para usar en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}