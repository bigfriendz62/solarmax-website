/* SOLARMAX LIMITED KENYA — site script */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('hidden'), 350);
  });
  // fallback in case 'load' is slow/blocked
  setTimeout(() => loader && loader.classList.add('hidden'), 2500);

  /* ---------- Scroll to top (declared early: referenced by onScroll below) ---------- */
  const totop = document.getElementById('totop');
  function toggleTotop(){ totop.classList.toggle('show', window.scrollY > 700); }
  totop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ---------- Nav: scrolled state + hamburger + active link ---------- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  function setActiveLink(){
    let current = sections[0];
    const y = window.scrollY + 120;
    sections.forEach(s => { if (s.offsetTop <= y) current = s; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current?.id));
  }

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    toggleTotop();
    setActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countIO.observe(el));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('tSlides');
  const slides = track ? [...track.children] : [];
  const dotsWrap = document.getElementById('tDots');
  let tIndex = 0;
  if (slides.length){
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
    function render(){
      track.style.transform = `translateX(-${tIndex * 100}%)`;
      [...dotsWrap.children].forEach((d,i) => d.classList.toggle('active', i === tIndex));
    }
    function goTo(i){ tIndex = (i + slides.length) % slides.length; render(); }
    document.getElementById('tPrev').addEventListener('click', () => goTo(tIndex - 1));
    document.getElementById('tNext').addEventListener('click', () => goTo(tIndex + 1));
    let auto = setInterval(() => goTo(tIndex + 1), 5500);
    document.getElementById('tSlider').addEventListener('mouseenter', () => clearInterval(auto));
    document.getElementById('tSlider').addEventListener('mouseleave', () => auto = setInterval(() => goTo(tIndex + 1), 5500));
  }

  /* ---------- Lightbox gallery ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  document.querySelectorAll('[data-lightbox]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      lightboxImg.src = trigger.dataset.lightbox;
      lightboxImg.alt = trigger.dataset.caption || '';
      lightbox.classList.add('open');
    });
  });
  document.getElementById('lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

  /* ---------- Contact form (EmailJS-ready, no backend required) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      status.textContent = 'Sending…';
      status.className = 'form-status';

      // To go live: include the EmailJS SDK script tag in index.html, then
      // replace the block below with:
      // emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form, 'YOUR_PUBLIC_KEY')
      //   .then(() => { ... }).catch(() => { ... });
      if (window.emailjs){
        emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
          .then(() => {
            status.textContent = 'Message sent — we\'ll reply within a few hours.';
            status.className = 'form-status ok';
            form.reset();
          })
          .catch(() => {
            status.textContent = 'Could not send. Please WhatsApp us instead.';
            status.className = 'form-status err';
          });
      } else {
        // Fallback while EmailJS isn't wired up yet
        setTimeout(() => {
          status.textContent = 'Thanks — form captured. Connect EmailJS to enable live sending.';
          status.className = 'form-status ok';
          form.reset();
        }, 700);
      }
    });
  }

  /* ---------- Newsletter form ---------- */
  const nl = document.getElementById('newsletterForm');
  if (nl){
    nl.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nl.querySelector('input');
      if (input.value) { input.value = ''; input.placeholder = 'Subscribed ✓'; }
    });
  }

  /* ---------- Lazy loading fallback attrs already set via loading="lazy" ---------- */
});
