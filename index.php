<?php
$usuario = 'Usuario';
$fechaActual = 'Sin registros cargados';

$estadisticas = [
    ['titulo' => 'Ventas', 'valor' => '$0.00', 'cambio' => '0%', 'tipo' => 'up'],
    ['titulo' => 'Clientes', 'valor' => '0', 'cambio' => '0%', 'tipo' => 'up'],
    ['titulo' => 'Pedidos', 'valor' => '0', 'cambio' => '0%', 'tipo' => 'down'],
    ['titulo' => 'Satisfacción', 'valor' => '0%', 'cambio' => '0%', 'tipo' => 'up'],
];

$actividades = [
    ['titulo' => 'Sin actividad', 'detalle' => 'No hay movimientos registrados.', 'hora' => 'Sin datos'],
];

$ventasSemana = [
    ['dia' => 'Lun', 'valor' => 0],
    ['dia' => 'Mar', 'valor' => 0],
    ['dia' => 'Mié', 'valor' => 0],
    ['dia' => 'Jue', 'valor' => 0],
    ['dia' => 'Vie', 'valor' => 0],
    ['dia' => 'Sáb', 'valor' => 0],
    ['dia' => 'Dom', 'valor' => 0],
];

$tabla = [
    ['nombre' => 'Sin usuarios registrados', 'email' => '-', 'estado' => 'Sin datos', 'rol' => '-'],
];

$tareas = [
    ['texto' => 'Sin tareas pendientes', 'estado' => 'Sin datos'],
];

$usuariosAdmin = [
    ['nombre' => 'Usuario', 'rol' => 'Administrador principal', 'estado' => 'Sin datos'],
    ['nombre' => 'Sin usuarios', 'rol' => 'Operaciones', 'estado' => 'Sin datos'],
];

$cajaResumen = [
    ['label' => 'Efectivo', 'valor' => '$0.00'],
    ['label' => 'Transferencias', 'valor' => '$0.00'],
    ['label' => 'Gastos', 'valor' => '$0.00'],
];

$reportes = [
    ['label' => 'Ventas del día', 'valor' => '$0.00'],
    ['label' => 'Ganancia neta', 'valor' => '$0.00'],
];

$tasaDolar = 0.00;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Control</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="lockScreen" class="lock-screen">
        <div class="lock-panel">
            <div class="lock-header">
                <div class="lock-badge">PC</div>
                <h2>Acceso al panel</h2>
            </div>

            <form id="loginForm" class="login-form">
                <label for="userName">Usuario</label>
                <input id="userName" type="text" placeholder="Ej.: admin" value="admin" required>

                <label for="userPass">Contraseña</label>
                <input id="userPass" type="password" placeholder="Ingrese su contraseña" value="1234" required>

                <label for="userRole">Rol</label>
                <select id="userRole">
                    <option value="Administrador">Administrador</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Reportes">Reportes</option>
                </select>

                <button type="submit" class="primary-btn login-btn">Entrar al sistema</button>
                <p id="loginError" class="login-error">Credenciales inválidas.</p>
            </form>
        </div>
    </div>

    <div id="appShell" class="app-shell locked-shell">
        <aside class="sidebar">
            <div class="brand">
                <div class="brand-mark">PC</div>
                <div>
                    <h1>Panel</h1>
                </div>
            </div>

            <nav class="menu">
                <a href="#" class="active">Dashboard</a>
                <a href="#">Ventas</a>
                <a href="#">Clientes</a>
                <a href="#">Productos</a>
                <a href="#">Reportes</a>
                <a href="#">Configuración</a>
            </nav>

            <div class="profile-card">
                <div class="avatar">ML</div>
                <div>
                    <strong id="profileName"><?php echo htmlspecialchars($usuario); ?></strong>
                    <span id="profileRole">Administrador</span>
                </div>
            </div>
        </aside>

        <main class="main-content">
            <header class="topbar">
                <div>
                    <p class="eyebrow">Resumen general</p>
                    <h2>Dashboard</h2>
                </div>
                <div class="topbar-actions">
                    <button class="ghost-btn" id="logoutBtn">Salir</button>
                    <button class="ghost-btn">Exportar</button>
                    <button class="primary-btn">Nuevo registro</button>
                </div>
            </header>

            <section class="hero">
                <div>
                    <p class="eyebrow">Bienvenido</p>
                    <h3>Hola, <?php echo htmlspecialchars($usuario); ?>.</h3>
                    <p class="date-text"><?php echo htmlspecialchars($fechaActual); ?></p>
                </div>
                <div class="mini-card">
                    <span>Objetivo del mes</span>
                    <strong>0%</strong>
                    <small>Sin datos registrados</small>
                </div>
            </section>

            <section class="stats-grid">
                <?php foreach ($estadisticas as $item): ?>
                    <article class="stat-card">
                        <div class="stat-head">
                            <span><?php echo htmlspecialchars($item['titulo']); ?></span>
                            <span class="chip <?php echo $item['tipo']; ?>"><?php echo htmlspecialchars($item['cambio']); ?></span>
                        </div>
                        <h3><?php echo htmlspecialchars($item['valor']); ?></h3>
                    </article>
                <?php endforeach; ?>
            </section>

            <section class="content-grid">
                <article class="panel chart-panel">
                    <div class="panel-header">
                        <h4>Ventas semanales</h4>
                        <a href="#">Ver más</a>
                    </div>

                    <div class="chart-bars" aria-label="Gráfico de ventas semanales">
                        <?php foreach ($ventasSemana as $venta): ?>
                            <div class="bar-group">
                                <span class="bar" style="height: <?php echo $venta['valor']; ?>%"></span>
                                <small><?php echo htmlspecialchars($venta['dia']); ?></small>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </article>

                <article class="panel activity-panel">
                    <div class="panel-header">
                        <h4>Actividad reciente</h4>
                        <a href="#">Actualizar</a>
                    </div>

                    <ul class="activity-list">
                        <?php foreach ($actividades as $actividad): ?>
                            <li>
                                <div class="dot"></div>
                                <div>
                                    <strong><?php echo htmlspecialchars($actividad['titulo']); ?></strong>
                                    <p><?php echo htmlspecialchars($actividad['detalle']); ?></p>
                                </div>
                                <time><?php echo htmlspecialchars($actividad['hora']); ?></time>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </article>
            </section>

            <section class="bottom-grid">
                <article class="panel table-panel">
                    <div class="panel-header">
                        <h4>Usuarios recientes</h4>
                        <a href="#">Ver todos</a>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th>Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($tabla as $usuarioFila): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($usuarioFila['nombre']); ?></td>
                                    <td><?php echo htmlspecialchars($usuarioFila['email']); ?></td>
                                    <td>
                                        <span class="status <?php echo strtolower(str_replace(' ', '-', $usuarioFila['estado'])); ?>"><?php echo htmlspecialchars($usuarioFila['estado']); ?></span>
                                    </td>
                                    <td><?php echo htmlspecialchars($usuarioFila['rol']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </article>

                <article class="panel tasks-panel">
                    <div class="panel-header">
                        <h4>Tareas</h4>
                        <a href="#">Agregar</a>
                    </div>

                    <ul class="tasks-list">
                        <?php foreach ($tareas as $tarea): ?>
                            <li>
                                <span class="check"></span>
                                <span><?php echo htmlspecialchars($tarea['texto']); ?></span>
                                <span class="task-tag"><?php echo htmlspecialchars($tarea['estado']); ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </article>
            </section>

            <section class="admin-grid">
                <article class="panel user-management-panel">
                    <div class="panel-header">
                        <h4>Administración de usuarios</h4>
                        <a href="#">Nuevo usuario</a>
                    </div>

                    <div class="admin-user-highlight">
                        <div class="avatar admin-avatar">U</div>
                        <div>
                            <strong>Usuario</strong>
                            <span>Administrador principal</span>
                        </div>
                        <span class="status inactivo">Sin datos</span>
                    </div>

                    <form id="userCreateForm" class="user-create-form">
                        <div class="user-form-grid">
                            <div>
                                <label for="newUserName">Usuario</label>
                                <input id="newUserName" type="text" placeholder="Ej.: pedro" required>
                            </div>
                            <div>
                                <label for="newUserPassword">Contraseña</label>
                                <input id="newUserPassword" type="text" placeholder="Ingrese contraseña" required>
                            </div>
                            <div>
                                <label for="newUserRole">Rol</label>
                                <select id="newUserRole">
                                    <option value="Operaciones">Operaciones</option>
                                    <option value="Reportes">Reportes</option>
                                </select>
                            </div>
                        </div>
                        <button class="primary-btn" type="submit">Crear usuario</button>
                    </form>

                    <ul id="userList" class="user-management-list"></ul>
                </article>

                <article class="panel cash-panel">
                    <div class="panel-header">
                        <h4>Control de caja</h4>
                        <span class="status activo">Abierta</span>
                    </div>

                    <div class="cash-summary">
                        <?php foreach ($cajaResumen as $caja): ?>
                            <div>
                                <small><?php echo htmlspecialchars($caja['label']); ?></small>
                                <strong><?php echo htmlspecialchars($caja['valor']); ?></strong>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="cash-actions">
                        <button class="ghost-btn">Registrar ingreso</button>
                        <button class="primary-btn">Cerrar turno</button>
                    </div>
                </article>

                <article class="panel report-panel">
                    <div class="panel-header">
                        <h4>Reportes diarios</h4>
                        <span class="pdf-badge">PDF</span>
                    </div>

                    <div class="report-summary">
                        <?php foreach ($reportes as $reporte): ?>
                            <div>
                                <small><?php echo htmlspecialchars($reporte['label']); ?></small>
                                <strong><?php echo htmlspecialchars($reporte['valor']); ?></strong>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <p class="report-note">Aún no se registraron movimientos del día. Complete la información para guardar el historial.</p>
                    <div class="report-activity-box">
                        <h5>Actividad de ventas por usuario</h5>
                        <ul id="salesActivityList" class="sales-activity-list"></ul>
                    </div>
                    <button class="primary-btn pdf-btn" type="button">Generar PDF</button>
                </article>

                <article class="panel dolar-panel">
                    <div class="panel-header">
                        <h4>Tipo de cambio</h4>
                    </div>

                    <label for="dolar-day">Día</label>
                    <select id="dolar-day">
                        <option value="Hoy">Hoy</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                    </select>

                    <label for="dolar-rate">Tasa del dólar</label>
                    <input id="dolar-rate" type="number" step="0.01" value="0.00" min="0">

                    <div class="dolar-display">
                        <span>Valor actual</span>
                        <strong id="dolar-value">$0.00</strong>
                    </div>

                    <div class="auto-rate-row">
                        <button class="ghost-btn" id="syncBcvRate" type="button">Tasa BCV</button>
                        <span id="autoRateStatus" class="auto-rate-status">Sin sincronizar</span>
                    </div>

                    <button class="primary-btn" id="save-dolar-rate" type="button">Guardar tasa</button>
                </article>

                <article class="panel inventory-panel">
                    <div class="panel-header">
                        <h4>Inventario de productos</h4>
                        <span class="status activo" id="inventorySummary">0 productos</span>
                    </div>

                    <p id="inventoryAccessNote" class="inventory-access-note" hidden>Solo el administrador puede agregar productos y controlar el inventario.</p>

                    <form id="productForm" class="product-form">
                        <div class="product-grid">
                            <div>
                                <label for="productName">Nombre</label>
                                <input id="productName" type="text" placeholder="Ej.: Arroz">
                            </div>
                            <div>
                                <label for="productCategory">Categoría</label>
                                <input id="productCategory" type="text" placeholder="Ej.: Abarrotes">
                            </div>
                            <div>
                                <label for="productStock">Stock</label>
                                <input id="productStock" type="number" min="0" step="1" value="0">
                            </div>
                            <div>
                                <label for="productPriceBs">Precio (Bs.)</label>
                                <input id="productPriceBs" type="number" min="0" step="0.01" value="0">
                            </div>
                            <div>
                                <label for="productPriceUsd">Precio (USD)</label>
                                <input id="productPriceUsd" type="number" min="0" step="0.01" value="0">
                            </div>
                        </div>

                        <div class="product-upload-wrap">
                            <label for="productImage">Imagen de referencia</label>
                            <input id="productImage" type="file" accept="image/*">
                            <img id="productImagePreview" class="product-image-preview" alt="Vista previa del producto" hidden>
                        </div>

                        <div class="product-preview">
                            <span>Equivalente en USD</span>
                            <strong id="productUsdPreview">$0.00</strong>
                        </div>
                        <div class="product-preview">
                            <span>Equivalente en Bs.</span>
                            <strong id="productBsPreview">Bs. 0,00</strong>
                        </div>

                        <button class="primary-btn" type="submit">Agregar producto</button>
                    </form>

                    <div class="inventory-table-wrap">
                        <table class="inventory-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Stock</th>
                                    <th>Bs.</th>
                                    <th>USD</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="productList"></tbody>
                        </table>
                    </div>
                </article>

                <article class="panel history-panel">
                    <div class="panel-header">
                        <h4>Historial de días</h4>
                    </div>

                    <form id="dailyHistoryForm" class="history-form">
                        <label for="dailySales">Ventas del día</label>
                        <input id="dailySales" type="number" step="0.01" placeholder="0.00">

                        <label for="dailyCash">Caja del día</label>
                        <input id="dailyCash" type="number" step="0.01" placeholder="0.00">

                        <label for="dailyDollar">Tasa USD</label>
                        <input id="dailyDollar" type="number" step="0.01" placeholder="0.00">

                        <button class="primary-btn" type="submit">Guardar día</button>
                    </form>

                    <ul id="historyList" class="history-list">
                        <li class="empty-history">No se registraron días anteriores.</li>
                    </ul>
                </article>
            </section>
        </main>
    </div>

    <div id="toastContainer" class="toast-container"></div>

    <script src="script.js"></script>
</body>
</html>
