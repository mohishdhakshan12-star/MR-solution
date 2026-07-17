import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

/* --------------------------------------------------
   MR SOLUTION APPLICATION SCRIPT
   -------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Boot loader sequence
  initBootLoader();

  // Initialize UI components first
  initMobileMenu();
  initContactForm();
  initHubtownThreeDScroll();
  initNavRedirects();

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
/* --------------------------------------------------
   GSAP & SCROLLTRIGGER INITIALIZATIONS
   -------------------------------------------------- */
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

    // Animate current pulse along the path
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
    }, "-=0.5");
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
}

/* --------------------------------------------------
   NAVIGATION REDIRECTS MAPPED TO SCROLL PROGRESS
   -------------------------------------------------- */
function initNavRedirects() {
  const links = document.querySelectorAll(".nav-link, .mobile-nav-link, .nav-cta, .mobile-cta");
  
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.startsWith("#")) {
        e.preventDefault();

        // Map section anchors to scroll-percentage heights matching the new staggered timeline
        const scrollMap = {
          "#hero": 0.0,
          "#capabilities": 0.22,
          "#projects": 0.41,
          "#process": 0.59,
          "#about": 0.78,
          "#contact": 0.96
        };

        const progress = scrollMap[targetId] !== undefined ? scrollMap[targetId] : 0.0;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        window.scrollTo({
          top: maxScroll * progress,
          behavior: "smooth"
        });
      }
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

  const sections = document.querySelectorAll('.cinematic-viewport section');
  
  // Set initial states for cinematic zoom slides (all start hidden to prevent boot flashes)
  sections.forEach((sec, idx) => {
    gsap.set(sec, { opacity: 0, scale: 0.3, visibility: "hidden", pointerEvents: "none" });
    sec.classList.remove('active');
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2.5, // Silky inertial momentum tracking
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

  // Master timeline duration: 8.0 units.
  // 1. Hero (Section 0) transitions (fades out and scales up as we scroll past)
  tl.to(sections[0], { 
    opacity: 0, 
    scale: 1.8, 
    autoAlpha: 0, 
    pointerEvents: "none", 
    duration: 0.3, 
    onStart: () => sections[0].classList.remove('active'),
    onReverseComplete: () => sections[0].classList.add('active')
  }, 0.6);

  // Stagger hero out
  tl.to(sections[0].querySelectorAll('.stagger-hero-item'), {
    y: -40,
    opacity: 0,
    stagger: 0.05,
    duration: 0.3
  }, 0.6);

  // 2. Capabilities (Section 1) transitions
  tl.to(sections[1], { 
    opacity: 1, 
    scale: 1, 
    autoAlpha: 1, 
    pointerEvents: "auto", 
    duration: 0.3, 
    onStart: () => sections[1].classList.add('active'),
    onReverseComplete: () => sections[1].classList.remove('active')
  }, 1.1)
  // Hubtown-style stagger entrance
  .fromTo(sections[1].querySelectorAll('.mono-section-label, .section-title, .section-desc, .capability-card'), 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: "power2.out" },
    1.1
  )
  .to(sections[1], { 
    opacity: 0, 
    scale: 1.8, 
    autoAlpha: 0, 
    pointerEvents: "none", 
    duration: 0.3, 
    onStart: () => sections[1].classList.remove('active'),
    onReverseComplete: () => sections[1].classList.add('active')
  }, 2.1)
  // Stagger exit
  .to(sections[1].querySelectorAll('.mono-section-label, .section-title, .section-desc, .capability-card'), {
    y: -40,
    opacity: 0,
    stagger: 0.03,
    duration: 0.3
  }, 2.1);

  // 3. Projects (Section 2) transitions
  tl.to(sections[2], { 
    opacity: 1, 
    scale: 1, 
    autoAlpha: 1, 
    pointerEvents: "auto", 
    duration: 0.3, 
    onStart: () => sections[2].classList.add('active'),
    onReverseComplete: () => sections[2].classList.remove('active')
  }, 2.6)
  // Stagger entrance
  .fromTo(sections[2].querySelectorAll('.mono-section-label, .section-title, .section-desc, .project-row'), 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: "power2.out" },
    2.6
  )
  .to(sections[2], { 
    opacity: 0, 
    scale: 1.8, 
    autoAlpha: 0, 
    pointerEvents: "none", 
    duration: 0.3, 
    onStart: () => sections[2].classList.remove('active'),
    onReverseComplete: () => sections[2].classList.add('active')
  }, 3.6)
  // Stagger exit
  .to(sections[2].querySelectorAll('.mono-section-label, .section-title, .section-desc, .project-row'), {
    y: -40,
    opacity: 0,
    stagger: 0.03,
    duration: 0.3
  }, 3.6);

  // 4. Process (Section 3) transitions
  tl.to(sections[3], { 
    opacity: 1, 
    scale: 1, 
    autoAlpha: 1, 
    pointerEvents: "auto", 
    duration: 0.3, 
    onStart: () => sections[3].classList.add('active'),
    onReverseComplete: () => sections[3].classList.remove('active')
  }, 4.1)
  // Stagger entrance
  .fromTo(sections[3].querySelectorAll('.mono-section-label, .section-title, .section-desc, .process-step'), 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: "power2.out" },
    4.1
  )
  .to(sections[3], { 
    opacity: 0, 
    scale: 1.8, 
    autoAlpha: 0, 
    pointerEvents: "none", 
    duration: 0.3, 
    onStart: () => sections[3].classList.remove('active'),
    onReverseComplete: () => sections[3].classList.add('active')
  }, 5.1)
  // Stagger exit
  .to(sections[3].querySelectorAll('.mono-section-label, .section-title, .section-desc, .process-step'), {
    y: -40,
    opacity: 0,
    stagger: 0.03,
    duration: 0.3
  }, 5.1);

  // 5. About (Section 4) transitions
  tl.to(sections[4], { 
    opacity: 1, 
    scale: 1, 
    autoAlpha: 1, 
    pointerEvents: "auto", 
    duration: 0.3, 
    onStart: () => sections[4].classList.add('active'),
    onReverseComplete: () => sections[4].classList.remove('active')
  }, 5.6)
  // Stagger entrance
  .fromTo(sections[4].querySelectorAll('.mono-section-label, .section-title, .about-lead, .about-text, .specs-panel, .specs-list li'), 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: "power2.out" },
    5.6
  )
  .to(sections[4], { 
    opacity: 0, 
    scale: 1.8, 
    autoAlpha: 0, 
    pointerEvents: "none", 
    duration: 0.3, 
    onStart: () => sections[4].classList.remove('active'),
    onReverseComplete: () => sections[4].classList.add('active')
  }, 6.6)
  // Stagger exit
  .to(sections[4].querySelectorAll('.mono-section-label, .section-title, .about-lead, .about-text, .specs-panel, .specs-list li'), {
    y: -40,
    opacity: 0,
    stagger: 0.03,
    duration: 0.3
  }, 6.6);

  // 6. Contact (Section 5) transitions
  tl.to(sections[5], { 
    opacity: 1, 
    scale: 1, 
    autoAlpha: 1, 
    pointerEvents: "auto", 
    duration: 0.3, 
    onStart: () => sections[5].classList.add('active'),
    onReverseComplete: () => sections[5].classList.remove('active')
  }, 7.1)
  // Stagger entrance
  .fromTo(sections[5].querySelectorAll('.mono-section-label, .section-title, .section-desc, .form-group, .form-checkbox-group, .form-actions, .info-block'), 
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: "power2.out" },
    7.1
  );

  // Three.js animations synchronized on the same timeline
  // Phase 1: Look Left
  tl.to(camera.rotation, { y: 0.35, ease: "sine.inOut" }, 1.1)
    .to(targetMat, { opacity: 0.6, duration: 0.5 }, 1.1) 
    .to("#status-text", { textContent: "BOGEY IDENTIFIED", duration: 0 }, 1.1);
    
  // Phase 2: Look Right
  tl.to(camera.rotation, { y: -0.35, ease: "sine.inOut" }, 2.6);
    
  // Phase 3: Lock On & Combat Mode
  tl.to(camera.rotation, { y: 0, ease: "power2.out" }, 4.1)
    .to("#helmet-viewport", { className: "viewport-container combat-mode", duration: 0.1 }, 4.1)
    .to(targetMat, { opacity: 1, duration: 0.2 }, 4.1) 
    .to("#status-text", { textContent: "COMBAT OVERRIDE", duration: 0 }, 4.1)
    .to("#reticle-center", { scale: 0.6, rotate: 45, duration: 0.3 }, 4.1);
    
  // Phase 4: Engage Thrusters (Speed increases dynamically)
  tl.to(camera, { fov: 90, ease: "power2.in" }, 5.6) 
    .to(terrain.position, { y: -120, ease: "power2.in" }, 5.6) 
    .to(flightEngine, { speed: 18, ease: "power3.in" }, 5.6) // Massive speed boost
    .to(".ui-perspective", { opacity: 0.3, scale: 1.05, ease: "power2.in" }, 5.6); 

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
    positions.needsUpdate = true;

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

/* --------------------------------------------------
   CINEMATIC SYSTEM BOOT SEQUENCE
   -------------------------------------------------- */
function initBootLoader() {
  const loader = document.getElementById("boot-loader");
  const percentText = document.getElementById("loader-percent-val");
  const statusText = document.getElementById("loader-status-msg");
  const btn = document.getElementById("btn-enter-simulation");
  const opening = document.getElementById("big-opening-brand");
  const blocks = document.querySelectorAll(".loader-block-dot");

  if (!loader || !percentText || !statusText || !btn || !opening || blocks.length === 0) return;

  // Disable scroll at boot
  document.body.style.overflow = "hidden";

  // Diagnostic status text list to cycle through as percentage climbs
  const statusMessages = [
    "INITIALIZING COGNITIVE INTERFACE...",
    "RETRIEVING GEOMETRIC COORDINATES...",
    "ATMOSPHERIC DATA LAYER INITIATED...",
    "ALL CORE SYSTEMS NOMINAL"
  ];

  // We use GSAP to animate a proxy object's progress property from 0 to 100
  const progressObj = { value: 0 };

  gsap.to(progressObj, {
    value: 100,
    duration: 3.5, // 3.5 seconds loading time
    ease: "power1.inOut",
    onUpdate: () => {
      const currentVal = Math.floor(progressObj.value);
      percentText.textContent = `${currentVal}%`;

      // Calculate how many blocks out of total block count should light up
      const totalBlocks = blocks.length;
      const activeCount = Math.floor((currentVal / 100) * totalBlocks);

      blocks.forEach((block, idx) => {
        if (idx < activeCount) {
          block.classList.add("active");
        } else {
          block.classList.remove("active");
        }
      });

      // Cycle status labels based on progress range
      if (currentVal < 30) {
        statusText.textContent = statusMessages[0];
      } else if (currentVal < 60) {
        statusText.textContent = statusMessages[1];
      } else if (currentVal < 90) {
        statusText.textContent = statusMessages[2];
      } else {
        statusText.textContent = statusMessages[3];
      }
    },
    onComplete: () => {
      // Hide status labels and show command button
      gsap.to(statusText, { opacity: 0, duration: 0.3 });
      gsap.to(percentText, { opacity: 0, duration: 0.3, onComplete: () => {
        percentText.style.display = "none";
        statusText.style.display = "none";
        btn.style.display = "inline-block";
        gsap.from(btn, { opacity: 0, scale: 0.9, duration: 0.5, ease: "back.out(1.5)" });
      }});
    }
  });

  // Enter click handler
  btn.addEventListener("click", () => {
    // 1. Zoom and fade out loader
    gsap.to(loader, {
      opacity: 0,
      scale: 1.1,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        loader.style.display = "none";
        
        // 2. Trigger Epic Reveal Splash
        opening.classList.add("active");
        
        // 3. Keep splash active, then zoom/fade out
        setTimeout(() => {
          opening.classList.remove("active");
          gsap.to(opening, {
            opacity: 0,
            scale: 1.3,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
              opening.style.display = "none";
              
              // Restore scroll track
              document.body.style.overflow = "";

              // Fade in Navigation Header
              gsap.to(".header", { opacity: 1, visibility: "visible", duration: 1.2, ease: "power2.out" });

              // Fade in Hero slide
              const firstSection = document.querySelector('.cinematic-viewport section');
              if (firstSection) {
                gsap.to(firstSection, { 
                  opacity: 1, 
                  scale: 1, 
                  autoAlpha: 1, 
                  pointerEvents: "auto", 
                  duration: 1.2, 
                  ease: "power2.out", 
                  onComplete: () => firstSection.classList.add('active') 
                });
                
                // Stagger inner items of hero in (Hubtown style)
                gsap.fromTo(firstSection.querySelectorAll('.stagger-hero-item'),
                  { y: 40, opacity: 0 },
                  { y: 0, opacity: 1, stagger: 0.08, duration: 1.0, ease: "power2.out" }
                );
              }

              // Visor components fly in from edges
              const visorPanels = document.querySelectorAll(".hud-panel");
              const reticle = document.getElementById("reticle-center");
              const tracker = document.getElementById("scroll-tracker");

              gsap.from(visorPanels[0], { x: -300, rotationY: 90, opacity: 0, duration: 1.5, ease: "power3.out" });
              gsap.from(visorPanels[1], { x: 300, rotationY: -90, opacity: 0, duration: 1.5, ease: "power3.out" });
              gsap.from(reticle, { scale: 3, opacity: 0, duration: 1.2, ease: "back.out(1.7)" });
              gsap.from(tracker, { y: 100, opacity: 0, duration: 1.5, ease: "power2.out" });
            }
          });
        }, 2200);
      }
    });
  });
}
