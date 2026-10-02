document.addEventListener('DOMContentLoaded', () => {
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar) => {
        const height = bar.style.height;
        bar.style.height = '0';
        requestAnimationFrame(() => {
            bar.style.transition = 'height 0.9s ease';
            bar.style.height = height;
        });
    });

    const buttons = document.querySelectorAll('.primary-btn, .secondary-btn');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
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

    const validUsers = {
        admin: '1234',
        maria: 'admin',
        operacion: 'operacion',
        reporte: 'reporte'
    };

    const getUserRole = (username) => {
        const normalized = (username || '').trim().toLowerCase();
        if (normalized === 'admin') return 'Administrador';
        if (normalized === 'maria' || normalized === 'operacion') return 'Operaciones';
        if (normalized === 'reporte') return 'Reportes';
        return 'Administrador';
    };

    let currentUserRole = 'Administrador';

    const unlockDashboard = (username, role) => {
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
    };

    const lockDashboard = () => {
        if (lockScreen) lockScreen.classList.remove('hidden');
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

            if (validUsers[username] && validUsers[username] === password) {
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
                    window.print();
                });
            }
            if (text === 'Nuevo registro') {
                button.addEventListener('click', () => {
                    const focusTarget = document.getElementById('productName') || document.getElementById('dailySales') || document.getElementById('userName');
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
                event.preventDefault();
                const text = (link.textContent || '').trim();
                if (text === 'Actualizar') {
                    renderInventory();
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
    const productUsdPreview = document.getElementById('productUsdPreview');
    const productBsPreview = document.getElementById('productBsPreview');
    const productList = document.getElementById('productList');
    const inventorySummary = document.getElementById('inventorySummary');
    const dolarDay = document.getElementById('dolar-day');
    const dolarRate = document.getElementById('dolar-rate');
    const dolarValue = document.getElementById('dolar-value');
    const syncBcvRateBtn = document.getElementById('syncBcvRate');
    const autoRateStatus = document.getElementById('autoRateStatus');
    const saveBtn = document.getElementById('save-dolar-rate');
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
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2600);
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

    const saveProducts = (products) => localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));

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
            nameCell.innerHTML = `<strong>${product.name}</strong><small>${product.category}</small>`;

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
                target.stock = Math.max(0, Number(target.stock || 0) - 1);
                target.status = determineStatus(target.stock);
                saveProducts(allProducts.map((item) => item.id === target.id ? target : item));
                renderInventory();
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

    const updateRateAccess = () => {
        const isAdmin = currentUserRole === 'Administrador';
        if (dolarRate) dolarRate.disabled = !isAdmin;
        if (syncBcvRateBtn) syncBcvRateBtn.disabled = !isAdmin;
        if (saveBtn) {
            saveBtn.disabled = !isAdmin;
            saveBtn.textContent = isAdmin ? 'Guardar tasa' : 'Solo admin';
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
                headers: { Accept: 'application/json' }
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
            updateDolar();
            if (autoRateStatus) {
                autoRateStatus.textContent = 'BCV sincronizado';
            }
            showToast(`Tasa BCV sincronizada: ${formatBs(rate)}`);
        } catch (error) {
            if (autoRateStatus) autoRateStatus.textContent = 'Sin sincronizar';
            showToast('No se pudo sincronizar la tasa del dólar. Inténtalo más tarde.');
        }
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

    const updateDolar = () => {
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
        dolarDay.addEventListener('change', updateDolar);
        dolarRate.addEventListener('input', () => {
            updateDolar();
            updateProductPreview();
        });
    }

    if (syncBcvRateBtn) {
        syncBcvRateBtn.addEventListener('click', syncRateFromBcv);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (currentUserRole !== 'Administrador') {
                showToast('Solo el administrador puede cambiar la tasa del dólar.');
                return;
            }
            updateDolar();
            const day = dolarDay ? dolarDay.value : 'Hoy';
            saveBtn.textContent = `Guardado (${day})`;
            showToast('La tasa del dólar fue actualizada.');
            setTimeout(() => {
                saveBtn.textContent = 'Guardar tasa';
            }, 1200);
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', (event) => {
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

            const products = getProducts();
            products.unshift({
                id: Date.now(),
                name,
                category: category || 'General',
                stock: stock >= 0 ? stock : 0,
                priceBs: priceBs >= 0 ? priceBs : 0,
                priceUsd: priceUsd >= 0 ? priceUsd : 0,
                status: determineStatus(stock)
            });
            saveProducts(products);
            renderInventory();
            productForm.reset();
            if (productPriceBsInput) productPriceBsInput.value = '0';
            if (productPriceUsdInput) productPriceUsdInput.value = '0';
            updateProductPreview('bs');
            showToast(`Se agregó ${name} al inventario.`);
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

    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    bindUtilityButtons();
    renderHistory();
    renderInventory();
    updateProductPreview();
    updateDolar();
    updateRateAccess();
    updateInventoryAccess();
    lockDashboard();
});
