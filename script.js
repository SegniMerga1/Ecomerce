/* ========================================================
   ShopEase – E-Commerce Script
   Handles: product rendering, filtering/sorting, cart
   ======================================================== */

'use strict';

// ── Product Data ──────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'electronics',
    price: 89.99,
    emoji: '🎧',
    description: 'Premium sound with 30-hour battery life and active noise cancellation.',
  },
  {
    id: 2,
    name: 'Mechanical Keyboard',
    category: 'electronics',
    price: 119.99,
    emoji: '⌨️',
    description: 'Tactile RGB mechanical keyboard with hot-swappable switches.',
  },
  {
    id: 3,
    name: 'Smart Watch',
    category: 'electronics',
    price: 199.99,
    emoji: '⌚',
    description: 'Track fitness, receive notifications, and monitor your health 24/7.',
  },
  {
    id: 4,
    name: 'Portable Bluetooth Speaker',
    category: 'electronics',
    price: 59.99,
    emoji: '🔊',
    description: 'Waterproof speaker with 360° surround sound and 12-hour playback.',
  },
  {
    id: 5,
    name: 'Classic Cotton T-Shirt',
    category: 'clothing',
    price: 24.99,
    emoji: '👕',
    description: 'Soft, breathable 100% organic cotton available in 12 colours.',
  },
  {
    id: 6,
    name: 'Slim-Fit Denim Jeans',
    category: 'clothing',
    price: 49.99,
    emoji: '👖',
    description: 'Comfortable stretch denim with a modern slim-fit silhouette.',
  },
  {
    id: 7,
    name: 'Running Sneakers',
    category: 'clothing',
    price: 74.99,
    emoji: '👟',
    description: 'Lightweight performance shoes with responsive cushioning.',
  },
  {
    id: 8,
    name: 'Ceramic Plant Pot Set',
    category: 'home',
    price: 34.99,
    emoji: '🪴',
    description: 'Set of 3 hand-painted ceramic pots perfect for indoor plants.',
  },
  {
    id: 9,
    name: 'Scented Soy Candle',
    category: 'home',
    price: 18.99,
    emoji: '🕯️',
    description: 'Long-burn lavender & vanilla soy candle in a reusable glass jar.',
  },
  {
    id: 10,
    name: 'Bamboo Cutting Board',
    category: 'home',
    price: 29.99,
    emoji: '🪵',
    description: 'Eco-friendly bamboo cutting board with juice groove and handle.',
  },
  {
    id: 11,
    name: 'JavaScript: The Good Parts',
    category: 'books',
    price: 19.99,
    emoji: '📗',
    description: 'A concise guide to the beautiful, expressive parts of JavaScript.',
  },
  {
    id: 12,
    name: 'Clean Code',
    category: 'books',
    price: 22.99,
    emoji: '📘',
    description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
  },
];

// ── Cart State ────────────────────────────────────────────
/** @type {Map<number, {product: object, qty: number}>} */
const cart = new Map();

// ── DOM References ────────────────────────────────────────
const productGrid    = document.getElementById('productGrid');
const cartBtn        = document.getElementById('cartBtn');
const cartCount      = document.getElementById('cartCount');
const cartSidebar    = document.getElementById('cartSidebar');
const closeCart      = document.getElementById('closeCart');
const overlay        = document.getElementById('overlay');
const cartItems      = document.getElementById('cartItems');
const cartTotal      = document.getElementById('cartTotal');
const checkoutBtn    = document.getElementById('checkoutBtn');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy         = document.getElementById('sortBy');
const toast          = document.getElementById('toast');

// ── Toast Helper ──────────────────────────────────────────
let toastTimer = null;

/**
 * Shows a brief toast notification.
 * @param {string} message
 */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Product Rendering ─────────────────────────────────────

/**
 * Returns the filtered and sorted product list.
 * @returns {object[]}
 */
function getFilteredProducts() {
  const category = categoryFilter.value;
  const sort     = sortBy.value;

  let list = category === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === category);

  switch (sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price);                        break;
    case 'price-desc': list.sort((a, b) => b.price - a.price);                        break;
    case 'name':       list.sort((a, b) => a.name.localeCompare(b.name));             break;
    default: break;
  }

  return list;
}

/**
 * Renders product cards into the grid.
 */
function renderProducts() {
  const list = getFilteredProducts();
  productGrid.innerHTML = '';

  if (list.length === 0) {
    productGrid.innerHTML = '<p class="no-results">No products found for this category.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img" aria-hidden="true">${product.emoji}</div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
      </div>
      <div class="product-footer">
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <button class="add-to-cart" data-id="${product.id}" aria-label="Add ${product.name} to cart">
          Add to Cart
        </button>
      </div>
    `;
    fragment.appendChild(card);
  });

  productGrid.appendChild(fragment);
}

// ── Cart Logic ────────────────────────────────────────────

/**
 * Adds a product to the cart (increments qty if already present).
 * @param {number} productId
 */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  if (cart.has(productId)) {
    cart.get(productId).qty += 1;
  } else {
    cart.set(productId, { product, qty: 1 });
  }

  updateCartUI();
  showToast(`${product.emoji} "${product.name}" added to cart`);
}

/**
 * Changes the quantity of a cart item by `delta`. Removes it if qty reaches 0.
 * @param {number} productId
 * @param {number} delta  +1 or -1
 */
function changeQty(productId, delta) {
  if (!cart.has(productId)) return;
  const entry = cart.get(productId);
  entry.qty += delta;
  if (entry.qty <= 0) {
    cart.delete(productId);
  }
  updateCartUI();
}

/**
 * Removes a product from the cart entirely.
 * @param {number} productId
 */
function removeFromCart(productId) {
  cart.delete(productId);
  updateCartUI();
}

/**
 * Re-renders the cart sidebar and updates the header counter.
 */
function updateCartUI() {
  // Header badge
  const totalQty = [...cart.values()].reduce((sum, e) => sum + e.qty, 0);
  cartCount.textContent = totalQty;

  // Cart items list
  if (cart.size === 0) {
    cartItems.innerHTML = '<li class="cart-empty">Your cart is empty 🛒</li>';
  } else {
    const fragment = document.createDocumentFragment();
    cart.forEach(({ product, qty }, id) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="cart-item-emoji" aria-hidden="true">${product.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">$${(product.price * qty).toFixed(2)} (×${qty})</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-id="${id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn" data-id="${id}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" data-id="${id}" aria-label="Remove ${product.name} from cart">Remove</button>
      `;
      fragment.appendChild(li);
    });
    cartItems.innerHTML = '';
    cartItems.appendChild(fragment);
  }

  // Total
  const total = [...cart.values()].reduce((sum, e) => sum + e.product.price * e.qty, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// ── Cart Sidebar Toggle ───────────────────────────────────

function openCartSidebar() {
  cartSidebar.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');
  closeCart.focus();
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('active');
  cartBtn.focus();
}

// ── Event Listeners ───────────────────────────────────────

// Open / close cart
cartBtn.addEventListener('click', openCartSidebar);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);

// Close cart on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
    closeCartSidebar();
  }
});

// Add to cart (event delegation on the grid)
productGrid.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

// Qty change & remove (event delegation on cart items list)
cartItems.addEventListener('click', e => {
  const qtyBtn    = e.target.closest('.qty-btn');
  const removeBtn = e.target.closest('.remove-item');

  if (qtyBtn) {
    changeQty(Number(qtyBtn.dataset.id), Number(qtyBtn.dataset.delta));
  } else if (removeBtn) {
    removeFromCart(Number(removeBtn.dataset.id));
  }
});

// Filter & sort
categoryFilter.addEventListener('change', renderProducts);
sortBy.addEventListener('change', renderProducts);

// Checkout
checkoutBtn.addEventListener('click', () => {
  if (cart.size === 0) {
    showToast('Your cart is empty!');
    return;
  }
  // Placeholder – in a real app this would navigate to a checkout page
  showToast('✅ Order placed! Thank you for shopping with ShopEase.');
  cart.clear();
  updateCartUI();
  closeCartSidebar();
});

// ── Init ──────────────────────────────────────────────────
renderProducts();
updateCartUI();
