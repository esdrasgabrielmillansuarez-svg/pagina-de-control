document.addEventListener('DOMContentLoaded', () => {
    const bars = document.querySelectorAll('.bar');

    bars.forEach((bar) => {
        const height = bar.style.height;
        bar.style.height = '0';
        requestAnimationFrame(() => {
            bar.style.transition = 'height 0.8s ease';
            bar.style.height = height;
        });
    });

    const buttons = document.querySelectorAll('.primary-btn, .ghost-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.add('pulse');
            setTimeout(() => btn.classList.remove('pulse'), 300);
        });
    });

    const lockScreen = document.getElementById('lockScreen');
    const appShell = document.getElementById('appShell');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const userNameInput = document.getElementById('userName');
    const userPassInput = document.getElementById('userPass');
    const userRoleSelect = document.getElementById('userRole');
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const logoutBtn = document.getElementById('logoutBtn');
    const userCreateForm = document.getElementById('userCreateForm');
    const newUserName = document.getElementById('newUserName');
    const newUserPassword = document.getElementById('newUserPassword');
    const newUserRole = document.getElementById('newUserRole');
    const userList = document.getElementById('userList');
    const salesActivityList = document.getElementById('salesActivityList');

    const USER_KEY = 'panelUsers';
    const SALES_KEY = 'panelSalesActivity';
    const validUsers = {
        admin: '1234',
        maria: 'admin',
        operacion: 'operacion',
        reporte: 'reporte'
    };

    const hydrateUserCredentials = () => {
        const users = getUsers();
        Object.keys(validUsers).forEach((key) => delete validUsers[key]);
        users.forEach((user) => {
            validUsers[(user.username || '').trim().toLowerCase()] = String(user.password || '');
        });
        Object.entries({ admin: '1234', maria: 'admin', operacion: 'operacion', reporte: 'reporte' }).forEach(([key, value]) => {
            if (!validUsers[key]) validUsers[key] = value;
        });
    };

    const getUserRole = (username) => {
        const normalized = (username || '').trim().toLowerCase();
        if (normalized === 'admin') return 'Administrador';
        const user = getUsers().find((item) => (item.username || '').trim().toLowerCase() === normalized);
        if (user && user.role) return user.role;
        if (normalized === 'maria' || normalized === 'operacion') return 'Operaciones';
        if (normalized === 'reporte') return 'Reportes';
        return 'Administrador';
    };

    let currentUserRole = 'Administrador';
    let currentUserName = 'admin';

    const unlockDashboard = (username, role) => {
        currentUserName = username || 'admin';
        if (profileName) profileName.textContent = username === 'admin' ? 'Usuario' : username.charAt(0).toUpperCase() + username.slice(1);
        if (profileRole) profileRole.textContent = role || 'Administrador';
        currentUserRole = role || 'Administrador';
        if (lockScreen) lockScreen.classList.add('hidden');
        if (appShell) {
            appShell.classList.remove('locked-shell');
            appShell.style.filter = 'none';
            appShell.style.pointerEvents = 'auto';
            appShell.style.userSelect = 'auto';
        }
        if (loginError) loginError.classList.remove('visible');
        updateRateAccess();
        updateInventoryAccess();
        renderUserList();
        renderSalesActivity();
    };

    const lockDashboard = () => {
        if (lockScreen) lockScreen.classList.remove('hidden');
        currentUserName = 'admin';
        currentUserRole = 'Administrador';
        if (appShell) {
            appShell.classList.add('locked-shell');
            appShell.style.filter = 'blur(2px)';
            appShell.style.pointerEvents = 'none';
            appShell.style.userSelect = 'none';
        }
        updateRateAccess();
        updateInventoryAccess();
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = (userNameInput ? userNameInput.value.trim().toLowerCase() : '');
            const password = userPassInput ? userPassInput.value.trim() : '';
            const role = getUserRole(username);
            const userMatch = getUsers().find((user) => (user.username || '').trim().toLowerCase() === username);

            if ((userMatch && userMatch.password === password) || (validUsers[username] && validUsers[username] === password)) {
                unlockDashboard(username, role);
            } else {
                if (loginError) loginError.classList.add('visible');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            lockDashboard();
            if (userNameInput) userNameInput.focus();
        });
    }

    const bindUtilityButtons = () => {
        const topButtons = document.querySelectorAll('.topbar-actions button');
        topButtons.forEach((button) => {
            const text = (button.textContent || '').trim();
            if (text === 'Salir') {
                button.addEventListener('click', () => {
                    lockDashboard();
                    if (userNameInput) userNameInput.focus();
                });
            }
            if (text === 'Exportar') {
                button.addEventListener('click', () => {
                    generateSalesReport();
                });
            }
            if (text === 'Nuevo registro') {
                button.addEventListener('click', () => {
                    const focusTarget = document.getElementById('productName') || document.getElementById('newUserName') || document.getElementById('dailySales') || document.getElementById('userName');
                    if (focusTarget) focusTarget.focus();
                    showToast('Se abrió el formulario rápido de registro.');
                });
            }
        });

        const cashButtons = document.querySelectorAll('.cash-actions button');
        cashButtons.forEach((button) => {
            const text = (button.textContent || '').trim();
            if (text === 'Registrar ingreso') {
                button.addEventListener('click', () => {
                    showToast('Ingreso registrado en caja correctamente.');
                });
            }
            if (text === 'Cerrar turno') {
                button.addEventListener('click', () => {
                    showToast('Turno de caja cerrado correctamente.');
                });
            }
        });

        const refreshLinks = document.querySelectorAll('.panel-header a');
        refreshLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const text = (link.textContent || '').trim();
                event.preventDefault();
                if (text === 'Actualizar') {
                    renderSalesActivity();
                    showToast('Actividad actualizada.');
                } else if (text === 'Nuevo usuario' || text === 'Ver todos' || text === 'Agregar') {
                    const focusTarget = document.getElementById('newUserName') || document.getElementById('productName');
                    if (focusTarget) focusTarget.focus();
                    showToast('Se abrió el acceso rápido a la gestión.');
                }
            });
        });
    };

    const toastContainer = document.getElementById('toastContainer');
    const productForm = document.getElementById('productForm');
    const inventoryAccessNote = document.getElementById('inventoryAccessNote');
    const productNameInput = document.getElementById('productName');
    const productCategoryInput = document.getElementById('productCategory');
    const productStockInput = document.getElementById('productStock');
    const productPriceBsInput = document.getElementById('productPriceBs');
    const productPriceUsdInput = document.getElementById('productPriceUsd');
    const productImageInput = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');
    const productUsdPreview = document.getElementById('productUsdPreview');
    const productBsPreview = document.getElementById('productBsPreview');
    const productList = document.getElementById('productList');
    const inventorySummary = document.getElementById('inventorySummary');
    const API_ENDPOINT = 'api.php';
    const dolarDay = document.getElementById('dolar-day');
    const dolarRate = document.getElementById('dolar-rate');
    const dolarValue = document.getElementById('dolar-value');
    const syncBcvRateBtn = document.getElementById('syncBcvRate');
    const autoRateStatus = document.getElementById('autoRateStatus');
    const saveDolarRate = document.getElementById('save-dolar-rate');
    const pdfBtn = document.querySelector('.pdf-btn');
    const dailyHistoryForm = document.getElementById('dailyHistoryForm');
    const dailySales = document.getElementById('dailySales');
    const dailyCash = document.getElementById('dailyCash');
    const dailyDollar = document.getElementById('dailyDollar');
    const historyList = document.getElementById('historyList');
    const STORAGE_KEY = 'panelHistoryDays';
    const MAX_HISTORY_DAYS = 15;
    const PRODUCT_KEY = 'panelProducts';
    const USD_RATE_KEY = 'panelUsdRate';

    const showToast = (message) => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    };

    const callBackend = async (action, payload = {}) => {
        if (typeof fetch !== 'function') {
            return null;
        }

        const endpoint = `${API_ENDPOINT}?action=${encodeURIComponent(action)}`;
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                formData.append(key, value);
            }
        });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return null;
        }
    };

    const getUsers = () => {
        try {
            const raw = localStorage.getItem(USER_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch (error) {
            return [];
        }

        const defaultUsers = [
            { username: 'admin', password: '1234', role: 'Administrador' },
            { username: 'maria', password: 'admin', role: 'Operaciones' },
            { username: 'operacion', password: 'operacion', role: 'Operaciones' },
            { username: 'reporte', password: 'reporte', role: 'Reportes' }
        ];
        localStorage.setItem(USER_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    };

    const saveUsers = (users) => {
        localStorage.setItem(USER_KEY, JSON.stringify(users));
        hydrateUserCredentials();
    };

    const getProducts = () => {
        try {
            const raw = localStorage.getItem(PRODUCT_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };

    const saveProducts = (products) => {
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    };

    const getSalesActivity = () => {
        try {
            const raw = localStorage.getItem(SALES_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };

    const saveSalesActivity = (entries) => {
        localStorage.setItem(SALES_KEY, JSON.stringify(entries));
    };

    const getUsdRate = () => {
        const value = Number(localStorage.getItem(USD_RATE_KEY) || 0);
        return Number.isFinite(value) && value > 0 ? value : 0;
    };

    const setUsdRate = (value) => {
        const rate = Number(value || 0);
        localStorage.setItem(USD_RATE_KEY, String(rate > 0 ? rate : 0));
    };

    const formatBs = (value) => new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0));

    const formatUsd = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0));

    const determineStatus = (stock) => {
        const qty = Number(stock || 0);
        if (qty <= 0) return 'Sin stock';
        if (qty <= 5) return 'Bajo stock';
        return 'Disponible';
    };

    const getStatusClass = (status) => {
        const normalized = status || 'Disponible';
        if (normalized === 'Sin stock') return 'inactivo';
        if (normalized === 'Bajo stock') return 'pendiente';
        return 'activo';
    };

    let isSyncingProductPrice = false;

    const updateProductPreview = (source = 'bs') => {
        if (!productPriceBsInput || !productPriceUsdInput || !productUsdPreview || !productBsPreview) return;
        if (isSyncingProductPrice) return;

        isSyncingProductPrice = true;
        const rate = getUsdRate();
        const priceBs = Number(productPriceBsInput.value || 0);
        const priceUsd = Number(productPriceUsdInput.value || 0);

        if (source === 'bs' && rate > 0) {
            productPriceUsdInput.value = (priceBs / rate).toFixed(2);
        } else if (source === 'usd' && rate > 0) {
            productPriceBsInput.value = (priceUsd * rate).toFixed(2);
        } else if (source === 'bs') {
            productPriceUsdInput.value = '0.00';
        } else if (source === 'usd') {
            productPriceBsInput.value = '0.00';
        }

        const finalUsd = Number(productPriceUsdInput.value || 0);
        const finalBs = Number(productPriceBsInput.value || 0);
        productUsdPreview.textContent = formatUsd(finalUsd);
        productBsPreview.textContent = formatBs(finalBs);
        isSyncingProductPrice = false;
    };

    const renderInventory = () => {
        if (!productList) return;
        const products = getProducts();
        if (inventorySummary) {
            inventorySummary.textContent = `${products.length} producto${products.length === 1 ? '' : 's'}`;
        }
        productList.innerHTML = '';

        if (!products.length) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 6;
            emptyCell.className = 'empty-row';
            emptyCell.textContent = 'Sin productos registrados.';
            emptyRow.appendChild(emptyCell);
            productList.appendChild(emptyRow);
            return;
        }

        products.forEach((product) => {
            const row = document.createElement('tr');
            const productStatus = product.status || determineStatus(product.stock);
            const usdEquivalent = getUsdRate() > 0 ? Number(product.priceBs || 0) / getUsdRate() : 0;
            const isAdmin = currentUserRole === 'Administrador';

            const nameCell = document.createElement('td');
            const productImage = product.image ? `<img class="product-thumb" src="${product.image}" alt="${product.name}">` : '';
            nameCell.innerHTML = `${productImage}<div><strong>${product.name}</strong><small>${product.category}</small></div>`;

            const stockCell = document.createElement('td');
            stockCell.textContent = `${product.stock}`;

            const priceCell = document.createElement('td');
            priceCell.textContent = formatBs(product.priceBs ?? 0);

            const usdCell = document.createElement('td');
            usdCell.textContent = formatUsd(Number(product.priceUsd ?? usdEquivalent));

            const statusCell = document.createElement('td');
            if (isAdmin) {
                const statusSelect = document.createElement('select');
                ['Disponible', 'Bajo stock', 'Sin stock', 'Reservado'].forEach((optionValue) => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    if (optionValue === productStatus) option.selected = true;
                    statusSelect.appendChild(option);
                });
                statusSelect.addEventListener('change', (event) => {
                    const selectedStatus = event.target.value;
                    const currentProduct = getProducts().find((item) => item.id === product.id);
                    if (!currentProduct) return;
                    const previousStatus = currentProduct.status || determineStatus(currentProduct.stock);
                    currentProduct.status = selectedStatus;
                    saveProducts(getProducts().map((item) => item.id === currentProduct.id ? currentProduct : item));
                    renderInventory();
                    showToast(`El producto "${currentProduct.name}" cambió de ${previousStatus} a ${selectedStatus}.`);
                });
                statusCell.appendChild(statusSelect);
            } else {
                const statusBadge = document.createElement('span');
                statusBadge.className = `status ${getStatusClass(productStatus)}`;
                statusBadge.textContent = productStatus;
                statusCell.appendChild(statusBadge);
            }

            const actionsCell = document.createElement('td');
            actionsCell.className = 'inventory-actions';

            const sellBtn = document.createElement('button');
            sellBtn.type = 'button';
            sellBtn.className = 'mini-btn sell-btn';
            sellBtn.textContent = 'Vender';
            sellBtn.addEventListener('click', () => {
                const allProducts = getProducts();
                const target = allProducts.find((item) => item.id === product.id);
                if (!target || Number(target.stock || 0) <= 0) {
                    showToast(`No hay stock disponible para ${target ? target.name : product.name}.`);
                    return;
                }
                const quantity = 1;
                const totalBs = Number(target.priceBs || 0) * quantity;
                const totalUsd = getUsdRate() > 0 ? totalBs / getUsdRate() : 0;
                target.stock = Math.max(0, Number(target.stock || 0) - quantity);
                target.status = determineStatus(target.stock);
                saveProducts(allProducts.map((item) => item.id === target.id ? target : item));
                renderInventory();
                logUserSale({
                    productName: target.name,
                    quantity,
                    totalBs,
                    totalUsd,
                    userName: currentUserName,
                    role: currentUserRole
                });
                showToast(`Venta registrada: ${target.name}.`);
            });
            actionsCell.appendChild(sellBtn);

            if (isAdmin) {
                const minusBtn = document.createElement('button');
                minusBtn.type = 'button';
                minusBtn.className = 'mini-btn';
                minusBtn.textContent = '-';
                minusBtn.addEventListener('click', () => {
                    const allProducts = getProducts();
                    const target = allProducts.find((item) => item.id === product.id);
                    if (!target) return;
                    target.stock = Math.max(0, Number(target.stock || 0) - 1);
                    target.status = determineStatus(target.stock);
                    saveProducts(allProducts.map((item) => item.id === target.id ? target : item));
                    renderInventory();
                    showToast(`Stock actualizado para ${target.name}.`);
                });

                const plusBtn = document.createElement('button');
                plusBtn.type = 'button';
                plusBtn.className = 'mini-btn';
                plusBtn.textContent = '+';
                plusBtn.addEventListener('click', () => {
                    const allProducts = getProducts();
                    const target = allProducts.find((item) => item.id === product.id);
                    if (!target) return;
                    target.stock = Number(target.stock || 0) + 1;
                    target.status = determineStatus(target.stock);
                    saveProducts(allProducts.map((item) => item.id === target.id ? target : item));
                    renderInventory();
                    showToast(`Stock actualizado para ${target.name}.`);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'mini-btn danger';
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', () => {
                    const allProducts = getProducts().filter((item) => item.id !== product.id);
                    saveProducts(allProducts);
                    renderInventory();
                    showToast(`Se eliminó ${product.name}.`);
                });

                actionsCell.appendChild(minusBtn);
                actionsCell.appendChild(plusBtn);
                actionsCell.appendChild(deleteBtn);
            }

            row.appendChild(nameCell);
            row.appendChild(stockCell);
            row.appendChild(priceCell);
            row.appendChild(usdCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            productList.appendChild(row);
        });
    };

    const updateInventoryAccess = () => {
        const isAdmin = currentUserRole === 'Administrador';
        if (productForm) productForm.style.display = isAdmin ? 'block' : 'none';
        if (inventoryAccessNote) {
            inventoryAccessNote.hidden = isAdmin;
            inventoryAccessNote.textContent = 'Solo el administrador puede agregar productos y controlar el inventario.';
        }
        renderInventory();
    };

    const deleteUser = async (username) => {
        const normalized = (username || '').trim();
        if (!normalized) return;
        if (normalized.toLowerCase() === 'admin') {
            showToast('No puedes eliminar al usuario administrador principal.');
            return;
        }

        try {
            const backendResult = await callBackend('delete_user', {
                username: normalized,
                role: currentUserRole
            });

            if (backendResult && backendResult.success === false) {
                showToast(backendResult.message || 'No se pudo eliminar el usuario.');
                return;
            }
        } catch (error) {
            // La eliminación sigue en localStorage como respaldo si el backend no responde.
        }

        const users = getUsers().filter((user) => (user.username || '').trim().toLowerCase() !== normalized.toLowerCase());
        saveUsers(users);
        renderUserList();
        if ((currentUserName || '').trim().toLowerCase() === normalized.toLowerCase()) {
            lockDashboard();
        }
        showToast(`Usuario ${normalized} eliminado.`);
    };

    const renderUserList = () => {
        if (!userList) return;
        const users = getUsers();
        userList.innerHTML = '';

        if (!users.length) {
            const emptyItem = document.createElement('li');
            emptyItem.innerHTML = '<div class="user-meta"><strong>Sin usuarios</strong><small>No registrados</small></div><span class="status inactivo">Sin datos</span>';
            userList.appendChild(emptyItem);
            return;
        }

        users.forEach((user) => {
            const item = document.createElement('li');
            const meta = document.createElement('div');
            meta.className = 'user-meta';
            const strong = document.createElement('strong');
            strong.textContent = user.username;
            const small = document.createElement('small');
            small.textContent = user.role;
            meta.appendChild(strong);
            meta.appendChild(small);

            const actions = document.createElement('div');
            actions.className = 'user-management-actions';

            const status = document.createElement('span');
            status.className = `status ${user.role === 'Administrador' ? 'activo' : 'pendiente'}`;
            status.textContent = user.role;
            actions.appendChild(status);

            if (currentUserRole === 'Administrador' && (user.username || '').trim().toLowerCase() !== 'admin') {
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'mini-btn danger';
                deleteBtn.textContent = 'Eliminar';
                deleteBtn.addEventListener('click', () => deleteUser(user.username));
                actions.appendChild(deleteBtn);
            }

            item.appendChild(meta);
            item.appendChild(actions);
            userList.appendChild(item);
        });
    };

    const renderSalesActivity = () => {
        if (!salesActivityList) return;
        const entries = getSalesActivity().slice(0, 12);
        salesActivityList.innerHTML = '';

        if (!entries.length) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-sales-item';
            emptyItem.textContent = 'No hay actividad de ventas registrada.';
            salesActivityList.appendChild(emptyItem);
            return;
        }

        entries.forEach((entry) => {
            const item = document.createElement('li');
            const date = document.createElement('strong');
            const info = document.createElement('span');
            const total = document.createElement('small');

            date.textContent = `${entry.user || 'Usuario'} · ${entry.product || 'Producto'}`;
            info.textContent = `${entry.role || 'Operaciones'} · ${entry.quantity || 0} und · ${entry.date || 'Sin fecha'}`;
            total.textContent = `${formatBs(entry.totalBs || 0)} / ${formatUsd(entry.totalUsd || 0)}`;

            item.appendChild(date);
            item.appendChild(info);
            item.appendChild(total);
            salesActivityList.appendChild(item);
        });
    };

    const logUserSale = ({ productName, quantity, totalBs, totalUsd, userName, role }) => {
        const list = getSalesActivity();
        const entry = {
            id: Date.now() + Math.random(),
            product: productName || 'Producto',
            quantity: Number(quantity || 0),
            totalBs: Number(totalBs || 0),
            totalUsd: Number(totalUsd || 0),
            user: userName || currentUserName || 'Usuario',
            role: role || currentUserRole || 'Operaciones',
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
        };
        list.unshift(entry);
        saveSalesActivity(list.slice(0, 50));
        renderSalesActivity();
    };

    const generateSalesReport = () => {
        const entries = getSalesActivity();
        const reportWindow = window.open('', '_blank', 'width=900,height=700');
        if (!reportWindow) {
            showToast('Tu navegador bloqueó la ventana del reporte.');
            return;
        }

        const rows = entries.length ? entries.map((entry) => `
            <tr>
                <td>${entry.date || '-'}</td>
                <td>${entry.user || 'Usuario'}</td>
                <td>${entry.role || 'Operaciones'}</td>
                <td>${entry.product || 'Producto'}</td>
                <td>${Number(entry.quantity || 0)}</td>
                <td>${formatBs(entry.totalBs || 0)}</td>
                <td>${formatUsd(entry.totalUsd || 0)}</td>
            </tr>
        `).join('') : '<tr><td colspan="7">No hay actividad de ventas registrada.</td></tr>';

        reportWindow.document.write(`<!doctype html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de ventas</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
                    h1 { margin-bottom: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
                    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    th { background: #f8fafc; }
                    .meta { color: #475569; margin-bottom: 16px; }
                </style>
            </head>
            <body>
                <h1>Reporte de ventas por usuario</h1>
                <div class="meta">Total de registros: ${entries.length}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Total Bs.</th>
                            <th>Total USD</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>`);
        reportWindow.document.close();
        reportWindow.focus();
        setTimeout(() => reportWindow.print(), 400);
    };

    const updateRateAccess = () => {
        const isAdmin = currentUserRole === 'Administrador';
        if (dolarRate) dolarRate.disabled = !isAdmin;
        if (syncBcvRateBtn) syncBcvRateBtn.disabled = !isAdmin;
        if (saveDolarRate) {
            saveDolarRate.disabled = !isAdmin;
            saveDolarRate.textContent = isAdmin ? 'Guardar tasa' : 'Solo admin';
        }
    };

    const syncRateFromBcv = async () => {
        if (currentUserRole !== 'Administrador') {
            showToast('Solo el administrador puede sincronizar la tasa del dólar.');
            return;
        }

        if (autoRateStatus) autoRateStatus.textContent = 'Consultando...';

        try {
            const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo consultar la tasa del BCV');
            }

            const payload = await response.json();
            const officialRate = Array.isArray(payload)
                ? payload.find((entry) => (entry.fuente || '').toLowerCase() === 'oficial')
                : null;
            const rate = Number(officialRate?.promedio ?? payload?.promedio ?? 0);

            if (!Number.isFinite(rate) || rate <= 0) {
                throw new Error('La tasa recibida es inválida');
            }

            if (dolarRate) dolarRate.value = String(rate);
            setUsdRate(rate);
            updateDolarValue();
            if (autoRateStatus) {
                autoRateStatus.textContent = 'BCV sincronizado';
            }
            showToast(`Tasa BCV sincronizada: ${formatBs(rate)}`);
        } catch (error) {
            if (autoRateStatus) autoRateStatus.textContent = 'Sin sincronizar';
            showToast('No se pudo sincronizar la tasa del dólar. Inténtalo más tarde.');
        }
    };

    const syncRateFromStorage = () => {
        const rate = getUsdRate();
        if (dolarRate) dolarRate.value = rate;
        if (dolarValue) dolarValue.textContent = `Bs. ${formatBs(rate)}`;
    };

    const getHistory = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    };

    const setHistory = (entries) => {
        const safeEntries = entries.slice(0, MAX_HISTORY_DAYS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeEntries));
    };

    const renderHistory = () => {
        if (!historyList) return;

        const entries = getHistory();
        historyList.innerHTML = '';
        if (!entries.length) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-history';
            emptyItem.textContent = 'No se registraron días anteriores.';
            historyList.appendChild(emptyItem);
            return;
        }

        entries.forEach((entry) => {
            const item = document.createElement('li');
            const date = document.createElement('strong');
            const value = document.createElement('span');
            date.textContent = entry.date;
            value.textContent = `Ventas: $${Number(entry.sales || 0).toFixed(2)} · Caja: $${Number(entry.cash || 0).toFixed(2)} · USD: $${Number(entry.dollar || 0).toFixed(2)}`;
            item.appendChild(date);
            item.appendChild(value);
            historyList.appendChild(item);
        });
    };

    const updateDolarValue = () => {
        const selectedDay = dolarDay ? dolarDay.value : 'Hoy';
        const rate = Number(dolarRate.value || 0);
        if (dolarValue) {
            dolarValue.textContent = formatBs(rate);
        }
        if (dolarValue) {
            dolarValue.setAttribute('data-day', selectedDay);
        }
        setUsdRate(rate);
    };

    if (dolarDay && dolarRate && dolarValue) {
        dolarDay.addEventListener('change', updateDolarValue);
        dolarRate.addEventListener('input', () => {
            updateDolarValue();
            updateProductPreview();
        });
    }

    if (syncBcvRateBtn) {
        syncBcvRateBtn.addEventListener('click', syncRateFromBcv);
    }

    if (saveDolarRate) {
        saveDolarRate.addEventListener('click', () => {
            if (currentUserRole !== 'Administrador') {
                showToast('Solo el administrador puede cambiar la tasa del dólar.');
                return;
            }
            updateDolarValue();
            const selectedDay = dolarDay ? dolarDay.value : 'Hoy';
            saveDolarRate.textContent = `Tasa guardada (${selectedDay})`;
            showToast('La tasa del dólar fue actualizada.');
            setTimeout(() => {
                saveDolarRate.textContent = 'Guardar tasa';
            }, 1200);
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (currentUserRole !== 'Administrador') {
                showToast('Solo el administrador puede agregar productos.');
                return;
            }

            const name = productNameInput ? productNameInput.value.trim() : '';
            const category = productCategoryInput ? productCategoryInput.value.trim() : 'General';
            const stock = Number(productStockInput ? productStockInput.value || 0 : 0);
            const priceBs = Number(productPriceBsInput ? productPriceBsInput.value || 0 : 0);
            const priceUsd = Number(productPriceUsdInput ? productPriceUsdInput.value || 0 : 0);

            if (!name) {
                showToast('Escribe el nombre del producto.');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category || 'General');
            formData.append('stock', String(stock >= 0 ? stock : 0));
            formData.append('priceBs', String(priceBs >= 0 ? priceBs : 0));
            formData.append('priceUsd', String(priceUsd >= 0 ? priceUsd : 0));
            formData.append('role', currentUserRole);

            if (productImageInput && productImageInput.files && productImageInput.files[0]) {
                formData.append('image', productImageInput.files[0]);
            }

            const backendResult = await callBackend('add_product', {
                name,
                category: category || 'General',
                stock: String(stock >= 0 ? stock : 0),
                priceBs: String(priceBs >= 0 ? priceBs : 0),
                priceUsd: String(priceUsd >= 0 ? priceUsd : 0),
                role: currentUserRole,
                image: productImageInput && productImageInput.files && productImageInput.files[0] ? productImageInput.files[0] : ''
            });

            if (backendResult && Array.isArray(backendResult.products)) {
                saveProducts(backendResult.products);
                showToast(`Se agregó ${name} al inventario.`);
            } else {
                const products = getProducts();
                const newProduct = {
                    id: Date.now(),
                    name,
                    category: category || 'General',
                    stock: stock >= 0 ? stock : 0,
                    priceBs: priceBs >= 0 ? priceBs : 0,
                    priceUsd: priceUsd >= 0 ? priceUsd : 0,
                    status: determineStatus(stock),
                    image: productImagePreview && !productImagePreview.hidden ? productImagePreview.src : ''
                };

                products.unshift(newProduct);
                saveProducts(products);
                showToast(`Se agregó ${name} al inventario.`);
            }

            renderInventory();
                    productForm.reset();
                    if (productPriceBsInput) productPriceBsInput.value = '0';
                    if (productPriceUsdInput) productPriceUsdInput.value = '0';
                    updateProductPreview('bs');
                    if (productImagePreview) {
                        productImagePreview.src = '';
                        productImagePreview.hidden = true;
                    }
        });
    }

    if (productImageInput && productImagePreview) {
        productImageInput.addEventListener('change', () => {
            const file = productImageInput.files && productImageInput.files[0];
            if (!file) {
                productImagePreview.hidden = true;
                productImagePreview.src = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                productImagePreview.src = event.target.result;
                productImagePreview.hidden = false;
            };
            reader.readAsDataURL(file);
        });
    }

    if (productPriceBsInput) {
        productPriceBsInput.addEventListener('input', () => updateProductPreview('bs'));
    }

    if (productPriceUsdInput) {
        productPriceUsdInput.addEventListener('input', () => updateProductPreview('usd'));
    }

    if (dailyHistoryForm) {
        dailyHistoryForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const entry = {
                date: new Date().toISOString().slice(0, 10),
                sales: Number(dailySales ? dailySales.value || 0 : 0),
                cash: Number(dailyCash ? dailyCash.value || 0 : 0),
                dollar: Number(dailyDollar ? dailyDollar.value || 0 : 0)
            };

            const current = getHistory();
            const filtered = current.filter((item) => item.date !== entry.date);
            filtered.unshift(entry);
            setHistory(filtered);
            renderHistory();
            dailyHistoryForm.reset();
        });
    }

    if (userCreateForm) {
        userCreateForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (currentUserRole !== 'Administrador') {
                showToast('Solo el administrador puede crear usuarios.');
                return;
            }

            const username = newUserName ? newUserName.value.trim() : '';
            const password = newUserPassword ? newUserPassword.value.trim() : '';
            const role = newUserRole ? newUserRole.value : 'Operaciones';

            if (!username || !password) {
                showToast('Completa usuario y contraseña.');
                return;
            }

            const users = getUsers();
            const alreadyExists = users.some((user) => (user.username || '').trim().toLowerCase() === username.toLowerCase());
            if (alreadyExists) {
                showToast('Ese usuario ya existe.');
                return;
            }

            const backendResult = await callBackend('create_user', {
                username,
                password,
                role,
                roleSource: currentUserRole
            });

            if (backendResult && backendResult.success === false) {
                showToast(backendResult.message || 'No se pudo crear el usuario.');
                return;
            }

            users.push({ username, password, role });
            saveUsers(users);
            renderUserList();
            userCreateForm.reset();
            hydrateUserCredentials();
            showToast(`Usuario ${username} creado correctamente.`);
        });
    }

    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            if (currentUserRole === 'Administrador') {
                generateSalesReport();
                return;
            }
            generateSalesReport();
        });
    }

    bindUtilityButtons();
    renderUserList();
    renderSalesActivity();
    renderHistory();
    renderInventory();
    updateProductPreview();
    updateDolarValue();
    updateRateAccess();
    updateInventoryAccess();
    hydrateUserCredentials();
    lockDashboard();
});
