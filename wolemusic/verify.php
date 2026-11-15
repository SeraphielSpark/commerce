<?php
/*
 * GET verify.php?reference=WM-...
 * Asks Paystack whether this order was paid (never trusts the browser),
 * marks it paid if the amount matches, and returns the order summary.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

$ref = (string)($_GET['reference'] ?? '');
if (!wm_valid_ref($ref)) {
    wm_fail(400, 'Invalid order reference.');
}
$order = wm_load_order($ref);
if ($order === null) {
    wm_fail(404, 'Order not found.');
}

if ($order['status'] !== 'paid') {
    $res = wm_paystack('GET', '/transaction/verify/' . rawurlencode($ref));
    if (!empty($res['status']) && is_array($res['data'] ?? null)) {
        $order = wm_apply_payment($order, $res['data']);
    }
}

wm_json(['ok' => true, 'order' => wm_public_order($order)]);
