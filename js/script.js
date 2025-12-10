document.addEventListener('DOMContentLoaded', function(){
  const yearEls = document.querySelectorAll('#year, #year-ent, #year-music, #year-edu, #year-live');
  yearEls.forEach(el => el.textContent = new Date().getFullYear());


  const nav = document.querySelector('.navbar');
  function onScroll(){
    if(window.scrollY > 20) nav.style.boxShadow = '0 8px 30px rgba(11,34,56,0.06)';
    else nav.style.boxShadow = 'none';
  }
  window.addEventListener('scroll', onScroll);
  onScroll();


  function extractYouTubeID(url){
    if(!url) return null;
    if(/^[A-Za-z0-9_-]{6,}$/i.test(url) && !url.includes('http')) return url;

    const patterns = [
      /v=([^&]+)/,                    
      /youtu\.be\/([^?&]+)/,         
      /embed\/([^?&]+)/,             
      /\/v\/([^?&]+)/,               
      /youtube\.com\/shorts\/([^?&]+)/ 
    ];
    for(const p of patterns){
      const m = url.match(p);
      if(m && m[1]) return m[1];
    }

    try{
      const u = new URL(url);
      if(u.searchParams && u.searchParams.get('v')) return u.searchParams.get('v');

      const seg = u.pathname.split('/').filter(Boolean).pop();
      if(seg && seg.length >= 6) return seg;
    }catch(e){
    
      return url;
    }
    return null;
  }

  
  function buildThumbnails(){
    const cards = document.querySelectorAll('.video-card');
    cards.forEach(card => {
      const thumbAttr = card.dataset.thumb || null;
   
      let videoLink = card.querySelector('[data-video]') ? card.querySelector('[data-video]').getAttribute('data-video') : null;
      if(!videoLink){
   
        const linkEl = card.querySelector('a[href]');
        if(linkEl) videoLink = linkEl.getAttribute('data-video') || linkEl.getAttribute('href');
      }
      
      if(!videoLink && card.dataset.video) videoLink = card.dataset.video;

     
      let thumbUrl = null;
      if(thumbAttr) thumbUrl = thumbAttr;
      else if(videoLink){
        const id = extractYouTubeID(videoLink);
        if(id) thumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }

   
      const thumbContainer = card.querySelector('.video-thumb');
      if(!thumbContainer) return;
     
      thumbContainer.innerHTML = '';

      if(thumbUrl){
        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = card.querySelector('.video-title') ? card.querySelector('.video-title').textContent.trim() : 'Video thumbnail';
        img.loading = 'lazy';
        thumbContainer.appendChild(img);

        
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.pointerEvents = 'none';
        overlay.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="rgba(255,255,255,0.92)"/></svg>';
        thumbContainer.appendChild(overlay);

      } else {
        
        thumbContainer.textContent = '▶';
        thumbContainer.style.fontSize = '28px';
      }

      
      if(card.querySelector('.video-link') || card.querySelector('.video-cta')) {
        let badge = card.querySelector('.preview-badge');
        if(!badge){
          badge = document.createElement('div');
          badge.className = 'preview-badge';
          badge.textContent = 'Preview';
          card.appendChild(badge);
        }
      }
    });
  }


  buildThumbnails();

  document.querySelectorAll('.video-link, .video-cta, .btn-play-link, .video-cta').forEach(el=>{
    el.addEventListener('click', function(e){
      const url = this.dataset.video || this.getAttribute('data-video') || this.getAttribute('href') || this.closest('.video-card')?.dataset.video;
      if(!url) return;
      let final = url;
      if(!/^https?:\/\//i.test(final) && final.length < 30){
        final = 'https://www.youtube.com/watch?v=' + final;
      }
      final = final.replace('/embed/','/watch?v=');
      window.open(final,'_blank','noopener');
      e.preventDefault();
    });
  });

  document.querySelectorAll('.video-card').forEach(card => {
    const link = card.querySelector('.video-link, .video-cta');
    if(!link) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e){
      if(e.target.tagName.toLowerCase() === 'a') return;
      const url = link.dataset.video || link.getAttribute('data-video') || link.getAttribute('href');
      if(!url) return;
      let final = url;
      if(!/^https?:\/\//i.test(final) && final.length < 30){
        final = 'https://www.youtube.com/watch?v=' + final;
      }
      final = final.replace('/embed/','/watch?v=');
      window.open(final,'_blank','noopener');
    });
  });

  const slides = Array.from(document.querySelectorAll('.slider .slide'));
  const dotsContainer = document.getElementById('dots');
  let current = 0;
  if(slides.length && dotsContainer){
    function showSlide(i){
      slides.forEach((s, idx) => s.classList.toggle('hidden', idx !== i));
      const dots = dotsContainer.querySelectorAll('button');
      dots.forEach((d,idx)=> d.classList.toggle('active', idx===i));
    }
    function createDots(){
      slides.forEach((_,i)=>{
        const b = document.createElement('button');
        b.style.width = '10px';
        b.style.height = '10px';
        b.style.margin = '0 6px';
        b.style.borderRadius = '50%';
        b.style.border = 'none';
        b.style.background = '#cfd8dc';
        b.style.opacity = '0.8';
        b.addEventListener('click', ()=> { current = i; showSlide(current); });
        dotsContainer.appendChild(b);
      });
    }
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    if(prev) prev.addEventListener('click', ()=> { current = (current - 1 + slides.length) % slides.length; showSlide(current); });
    if(next) next.addEventListener('click', ()=> { current = (current + 1) % slides.length; showSlide(current); });

    createDots();
    showSlide(0);

    let interval = setInterval(()=> { current = (current + 1) % slides.length; showSlide(current); }, 6000);
    const sliderEl = document.querySelector('.slider');
    if(sliderEl){
      sliderEl.addEventListener('mouseenter', ()=> clearInterval(interval));
      sliderEl.addEventListener('mouseleave', ()=> { interval = setInterval(()=> { current = (current + 1) % slides.length; showSlide(current); }, 6000); });
    }
  }

  const form = document.getElementById('newsletter');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      if(!email || !email.includes('@')){ alert('Please enter a valid email.'); return; }
      alert('Thanks — demo subscription recorded.');
      form.reset();
    });
  }

  const path = window.location.pathname.split('/').pop();
  const map = {
    'index.html':'home',
    '': 'home',
    'entertainment.html':'entertainment',
    'music.html':'music',
    'education.html':'education',
    'live-podcasts.html':'live'
  };
  const page = map[path] || map['index.html'];
  document.querySelectorAll('.nav-link').forEach(n => {
    if(n.dataset.page === page) n.classList.add('active');
    else n.classList.remove('active');
  });
});
