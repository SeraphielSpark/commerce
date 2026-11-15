# Wolemusic — payment setup (Paystack)

All files sit in one folder. This notes file is blocked from visitors by `.htaccess`.

## How a payment works
1. Checkout sends the cart (product ids + quantities only) to `init.php`.
2. The server works out the price itself from `catalog.js` (laptop deal and delivery fee included), saves the order as **pending**, and asks Paystack to start a payment for that exact amount.
3. The Paystack popup opens. If it can't, the customer is sent to Paystack's own payment page.
4. After paying, the customer lands on `order.html`, which calls `verify.php`. The server asks Paystack directly whether the payment went through, and only marks the order **paid** if the amount and currency match exactly.
5. Paystack also calls `webhook.php`, so the order is still marked paid if the customer closes the tab.
6. When an order becomes paid, Wole gets one email with the items, total and customer details.

If someone pays a different amount than the order total, the order is marked **review**, not paid.

## Setting it up on the hosting (cPanel)
1. Upload everything in the folder (including the hidden `.htaccess` file).
2. Copy `config.sample.php` to `config.php` and fill in:
   - `paystack_secret`: start with the **test** secret key (`sk_test_…`) from Paystack → Settings → API Keys & Webhooks.
   - `site_url`: e.g. `https://www.wolemusic.com`, with no trailing slash.
   - `owner_email` and `mail_from`: use an address on the site's own domain for `mail_from`.
   - `orders_dir`: ideally a folder **outside** `public_html`, e.g. `/home/CPANELUSER/wolemusic-orders`.
3. In Paystack → Settings → API Keys & Webhooks, set **Webhook URL** to `https://YOUR-DOMAIN/webhook.php`.
4. Test with Paystack's test cards. When everything works and Wole's business is verified, swap in `sk_live_…`.

Requirements: PHP 7.4 or newer, with the curl and mbstring extensions (standard on cPanel).

## Editing products and prices
Edit `catalog.js` only. The website and the payment server both read it.
