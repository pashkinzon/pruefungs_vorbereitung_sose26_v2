document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('content-container');
  const searchInput = document.getElementById('search-input');
  const filterContainer = document.getElementById('filter-container');
  const previewOverlay = document.getElementById('preview-overlay');
  const previewTitle = document.getElementById('preview-title');
  const previewFrame = document.getElementById('preview-frame');
  const closePreviewBtn = document.getElementById('close-preview');
  
  let pdfData = [];
  let currentFilter = 'all';
  
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
    previewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closePreview() {
    previewOverlay.classList.remove('active');
    setTimeout(() => { previewFrame.src = ''; }, 300); // clear after animation
    document.body.style.overflow = '';
  }

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
