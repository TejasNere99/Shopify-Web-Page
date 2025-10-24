/* script.js
   JavaScript for product interactions.
   - Handles gallery thumbnails + zoom
   - Variants (colours + sizes)
   - Size chart modal (accessible)
   - Compare colours modal + preview
   - Pair-well carousel population
   - Tabs
   - Related products injection
   - localStorage persistence for selected color/size
*/

/* ---------------------------
   Product / placeholder data
   --------------------------- */
const PRODUCT = {
  title: 'Apex Classic Hoodie',
  vendor: 'Studio Apex',
  basePrice: 79.00,
  compareAtPrice: 99.00,
  // Main product gallery - 6 hoodie images
  images: [
    'assets/hoodie-black.webp', // Black hoodie
    'assets/hoodie-gray.webp', // Grey hoodie
    'assets/hoodie-blue.webp', // Blue/Ocean
    'assets/hoodie-cream.webp', // Cream/Beige
    'assets/hoodie-red.webp', // Burgundy/Red
    'assets/hoodie-orange.webp', // orange
    'assets/hoodie-pink.webp', // pink
    'assets/hoodie-yellow.webp' // yellow
  ],
  colours: [
    { id: 'black', name: 'Black', hex: '#111827', imageIndex: 0 },
    { id: 'slate', name: 'Slate', hex: '#6b7280', imageIndex: 1 },
    { id: 'ocean', name: 'Ocean', hex: '#1f7a8c', imageIndex: 2 },
    { id: 'cream', name: 'Cream', hex: '#f5f0e1', imageIndex: 3 },
    { id: 'burgundy', name: 'Burgundy', hex: '#6b1f2b', imageIndex: 4 },
    { id: 'orange', name: 'orange', hex: '#FFA500', imageIndex: 5 },
    { id: 'pink', name: 'pink', hex: '#FFC0CB', imageIndex: 6 },
    { id: 'yellow', name: 'yellow', hex: '#FFFF00', imageIndex: 7 }

  ],
  sizes: ['S', 'M', 'L', 'XL'],
  // Pair Well With section
  pairWellWith: [
    {
      id: 'beanie',
      title: 'Apex Beanie',
      price: 19.00,
      img: 'assets/photo1.jpeg'
    },
    {
      id: 'socks',
      title: 'Grip Socks',
      price: 9.00,
      img: 'assets/photo2.jpeg'
    },
    {
      id: 'mug',
      title: 'Apex Mug',
      price: 12.00,
      img: 'assets/photo3.jpeg'
    },
    {
      id: 'cap',
      title: 'Performance Cap',
      price: 15.00,
      img: 'assets/photo4.jpeg'
    },
    {
      id: 'water-bottle',
      title: 'Apex Water Bottle',
      price: 14.00,
      img: 'assets/water bottle.webp'
    },
    {
      id: 'keychain',
      title: 'Apex Keychain',
      price: 5.00,
      img: 'assets/keychain.webp'
    },
    {
      id: 'notebook',
      title: 'Apex Notebook',
      price: 8.00,
      img: 'assets/notebook.webp'
    },
    {
      id: 'backpack',
      title: 'Performance Backpack',
      price: 45.00,
      img: 'assets/backpack.webp'
    }
  ],
  // Related products section
  related: [
    {
      id: 'rp1',
      title: 'Summit Jacket',
      price: 129.00,
      img: 'assets/photo5.jpeg',
      badge: 'Popular'
    },
    {
      id: 'rp2',
      title: 'Trail Tee',
      price: 29.00,
      img: 'assets/photo6.jpeg',
      badge: 'New'
    },
    {
      id: 'rp3',
      title: 'Transit Backpack',
      price: 89.00,
      img: 'assets/photo7.jpeg'
    },
    {
      id: 'rp4',
      title: 'Everyday Shorts',
      price: 39.00,
      img: 'assets/photo8.jpeg'
    }
  ],
  bundle: [
    { id: 'hoodie', title: 'Apex Hoodie', price: 79.00 },
    { id: 'beanie', title: 'Apex Beanie', price: 19.00 },
    { id: 'socks', title: 'Grip Socks', price: 9.00 }
  ]
};

/* localStorage keys */
const LS_KEYS = {
  color: 'shop_selected_color',
  size: 'shop_selected_size'
};

/* ---------------------------
   DOM cache
   --------------------------- */
const mainImage = document.getElementById('mainImage');
const mainImageWrap = document.getElementById('mainImageWrap');
const thumbnailsEl = document.getElementById('thumbnails');
const swatchesEl = document.getElementById('swatches');
const sizeSelect = document.getElementById('sizeSelect');
const selectedColorLabel = document.getElementById('selectedColorLabel');
const selectedSizeLabel = document.getElementById('selectedSizeLabel');
const compareColoursBtn = document.getElementById('compareColoursBtn');
const sizeChartBtn = document.getElementById('sizeChartBtn');
const sizeChartModal = document.getElementById('sizeChartModal');
const compareModal = document.getElementById('compareModal');
const compareSwatchesEl = document.getElementById('compareSwatches');
const doCompareBtn = document.getElementById('doCompare');
const clearCompareBtn = document.getElementById('clearCompare');
const comparePreview = document.getElementById('comparePreview');
const pairCarousel = document.getElementById('pairCarousel');
const relatedGrid = document.getElementById('relatedGrid');
const bundleTotalEl = document.getElementById('bundleTotal');
const swatchSelectedClass = 'selected';

/* ---------------------------
   Initialization
   --------------------------- */

function init() {
  // populate gallery thumbnails
  PRODUCT.images.forEach((src, idx) => {
    const btn = document.createElement('button');
    btn.className = 'thumb';
    btn.setAttribute('aria-label', 'Thumbnail ' + (idx + 1));
    btn.innerHTML = `<img src="${src}" alt="Thumb ${idx + 1}">`;
    btn.addEventListener('click', () => {
      setMainImage(idx);
      setActiveThumb(idx);
    });
    thumbnailsEl.appendChild(btn);
    let scrollPos = 0;
    setInterval(() => {
      scrollPos += 1;
      pairCarousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
      if (scrollPos >= pairCarousel.scrollWidth - pairCarousel.clientWidth) scrollPos = 0;
    }, 40);


  });
  // mark first thumb active
  setActiveThumb(0);

  // populate colour swatches
  PRODUCT.colours.forEach(c => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = c.hex;
    b.title = c.name;
    b.dataset.id = c.id;
    b.dataset.index = c.imageIndex;
    b.setAttribute('aria-label', `Colour: ${c.name}`);
    b.addEventListener('click', () => selectColour(c.id));
    swatchesEl.appendChild(b);
  });

  // populate compare modal swatches (clones with selection toggles)
  PRODUCT.colours.forEach(c => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = c.hex;
    b.title = c.name;
    b.dataset.id = c.id;
    b.addEventListener('click', () => toggleCompareSwatch(b));
    compareSwatchesEl.appendChild(b);
  });

  // populate sizes
  PRODUCT.sizes.forEach(sz => {
    const o = document.createElement('option');
    o.value = sz;
    o.textContent = sz;
    sizeSelect.appendChild(o);
  });

  // load persisted selection if present
  const savedColor = localStorage.getItem(LS_KEYS.color);
  const savedSize = localStorage.getItem(LS_KEYS.size);
  if (savedColor) selectColour(savedColor, { persist: false });
  if (savedSize) selectSize(savedSize, { persist: false });
  // default to first size if none saved
  if (!localStorage.getItem(LS_KEYS.size)) selectSize(PRODUCT.sizes[1] || PRODUCT.sizes[0], { persist: true });

  // pair well with
  PRODUCT.pairWellWith.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pair-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="title">${p.title}</div>
      <div class="price">₹${(p.price * 82).toFixed(0)}</div>
      <div style="margin-top:8px;"><button class="btn small primary">Add</button></div>
    `;
    pairCarousel.appendChild(card);
  });
  // pair well with buttons
  pairCarousel.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = btn.closest('.pair-card').querySelector('.title').textContent;
      flyToCart(e, PRODUCT.images[0]); // main product image
      showToast(`${title} added to cart!`);
    });
  });


  // related products grid
  PRODUCT.related.forEach(r => {
    const card = document.createElement('div');
    card.className = 'related-card';
    card.innerHTML = `
      <div style="position:relative;">
        ${r.badge ? `<div class="badge" style="top:10px;left:10px">${r.badge}</div>` : ''}
        <img src="${r.img}" alt="${r.title}">
      </div>
      <div style="margin-top:8px;font-weight:700">${r.title}</div>
      <div style="color:var(--muted);margin-top:6px">₹${(r.price * 82).toFixed(0)}</div>
    `;
    relatedGrid.appendChild(card);
  });

  // bundle total
  const bundleTotal = PRODUCT.bundle.reduce((s, it) => s + it.price, 0);
  bundleTotalEl.textContent = `₹${(bundleTotal * 82).toFixed(0)}`;

  // event listeners
  sizeChartBtn.addEventListener('click', openSizeModal);
  compareColoursBtn.addEventListener('click', openCompareModal);
  document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', closeModals));
  document.getElementById('doCompare').addEventListener('click', showComparePreview);
  document.getElementById('clearCompare').addEventListener('click', clearCompareSelection);
  sizeSelect.addEventListener('change', (e) => selectSize(e.target.value, { persist: true }));
  // keyboard accessibility: ESC closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) closeModals();
    });
  });

  // preload images (optional)
  PRODUCT.images.forEach(src => { const i = new Image(); i.src = src; });

  // tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });
}

/* ---------------------------
   Gallery helpers
   --------------------------- */

function setMainImage(index) {
  const src = PRODUCT.images[index];
  mainImage.classList.add('fade-out');
  setTimeout(() => {
    mainImage.src = src;
    mainImage.alt = `Product image ${index + 1}`;
    mainImage.classList.remove('fade-out');
    mainImage.classList.add('fade-in');
    setTimeout(() => mainImage.classList.remove('fade-in'), 400);
  }, 200);
}
mainImageWrap.addEventListener('mousemove', (e) => {
  const rect = mainImageWrap.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  mainImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
});



function setActiveThumb(index) {
  const thumbs = Array.from(document.querySelectorAll('.thumb'));
  thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
}

/* ---------------------------
   Variant selection
   --------------------------- */
function selectColour(colId, opts = { persist: true }) {
  const chosen = PRODUCT.colours.find(c => c.id === colId) || PRODUCT.colours[0];

  // remove previous selection highlight
  document.querySelectorAll('#swatches .swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.id === chosen.id);
    sw.addEventListener('mouseenter', () => {
      const idx = sw.dataset.index;
      setMainImage(idx);
    });
    sw.addEventListener('mouseleave', () => {
      const savedColor = localStorage.getItem(LS_KEYS.color);
      if (savedColor) selectColour(savedColor, { persist: false });
    });
  });

  // update label
  selectedColorLabel.textContent = chosen.name;

  // update main image + thumbnails
  if (typeof chosen.imageIndex === 'number') {
    setMainImage(chosen.imageIndex);
    setActiveThumb(chosen.imageIndex);
  }

  // persist choice
  if (opts.persist) localStorage.setItem(LS_KEYS.color, chosen.id);
}

function selectSize(size, opts = { persist: true }) {
  // select in dropdown
  sizeSelect.value = size;
  selectedSizeLabel.textContent = size;
  if (opts.persist) localStorage.setItem(LS_KEYS.size, size);
}

/* ---------------------------
   Modals
   --------------------------- */
function openSizeModal() {
  openModal('sizeChartModal');
}

function openCompareModal() {
  openModal('compareModal');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // focus modal for accessibility
  setTimeout(() => el.querySelector('.modal')?.focus(), 80);
}

function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.setAttribute('aria-hidden', 'true'));
  document.body.style.overflow = '';
}

/* ---------------------------
   Compare colours logic
   --------------------------- */
let compareSelection = new Set();
function toggleCompareSwatch(button) {
  const id = button.dataset.id;
  if (compareSelection.has(id)) {
    compareSelection.delete(id);
    button.classList.remove('selected');
  } else {
    if (compareSelection.size >= 4) {
      alert('You can compare up to 4 colours.');
      return;
    }
    compareSelection.add(id);
    button.classList.add('selected');
  }
}

function showComparePreview() {
  comparePreview.innerHTML = '';
  if (compareSelection.size < 2) {
    comparePreview.textContent = 'Select at least 2 colours to compare.';
    return;
  }
  compareSelection.forEach(id => {
    const meta = PRODUCT.colours.find(c => c.id === id);
    const box = document.createElement('div');
    box.style.minWidth = '140px';
    box.style.padding = '12px';
    box.style.border = '1px solid #eef2f6';
    box.style.borderRadius = '8px';
    box.innerHTML = `
      <div style="height:80px;border-radius:6px;background:${meta.hex}"></div>
      <div style="margin-top:8px;font-weight:700">${meta.name}</div>
    `;
    comparePreview.appendChild(box);
  });
}

function clearCompareSelection() {
  compareSelection.clear();
  compareSwatchesEl.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
  comparePreview.innerHTML = '';
}

/* ---------------------------
   Utility: automatically select default values if not present
   --------------------------- */
document.addEventListener('DOMContentLoaded', init);

/* ---------------------------
       Flying-to-cart & toast
    --------------------------- */
function showToast(msg, icon = '🛒') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon} ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2400);
}
document.getElementById('addToCart').addEventListener('click', () => showToast('Added product to cart'));

function flyToCart(e, imgUrl) {
  const img = document.createElement('img');
  img.src = imgUrl;
  img.className = 'fly-img';
  document.body.appendChild(img);

  const start = e.target.getBoundingClientRect();
  const end = document.getElementById('miniCart').getBoundingClientRect();

  img.style.left = `${start.left + start.width / 2 - 32}px`;
  img.style.top = `${start.top + start.height / 2 - 32}px`;

  requestAnimationFrame(() => {
    img.animate([
      { transform: `translate(0, 0) scale(1)`, opacity: 1 },
      { transform: `translate(${(end.left - start.left) / 2}px, -100px) scale(0.7)`, opacity: 0.9 },
      { transform: `translate(${end.left - start.left}px, ${end.top - start.top}px) scale(0.2) rotate(20deg)`, opacity: 0 }
    ], {
      duration: 900,
      easing: 'cubic-bezier(.2, .9, .2, 1)',
      fill: 'forwards'
    });
  });

  setTimeout(() => img.remove(), 800);
}


document.getElementById('addBundle').addEventListener('click', (e) => {
  flyToCart(e, PRODUCT.images[0]);
  showToast('Bundle added to cart!');
});


