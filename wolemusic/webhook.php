<?php
/*
 * POST webhook.php — Paystack calls this when a payment succeeds,
 * even if the customer closed their browser before returning to the site.
 * Set this URL in Paystack → Settings → API Keys & Webhooks → Webhook URL:
 *   https://YOUR-DOMAIN/webhook.php
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    exit;
}
$raw = (string)file_get_contents('php://input');
$sig = (string)($_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '');
$secret = (string)(wm_config()['paystack_secret'] ?? '');

// Only accept events signed with our secret key.
if ($sig === '' || $secret === '' || !hash_equals(hash_hmac('sha512', $raw, $secret), $sig)) {
    http_response_code(401);
    exit;
}

$event = json_decode($raw, true);
if (($event['event'] ?? '') === 'charge.success') {
    $ref = (string)($event['data']['reference'] ?? '');
    if (wm_valid_ref($ref) && ($order = wm_load_order($ref)) !== null && $order['status'] !== 'paid') {
        // Double-check with Paystack directly rather than trusting the event body alone.
        $res = wm_paystack('GET', '/transaction/verify/' . rawurlencode($ref));
        if (!empty($res['status']) && is_array($res['data'] ?? null)) {
            wm_apply_payment($order, $res['data']);
        }
    }
}
http_response_code(200);
echo 'ok';
