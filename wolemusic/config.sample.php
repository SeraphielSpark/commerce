<?php
/*
 * Wolemusic payment settings.
 * Copy this file to config.php (same folder) and fill in the values.
 * config.php holds the SECRET key: never share it, never put it in JavaScript.
 *
 * Test mode:  use the sk_test_... key from Paystack → Settings → API Keys & Webhooks.
 * Going live: swap in the sk_live_... key once Wole's Paystack business is verified.
 */
return [
    // Paystack secret key (starts with sk_test_ or sk_live_).
    'paystack_secret' => 'sk_test_REPLACE_ME',

    // Full address of the website, no trailing slash. Paystack sends customers back here.
    'site_url' => 'https://www.wolemusic.com',

    // Where new paid orders are emailed (Wole's email).
    'owner_email' => 'orders@wolemusic.com',

    // "From" address for emails. Use an address on the same domain so mail isn't flagged as spam.
    'mail_from' => 'no-reply@wolemusic.com',

    // Folder where orders are saved. Best: a folder OUTSIDE public_html,
    // e.g. '/home/CPANELUSER/wolemusic-orders'. Default: the protected orders folder next to these files.
    'orders_dir' => __DIR__ . '/orders',
];
