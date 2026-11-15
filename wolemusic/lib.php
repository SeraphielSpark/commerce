<?php
/*
 * Wolemusic — shared payment helpers.
 * Prices are ALWAYS recalculated here from catalog.js; the browser's
 * total is never trusted. An order only becomes "paid" after Paystack itself
 * confirms the payment (verify call or signed webhook) for the exact amount.
 */
declare(strict_types=1);

const WM_PAYSTACK_API = 'https://api.paystack.co';

function wm_config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        // WM_CONFIG lets the local test server use its own settings file.
        $file = getenv('WM_CONFIG') ?: __DIR__ . '/config.php';
        if (!is_file($file)) {
            wm_fail(500, 'Payments are not set up yet (config.php missing).');
        }
        $cfg = require $file;
    }
    return $cfg;
}

/* ---------- JSON responses ---------- */
function wm_json(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function wm_fail(int $code, string $message): void
{
    wm_json(['ok' => false, 'error' => $message], $code);
    exit;
}

/* ---------- Catalogue (single source of truth shared with the website) ---------- */
function wm_catalog(): array
{
    static $cat = null;
    if ($cat === null) {
        $raw = @file_get_contents(__DIR__ . '/catalog.js');
        $start = $raw === false ? false : strpos($raw, '{');
        $end = $raw === false ? false : strrpos($raw, '}');
        $cat = ($start !== false && $end !== false)
            ? json_decode(substr($raw, $start, $end - $start + 1), true)
            : null;
        if (!is_array($cat) || empty($cat['products'])) {
            wm_fail(500, 'Product catalogue could not be read.');
        }
    }
    return $cat;
}

/**
 * Build a priced order from what the customer sent: [{id, qty}], delivery id.
 * Returns lines, subtotal, discount, delivery fee and total in naira (integers).
 */
function wm_price_order(array $items, string $deliveryId): array
{
    $cat = wm_catalog();
    $byId = [];
    foreach ($cat['products'] as $p) {
        $byId[(int)$p['id']] = $p;
    }
    $delivery = null;
    foreach ($cat['delivery'] as $d) {
        if ($d['id'] === $deliveryId) {
            $delivery = $d;
        }
    }
    if ($delivery === null) {
        wm_fail(422, 'Please choose pickup or a delivery option.');
    }

    $lines = [];
    $qtyById = [];
    foreach ($items as $it) {
        $id = (int)($it['id'] ?? 0);
        $qty = (int)($it['qty'] ?? 0);
        if (!isset($byId[$id]) || $qty < 1) {
            continue;
        }
        $qtyById[$id] = min(99, ($qtyById[$id] ?? 0) + $qty);
    }
    if (!$qtyById) {
        wm_fail(422, 'Your cart is empty.');
    }

    $subtotal = 0;
    $discount = 0;
    $deal = $cat['deal'] ?? null;
    foreach ($qtyById as $id => $qty) {
        $p = $byId[$id];
        $price = (int)$p['price'];
        $line = $price * $qty;
        $subtotal += $line;
        if ($deal && $p['cat'] === $deal['cat'] && $price > (int)$deal['min']) {
            $discount += (int)$deal['off'] * $qty;
        }
        $lines[] = ['id' => $id, 'name' => $p['name'], 'price' => $price, 'qty' => $qty, 'line' => $line];
    }
    $fee = (int)$delivery['fee'];
    $total = $subtotal - $discount + $fee;
    if ($total < 100) {
        wm_fail(422, 'Order total is too small.');
    }

    return [
        'lines' => $lines,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'delivery' => ['id' => $delivery['id'], 'name' => $delivery['name'], 'fee' => $fee],
        'total' => $total,
    ];
}

/* ---------- Order storage (one JSON file per order) ---------- */
function wm_orders_dir(): string
{
    $dir = rtrim((string)(wm_config()['orders_dir'] ?? (__DIR__ . '/orders')), '/\\');
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        wm_fail(500, 'Order storage is not writable.');
    }
    // Block web access in case the folder sits inside public_html.
    if (!is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    }
    return $dir;
}

function wm_valid_ref(string $ref): bool
{
    return (bool)preg_match('/^WM-\d{6}-[A-F0-9]{8}$/', $ref);
}

function wm_new_ref(): string
{
    return 'WM-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
}

function wm_order_path(string $ref): string
{
    if (!wm_valid_ref($ref)) {
        wm_fail(400, 'Invalid order reference.');
    }
    return wm_orders_dir() . '/' . $ref . '.json';
}

function wm_load_order(string $ref): ?array
{
    $path = wm_order_path($ref);
    if (!is_file($path)) {
        return null;
    }
    $o = json_decode((string)file_get_contents($path), true);
    return is_array($o) ? $o : null;
}

function wm_save_order(array $order): void
{
    $path = wm_order_path($order['reference']);
    $tmp = $path . '.tmp';
    file_put_contents($tmp, json_encode($order, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($tmp, $path);
}

/* ---------- Paystack HTTP ---------- */
function wm_paystack(string $method, string $path, ?array $body = null): array
{
    // Test harness hook: only exists when the local test script defines it.
    if (function_exists('wm_paystack_mock')) {
        return wm_paystack_mock($method, $path, $body);
    }
    $secret = (string)(wm_config()['paystack_secret'] ?? '');
    if (!preg_match('/^sk_(test|live)_\w+$/', $secret) || strpos($secret, 'REPLACE') !== false) {
        wm_fail(500, 'Payments are not set up yet (Paystack key missing).');
    }
    $ch = curl_init(WM_PAYSTACK_API . $path);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $secret,
            'Content-Type: application/json',
            'Cache-Control: no-cache',
        ],
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $res = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($res === false) {
        error_log('Paystack request failed: ' . $err);
        wm_fail(502, 'Could not reach Paystack. Please try again.');
    }
    $data = json_decode((string)$res, true);
    return is_array($data) ? $data : ['status' => false, 'message' => 'Bad response from Paystack'];
}

/**
 * Mark an order paid ONLY if Paystack's transaction data matches it exactly.
 * Safe to call more than once (verify page + webhook); the owner is emailed once.
 */
function wm_apply_payment(array $order, array $tx): array
{
    $ok = ($tx['status'] ?? '') === 'success'
        && ($tx['reference'] ?? '') === $order['reference']
        && (int)($tx['amount'] ?? -1) === (int)$order['amount_kobo']
        && strtoupper((string)($tx['currency'] ?? '')) === 'NGN';

    if (!$ok) {
        if (($tx['status'] ?? '') === 'success') {
            // Paid, but not the amount we asked for: flag it, never fulfil it automatically.
            $order['status'] = 'review';
            $order['note_internal'] = 'Paystack amount/currency did not match the order. Check before releasing goods.';
            error_log('Wolemusic: payment mismatch on ' . $order['reference']);
            wm_save_order($order);
        }
        return $order;
    }
    if ($order['status'] === 'paid') {
        return $order;
    }
    $order['status'] = 'paid';
    $order['paid_at'] = date('c');
    $order['paystack'] = [
        'id' => $tx['id'] ?? null,
        'channel' => $tx['channel'] ?? null,
        'paid_at' => $tx['paid_at'] ?? ($tx['paidAt'] ?? null),
    ];
    wm_save_order($order);
    wm_notify_owner($order);
    return $order;
}

function wm_naira(int $n): string
{
    return 'NGN ' . number_format($n);
}

function wm_notify_owner(array $o): void
{
    $cfg = wm_config();
    $to = (string)($cfg['owner_email'] ?? '');
    if ($to === '' || !function_exists('mail')) {
        return;
    }
    $lines = array_map(fn($l) => "- {$l['name']} x {$l['qty']} = " . wm_naira($l['line']), $o['lines']);
    $c = $o['customer'];
    $body = "New PAID order {$o['reference']}\n\n"
        . implode("\n", $lines) . "\n\n"
        . 'Subtotal: ' . wm_naira($o['subtotal']) . "\n"
        . ($o['discount'] ? 'Student laptop deal: -' . wm_naira($o['discount']) . "\n" : '')
        . "{$o['delivery']['name']}: " . wm_naira($o['delivery']['fee']) . "\n"
        . 'TOTAL PAID: ' . wm_naira($o['total']) . "\n\n"
        . "Customer: {$c['name']}\nPhone: {$c['phone']}\nEmail: {$c['email']}\n"
        . ($c['address'] !== '' ? "Address: {$c['address']}\n" : '')
        . ($c['note'] !== '' ? "Note: {$c['note']}\n" : '')
        . "\nPaid via Paystack ({$o['paystack']['channel']}) at {$o['paid_at']}.\n";
    $from = (string)($cfg['mail_from'] ?? '');
    $headers = $from !== '' ? "From: Wolemusic <{$from}>\r\nReply-To: {$c['email']}" : '';
    @mail($to, "New paid order {$o['reference']} - " . wm_naira($o['total']), $body, $headers);
}

/* Public view of an order (safe to send to the browser). */
function wm_public_order(array $o): array
{
    return [
        'reference' => $o['reference'],
        'status' => $o['status'],
        'lines' => $o['lines'],
        'subtotal' => $o['subtotal'],
        'discount' => $o['discount'],
        'delivery' => $o['delivery'],
        'total' => $o['total'],
        'name' => explode(' ', trim($o['customer']['name']))[0], // first name only
    ];
}
