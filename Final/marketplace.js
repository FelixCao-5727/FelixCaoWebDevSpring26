
const _supabase = supabase.createClient(
  'https://veqeaencaefuwtshavyf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcWVhZW5jYWVmdXd0c2hhdnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDUzODQsImV4cCI6MjA5MDQ4MTM4NH0.ICB0k5elZgnisLCdgC5DgpBhC1av9KG1DDDyGviRkl8'
);


let locationMap = {};
let urgencyMap = {};
let userMap = {};
let discountMap = {};


async function displayUserGreeting(netId) {
  const { data, error } = await _supabase
    .from('user')
    .select('first_name')
    .eq('net_id', netId)
    .single();
  if (error) return console.error(error);
  if (data && data.first_name) {
    document.getElementById('welcome-message').innerText =
      `${data.first_name.toUpperCase()}, WELCOME TO NYU SWIPE MARKETPLACE`;
  }
}
document.addEventListener('DOMContentLoaded', () => displayUserGreeting('ac0721'));


async function loadLookupData() {
  const [locRes, urgRes, userRes, discRes] = await Promise.all([
    _supabase.from('location').select('location_id, location'),
    _supabase.from('urgency').select('urgency_id, urgency'),
    _supabase.from('user').select('net_id, first_name, last_name'),
    _supabase.from('discount').select('discount_id, discount_rate, begin_date, end_date')
  ]);
  if (locRes.error) console.error(locRes.error);
  if (urgRes.error) console.error(urgRes.error);
  if (userRes.error) console.error(userRes.error);
  if (discRes.error) console.error(discRes.error);

  if (locRes.data) locationMap = Object.fromEntries(locRes.data.map(l => [l.location_id, l.location]));
  if (urgRes.data) urgencyMap = Object.fromEntries(urgRes.data.map(u => [u.urgency_id, u.urgency]));
  if (userRes.data) userMap = Object.fromEntries(userRes.data.map(u => [u.net_id, `${u.first_name} ${u.last_name}`]));
  if (discRes.data) {
    discountMap = {};
    discRes.data.forEach(d => { discountMap[d.discount_id] = d; });
  }
}


function isDiscountActive(discount) {
  if (!discount) return false;
  const now = new Date();
  return now >= new Date(discount.begin_date) && now <= new Date(discount.end_date);
}


async function loadPostings() {
  await loadLookupData();

  const { data: postings, error } = await _supabase
    .from('listing')
    .select('*')
    .eq('is_active', true);
  if (error) return;

  const grid = document.getElementById('listing-grid');
  grid.innerHTML = '';

  postings.forEach(item => {
    const locationName = locationMap[item.preferred_location_id] || 'Unknown';
    const rawUrgency = (urgencyMap[item.urgency_id] || 'med').toLowerCase();

    let statusClass = 'status-med';
    if (rawUrgency.includes('urgent')) statusClass = 'status-urg';
    else if (rawUrgency.includes('high')) statusClass = 'status-hi';
    else if (rawUrgency.includes('low')) statusClass = 'status-lo';
    else if (rawUrgency.includes('no rush')) statusClass = 'status-no-rush';

    const sellerDisplay = item.seller_net_id || 'ac0721';

    
    let discountTagHTML = '';
    if (item.discount_id) {
      const discount = discountMap[item.discount_id];
      if (discount && isDiscountActive(discount)) {
        const rate = Math.round(discount.discount_rate * 100);
        discountTagHTML = `<div class="discount-tag">-${rate}% off</div>`;
      }
    }

    
    let imgFileName = 'default.jpg';
    if (locationName.includes('Jasper')) imgFileName = 'jk.jpg';
    if (locationName.includes('Lipton')) imgFileName = 'Lipton-Horizontal.jpg';
    if (locationName.includes('Weinstein')) imgFileName = 'weinstein.jpg';
    if (locationName.includes('Palladium')) imgFileName = 'palladium.jpg';
    if (locationName.includes('370')) imgFileName = '370.jpg';
    if (locationName.includes('181')) imgFileName = '181.jpg';
    if (locationName.includes('North')) imgFileName = '3rdn.jpg';
    if (locationName.includes('Kimmel')) imgFileName = 'Kimmel.jpg';
    if (locationName.includes('Dunkin')) imgFileName = 'dunkin.jpg';
    if (locationName.includes('Crave')) imgFileName = 'crave.jpg';
    if (locationName.includes('Burger')) imgFileName = 'paulson.jpg';

    
    const colDiv = document.createElement('div');
    colDiv.className = 'col';

    const card = document.createElement('article');
    card.className = 'listing-card card';
    card.setAttribute('data-location', locationName.toLowerCase());
    card.setAttribute('data-swipe', item.amount);
    card.setAttribute('data-price', item.price);

    card.innerHTML = `
      ${discountTagHTML}
      <div class="card-img-container">
        <img src="media/${imgFileName}" alt="${locationName}" class="card-img-top">
      </div>
      <div class="card-details card-body p-3">
        <p class="price-main card-text">${item.amount} SWIPE(S) FOR $${item.price.toLocaleString()}</p>
        <p class="location-label card-text">Location: ${locationName}</p>
        <div class="seller-netid card-text">Seller: ${sellerDisplay}</div>
        <div class="status-bar ${statusClass}">${rawUrgency}</div>
      </div>
      <div class="view-bar">VIEW</div>
    `;

    
    card.addEventListener('click', () => {
      window.location.href = `商品ページ.html?id=${item.listing_id}`;
    });

    colDiv.appendChild(card);
    grid.appendChild(colDiv);
  });

  
  document.getElementById('item-count').innerText = `(${postings.length})`;

  
  revealOnScroll('.listing-card');
}


function revealOnScroll(selector) {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  elements.forEach(el => observer.observe(el));
}


let selectedLocation = 'all';


document.querySelectorAll('#location-filters .filter-item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('#location-filters .filter-item').forEach(el => el.classList.remove('active'));
    this.classList.add('active');
    selectedLocation = this.getAttribute('data-loc').toLowerCase();
  });
});


document.querySelectorAll('#location-filters-mobile .filter-item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('#location-filters-mobile .filter-item').forEach(el => el.classList.remove('active'));
    this.classList.add('active');
    selectedLocation = this.getAttribute('data-loc').toLowerCase();
  });
});

function applyAllFilters() {
  const maxSwipes = parseFloat(document.getElementById('swipe-range-desktop').value);
  const maxPrice = parseFloat(document.getElementById('price-range-desktop').value);

  const cards = document.querySelectorAll('.listing-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const location = card.getAttribute('data-location') || '';
    const swipes = parseFloat(card.getAttribute('data-swipe')) || 0;
    const price = parseFloat(card.getAttribute('data-price')) || 0;

    let locationMatch = (selectedLocation === 'all') || location.includes(selectedLocation);
    let swipeMatch = swipes <= maxSwipes;
    let priceMatch = price <= maxPrice;

    if (locationMatch && swipeMatch && priceMatch) {
      card.parentElement.style.display = 'block';  
      visibleCount++;
    } else {
      card.parentElement.style.display = 'none';
    }
  });

  document.getElementById('item-count').innerText = `(${visibleCount})`;
}


document.getElementById('apply-filters').addEventListener('click', applyAllFilters);


const mobileFilterBtn = document.getElementById('apply-filters-mobile');
if (mobileFilterBtn) {
  mobileFilterBtn.addEventListener('click', applyAllFilters);
}


document.addEventListener('DOMContentLoaded', loadPostings);