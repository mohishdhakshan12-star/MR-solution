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

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010203, 0.0035); // Dense fog hides the horizon edge

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2500);
  camera.position.set(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- 3. TOPOGRAPHICAL TERRAIN ---
  // Procedural mountain/valley displacement
  const gridGeo = new THREE.PlaneGeometry(2500, 2500, 80, 80);
  const posAttribute = gridGeo.attributes.position;
  
  for (let i = 0; i < posAttribute.count; i++) {
    let x = posAttribute.getX(i);
    let y = posAttribute.getY(i);
    // Math-based terrain generation (Sine/Cosine waves)
    let z = Math.sin(x * 0.003) * Math.cos(y * 0.003) * 80 + Math.sin(x * 0.01) * 20;
    posAttribute.setZ(i, z);
  }
  gridGeo.computeVertexNormals();

  const gridMat = new THREE.MeshBasicMaterial({ color: 0x3a8fb7, wireframe: true, transparent: true, opacity: 0.12 });
  const terrain = new THREE.Mesh(gridGeo, gridMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -80; // Distance below the camera
  scene.add(terrain);

  // High-altitude atmospheric dust
  const particleGeo = new THREE.BufferGeometry();
  const pCount = 1500;
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i < pCount * 3; i+=3) {
    pPos[i] = (Math.random() - 0.5) * 800;   
    pPos[i+1] = (Math.random() - 0.5) * 800; 
    pPos[i+2] = -Math.random() * 1500;       
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.3 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Target Bogeys (Wireframe Octahedrons)
  const targetGroup = new THREE.Group();
  scene.add(targetGroup);
  
  const targetMat = new THREE.MeshBasicMaterial({ color: 0xd93829, wireframe: true, transparent: true, opacity: 0 }); 
  
  const target1 = new THREE.Mesh(new THREE.OctahedronGeometry(15, 0), targetMat);
  target1.position.set(-200, 20, -500); 
  targetGroup.add(target1);

  const target2 = new THREE.Mesh(new THREE.OctahedronGeometry(20, 0), targetMat);
  target2.position.set(250, -30, -600); 
  targetGroup.add(target2);

  // --- 4. HEAD-TRACKING LOGIC ---
  let normX = 0; let normY = 0;
  document.addEventListener('mousemove', (e) => {
    normX = (e.clientX - window.innerWidth / 2) * 0.001;
    normY = (e.clientY - window.innerHeight / 2) * 0.001;
    
    // Animate center eye-reticle to follow gaze slightly
    gsap.to("#reticle-center", {
      x: normX * 80,
      y: normY * 80,
      duration: 0.2
    });

    // Helmet perspective sway
    gsap.to("#visor-ui", {
      rotationY: normX * 12,
      rotationX: -normY * 12,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  // Custom cursor movement
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => gsap.to(cursor, { scale: 0.7, duration: 0.1 }));
    document.addEventListener('mouseup', () => gsap.to(cursor, { scale: 1, duration: 0.2, ease: "back.out(2)" }));
  }

  // --- 5. FLIGHT DYNAMICS & GSAP SCROLL ---
  const flightEngine = { speed: 1.5 }; // Slow cruising speed

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const tracker = document.getElementById('scroll-tracker');
        if (tracker) {
          if (self.progress > 0.05) {
            tracker.style.opacity = '0';
          } else {
            tracker.style.opacity = '0.5';
          }
        }
      }
    }
  });

  // Phase 1: Look Left
  tl.to(camera.rotation, { y: 0.35, ease: "sine.inOut" }, 0)
    .to(targetMat, { opacity: 0.6, duration: 0.5 }, 0) 
    .to("#status-text", { textContent: "BOGEY IDENTIFIED", duration: 0 }, 0)
    
  // Phase 2: Look Right
  tl.to(camera.rotation, { y: -0.35, ease: "sine.inOut" }, 1)
    
  // Phase 3: Lock On & Combat Mode
  tl.to(camera.rotation, { y: 0, ease: "power2.out" }, 2)
    .to("#helmet-viewport", { className: "viewport-container combat-mode", duration: 0.1 }, 2)
    .to(targetMat, { opacity: 1, duration: 0.2 }, 2) 
    .to("#status-text", { textContent: "COMBAT OVERRIDE", duration: 0 }, 2)
    .to("#reticle-center", { scale: 0.6, rotate: 45, duration: 0.3 }, 2) 
    
  // Phase 4: Engage Thrusters (Speed increases dynamically)
  tl.to(camera, { fov: 90, ease: "power2.in" }, 3) 
    .to(terrain.position, { y: -120, ease: "power2.in" }, 3) 
    .to(flightEngine, { speed: 18, ease: "power3.in" }, 3) // Massive speed boost
    .to(".ui-perspective", { opacity: 0.3, scale: 1.05, ease: "power2.in" }, 3); 

  // --- 6. RENDER LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    // Simulate head sway mapped to mouse
    camera.position.x += (normX * 15 - camera.position.x) * 0.05;
    camera.position.y += (-normY * 15 - camera.position.y) * 0.05;

    // Move particles based on dynamic engine speed
    const positions = particles.geometry.attributes.position.array;
    for(let i=2; i < pCount * 3; i+=3) {
      positions[i] += flightEngine.speed;
      if(positions[i] > 100) positions[i] = -1500; 
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Scroll the topographical terrain seamlessly
    terrain.position.z += flightEngine.speed;
    if(terrain.position.z > 60) terrain.position.z = 0; // Seamless loop reset

    // Spin target bogeys
    target1.rotation.y += 0.01;
    target1.rotation.x += 0.005;
    target2.rotation.y -= 0.01;

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  // Tickers
  const repInterval = setInterval(() => {
    const rep = document.getElementById('val-rep');
    if (rep) rep.innerText = Math.floor(80 + Math.random() * 8);
  }, 200);

  const altInterval = setInterval(() => {
    const alt = document.getElementById('val-alt');
    if (alt) alt.innerText = Math.floor(42000 + Math.random() * 150).toLocaleString();
  }, 800);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}
