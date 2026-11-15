<?php
/*
 * POST init.php — start a payment.
 * Body (JSON): { name, phone, email, delivery, address, note, items: [{id, qty}] }
 * Prices the order on the server, saves it as "pending", asks Paystack to start
 * a transaction for that exact amount, and returns the access code for the popup.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    wm_fail(405, 'Use POST.');
}
$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in)) {
    wm_fail(400, 'Bad request.');
}

$clean = fn($v, int $max) => mb_substr(trim(preg_replace('/\s+/u', ' ', (string)$v)), 0, $max);
$name = $clean($in['name'] ?? '', 80);
$phone = preg_replace('/[\s-]/', '', (string)($in['phone'] ?? ''));
$email = strtolower($clean($in['email'] ?? '', 120));
$address = $clean($in['address'] ?? '', 300);
$note = $clean($in['note'] ?? '', 300);
$deliveryId = (string)($in['delivery'] ?? '');

if (mb_strlen($name) < 2) {
    wm_fail(422, 'Please enter your name.');
}
if (!preg_match('/^(\+?234|0)[789][01]\d{8}$/', $phone)) {
    wm_fail(422, 'Please enter a valid Nigerian phone number.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    wm_fail(422, 'Please enter a valid email address.');
}

$priced = wm_price_order(is_array($in['items'] ?? null) ? array_slice($in['items'], 0, 50) : [], $deliveryId);
if ($priced['delivery']['id'] !== 'pickup' && mb_strlen($address) < 8) {
    wm_fail(422, 'Please enter your delivery address.');
}

$ref = wm_new_ref();
$order = $priced + [
    'reference' => $ref,
    'status' => 'pending',
    'amount_kobo' => $priced['total'] * 100,
    'created_at' => date('c'),
    'customer' => compact('name', 'phone', 'email', 'address', 'note'),
];
wm_save_order($order);

$site = rtrim((string)(wm_config()['site_url'] ?? ''), '/');
$res = wm_paystack('POST', '/transaction/initialize', [
    'email' => $email,
    'amount' => $order['amount_kobo'],
    'currency' => 'NGN',
    'reference' => $ref,
    'callback_url' => $site . '/order.html',
    'metadata' => [
        'order_reference' => $ref,
        'custom_fields' => [
            ['display_name' => 'Customer', 'variable_name' => 'customer', 'value' => $name],
            ['display_name' => 'Phone', 'variable_name' => 'phone', 'value' => $phone],
            ['display_name' => 'Delivery', 'variable_name' => 'delivery', 'value' => $priced['delivery']['name']],
        ],
    ],
]);

if (empty($res['status']) || empty($res['data']['access_code'])) {
    $order['status'] = 'failed_to_start';
    $order['note_internal'] = (string)($res['message'] ?? 'initialize failed');
    wm_save_order($order);
    error_log('Paystack initialize failed for ' . $ref . ': ' . ($res['message'] ?? ''));
    wm_fail(502, 'We could not start the payment. Please try again.');
}

$order['access_code'] = $res['data']['access_code'];
wm_save_order($order);

wm_json([
    'ok' => true,
    'reference' => $ref,
    'access_code' => $res['data']['access_code'],
    'authorization_url' => $res['data']['authorization_url'] ?? null,
    'total' => $priced['total'],
]);
