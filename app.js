/* --------------------------------------------------
   MR SOLUTION APPLICATION SCRIPT
   -------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initialize UI components first
  initMobileMenu();
  initContactForm();

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
