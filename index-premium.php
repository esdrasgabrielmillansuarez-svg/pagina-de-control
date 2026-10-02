<?php
$usuario = 'Usuario';
$fechaActual = 'Sin registros cargados';

$estadisticas = [
    ['titulo' => 'Ingresos', 'valor' => '$0.00', 'cambio' => '0%', 'tipo' => 'up'],
    ['titulo' => 'Clientes', 'valor' => '0', 'cambio' => '0%', 'tipo' => 'up'],
    ['titulo' => 'Cobros', 'valor' => '$0.00', 'cambio' => '0%', 'tipo' => 'up'],
    ['titulo' => 'Gastos', 'valor' => '$0.00', 'cambio' => '0%', 'tipo' => 'down'],
];

$actividades = [
    ['titulo' => 'Sin actividad', 'detalle' => 'No hay movimientos registrados.', 'hora' => 'Sin datos'],
];

$ventasSemana = [
    ['dia' => 'L', 'valor' => 0],
    ['dia' => 'M', 'valor' => 0],
    ['dia' => 'M', 'valor' => 0],
    ['dia' => 'J', 'valor' => 0],
    ['dia' => 'V', 'valor' => 0],
    ['dia' => 'S', 'valor' => 0],
    ['dia' => 'D', 'valor' => 0],
];

$usuarios = [
    ['nombre' => 'Sin usuarios registrados', 'cargo' => '-', 'estado' => 'Sin datos'],
];

$caja = [
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
    <title>Dashboard Premium</title>
    <link rel="stylesheet" href="style-premium.css">
</head>
<body>
    <div id="lockScreen" class="lock-screen">
        <div class="lock-panel">
            <div class="lock-header">
                <div class="lock-badge">P</div>
                <h2>Acceso al sistema</h2>
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

    <div id="appShell" class="shell locked-shell">
        <aside class="sidebar">
            <div class="brand">
                <div class="brand-mark">P</div>
                <div>
                    <p class="brand-label">Sistema</p>
                    <h1>Premium</h1>
                </div>
            </div>

            <nav class="nav">
                <a href="#" class="active">Dashboard</a>
                <a href="#">Ventas</a>
                <a href="#">Usuarios</a>
                <a href="#">Caja</a>
                <a href="#">Reportes</a>
                <a href="#">Config</a>
            </nav>

            <div class="profile-box">
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
                    <p class="eyebrow">Panel general</p>
                    <h2>Dashboard premium</h2>
                </div>
                <div class="topbar-actions">
                    <button class="secondary-btn" id="logoutBtn">Salir</button>
                    <button class="secondary-btn">Exportar</button>
                    <button class="primary-btn">Nuevo registro</button>
                </div>
            </header>

            <section class="hero">
                <div class="hero-copy">
                    <p class="eyebrow">Buenos días</p>
                    <h3>Bienvenido, <?php echo htmlspecialchars($usuario); ?></h3>
                    <p><?php echo htmlspecialchars($fechaActual); ?></p>
                </div>
                <div class="hero-metric">
                    <span>Meta del mes</span>
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
                        <a href="#">Ver detalle</a>
                    </div>
                    <div class="bars">
                        <?php foreach ($ventasSemana as $item): ?>
                            <div class="bar-col">
                                <span class="bar" style="height: <?php echo $item['valor']; ?>%"></span>
                                <small><?php echo htmlspecialchars($item['dia']); ?></small>
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
                                <span class="dot"></span>
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

            <section class="admin-grid">
                <article class="panel">
                    <div class="panel-header">
                        <h4>Administración de usuarios</h4>
                        <a href="#">Nuevo usuario</a>
                    </div>

                    <div class="admin-highlight">
                        <div class="avatar large">U</div>
                        <div>
                            <strong>Usuario</strong>
                            <span>Administrador principal</span>
                        </div>
                        <span class="status online">Sin datos</span>
                    </div>

                    <ul class="stack-list">
                        <?php foreach ($usuarios as $usuarioItem): ?>
                            <li>
                                <div>
                                    <strong><?php echo htmlspecialchars($usuarioItem['nombre']); ?></strong>
                                    <small><?php echo htmlspecialchars($usuarioItem['cargo']); ?></small>
                                </div>
                                <span class="status <?php echo strtolower(str_replace(' ', '-', $usuarioItem['estado'])); ?>"><?php echo htmlspecialchars($usuarioItem['estado']); ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </article>

                <article class="panel">
                    <div class="panel-header">
                        <h4>Control de caja</h4>
                        <span class="status online">Abierta</span>
                    </div>
                    <div class="mini-metrics">
                        <?php foreach ($caja as $item): ?>
                            <div>
                                <small><?php echo htmlspecialchars($item['label']); ?></small>
                                <strong><?php echo htmlspecialchars($item['valor']); ?></strong>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="action-group">
                        <button class="secondary-btn">Registrar ingreso</button>
                        <button class="primary-btn">Cerrar turno</button>
                    </div>
                </article>

                <article class="panel">
                    <div class="panel-header">
                        <h4>Reportes diarios</h4>
                        <span class="pdf-tag">PDF</span>
                    </div>
                    <div class="mini-metrics report-metrics">
                        <?php foreach ($reportes as $reporte): ?>
                            <div>
                                <small><?php echo htmlspecialchars($reporte['label']); ?></small>
                                <strong><?php echo htmlspecialchars($reporte['valor']); ?></strong>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <p class="report-note">No se registran movimientos del día. La actividad aparecerá cuando se genere una venta.</p>
                    <div class="exchange-box">
                        <span>Tasa del dólar</span>
                        <strong>0,00</strong>
                    </div>
                    <button class="primary-btn">Generar PDF</button>
                </article>

                <article class="panel">
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
                    <label for="dolar-rate">Tasa en bolívares</label>
                    <input id="dolar-rate" type="number" step="0.01" value="0.00">
                    <div class="exchange-box">
                        <span>Valor actual</span>
                        <strong id="dolar-value">Bs. 0,00</strong>
                    </div>
                    <div class="auto-rate-row">
                        <button class="secondary-btn" id="syncBcvRate" type="button">Tasa BCV</button>
                        <span id="autoRateStatus" class="auto-rate-status">Sin sincronizar</span>
                    </div>
                    <button class="primary-btn" id="save-dolar-rate" type="button">Guardar tasa</button>
                </article>
            </section>
        </main>
    </div>

    <div id="toastContainer" class="toast-container"></div>

    <script src="script-premium.js"></script>
</body>
</html>
