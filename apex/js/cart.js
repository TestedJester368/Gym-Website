const API_URL = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', () => {
  displayCart();
  setupPaymentMethods();
  setupCheckout();
  setupCardPreview();
});

function displayCart() {
  const cart = getCart();
  const itemsContainer = document.getElementById('cartItems');

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p class="empty-sub">Add a membership plan to get started</p>
        <a href="../index.html#plans" class="btn-primary" style="margin-top: 20px;">
          <span>View Plans</span>
        </a>
      </div>
    `;
    document.getElementById('checkoutBtn').disabled = true;
    return;
  }

  itemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name} Plan</div>
        <div class="cart-item-desc">${getDescription(item.plan)}</div>
        <div class="cart-item-features">
          ${getFeatures(item.plan).map(f => `<span class="feature-tag">✓ ${f}</span>`).join('')}
        </div>
      </div>
      <div class="cart-item-price">
        <div class="cart-item-amount">₹${item.price}</div>
        <div class="cart-item-period">per month</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
    </div>
  `).join('');

  updateSummary();
  document.getElementById('checkoutBtn').disabled = false;
}

function getDescription(plan) {
  const descriptions = {
    starter: 'Basic gym access with essential features',
    pro: 'Complete gym experience with classes',
    elite: 'Premium membership with personal training'
  };
  return descriptions[plan] || 'Membership plan';
}

function getFeatures(plan) {
  const features = {
    starter: ['Gym Access', 'Locker Room', '2 Classes/week'],
    pro: ['Unlimited Access', 'All Classes', '2 PT Sessions', 'Portal Access'],
    elite: ['Everything', 'Unlimited PT', 'Nutrition Coach', 'Body Scans', 'Priority Booking']
  };
  return features[plan] || [];
}

function updateSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('tax').textContent = `₹${tax.toLocaleString('en-IN')}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  displayCart();
}

function addPlanToCart(planName, price, planType) {
  const cart = getCart();
  cart.push({ name: planName, price, plan: planType });
  saveCart(cart);
  alert(`✓ ${planName} added to cart!`);
}

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', () => {
  checkoutModal.classList.add('active');
  populateCheckoutForm();
});

closeCheckout.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
});

checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) {
    checkoutModal.classList.remove('active');
  }
});

function populateCheckoutForm() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('fullName').value = user.fullName || '';
  document.getElementById('email').value = user.email || '';
}

function switchTab(tabName) {
  if (tabName === 'payment') {
    if (!validateDeliveryForm()) return;
  } else if (tabName === 'review') {
    if (!validatePaymentForm()) return;
    populateReview();
  }

  const tabs = document.querySelectorAll('.tab-content');
  const btns = document.querySelectorAll('.tab-btn');

  tabs.forEach(t => t.classList.remove('active'));
  btns.forEach(b => b.classList.remove('active'));

  document.getElementById(`${tabName}-tab`).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

function validateDeliveryForm() {
  const fields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postal'];
  for (let field of fields) {
    if (!document.getElementById(field).value.trim()) {
      showCheckoutStatus(`Please fill in all fields`, 'error');
      return false;
    }
  }
  return true;
}

function validatePaymentForm() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (method === 'card') {
    const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    if (cardNum.length !== 16) {
      showCheckoutStatus('Card number must be 16 digits', 'error');
      return false;
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      showCheckoutStatus('Expiry must be MM/YY format', 'error');
      return false;
    }
    if (cvv.length !== 3) {
      showCheckoutStatus('CVV must be 3 digits', 'error');
      return false;
    }
  }

  return true;
}

function populateReview() {
  const cart = getCart();
  const cart_total = cart.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(cart_total * 0.18);
  const total = cart_total + tax;

  document.getElementById('reviewPlan').innerHTML = cart
    .map(item => `<strong>${item.name} Plan</strong> - ₹${item.price}/month`)
    .join('<br />');

  const delivery = `
    <strong>${document.getElementById('fullName').value}</strong><br />
    ${document.getElementById('email').value}<br />
    ${document.getElementById('phone').value}<br />
    ${document.getElementById('address').value}<br />
    ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('postal').value}
  `;
  document.getElementById('reviewDelivery').innerHTML = delivery;

  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  const methodNames = { card: 'Credit/Debit Card', upi: 'UPI', wallet: 'Digital Wallet' };
  document.getElementById('reviewPayment').textContent = methodNames[method];

  document.getElementById('reviewTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function setupPaymentMethods() {
  const radios = document.querySelectorAll('input[name="paymentMethod"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const method = e.target.value;
      document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';
      document.getElementById('upiPayment').style.display = method === 'upi' ? 'block' : 'none';
      document.getElementById('walletPayment').style.display = method === 'wallet' ? 'block' : 'none';
    });
  });
}

function setupCardPreview() {
  const cardNumber = document.getElementById('cardNumber');
  const cardHolder = document.getElementById('cardHolder');
  const expiry = document.getElementById('expiry');

  cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;

    const display = value.replace(/\d(?=\d{4})/g, '•');
    document.getElementById('cardDisplay').textContent = display.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
  });

  cardHolder.addEventListener('input', (e) => {
    document.getElementById('nameDisplay').textContent = e.target.value.toUpperCase() || 'CARDHOLDER NAME';
  });

  expiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
    document.getElementById('expiryDisplay').textContent = value || 'MM/YY';
  });
}

function setupCheckout() {
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
}

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) return;

  const orderId = `ORD-${Date.now()}`;
  const planName = cart[0].name;
  const planType = cart[0].plan;

  try {
    showCheckoutStatus('Processing payment...', 'loading');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_URL}/auth/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: planType })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update plan');
    }

    user.plan = planType;
    localStorage.setItem('user', JSON.stringify(user));

    localStorage.removeItem('cart');

    checkoutModal.classList.remove('active');
    showSuccessModal(orderId, planName);

  } catch (error) {
    console.error('Order error:', error);
    showCheckoutStatus('Payment failed. Please try again.', 'error');
  }
}

function showSuccessModal(orderId, planName) {
  const successModal = document.getElementById('successModal');
  document.getElementById('successOrderId').textContent = `Order ID: ${orderId}`;
  document.getElementById('successPlan').textContent = `Plan: ${planName} Membership Activated`;
  successModal.classList.add('active');
}

function completeCheckout() {
  window.location.href = 'dashboard.html';
}

function showCheckoutStatus(message, type = 'info') {
  const statusEl = document.getElementById('checkoutStatus');
  statusEl.textContent = message;
  statusEl.className = `checkout-status ${type}`;

  if (type !== 'loading') {
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 4000);
  }
}