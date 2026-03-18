# ShopEase – E-Commerce Store

A lightweight, dependency-free e-commerce web application built with plain HTML, CSS, and JavaScript.

## Features

- **Product catalog** – 12 products across Electronics, Clothing, Home & Garden, and Books categories
- **Filtering & Sorting** – Filter by category; sort by price (low/high) or name
- **Shopping Cart** – Slide-in sidebar with add, remove, and quantity controls
- **Toast notifications** – Brief confirmations when adding items or placing an order
- **Responsive design** – Works on desktop, tablet, and mobile
- **Accessible** – ARIA labels, keyboard navigation (Escape closes the cart)

## Getting Started

No build step required. Simply open `index.html` in your browser:

```bash
# Option 1 – open directly
open index.html          # macOS
start index.html         # Windows

# Option 2 – serve locally (recommended)
npx serve .
# then visit http://localhost:3000
```

## Project Structure

```
├── index.html   – Page markup (header, hero, product grid, cart sidebar)
├── styles.css   – All styling (CSS custom properties, responsive grid)
└── script.js    – Product data, cart state, filtering/sorting logic
```

## Usage

1. Browse products on the home page.
2. Use the **Category** and **Sort by** dropdowns to narrow results.
3. Click **Add to Cart** on any product.
4. Click the 🛒 **Cart** button (top-right) to open the cart sidebar.
5. Adjust quantities with **+** / **−** or click **Remove**.
6. Click **Checkout** to place your order.