document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('content-container');
  const searchInput = document.getElementById('search-input');
  const filterContainer = document.getElementById('filter-container');
  const previewOverlay = document.getElementById('preview-overlay');
  const previewTitle = document.getElementById('preview-title');
  const previewFrame = document.getElementById('preview-frame');
  const closePreviewBtn = document.getElementById('close-preview');
  const previewOpenLink = document.getElementById('preview-open-link');
  
  // Random Wheel Elements
  const randomBtn = document.getElementById('random-subject-btn');
  const randomModal = document.getElementById('random-modal');
  const closeRandomModal = document.getElementById('close-random-modal');
  const roulette = document.getElementById('wheel-roulette');
  const goRandomBtn = document.getElementById('go-to-random-subject');
  
  let pdfData = [];
  let currentFilter = 'all';
  let selectedRandomSubject = '';
  
  // Load data
  fetch('data/pdfs.json')
    .then(response => response.json())
    .then(data => {
      pdfData = data;
      initFilters(data);
      render(data);
    })
    .catch(err => {
      console.error('Failed to load PDFs JSON', err);
      container.innerHTML = `
        <div class="empty-state">
          <h3>Fehler beim Laden</h3>
          <p>Konnten keine Daten finden. Bitte führen Sie das Generierungs-Skript aus.</p>
        </div>`;
    });

  // Init Filters
  function initFilters(data) {
    const subjects = [...new Set(data.map(item => item.subject))].sort();
    
    // Create 'All' filter
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.subject = 'all';
    allBtn.textContent = 'Alle';
    filterContainer.appendChild(allBtn);
    
    // Create specific filters
    subjects.forEach(subject => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.subject = subject;
      btn.textContent = subject;
      filterContainer.appendChild(btn);
    });
    
    filterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.subject;
        applySearchAndFilter();
      }
    });
    
    searchInput.addEventListener('input', () => {
      applySearchAndFilter();
    });
  }

  // Filter and Search logic
  function applySearchAndFilter() {
    const query = searchInput.value.toLowerCase();
    
    let filtered = pdfData.filter(pdf => {
      const matchesSearch = pdf.title.toLowerCase().includes(query);
      const matchesFilter = currentFilter === 'all' || pdf.subject === currentFilter;
      return matchesSearch && matchesFilter;
    });
    
    render(filtered);
  }

  // Group and Render
  function render(data) {
    container.innerHTML = '';
    
    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Keine PDFs gefunden</h3>
          <p>Versuche einen anderen Suchbegriff oder Filter.</p>
        </div>`;
      return;
    }
    
    // Group by subject
    const grouped = data.reduce((acc, pdf) => {
      if (!acc[pdf.subject]) {
        acc[pdf.subject] = {
           slug: pdf.subjectSlug,
           zip: pdf.subjectZip,
           items: []
        };
      }
      acc[pdf.subject].items.push(pdf);
      return acc;
    }, {});
    
    // Render sections
    for (const [subject, info] of Object.entries(grouped)) {
      const section = document.createElement('section');
      section.className = 'subject-section';
      
      const header = document.createElement('div');
      header.className = 'subject-header';
      header.innerHTML = `
        <h2>${subject}</h2>
        ${info.zip ? `<a href="${info.zip}" class="subject-download-btn" download>ZIP Herunterladen</a>` : ''}
      `;
      
      const grid = document.createElement('div');
      grid.className = 'pdf-grid';
      
      info.items.forEach(pdf => {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        card.dataset.subject = pdf.subjectSlug;
        
        card.innerHTML = `
          <div class="badge">${pdf.subject}</div>
          <h3 class="pdf-title">${pdf.title}</h3>
          <div class="pdf-meta">${pdf.size}</div>
          <div class="pdf-actions">
            <button class="btn btn-primary preview-btn" data-url="${pdf.path}" data-title="${pdf.title}">Vorschau</button>
            <a href="${pdf.path}" class="btn btn-secondary" target="_blank">Öffnen</a>
            <a href="${pdf.path}" class="btn btn-outline" download>Download</a>
          </div>
        `;
        
        // Preview event target
        const previewBtn = card.querySelector('.preview-btn');
        previewBtn.addEventListener('click', () => {
          openPreview(pdf.title, pdf.path);
        });
        
        grid.appendChild(card);
      });
      
      section.appendChild(header);
      section.appendChild(grid);
      container.appendChild(section);
    }
  }

  // Preview Logic
  function openPreview(title, url) {
    previewTitle.textContent = title;
    previewFrame.src = url;
    previewOpenLink.href = url;
    previewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closePreview() {
    previewOverlay.classList.remove('active');
    setTimeout(() => { previewFrame.src = ''; }, 300); // clear after animation
    document.body.style.overflow = '';
  }

  // Random Subject Wheel Logic
  randomBtn.addEventListener('click', () => {
    const subjects = [...new Set(pdfData.map(item => item.subject))].sort();
    if (subjects.length === 0) return;
    
    // Reset Modal
    roulette.innerHTML = '';
    goRandomBtn.style.display = 'none';
    roulette.style.transition = 'none';
    roulette.style.transform = 'translateY(0px)';
    
    // Create a long array to simulate spinning
    const spinItems = [];
    for (let i = 0; i < 4; i++) {
       // shuffle array
       const shuffled = [...subjects].sort(() => Math.random() - 0.5);
       spinItems.push(...shuffled);
    }
    
    // The final winning subject
    const winSubject = subjects[Math.floor(Math.random() * subjects.length)];
    spinItems.push(winSubject);
    
    // Append divs to roulette
    spinItems.forEach(subj => {
       const div = document.createElement('div');
       div.className = 'wheel-item';
       div.textContent = subj;
       roulette.appendChild(div);
    });
    
    randomModal.classList.add('active');
    
    // Trigger the animation
    setTimeout(() => {
       roulette.style.transition = 'transform 3.5s cubic-bezier(0.1, 0.7, 0.1, 1)';
       const itemHeight = 80;
       // Target the exact last element
       const targetY = -((spinItems.length - 1) * itemHeight);
       roulette.style.transform = `translateY(${targetY}px)`;
       
       // Show the 'let's go' button once animation finishes
       setTimeout(() => {
          selectedRandomSubject = winSubject;
          goRandomBtn.style.display = 'block';
       }, 3600);
    }, 100);
  });

  closeRandomModal.addEventListener('click', () => {
    randomModal.classList.remove('active');
  });

  goRandomBtn.addEventListener('click', () => {
    randomModal.classList.remove('active');
    
    // Actually click the target filter visually
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
       if (btn.dataset.subject === selectedRandomSubject) {
          btn.click();
       }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  closePreviewBtn.addEventListener('click', closePreview);
  
  // Close on Escape or click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewOverlay.classList.contains('active')) {
      closePreview();
    }
  });
  
  // Actually, we don't close on click outside the frame so easily to avoid accidental closes, 
  // but if needed we could add an event to the overlay background.
});
