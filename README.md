# GameVault Emporium (90)

Build a polished, responsive video game ecommerce website called “GameVault”.

The store sells games for three platform categories: PlayStation 5, Xbox Series X|S, and PC. Customers must be able to browse games, view product details, add products to their cart, change quantities, remove products, enter their email and relevant delivery information, and submit an order.

Deliver a working shopping journey with persistent order storage. Use demo checkout for this first version.

Project defaults

Use English for all customer-facing text and Swedish kronor (SEK, displayed as “kr”) for prices. Physical delivery is within Sweden for this version.

Keep the store name, currency, delivery fee, colors, and product data easy to change.

Use Lovable’s default supported application stack, reusable components, TypeScript, and Lovable Cloud for product and order storage. Keep the code understandable for a student team.

Visual design

Create an immersive, premium gaming atmosphere with a dark theme throughout the website, including the cart, forms, and confirmation screen.

Use:

Main background: near-black #0B0F17.

Cards and elevated surfaces: dark slate #151C28.

Primary accent: electric cyan #22D3EE.

Main text: off-white #F3F4F6.

Secondary text: muted gray #A8B3C7.

Platform accents: blue for PlayStation, green for Xbox, and violet for PC.

Use cinematic gaming artwork, subtle gradients, restrained glow effects, clear typography, and generous spacing. Keep prices, platform labels, and purchase buttons immediately readable.

Use smooth, subtle hover and focus transitions. Respect reduced-motion preferences.

Make every page work well on mobile, tablet, and desktop. Use comfortable touch targets, visible keyboard focus, properly labeled inputs, and sufficient contrast. Prevent horizontal scrolling on small screens.

Navigation and homepage

Create a sticky navigation bar containing:

GameVault logo linking to the homepage.

Three primary category links: “PlayStation 5”, “Xbox Series X|S”, and “PC”.

A working game search.

A cart icon displaying the total item quantity.

Highlight the active category. On mobile, collapse navigation into an accessible menu while keeping the cart easy to reach.

Build the homepage in this order:

Cinematic hero with the headline “Your next adventure starts here.”

Supporting text: “Discover games for PlayStation 5, Xbox Series X|S, and PC.”

An “Explore Games” button linking to the catalogue.

Three visual platform cards linking to their respective categories.

A featured games grid.

A short explanation of physical and digital delivery.

A compact footer with working navigation links.

Catalogue and product details

Create dedicated routes for each platform category and individual products.

Seed at least 18 demo listings, with at least six in each platform category. Include varied genres and prices. Clearly identify the catalogue and prices as demo content.

Use relevant cover artwork with consistent proportions and a polished fallback if an image cannot load. For real game titles, verify platform compatibility before including them.

Every product must have a unique SKU, title, platform, format, price, image, description, genre, and availability.

Treat different platforms or formats of the same game as separate purchasable SKUs.

Support:

Search by game title.

Filters for genre and format.

Sorting by price, ascending or descending.

A helpful empty-results state with a “Clear filters” action.

Each product card must show its cover, title, platform, physical or digital format, price, and an “Add to Cart” button.

Each product detail page must show a larger image, description, compatibility information, delivery method, price, availability, quantity selector, and “Add to Cart”.

Use these catalogue rules:

PC listings are digital games and identify their activation platform.

Xbox digital listings may support Series X|S when compatible.

Xbox physical discs must clearly state compatibility with a Series X equipped with a disc drive. They must never be presented as compatible with Series S.

Seed physical PS5 games and clearly state that a compatible disc drive is required.

Shopping cart

Customers must be able to add products, increase or decrease quantities, and remove individual items.

Adding the same SKU again increases its quantity. Different platform or format variants remain separate cart items.

Keep quantities as positive integers and enforce availability limits. Disable purchasing for unavailable products.

Update the cart badge, line totals, subtotal, delivery fee, and order total immediately after changes.

Persist only cart SKUs and quantities in localStorage so the cart survives refreshes. Retrieve current prices from product data.

Include product thumbnails, platform and format labels, quantity controls, remove buttons, “Continue Shopping”, and “Proceed to Checkout”.

Show a helpful empty-cart state and prevent checkout when the cart is empty.

Checkout and delivery

Provide guest checkout without requiring account creation.

Collect the customer’s full name and email address for every order. Explain that the email is used for communication about the order.

When the cart contains physical products, also require street address, postal code, and city. Show Sweden as the delivery country. A phone number may be optional.

For digital-only orders, omit physical address fields and charge no shipping.

Use a configurable sample shipping fee of 49 kr, charged once per order containing physical products. Mixed orders must clearly distinguish physical items from digital items.

Show an editable order review with all products, quantities, delivery information, subtotal, shipping, and final total before submission.

Validate required fields and email format with clear inline messages. Preserve entered information if submission fails.

Label the checkout action “Place Demo Order” and clearly explain that no money will be charged and no games will actually be dispatched or activated.

Order storage and confirmation

Save each submitted order and its items in the backend, including:

Unique order reference and creation time.

Customer name and contact email.

Delivery address when applicable.

Product SKU, title, platform, format, quantity, and purchase-price snapshot.

Subtotal, delivery fee, total, and demo order status.

Calculate authoritative totals on the server from product records. Do not trust prices or totals submitted by the browser. Use integer minor currency units to avoid rounding errors.

Validate submitted products and quantities on the server. Create the order and its items atomically and prevent duplicate orders from repeated submission or retries.

Protect customer data with appropriate database permissions. Public visitors must not be able to list orders or retrieve another customer’s details using an email address or order number. Keep customer information out of URLs and localStorage.

Only show success after the backend confirms that the order was saved. Then clear the cart and show the order reference, purchased items, total, and delivery summary.

For this version, collecting and saving the email is required; sending emails is outside the initial scope. Do not display “Email sent” or claim delivery has occurred.

Explain to the project team how to inspect saved orders and customer emails through the private backend dashboard. A separate admin application is unnecessary for this version.

If backend activation or configuration is required, state the exact remaining setup and continue building everything that can work independently. Never silently replace persistent order storage with a fake success message.

Implementation and verification

Implement in this sequence: visual foundation and catalogue, product details and cart, checkout and backend order storage, then verification.

Keep the design consistent across all routes. Include useful loading, error, empty, and success states. Every visible button and navigation link must perform its intended action.

Verify these complete flows:

Open all three platform categories and confirm correct filtering.

Add the same SKU twice and a different platform variant once.

Refresh the page and confirm the cart is preserved.

Change quantities and remove products; verify badge and totals.

Confirm digital-only orders have no address requirement or shipping fee.

Confirm mixed orders require an address and charge shipping only once.

Submit invalid email or incomplete delivery details and verify validation.

Submit a valid demo order and verify that exactly one order and its items are saved.

Simulate a submission failure and confirm the cart and form are preserved.

Confirm customers cannot access other customers’ order data.

Check the shopping journey on mobile and desktop.

When finished, summarize the implemented features, verification results, any required configuration, and the boundaries of demo checkout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/af331a6d-afe8-4cd1-a869-ab21061f645c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
