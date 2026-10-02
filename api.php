<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data';
$storePath = $dataDir . '/store.json';
$uploadsDir = __DIR__ . '/uploads';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0775, true);
}

if (!file_exists($storePath)) {
    $default = [
        'users' => [
            ['username' => 'admin', 'password' => '1234', 'role' => 'Administrador'],
            ['username' => 'maria', 'password' => 'admin', 'role' => 'Operaciones'],
            ['username' => 'operacion', 'password' => 'operacion', 'role' => 'Operaciones'],
            ['username' => 'reporte', 'password' => 'reporte', 'role' => 'Reportes']
        ],
        'products' => [],
        'sales' => [],
        'history' => [],
        'rate' => 0
    ];
    file_put_contents($storePath, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function readStore(string $storePath): array {
    $content = file_get_contents($storePath);
    if ($content === false) {
        return [];
    }

    $data = json_decode($content, true);
    if (!is_array($data)) {
        return [];
    }

    return $data;
}

function saveStore(string $storePath, array $data): void {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('No se pudo serializar la estructura de datos.');
    }
    file_put_contents($storePath, $json, LOCK_EX);
}

function determineStatus(int|float $stock): string {
    if ($stock <= 0) {
        return 'Sin stock';
    }
    if ($stock <= 5) {
        return 'Bajo stock';
    }
    return 'Disponible';
}

function asFloat($value): float {
    $number = (float) $value;
    return is_finite($number) ? $number : 0.0;
}

function parseJsonBody(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'health');
$store = readStore($storePath);

try {
    switch ($action) {
        case 'health':
            echo json_encode(['success' => true, 'message' => 'Backend activo']);
            break;

        case 'login':
            $username = strtolower(trim((string) ($_POST['username'] ?? '')));
            $password = trim((string) ($_POST['password'] ?? ''));
            $users = $store['users'] ?? [];
            foreach ($users as $user) {
                if (strtolower((string) ($user['username'] ?? '')) === $username && (string) ($user['password'] ?? '') === $password) {
                    echo json_encode(['success' => true, 'user' => $user]);
                    return;
                }
            }
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
            break;

        case 'users':
            echo json_encode(['success' => true, 'users' => $store['users'] ?? []]);
            break;

        case 'create_user':
            $role = trim((string) ($_POST['role'] ?? 'Operaciones'));
            $username = trim((string) ($_POST['username'] ?? ''));
            $password = trim((string) ($_POST['password'] ?? ''));

            if ($username === '' || $password === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Usuario y contraseña obligatorios']);
                return;
            }

            $users = $store['users'] ?? [];
            $exists = false;
            foreach ($users as $user) {
                if (strtolower((string) ($user['username'] ?? '')) === strtolower($username)) {
                    $exists = true;
                    break;
                }
            }

            if ($exists) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'El usuario ya existe']);
                return;
            }

            $users[] = ['username' => $username, 'password' => $password, 'role' => $role];
            $store['users'] = $users;
            saveStore($storePath, $store);
            echo json_encode(['success' => true, 'users' => $users]);
            break;

        case 'delete_user':
            $role = trim((string) ($_POST['role'] ?? ''));
            if ($role !== 'Administrador') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Solo el administrador puede eliminar usuarios']);
                return;
            }

            $username = trim((string) ($_POST['username'] ?? ''));
            if ($username === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El nombre del usuario es obligatorio']);
                return;
            }

            if (strtolower($username) === 'admin') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No se puede eliminar al administrador principal']);
                return;
            }

            $users = $store['users'] ?? [];
            $filteredUsers = array_values(array_filter($users, static fn ($user) => strtolower((string) ($user['username'] ?? '')) !== strtolower($username)));

            if (count($filteredUsers) === count($users)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
                return;
            }

            $store['users'] = $filteredUsers;
            saveStore($storePath, $store);
            echo json_encode(['success' => true, 'users' => $filteredUsers]);
            break;

        case 'products':
            $products = $store['products'] ?? [];
            echo json_encode(['success' => true, 'products' => $products]);
            break;

        case 'add_product':
            $role = trim((string) ($_POST['role'] ?? ''));
            if ($role !== 'Administrador') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Solo el administrador puede crear productos']);
                return;
            }

            $name = trim((string) ($_POST['name'] ?? ''));
            $category = trim((string) ($_POST['category'] ?? 'General'));
            $stock = max(0, (int) ($_POST['stock'] ?? 0));
            $priceBs = max(0, asFloat($_POST['priceBs'] ?? 0));
            $priceUsd = max(0, asFloat($_POST['priceUsd'] ?? 0));

            if ($name === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El nombre del producto es obligatorio']);
                return;
            }

            if ($priceBs <= 0 && $priceUsd > 0 && ($store['rate'] ?? 0) > 0) {
                $priceBs = $priceUsd * (float) ($store['rate'] ?? 0);
            }
            if ($priceUsd <= 0 && $priceBs > 0 && ($store['rate'] ?? 0) > 0) {
                $priceUsd = $priceBs / (float) ($store['rate'] ?? 1);
            }

            $imagePath = '';
            if (isset($_FILES['image']) && is_array($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['image']['tmp_name'];
                $original = basename((string) $_FILES['image']['name']);
                $extension = strtolower(pathinfo($original, PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
                if (!in_array($extension, $allowed, true)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Formato de imagen no válido']);
                    return;
                }

                $fileName = 'product_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
                $target = $uploadsDir . '/' . $fileName;
                if (!move_uploaded_file($tmpName, $target)) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'No se pudo guardar la imagen']);
                    return;
                }
                $imagePath = 'uploads/' . $fileName;
            }

            $product = [
                'id' => time() . '_' . random_int(1000, 9999),
                'name' => $name,
                'category' => $category !== '' ? $category : 'General',
                'stock' => $stock,
                'priceBs' => $priceBs,
                'priceUsd' => $priceUsd,
                'status' => determineStatus($stock),
                'image' => $imagePath
            ];

            $products = $store['products'] ?? [];
            array_unshift($products, $product);
            $store['products'] = $products;
            saveStore($storePath, $store);

            echo json_encode(['success' => true, 'products' => $products, 'product' => $product]);
            break;

        case 'save_rate':
            $role = trim((string) ($_POST['role'] ?? ''));
            if ($role !== 'Administrador') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Solo el administrador puede cambiar la tasa del dólar']);
                return;
            }
            $store['rate'] = max(0, asFloat($_POST['rate'] ?? 0));
            saveStore($storePath, $store);
            echo json_encode(['success' => true, 'rate' => $store['rate']]);
            break;

        case 'rate':
            echo json_encode(['success' => true, 'rate' => $store['rate'] ?? 0]);
            break;

        case 'history':
            echo json_encode(['success' => true, 'history' => $store['history'] ?? []]);
            break;

        case 'save_history':
            $payload = parseJsonBody();
            $date = trim((string) ($payload['date'] ?? date('Y-m-d')));
            $sales = asFloat($payload['sales'] ?? 0);
            $cash = asFloat($payload['cash'] ?? 0);
            $dollar = asFloat($payload['dollar'] ?? 0);
            $history = $store['history'] ?? [];
            $filtered = array_values(array_filter($history, static fn ($item) => ($item['date'] ?? '') !== $date));
            array_unshift($filtered, ['date' => $date, 'sales' => $sales, 'cash' => $cash, 'dollar' => $dollar]);
            $store['history'] = array_slice($filtered, 0, 15);
            saveStore($storePath, $store);
            echo json_encode(['success' => true, 'history' => $store['history']]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Acción no encontrada']);
            break;
    }
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $exception->getMessage()]);
}
