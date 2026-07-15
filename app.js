import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

/* --------------------------------------------------
   MR SOLUTION APPLICATION SCRIPT
   -------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialize UI components first
  initMobileMenu();
  initContactForm();
  initHubtownThreeDScroll();

  // Run animations if motion is allowed
  if (!prefersReducedMotion) {
    initGsapAnimations();
  } else {
    // If reduced motion, set paths and layout states to their final static positions
    const sigPath = document.querySelector("#signature-circuit-path");
    if (sigPath) {
      const pathLength = sigPath.getTotalLength();
      sigPath.style.strokeDasharray = pathLength;
      sigPath.style.strokeDashoffset = 0;
    }
    const pulse = document.querySelector("#trace-pulse");
    if (pulse) {
      pulse.style.display = "none";
    }
  }
});

/* --------------------------------------------------
   MOBILE MENU LOGIC
   -------------------------------------------------- */
function initMobileMenu() {
  const trigger = document.querySelector(".mobile-menu-trigger");
  const menu = document.querySelector(".mobile-menu");
  const links = document.querySelectorAll(".mobile-nav-link");

  if (!trigger || !menu) return;

  function toggleMenu() {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", !isExpanded);
    trigger.classList.toggle("active");
    menu.classList.toggle("active");
    menu.setAttribute("aria-hidden", isExpanded);
    
    // Toggle body scroll to prevent background scrolling when menu is open
    document.body.style.overflow = isExpanded ? "" : "hidden";
  }

  trigger.addEventListener("click", toggleMenu);

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener("click", () => {
      if (menu.classList.contains("active")) {
        toggleMenu();
      }
    });
  });
}

/* --------------------------------------------------
   GSAP & SCROLLTRIGGER ANIMATIONS
   -------------------------------------------------- */
// Initialize Background Schematic Parallax
function initBackgroundParallax() {
  // Gracefully exit if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Slow architectural drag on the main schematic drafting grid
  gsap.to('.schematic-grid-overlay', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5 // Smooth catch-up delay
    }
  });

  // Layered depth: Animate terminal nodes at differing, accelerated velocities
  gsap.to('.node-alpha', {
    y: '-40vh',
    x: '30px',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8
    }
  });

  gsap.to('.node-beta', {
    y: '-60vh',
    x: '-40px',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2
    }
  });

  gsap.to('.node-gamma', {
    y: '-35vh',
    x: '15px',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6
    }
  });
}

// Call configuration alongside existing GSAP animations
initBackgroundParallax();
   function initGsapAnimations() {
  // Register ScrollTrigger plugin (loaded via CDN)
  gsap.registerPlugin(ScrollTrigger);

  // 1. Signature Circuit Trace & Current Pulse
  const sigPath = document.querySelector("#signature-circuit-path");
  const pulse = document.querySelector("#trace-pulse");

  if (sigPath && pulse) {
    const pathLength = sigPath.getTotalLength();
    
    // Set up path stroke properties for drawing effect
    sigPath.style.strokeDasharray = pathLength;
    sigPath.style.strokeDashoffset = pathLength;

    // Timeline for initial draw and looping pulse
    const circuitTimeline = gsap.timeline({ delay: 0.5 });

    // Draw the path in
    circuitTimeline.to(sigPath, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: "power2.out"
    });

    // Animate current pulse along the path using custom object update
    const pulseData = { progress: 0 };
    
    circuitTimeline.to(pulseData, {
      progress: 1,
      duration: 3.5,
      repeat: -1,
      ease: "none",
      onUpdate: () => {
        const point = sigPath.getPointAtLength(pulseData.progress * pathLength);
        pulse.setAttribute("cx", point.x);
        pulse.setAttribute("cy", point.y);
      }
    }, "-=0.5"); // Start pulse slightly before drawing finishes
  }

  // 2. Hero Section Staggered Entrance
  const heroItems = document.querySelectorAll(".stagger-hero-item");
  if (heroItems.length > 0) {
    gsap.from(heroItems, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.2
    });
  }

  // 3. Scroll Reveals for Generic Sections
  const reveals = document.querySelectorAll(".scroll-reveal");
  reveals.forEach(el => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%", // Starts reveal when element is 85% from top of viewport
        toggleActions: "play none none none"
      }
    });
  });

  // 4. Staggered reveal for Capability Cards
  const capCards = document.querySelectorAll(".capability-card");
  if (capCards.length > 0) {
    gsap.from(capCards, {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".capabilities-grid",
        start: "top 80%"
      }
    });
  }

  // 5. Staggered reveal for Project Rows
  const projectRows = document.querySelectorAll(".project-row");
  if (projectRows.length > 0) {
    gsap.from(projectRows, {
      x: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".project-table",
        start: "top 80%"
      }
    });
  }

  // 6. Interactive Process Conductor Line Glow
  const conductorGlow = document.querySelector(".timeline-conductor-glow");
  if (conductorGlow) {
    gsap.to(conductorGlow, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".process-timeline",
        start: "top 20%",
        end: "bottom 80%",
        scrub: true
      }
    });
  }

  // Activate timeline steps as they scroll in
  const processSteps = document.querySelectorAll(".process-step");
  processSteps.forEach(step => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 65%",
      onEnter: () => step.classList.add("active"),
      onLeaveBack: () => step.classList.remove("active")
    });
  });
}

/* --------------------------------------------------
   CONTACT FORM VALIDATION & SIMULATION
   -------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("#engineering-contact-form");
  const statusBox = document.querySelector("#form-status");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Clear previous status
    statusBox.className = "form-status-box";
    statusBox.style.display = "none";
    statusBox.textContent = "";

    // Inputs
    const nameInput = document.querySelector("#client-name");
    const emailInput = document.querySelector("#client-email");
    const detailsInput = document.querySelector("#project-details");

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      showError(nameInput, true);
      isValid = false;
    } else {
      showError(nameInput, false);
    }

    // Validate Email
    if (!validateEmail(emailInput.value)) {
      showError(emailInput, true);
      isValid = false;
    } else {
      showError(emailInput, false);
    }

    // Validate Details
    if (!detailsInput.value.trim()) {
      showError(detailsInput, true);
      isValid = false;
    } else {
      showError(detailsInput, false);
    }

    if (!isValid) return;

    // Simulate Transmission (Cinematic Datasheet Loader)
    const submitBtn = form.querySelector(".btn-submit");
    const submitBtnText = submitBtn.querySelector("span");
    const originalText = submitBtnText.textContent;
    
    submitBtn.disabled = true;
    submitBtnText.textContent = "TRANSMITTING TELEMETRY NODE...";

    setTimeout(() => {
      // Complete Simulation
      submitBtn.disabled = false;
      submitBtnText.textContent = originalText;

      statusBox.classList.add("success");
      statusBox.textContent = "CONNECTION SECURED. TELEMETRY RECEIVED AND REGISTERED IN LOG [AMX-IN-BOUND-026].";
      
      form.reset();
    }, 2000);
  });

  function showError(inputElement, show) {
    const group = inputElement.closest(".form-group");
    if (show) {
      group.classList.add("invalid");
    } else {
      group.classList.remove("invalid");
    }
  }

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }
}

function initHubtownThreeDScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.querySelector('#blueprint-3d-stage');
  if (!canvas) return;

  // 1. Scene Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0b0d, 0.015); // Emulate Hubtown structural depth fade

  // 2. Camera Coordinates
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0; // Baseline Z-axis indexing

  // 3. WebGL Renderer Initialization
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 4. Build Engineering Circuit Tunnel Geometry
  const tunnelSegments = 60;
  const points = [];
  
  // Generate a smooth mathematical line track for the tunnel path
  for (let i = 0; i < tunnelSegments; i++) {
    points.push(new THREE.Vector3(
      Math.sin(i * 0.1) * 5, 
      Math.cos(i * 0.1) * 2, 
      i * 8
    ));
  }
  
  const tunnelPath = new THREE.CatmullRomCurve3(points);
  
  // Create a clean, structural cylinder mesh framework around the track
  const tubeGeometry = new THREE.TubeGeometry(tunnelPath, 100, 4, 12, false);
  
  // Wireframe material rendering in your signature Plated Brass & Physical Copper tones
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xc19a5b, // Plated Brass hex value
    wireframe: true,
    transparent: true,
    opacity: 0.07
  });
  
  const tunnelMesh = new THREE.Mesh(tubeGeometry, wireframeMaterial);
  scene.add(tunnelMesh);

  // Add glowing data terminal ring nodes down the line
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const pos = tunnelPath.getPointAt(t);
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.8 + Math.random() * 0.4; // Frame tightly along the tube walls
    
    positions[i * 3] = pos.x + Math.sin(angle) * radius;
    positions[i * 3 + 1] = pos.y + Math.cos(angle) * radius;
    positions[i * 3 + 2] = pos.z;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xff9d5c, // Energized copper glow hex value
    size: 0.08,
    transparent: true,
    opacity: 0.4
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // 5. Connect Camera Flight Path directly to GSAP ScrollTrigger
  const totalLength = points[points.length - 1].z;

  gsap.to(camera.position, {
    z: totalLength - 15,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8, // Smooth momentum tracking delay
      onUpdate: (self) => {
        // Direct the camera to look along the curve of the tunnel path based on scroll step
        const progress = self.progress * 0.95;
        const lookTarget = tunnelPath.getPointAt(Math.min(progress + 0.05, 1));
        const currentPos = tunnelPath.getPointAt(progress);
        
        // Dynamically shift camera offsets slightly off-center for rich 3D depth parallax
        camera.position.x = currentPos.x;
        camera.position.y = currentPos.y + 0.2;
        camera.lookAt(lookTarget);
      }
    }
  });

  // 6. Handle Frame Resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 7. Render Loop Engine
  function animate() {
    requestAnimationFrame(animate);
    // Add micro-rotation down the wireframe tunnel for active telemetry feel
    tunnelMesh.rotation.z += 0.0005;
    renderer.render(scene, camera);
  }
  animate();
}
