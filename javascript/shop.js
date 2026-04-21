
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
  });

 
  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]');
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = total;
  }
  updateCartBadge();


  const marqueeTexts = [
    'Free Delivery Over ₦15,000', '✦', 'Cruelty Free',
    '✦', 'New Arrivals Every Week', '✦', 'Premium Beauty',
    '✦', 'Gift Wrapping Available', '✦', 'Dermatologist Tested',
    '✦', 'Free Delivery Over ₦15,000', '✦', 'Cruelty Free',
    '✦', 'New Arrivals Every Week', '✦', 'Premium Beauty',
    '✦', 'Gift Wrapping Available', '✦', 'Dermatologist Tested', '✦'
  ];
  const mi = document.getElementById('marqueeInner');
  const html = marqueeTexts.map(t => `<span class="${t==='✦'?'dot':''}">${t}</span>`).join('');
  mi.innerHTML = html + html; 
  
  const PRODUCTS = [
    { id:1, name:'Velvet Matte Lipstick', cat:'Lips', price:3500, emoji:'💄', badge:'Bestseller' },
    { id:2, name:'Glow Serum', cat:'Skincare', price:5800, emoji:'✨', badge:'New' },
    { id:3, name:'Lash Lengthening Mascara', cat:'Eyes', price:2900, emoji:'👁', badge:'' },
    { id:4, name:'Rose Lip Gloss', cat:'Lips', price:2200, emoji:'💋', badge:'Fan Fave' },
    { id:5, name:'Hydra Glow Foundation', cat:'Face', price:6500, emoji:'🌟', badge:'New' },
    { id:6, name:'Brow Define Pencil', cat:'Eyes', price:1800, emoji:'✏️', badge:'' },
    { id:7, name:'Vitamin C Moisturiser', cat:'Skincare', price:4200, emoji:'🍊', badge:'Trending' },
    { id:8, name:'Contour & Highlight Kit', cat:'Face', price:5500, emoji:'🎨', badge:'' },
  ];

  
  localStorage.setItem('lumiere_products', JSON.stringify(PRODUCTS));

  const grid = document.getElementById('featuredGrid');
  PRODUCTS.slice(0,4).forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <div class="card-img">
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          ${p.emoji}
        </div>
        <div class="card-body">
          <div class="card-cat">${p.cat}</div>
          <div class="card-name">${p.name}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.8rem;">
            <span class="card-price">₦${p.price.toLocaleString()}</span>
            <a href="shop.html" class="btn-primary" style="padding:.5rem 1.2rem;font-size:.75rem;">Shop</a>
          </div>
        </div>
      </div>`;
  });
