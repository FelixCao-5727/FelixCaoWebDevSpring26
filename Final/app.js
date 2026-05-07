
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

    if (error) {
        console.error('Error fetching user name:', error);
        return;
    }

    if (data && data.first_name) {
        const greetingHeader = document.getElementById('welcome-message');
        
        
        
        greetingHeader.innerText = `${data.first_name.toUpperCase()}, WELCOME TO NYU SWIPE MARKETPLACE`;
    }
}



document.addEventListener('DOMContentLoaded', () => {
    displayUserGreeting('ac0721'); 
});

async function loadLookupData() {
  const [locRes, urgRes, userRes, discRes] = await Promise.all([
    _supabase.from('location').select('location_id, location'),
    _supabase.from('urgency').select('urgency_id, urgency'),
    _supabase.from('user').select('net_id, first_name, last_name'),
    _supabase.from('discount').select('discount_id, discount_rate, begin_date, end_date')  
  ]);

  console.log('Location response:', locRes);
  console.log('Urgency response:', urgRes);
  console.log('User response:', userRes);
  console.log('Discount response:', discRes);   

  if (locRes.error) console.error('Location fetch error:', locRes.error);
  if (urgRes.error) console.error('Urgency fetch error:', urgRes.error);
  if (userRes.error) console.error('User fetch error:', userRes.error);
  if (discRes.error) console.error('Discount fetch error:', discRes.error);  

  if (locRes.data) locationMap = Object.fromEntries(locRes.data.map(l => [l.location_id, l.location]));
  if (urgRes.data) urgencyMap = Object.fromEntries(urgRes.data.map(u => [u.urgency_id, u.urgency]));
  if (userRes.data) {
    userMap = Object.fromEntries(userRes.data.map(u => [u.net_id, `${u.first_name} ${u.last_name}`]));
    console.log('User map built:', userMap);
  } else {
    console.warn('No user data returned. Check RLS or table content.');
  }

  
  if (discRes.data) {
    discountMap = {};
    discRes.data.forEach(d => {
      discountMap[d.discount_id] = d;
    });
    console.log('Discount map built:', discountMap);
  }
}

function isDiscountActive(discount) {
  if (!discount) return false;
  const now = new Date();
  const begin = new Date(discount.begin_date);
  const end = new Date(discount.end_date);
  return now >= begin && now <= end;
}

async function fetchMyListings() {
  await loadLookupData();

  const { data: listings, error } = await _supabase
    .from('listing')
    .select('*');

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  const ongoingContainer = document.getElementById('ongoing-list');
  const toSellContainer = document.getElementById('tobesold-list');
  ongoingContainer.innerHTML = '';
  toSellContainer.innerHTML = '';

  listings.forEach(item => {
    const locationName = locationMap[item.preferred_location_id] || 'Unknown';
    const urgencyText = urgencyMap[item.urgency_id] || 'Medium';
    const rawUrgency = urgencyText.toLowerCase();

    
    let statusClass = 'status-med';               
    if (rawUrgency.includes('urgent')) statusClass = 'status-urg';
    else if (rawUrgency.includes('high')) statusClass = 'status-hi';
    else if (rawUrgency.includes('low')) statusClass = 'status-lo';
    else if (rawUrgency.includes('no rush')) statusClass = 'status-no-rush';

    const row = document.createElement('article');
    row.className = `listing-row ${!item.is_active ? 'border-ongoing' : ''}`;
    row.setAttribute('data-location', locationName.toLowerCase());
    row.setAttribute('data-amount', item.amount);
    row.setAttribute('data-price', item.price);
    row.innerHTML = `
      <div class="col location">
          <span class="label">Location</span>
          <h4>${locationName}</h4>
          ${item.buyer_name ? `<div class="buyer-indicator">Buyer: <strong>${item.buyer_name}</strong></div>` : ''}
      </div>
      <div class="col amount"><span class="label">Amount</span><span class="val">${item.amount} Swipe(s)</span></div>
      <div class="col cost"><span class="label">Price</span><span class="val price">$${item.price}</span></div>
      <div class="col discount">
          <span class="label">Discount</span>
          <span class="val discount-text">${item.discount_id && discountMap[item.discount_id] && isDiscountActive(discountMap[item.discount_id]) 
              ? Math.round(discountMap[item.discount_id].discount_rate * 100) + '% off' 
              : '—'}</span>
      </div>
      <div class="col urgency"><span class="label">Urgency</span>
          <div class="status-bar ${statusClass}">${urgencyText}</div>
      </div>
      <div class="col actions">
          <span class="label">Actions</span>
          <div class="button-group">
              ${!item.is_active 
                  ? `<button class="text-btn" onclick="confirmListing('${item.listing_id}')">CONFIRM</button>
                    <button class="text-btn-r" onclick="deleteListing('${item.listing_id}')">CANCEL</button>`
                  : `<button class="text-btn" onclick="modifyListing('${item.listing_id}')">MODIFY</button>
                    <button class="text-btn-r" onclick="deleteListing('${item.listing_id}')">CANCEL</button>`
              }
          </div>
      </div>
  `;

    if (item.is_active) {
      toSellContainer.appendChild(row);
    } else {
      ongoingContainer.appendChild(row);
    }
  });
  revealOnScroll('.listing-row');
}


document.getElementById('btn-post-swipe').addEventListener('click', async () => {
  const locationSelect = document.getElementById('post-location');
  const locationText = locationSelect.value;
  const urgencySelect = document.getElementById('post-urgency');
  const urgencyText = urgencySelect.value;
  const amount = document.getElementById('post-qty').value;
  const price = document.getElementById('post-price').value;

  
  const locationIdMap = {
    'The Marketplace at Kimmel': '9054eb09-c9c0-46f2-bf3e-2e5adf57df16',
    'Crave NYU (Paulson Center, 6th Fl)': '68d84a32-8f27-43e3-9254-3589747fc520',
    'True Burger (Paulson Center, 6th Fl)': '95ea034e-3c41-4ab5-acba-ed153b01c690',
    'Café 181 (Paulson Center, 2nd Fl)': '454abf86-4d57-459e-8620-0d1d97d87cba',
    'Café 370 (370 Jay St, Brooklyn)': '551dc5eb-194d-4942-935a-c793aa7a55c6',
    'Jasper Kane Café (Brooklyn)': 'b66aa04e-f089-4b81-8784-2f3dc00a6157',
    'Dunkin\' (UHall, Union Square)': 'bd8805f0-b946-4cfa-b3d3-40f2274fa52a',
    'Third North Dining Hall': '6b6f0a9b-fbb8-49a2-afc6-97a6a9da63f1',
    'Lipton Dining Hall': '464a9c71-3cc8-4cbd-9bf3-5c8a365bdeae',
    'Palladium Dining Hall': '3e8a7de0-d744-4ce2-a959-949421403531',
    'Downstein (Weinstein Hall)': 'f18e7d40-d7bd-4f3d-9a11-2fa6f0c5a657',
    'Upstein (Weinstein Hall)': 'b4bda7a2-d1fd-4cc1-8e5f-1ef2e618b80e'
  };

  const urgencyIdMap = {
    'Hi': '191614ac-aa4f-4aca-95f0-cd9ea102eace',   
    'Med': 'b68c425f-a828-49d8-81a4-08aff5a03575',  
    'Lo': '40c5cf13-19a6-43c3-9d0d-133ce2a7eb6a'    
  };

  const locationId = locationIdMap[locationText];
  const urgencyId = urgencyIdMap[urgencyText];

  if (!locationId || !urgencyId) {
    alert('Selectoin Invalid.');
    return;
  }

  const sellerNetId = 'ac0721'; 

  const { error } = await _supabase
    .from('listing')
    .insert([{
      price: parseFloat(price),
      amount: amount.toString(),
      preferred_location_id: locationId,
      urgency_id: urgencyId,
      seller_net_id: sellerNetId,
      posted_date: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }]);

  if (!error) {
    alert('Swipe Posted!');
    fetchMyListings();
    document.getElementById('post-qty').value = '';
    document.getElementById('post-price').value = '';
  } else {
    console.error('Insert error:', error);
    alert('Error posting: ' + error.message);
  }
});


async function deleteListing(listingId) {
  if (!confirm('Are you sure you want to cancel this listing?')) return;
  const { error } = await _supabase
    .from('listing')
    .update({ is_active: false })
    .eq('listing_id', listingId);
  if (!error) {
    fetchMyListings();
  } else {
    alert('Error: ' + error.message);
  }
}

async function confirmListing(listingId) {
  if (!confirm('Mark this transaction as complete? This will remove it from your active listings.')) return;
  
  const { error } = await _supabase
    .from('listing')
    .update({ is_active: false })   
    .eq('listing_id', listingId);
    
  if (!error) {
    fetchMyListings();  
  } else {
    alert('Error: ' + error.message);
  }
}


function modifyListing(listingId) {
  
  window.location.href = `modify.html?id=${listingId}`;
}


fetchMyListings();

const mobilePostBtn = document.getElementById('btn-post-swipe-mobile');
if (mobilePostBtn) {
    mobilePostBtn.addEventListener('click', async () => {
        const locationText = document.getElementById('post-location-mobile').value;
        const urgencyText = document.getElementById('post-urgency-mobile').value;
        const amount = document.getElementById('post-qty-mobile').value;
        const price = document.getElementById('post-price-mobile').value;

        
        const locationIdMap = {  };
        const urgencyIdMap = {  };
        const locationId = locationIdMap[locationText];
        const urgencyId = urgencyIdMap[urgencyText];

        if (!locationId || !urgencyId) {
            alert('Please select a valid location and urgency.');
            return;
        }

        const sellerNetId = 'ac0721';
        const { error } = await _supabase
            .from('listing')
            .insert([{
                price: parseFloat(price),
                amount: amount.toString(),
                preferred_location_id: locationId,
                urgency_id: urgencyId,
                seller_net_id: sellerNetId,
                posted_date: new Date().toISOString(),
                expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true
            }]);

        if (!error) {
            alert('Swipe Posted!');
            fetchMyListings();
            
            document.getElementById('post-qty-mobile').value = '';
            document.getElementById('post-price-mobile').value = '';
        } else {
            console.error('Insert error:', error);
            alert('Error posting: ' + error.message);
        }
    });
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
    }, {
        threshold: 0.1,   
        rootMargin: '0px 0px -20px 0px'   
    });

    elements.forEach(el => observer.observe(el));
    return observer;   
}