// DOM Elements
const body = document.body;
const aiThemeBtn = document.getElementById('ai-theme-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const themeTransitionOverlay = document.getElementById('theme-transition-overlay');
const aiThinkingModal = document.querySelector('.ai-thinking-modal');
const toggleModeBtn = document.getElementById('toggle-mode');

// Theme configurations with font settings and animation speeds
const themeConfigs = {
    'theme-default': {
        fontFamily: 'Poppins, sans-serif',
        secondaryFont: 'Montserrat, sans-serif',
        animationSpeed: 1
    },
    'theme-dark': {
        fontFamily: 'Poppins, sans-serif',
        secondaryFont: 'Montserrat, sans-serif',
        animationSpeed: 0.9
    },
    'theme-neon': {
        fontFamily: 'Montserrat, sans-serif',
        secondaryFont: 'Poppins, sans-serif',
        animationSpeed: 1.2
    },
    'theme-pastel': {
        fontFamily: 'Roboto, sans-serif',
        secondaryFont: 'Poppins, sans-serif',
        animationSpeed: 0.8
    },
    'theme-forest': {
        fontFamily: 'Montserrat, sans-serif',
        secondaryFont: 'Roboto, sans-serif',
        animationSpeed: 0.95
    }
};

// Global variables for 3D objects
let threeScene, threeCamera, threeRenderer;
let threeGlobe, threeCube;
let isAnimating = true;

// D3.js Chart Data
const themeUsageData = [
    { name: 'Default', value: 45 },
    { name: 'Dark', value: 30 },
    { name: 'Neon', value: 15 },
    { name: 'Custom', value: 10 }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    tippy('[data-tippy-content]', {
        placement: 'bottom',
        animation: 'scale',
        duration: 300
    });
    
    // Set up GSAP ScrollTrigger
    initScrollAnimations();
    
    // Set up event listeners for theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            switchTheme(theme);
            setActiveThemeButton(button);
        });
    });

    // AI Theme button event
    aiThemeBtn.addEventListener('click', generateAITheme);
    
    // Toggle mode button event
    toggleModeBtn.addEventListener('click', toggleDarkLightMode);

    // Add a subtle animation to the orb on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Initialize 3D elements
    init3DGlobe();
    init3DShowcase();
    
    // Initialize particles
    initParticles();
    
    // Initialize chart
    initD3Chart();
    
    // Showcase controls
    document.getElementById('rotate-model').addEventListener('click', toggleRotation);
    document.getElementById('change-model-theme').addEventListener('click', changeModelTheme);
    
    // Update color swatches
    updateColorSwatches();
});

// Initialize GSAP ScrollTrigger animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate elements when they come into view
    gsap.utils.toArray('[data-scroll]').forEach(element => {
        const animation = element.getAttribute('data-scroll');
        const delay = element.getAttribute('data-scroll-delay') || 0;
        
        gsap.set(element, { autoAlpha: 0 });
        
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
        
        switch(animation) {
            case 'fade-in':
                tl.fromTo(element, {
                    y: 20,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    y: 0,
                    autoAlpha: 1,
                    ease: "power2.out",
                    delay: delay
                });
                break;
            case 'slide-right':
                tl.fromTo(element, {
                    x: -50,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    x: 0,
                    autoAlpha: 1,
                    ease: "power2.out",
                    delay: delay
                });
                break;
            case 'slide-left':
                tl.fromTo(element, {
                    x: 50,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    x: 0,
                    autoAlpha: 1,
                    ease: "power2.out",
                    delay: delay
                });
                break;
            case 'fade-up':
                tl.fromTo(element, {
                    y: 50,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    y: 0,
                    autoAlpha: 1,
                    ease: "power2.out",
                    delay: delay
                });
                break;
            case 'scale-in':
                tl.fromTo(element, {
                    scale: 0.9,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    scale: 1,
                    autoAlpha: 1,
                    ease: "back.out(1.7)",
                    delay: delay
                });
                break;
            case 'slide-up':
                tl.fromTo(element, {
                    y: 30,
                    autoAlpha: 0
                }, {
                    duration: 0.7,
                    y: 0,
                    autoAlpha: 1,
                    ease: "power2.out",
                    delay: delay
                });
                break;
        }
    });
    
    // Create a parallax effect for the theme orb
    gsap.to(".theme-orb", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 100,
        scale: 0.8,
        opacity: 0.5,
        ease: "none"
    });
}

// Initialize a 3D globe in the hero section
function init3DGlobe() {
    const container = document.getElementById('3d-globe-container');
    if (!container) return;
    
    // Scene setup
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    threeCamera.position.z = 5;
    
    // Renderer setup
    threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    threeRenderer.setSize(container.clientWidth, container.clientHeight);
    threeRenderer.setClearColor(0x000000, 0);
    container.appendChild(threeRenderer.domElement);
    
    // Add globe
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    
    // Create a material based on the current theme
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    
    const material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: new THREE.Color(primaryColor),
        transparent: true,
        opacity: 0.3
    });
    
    threeGlobe = new THREE.Mesh(geometry, material);
    threeScene.add(threeGlobe);
    
    // Add points on the globe
    addGlobePoints(primaryColor, secondaryColor);
    
    // Start animation loop
    animateGlobe();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        threeCamera.aspect = container.clientWidth / container.clientHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Add points to the globe
function addGlobePoints(primaryColor, secondaryColor) {
    const pointCount = 100;
    const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    
    for (let i = 0; i < pointCount; i++) {
        // Create a random position on the sphere
        const phi = Math.acos(-1 + (2 * i) / pointCount);
        const theta = Math.sqrt(pointCount * Math.PI) * phi;
        
        const x = 2 * Math.sin(phi) * Math.cos(theta);
        const y = 2 * Math.sin(phi) * Math.sin(theta);
        const z = 2 * Math.cos(phi);
        
        // Alternate between primary and secondary colors
        const color = i % 2 === 0 ? primaryColor : secondaryColor;
        const pointMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.7
        });
        
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(x, y, z);
        
        // Add some random animation to each point
        point.userData = {
            originalY: y,
            speed: Math.random() * 0.01
        };
        
        threeScene.add(point);
    }
}

// Animate the 3D globe
function animateGlobe() {
    if (!threeScene || !threeCamera || !threeRenderer || !threeGlobe) return;
    
    requestAnimationFrame(animateGlobe);
    
    // Rotate the globe
    threeGlobe.rotation.y += 0.002;
    
    // Animate the points
    threeScene.children.forEach(child => {
        if (child.geometry && child.geometry.type === "SphereGeometry" && child.geometry.parameters.radius === 0.05) {
            child.position.y = child.userData.originalY + Math.sin(Date.now() * child.userData.speed) * 0.1;
        }
    });
    
    threeRenderer.render(threeScene, threeCamera);
}

// Initialize the 3D showcase model
function init3DShowcase() {
    const container = document.getElementById('theme-showcase');
    if (!container) return;
    
    // Create a new scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create a cube with the current theme colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    
    // Create a multi-material cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const materials = [
        new THREE.MeshBasicMaterial({ color: new THREE.Color(primaryColor) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(secondaryColor) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(accentColor) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(primaryColor) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(secondaryColor) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(accentColor) })
    ];
    
    threeCube = new THREE.Mesh(geometry, materials);
    scene.add(threeCube);
    
    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        
        if (isAnimating) {
            threeCube.rotation.x += 0.01;
            threeCube.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Toggle cube rotation
function toggleRotation() {
    isAnimating = !isAnimating;
    
    const rotateBtn = document.getElementById('rotate-model');
    if (isAnimating) {
        rotateBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
        rotateBtn.innerHTML = '<i class="fas fa-sync"></i> Rotate';
    }
}

// Change the color of the 3D model
function changeModelTheme() {
    if (!threeCube) return;
    
    // Generate random colors
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;
    
    const color1 = `hsl(${hue1}, 80%, 55%)`;
    const color2 = `hsl(${hue2}, 80%, 60%)`;
    const color3 = `hsl(${hue3}, 80%, 65%)`;
    
    // Update the cube materials
    threeCube.material[0].color.set(color1);
    threeCube.material[1].color.set(color2);
    threeCube.material[2].color.set(color3);
    threeCube.material[3].color.set(color1);
    threeCube.material[4].color.set(color2);
    threeCube.material[5].color.set(color3);
    
    // Show a toast message
    showThemeSuccessMessage('Random 3D Theme');
}

// Initialize D3.js chart
function initD3Chart() {
    const chartContainer = document.getElementById('theme-usage-chart');
    if (!chartContainer) return;
    
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight || 300;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Create a color scale
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    
    const color = d3.scaleOrdinal()
        .domain(themeUsageData.map(d => d.name))
        .range([primaryColor, secondaryColor, accentColor, '#aaaaaa']);
    
    // Create the pie layout
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    // Create the arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.5) // Create a donut chart
        .outerRadius(radius * 0.8);
    
    // Create the outer arc for labels
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
    
    // Create the arcs
    const path = svg.selectAll('path')
        .data(pie(themeUsageData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.7)
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });
    
    // Add percentage labels
    svg.selectAll('text')
        .data(pie(themeUsageData))
        .enter()
        .append('text')
        .text(d => `${d.data.value}%`)
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .style('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity', 1);
}

// Toggle between light and dark base mode
function toggleDarkLightMode() {
    const currentTheme = document.body.className;
    const icon = toggleModeBtn.querySelector('i');
    
    if (currentTheme.includes('theme-dark') || currentTheme.includes('theme-neon')) {
        // Switch to light mode
        if (currentTheme.includes('theme-dark')) {
            switchTheme('theme-default');
            setActiveThemeButton(document.querySelector('[data-theme="theme-default"]'));
        } else if (currentTheme.includes('theme-neon')) {
            switchTheme('theme-pastel');
            setActiveThemeButton(document.querySelector('[data-theme="theme-pastel"]'));
        }
        icon.className = 'fas fa-moon';
    } else {
        // Switch to dark mode
        if (currentTheme.includes('theme-default') || currentTheme === '') {
            switchTheme('theme-dark');
            setActiveThemeButton(document.querySelector('[data-theme="theme-dark"]'));
        } else if (currentTheme.includes('theme-pastel') || currentTheme.includes('theme-forest')) {
            switchTheme('theme-neon');
            setActiveThemeButton(document.querySelector('[data-theme="theme-neon"]'));
        }
        icon.className = 'fas fa-sun';
    }
}

// Update the color swatches with current theme values
function updateColorSwatches() {
    const primarySwatch = document.querySelector('.primary-swatch .color-value');
    const secondarySwatch = document.querySelector('.secondary-swatch .color-value');
    const accentSwatch = document.querySelector('.accent-swatch .color-value');
    const backgroundSwatch = document.querySelector('.background-swatch .color-value');
    const textSwatch = document.querySelector('.text-swatch .color-value');
    
    if (primarySwatch) {
        primarySwatch.textContent = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    }
    
    if (secondarySwatch) {
        secondarySwatch.textContent = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    }
    
    if (accentSwatch) {
        accentSwatch.textContent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    }
    
    if (backgroundSwatch) {
        backgroundSwatch.textContent = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
    }
    
    if (textSwatch) {
        textSwatch.textContent = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
    }
}

// Function to switch themes with smooth transition
function switchTheme(theme) {
    // Show transition overlay
    showTransitionOverlay();
    
    // After a short delay, apply the theme
    setTimeout(() => {
        // Remove all theme classes
        document.body.classList.remove(
            'theme-default', 
            'theme-dark', 
            'theme-neon', 
            'theme-pastel', 
            'theme-forest'
        );
        
        // Add the new theme class
        document.body.classList.add(theme);
        
        // Apply font changes and animation speeds from config
        if (themeConfigs[theme]) {
            document.documentElement.style.setProperty('--font-primary', themeConfigs[theme].fontFamily);
            document.documentElement.style.setProperty('--font-secondary', themeConfigs[theme].secondaryFont);
            
            // Adjust animation speeds based on theme
            const animElements = document.querySelectorAll('[class*="anim"]');
            animElements.forEach(el => {
                el.style.animationDuration = `${themeConfigs[theme].animationSpeed * 2}s`;
            });
        }
        
        // Hide the transition overlay
        hideTransitionOverlay();
    }, 400);
}

function showTransitionOverlay() {
    document.body.classList.add('theme-transitioning');
    themeTransitionOverlay.style.opacity = '0.8';
}

function hideTransitionOverlay() {
    setTimeout(() => {
        themeTransitionOverlay.style.opacity = '0';
        document.body.classList.remove('theme-transitioning');
    }, 400);
}

function setActiveThemeButton(activeButton) {
    // Remove active class from all buttons
    themeButtons.forEach(button => button.classList.remove('active'));
    
    // Add active class to the clicked button
    activeButton.classList.add('active');
}

// Simulated AI theme generation
function generateAITheme() {
    // Show the AI thinking modal
    aiThinkingModal.classList.add('visible');
    
    // Get current page elements to "analyze"
    simulateAIAnalysis()
        .then(aiTheme => {
            // Hide the AI thinking modal
            aiThinkingModal.classList.remove('visible');
            
            // Apply the "AI generated" theme
            applyAITheme(aiTheme);
        });
}

function simulateAIAnalysis() {
    return new Promise(resolve => {
        // Simulate AI processing time with progress animation
        const progressBar = document.querySelector('.ai-progress-bar');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += 2;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // After completion, create a simulated AI theme
                setTimeout(() => {
                    resolve(generateRandomTheme());
                }, 500);
            }
        }, 30);
    });
}

// Generate a random theme to simulate AI creation
function generateRandomTheme() {
    // Create a "unique" theme with random color variables
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + Math.floor(Math.random() * 120 + 120)) % 360;
    const hue3 = (hue2 + Math.floor(Math.random() * 120 + 60)) % 360;
    
    // Create a theme with complementary colors
    return {
        name: 'AI Generated Theme',
        primaryColor: `hsl(${hue1}, 80%, 55%)`,
        secondaryColor: `hsl(${hue2}, 80%, 60%)`,
        accentColor: `hsl(${hue3}, 80%, 65%)`,
        backgroundColor: Math.random() > 0.5 ? '#ffffff' : '#121212',
        secondaryBackground: Math.random() > 0.5 ? '#f5f7fa' : '#1e1e1e',
        textColor: Math.random() > 0.5 ? '#333333' : '#f1f1f1',
        secondaryText: Math.random() > 0.5 ? '#666666' : '#aaaaaa',
        fontPrimary: getRandomFont(),
        cardShadow: Math.random() > 0.5 ? 
            '0 10px 30px rgba(0, 0, 0, 0.1)' : 
            '0 10px 30px rgba(255, 255, 255, 0.05)'
    };
}

function getRandomFont() {
    const fonts = ['Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lato'];
    return `${fonts[Math.floor(Math.random() * fonts.length)]}, sans-serif`;
}

function applyAITheme(theme) {
    // Show transition effect
    showTransitionOverlay();
    
    setTimeout(() => {
        // Remove existing theme classes
        document.body.className = '';
        
        // Apply custom CSS variables for the AI theme
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--accent-color', theme.accentColor);
        document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
        document.documentElement.style.setProperty('--secondary-background', theme.secondaryBackground);
        document.documentElement.style.setProperty('--text-color', theme.textColor);
        document.documentElement.style.setProperty('--secondary-text', theme.secondaryText);
        document.documentElement.style.setProperty('--font-primary', theme.fontPrimary);
        document.documentElement.style.setProperty('--card-shadow', theme.cardShadow);
        
        // Create a unique animation
        createDynamicAnimations(theme);
        
        // Hide transition overlay
        hideTransitionOverlay();
        
        // Show a success message
        showThemeSuccessMessage(theme.name);
    }, 400);
}

function createDynamicAnimations(theme) {
    // Add special animations for the AI-generated theme
    const heroTitle = document.querySelector('.hero-content h2');
    if (heroTitle) {
        heroTitle.style.animation = 'gradient-shift 4s ease infinite';
        heroTitle.style.backgroundSize = '300% 100%';
    }
    
    // Add a subtle pulse effect to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.animation = 'pulse 3s infinite';
        card.style.animationDelay = `${Math.random() * 2}s`;
    });
}

function showThemeSuccessMessage(themeName) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.innerHTML = `
        <div class="theme-toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${themeName} applied successfully!</span>
        </div>
    `;
    
    // Add styles for the toast
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'var(--primary-color)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '1000';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Show the toast with animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Scroll animations
function animateOnScroll() {
    const scrollY = window.scrollY;
    
    // Animate orb parallax effect
    const orb = document.querySelector('.theme-orb');
    if (orb) {
        const parallaxAmount = scrollY * 0.1;
        orb.style.transform = `translateY(${parallaxAmount}px) scale(${1 - parallaxAmount/1000})`;
    }
    
    // Fade in cards as they come into view
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (cardPosition < screenPosition) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
        }
    });
}

// Initialize particle effects
function initParticles() {
    // Check if canvas API is supported
    if (!document.createElement('canvas').getContext) {
        return; // Canvas not supported
    }
    
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.1';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Particle settings
    const particleCount = 30;
    const particles = [];
    
    // Generate particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25
        });
    }
    
    // Animation function
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            // Get current theme color
            particle.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
            
            // Move particles
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start animation
    animate();
} 