// ==================== ESTADO GLOBAL ====================
let appState = {
    currentRole: null,
    selectedTable: null,
    cart: {},
    orders: [],
    nextOrderId: 2001,
    searchTerm: '',
    dayHistory: [],
    availability: {},
};

const menuData = {
    burgers: [
        { id: 1, name: 'Special AB', desc: 'Cheddar, bacon, mozzarella', price: 6500 },
        { id: 2, name: 'Xlibra Beef', desc: 'American cheese, pink sauce', price: 5000 },
        { id: 3, name: 'A-50/50', desc: 'Beef and pork, Provolone', price: 6000 },
        { id: 4, name: 'B-Bacon', desc: 'American cheese, pink sauce', price: 6000 },
        { id: 5, name: 'C-Cheese', desc: 'Cheddar, mozzarella', price: 6000 },
        { id: 6, name: 'D-Hot', desc: 'PeperJack, chili, habanero', price: 6000 },
        { id: 7, name: 'Texas', desc: 'Bacon, cheddar, BBQ', price: 6500 },
        { id: 8, name: 'B-Bacon Beef', desc: 'Cheddar, bacon', price: 5500 },
        { id: 9, name: 'Italian', desc: 'Mozzarella, pomodoro', price: 6500 },
        { id: 10, name: 'Hawaiian', desc: 'Beef, mozzarella, pineapple', price: 6500 },
    ],
    chicken: [
        { id: 11, name: 'Classic Chicken', desc: 'Breast, lettuce, tomato', price: 5500 },
        { id: 12, name: 'Classic Chicken II', desc: 'Brisket, Cheddar', price: 6000 },
        { id: 13, name: 'Italian Chicken', desc: 'Breaded, basil', price: 7000 },
        { id: 14, name: 'Chicken Texan', desc: 'Breaded, BBQ', price: 7000 },
        { id: 15, name: 'Buffalo', desc: 'Breaded, coleslaw', price: 6500 },
    ],
    combos: [
        { id: 101, name: 'Italian Smashed', desc: 'Beef, mozzarella', price: 7000 },
        { id: 102, name: 'Crispy Mushroom', desc: 'Beef, portobello', price: 7000 },
        { id: 103, name: 'Hawaiian Smashed', desc: 'Beef, pineapple', price: 7000 },
        { id: 104, name: 'Smoked Pork', desc: 'Short rib, BBQ', price: 8000 },
        { id: 105, name: 'Camarones', desc: 'Shrimp, cheddar', price: 8000 },
    ],
    sides: [
        { id: 201, name: 'Aros de Cebolla', desc: 'Onion rings', price: 4000 },
        { id: 202, name: 'Mozzarella Sticks', desc: 'With Pomodoro', price: 4000 },
        { id: 203, name: 'Papas Fritas', desc: 'Fries', price: 3500 },
        { id: 204, name: 'Chili Cheese Fries', desc: 'With cheddar', price: 5500 },
        { id: 205, name: 'Boneless Wings', desc: 'Chicken wings', price: 6500 },
        { id: 206, name: 'Fish and Chips', desc: 'Breaded fish', price: 6500 },
    ],
    bebidas: [
        { id: 301, name: 'Gaseosa', desc: 'Soda', price: 1000 },
        { id: 302, name: 'Gaseosa Desechable', price: 1000, desc: 'Disposable' },
        { id: 303, name: 'Gaseosa Lata', desc: 'Canned', price: 1500 },
        { id: 304, name: 'Té Frío', desc: 'Iced tea', price: 1500 },
        { id: 305, name: 'Smoothie', desc: 'Fresh', price: 2000 },
        { id: 306, name: 'Natural', desc: 'Juice', price: 1000 },
        { id: 307, name: 'Botella de Agua', desc: 'Water', price: 1000 },
    ]
};

// ==================== UTILIDADES ====================
function formatPrice(colones) {
    return '₡' + Math.round(colones).toLocaleString('es-CR', { minimumFractionDigits: 0 });
}

function getFullItem(id) {
    for (const cat of Object.values(menuData)) {
        const item = cat.find(i => i.id === id);
        if (item) return item;
    }
    return null;
}

function playNotification() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
}

// ==================== LOGIN ====================
function setupLogin() {
    const buttons = document.querySelectorAll('.role-card');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.getAttribute('data-role');
            loginRole(role);
        });
    });
}

function loginRole(role) {
    appState.currentRole = role;
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('mainContainer').style.display = 'flex';
    
    const roleNames = { mesero: 'Mesero', chef: 'Chef', admin: 'Admin' };
    document.getElementById('roleTitle').textContent = roleNames[role] || role;
    
    switchRole(role);
    updateTime();
}

function switchRole(role) {
    console.log('Cambiando a vista:', role);
    
    // Ocultar todas las vistas
    const views = document.querySelectorAll('.view');
    views.forEach(v => {
        v.style.display = 'none';
        v.classList.remove('active');
    });
    
    // Mostrar la vista correcta
    if (role === 'mesero') {
        const meseroView = document.getElementById('meseroView');
        if (meseroView) {
            meseroView.style.display = 'flex';
            meseroView.classList.add('active');
            console.log('Vista mesero mostrada');
            setupMesero();
        }
    } else if (role === 'chef') {
        const chefView = document.getElementById('chefView');
        if (chefView) {
            chefView.style.display = 'flex';
            chefView.classList.add('active');
            console.log('Vista chef mostrada');
            setTimeout(() => updateKitchenDisplay(), 100);
        }
    } else if (role === 'admin') {
        const adminView = document.getElementById('adminView');
        if (adminView) {
            adminView.style.display = 'flex';
            adminView.classList.add('active');
            console.log('Vista admin mostrada');
            setTimeout(() => updateAdminPanel(), 100);
        }
    }
}

function setupLogout() {
    const btn = document.getElementById('btnLogout');
    if (btn) {
        btn.addEventListener('click', () => {
            appState.currentRole = null;
            appState.selectedTable = null;
            appState.cart = {};
            document.getElementById('loginScreen').classList.add('active');
            document.getElementById('mainHeader').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'none';
        });
    }
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    const elem = document.getElementById('timeDisplay');
    if (elem) elem.textContent = time;
}

// ==================== MESERO ====================
function setupMesero() {
    setupTableButtons();
    setupFilterButtons();
    setupSearchInput();
    setupConfirmButton();
    renderMenu('all');
    updateCart();
}

function setupTableButtons() {
    const buttons = document.querySelectorAll('.table-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const table = parseInt(btn.getAttribute('data-table'));
            selectTable(table);
        });
    });
}

function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-tab');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-category');
            renderMenu(cat);
        });
    });
}

function setupSearchInput() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('input', (e) => {
            appState.searchTerm = e.target.value.toLowerCase();
            const cat = document.querySelector('.filter-tab.active')?.getAttribute('data-category') || 'all';
            renderMenu(cat);
        });
    }
}

function setupConfirmButton() {
    const btn = document.getElementById('btnConfirmOrder');
    if (btn) {
        btn.addEventListener('click', confirmOrder);
    }
}

function selectTable(table) {
    appState.selectedTable = table;
    document.querySelectorAll('.table-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-table') == table);
    });
    document.getElementById('selectedTableDisplay').textContent = table;
}

function renderMenu(category = 'all') {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    let items = [];
    if (category === 'all') {
        items = Object.values(menuData).flat();
    } else {
        items = menuData[category] || [];
    }
    
    const filtered = appState.searchTerm
        ? items.filter(i => i.name.toLowerCase().includes(appState.searchTerm))
        : items;
    
    container.innerHTML = filtered.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="product-name">${item.name}</div>
            <div class="product-desc">${item.desc}</div>
            <div class="product-footer">
                <span class="product-price">${formatPrice(item.price)}</span>
                <button class="btn-add">+</button>
            </div>
        </div>
    `).join('');
}

function addToCart(itemId) {
    if (!appState.selectedTable) {
        alert('Selecciona mesa');
        return;
    }
    
    if (appState.cart[itemId]) {
        appState.cart[itemId].qty++;
    } else {
        const item = getFullItem(itemId);
        if (item) {
            appState.cart[itemId] = { ...item, qty: 1, instructions: [] };
        }
    }
    updateCart();
}

function updateCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (Object.keys(appState.cart).length === 0) {
        container.innerHTML = '<div class="empty-state">Sin productos</div>';
    } else {
        container.innerHTML = Object.entries(appState.cart).map(([id, item]) => {
            const badgeHtml = item.instructions?.length ? `<div class="instructions-badge">${item.instructions.join(', ')}</div>` : '';
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        ${badgeHtml}
                        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
                    </div>
                    <div class="cart-controls">
                        <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${id}, 1)">+</button>
                        <button class="btn-instructions" onclick="openInstrModal(${id})">📝</button>
                        <button class="btn-remove" onclick="removeItem(${id})">×</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const sub = Object.values(appState.cart).reduce((s, i) => s + (i.price * i.qty), 0);
    const tax = Math.round(sub * 0.13);
    const total = sub + tax;
    
    document.getElementById('cartSubtotal').textContent = formatPrice(sub);
    document.getElementById('cartTax').textContent = formatPrice(tax);
    document.getElementById('cartTotal').textContent = formatPrice(total);
    
    const confirmBtn = document.getElementById('btnConfirmOrder');
    if (confirmBtn) {
        confirmBtn.disabled = Object.keys(appState.cart).length === 0;
    }
}

function changeQty(id, change) {
    const item = appState.cart[id];
    if (!item) return;
    
    item.qty += change;
    if (item.qty <= 0) {
        delete appState.cart[id];
    }
    updateCart();
}

function removeItem(id) {
    delete appState.cart[id];
    updateCart();
}

function confirmOrder() {
    if (!appState.selectedTable || Object.keys(appState.cart).length === 0) return;
    
    const sub = Object.values(appState.cart).reduce((s, i) => s + (i.price * i.qty), 0);
    const order = {
        id: appState.nextOrderId++,
        table: appState.selectedTable,
        items: Object.values(appState.cart),
        subtotal: sub,
        tax: Math.round(sub * 0.13),
        total: sub + Math.round(sub * 0.13),
        status: 'nuevo',
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    };
    
    appState.orders.unshift(order);
    appState.dayHistory.push(order);
    appState.cart = {};
    appState.selectedTable = null;
    
    document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('selectedTableDisplay').textContent = '-';
    
    updateCart();
    playNotification();
    saveState();
    alert('Pedido #' + order.id + ' confirmado');
}

// ==================== CHEF ====================
function updateKitchenDisplay() {
    const countNuevo = appState.orders.filter(o => o.status === 'nuevo').length;
    const countPreparando = appState.orders.filter(o => o.status === 'preparando').length;
    const countListo = appState.orders.filter(o => o.status === 'listo').length;
    
    const elems = {
        nuevo: document.getElementById('countNuevo'),
        preparando: document.getElementById('countPreparando'),
        listo: document.getElementById('countListo')
    };
    
    if (elems.nuevo) elems.nuevo.textContent = countNuevo;
    if (elems.preparando) elems.preparando.textContent = countPreparando;
    if (elems.listo) elems.listo.textContent = countListo;
    
    const container = document.getElementById('kitchenOrders');
    if (!container) return;
    
    if (appState.orders.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #b0b0b0; padding: 40px;">Sin pedidos</div>';
        return;
    }
    
    container.innerHTML = appState.orders.map(order => `
        <div class="order-card ${order.status}">
            <div class="order-header">
                <div class="order-meta">
                    <div class="order-id">Mesa #${order.table} - Pedido #${order.id}</div>
                    <div class="order-time">${order.timestamp}</div>
                </div>
                <div class="order-badge">${order.status.toUpperCase()}</div>
            </div>
            <div class="order-items">
                ${order.items.map(i => {
                    const instr = i.instructions?.length ? `<div style="font-size: 11px; color: #ffb800; margin-top: 4px;">${i.instructions.join(', ')}</div>` : '';
                    return `<div class="order-item"><span>${i.name}</span><span>×${i.qty}</span>${instr}</div>`;
                }).join('')}
            </div>
            <div class="order-actions">
                ${order.status === 'nuevo' ? `<button class="order-btn primary" onclick="setOrderStatus(${order.id}, 'preparando')">En Prep</button>` : ''}
                ${order.status === 'preparando' ? `<button class="order-btn primary" onclick="setOrderStatus(${order.id}, 'listo')">Listo</button>` : ''}
                <button class="order-btn secondary" onclick="deleteOrder(${order.id})">Limpiar</button>
            </div>
        </div>
    `).join('');
}

function setOrderStatus(id, status) {
    const order = appState.orders.find(o => o.id === id);
    if (order) {
        order.status = status;
        playNotification();
        updateKitchenDisplay();
        saveState();
    }
}

function deleteOrder(id) {
    appState.orders = appState.orders.filter(o => o.id !== id);
    updateKitchenDisplay();
    saveState();
}

// ==================== ADMIN ====================
function updateAdminPanel() {
    updateAvailability();
    updateHistoryList();
    updateReportData();
}

function updateAvailability() {
    const container = document.getElementById('availabilityList');
    if (!container) return;
    
    let html = '';
    for (const cat of Object.values(menuData)) {
        for (const item of cat) {
            const avail = appState.availability[item.id] !== false;
            html += `
                <div class="availability-item ${!avail ? 'unavailable' : ''}">
                    <div class="availability-name">${item.name}</div>
                    <button class="toggle-switch ${!avail ? 'off' : ''}" onclick="toggleProduct(${item.id})">${avail ? 'OK' : 'AGOT'}</button>
                </div>
            `;
        }
    }
    container.innerHTML = html;
}

function toggleProduct(id) {
    appState.availability[id] = appState.availability[id] !== false ? false : true;
    updateAvailability();
    saveState();
}

function updateHistoryList() {
    const container = document.getElementById('historialList');
    if (!container) return;
    
    if (appState.dayHistory.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin historial</div>';
        return;
    }
    
    container.innerHTML = appState.dayHistory.map(o => `
        <div class="historial-row">
            <strong>Pedido #${o.id}</strong> - Mesa ${o.table} - ${o.timestamp}
            <br><span style="color: #b0b0b0; font-size: 11px;">${o.items.length} items - ${formatPrice(o.total)}</span>
        </div>
    `).join('');
}

function updateReportData() {
    const total = appState.dayHistory.length;
    const revenue = appState.dayHistory.reduce((s, o) => s + o.total, 0);
    const avg = total > 0 ? revenue / total : 0;
    
    const elems = {
        orders: document.getElementById('totalOrders'),
        revenue: document.getElementById('totalRevenue'),
        avg: document.getElementById('avgTicket'),
        top: document.getElementById('topProduct'),
        list: document.getElementById('topProductsList')
    };
    
    if (elems.orders) elems.orders.textContent = total;
    if (elems.revenue) elems.revenue.textContent = formatPrice(revenue);
    if (elems.avg) elems.avg.textContent = formatPrice(avg);
    
    const products = {};
    appState.dayHistory.forEach(o => {
        o.items.forEach(i => {
            products[i.name] = (products[i.name] || 0) + i.qty;
        });
    });
    
    const top = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length > 0 && elems.top) elems.top.textContent = top[0][0];
    
    if (elems.list) {
        elems.list.innerHTML = '<h3 style="margin-bottom: 12px;">Top 5</h3>' +
            top.map(([name, count]) => `<div class="top-product-row"><span>${name}</span><strong>${count} u.</strong></div>`).join('');
    }
}

// ==================== ADMIN TABS ====================
function setupAdminTabs() {
    const buttons = document.querySelectorAll('.admin-tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });
}

// ==================== INSTRUCCIONES ====================
function setupInstructions() {
    const closeBtn = document.getElementById('closeInstructionsModal');
    const cancelBtn = document.getElementById('cancelInstructions');
    const saveBtn = document.getElementById('saveInstructions');
    
    if (closeBtn) closeBtn.addEventListener('click', closeInstrModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeInstrModal);
    if (saveBtn) saveBtn.addEventListener('click', saveInstructions);
}

let currentItemId = null;

function openInstrModal(id) {
    currentItemId = id;
    const item = appState.cart[id];
    if (!item) return;
    
    document.getElementById('instructionItemName').textContent = item.name;
    const list = document.getElementById('instructionsList');
    
    const instructions = ['Sin cebolla', 'Sin tomate', 'Sin lechuga', 'Sin mayonesa', 'Picante', 'Doble queso'];
    list.innerHTML = instructions.map(instr => `
        <div class="instruction-checkbox">
            <input type="checkbox" id="instr_${instr}" ${item.instructions?.includes(instr) ? 'checked' : ''}>
            <label for="instr_${instr}">${instr}</label>
        </div>
    `).join('');
    
    document.getElementById('instructionsModal').style.display = 'flex';
}

function closeInstrModal() {
    document.getElementById('instructionsModal').style.display = 'none';
    currentItemId = null;
}

function saveInstructions() {
    if (currentItemId === null) {
        closeInstrModal();
        return;
    }
    
    const item = appState.cart[currentItemId];
    if (!item) {
        closeInstrModal();
        return;
    }
    
    const checked = document.querySelectorAll('.instruction-checkbox input:checked');
    item.instructions = Array.from(checked).map(cb => cb.id.replace('instr_', ''));
    
    closeInstrModal();
    updateCart();
}

// ==================== STORAGE ====================
function saveState() {
    localStorage.setItem('abgbState', JSON.stringify({
        orders: appState.orders,
        dayHistory: appState.dayHistory,
        availability: appState.availability,
        nextOrderId: appState.nextOrderId
    }));
}

function loadState() {
    const saved = localStorage.getItem('abgbState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appState.orders = data.orders || [];
            appState.dayHistory = data.dayHistory || [];
            appState.availability = data.availability || {};
            appState.nextOrderId = data.nextOrderId || 2001;
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }
    
    // Inicializar disponibilidad
    for (const cat of Object.values(menuData)) {
        for (const item of cat) {
            if (appState.availability[item.id] === undefined) {
                appState.availability[item.id] = true;
            }
        }
    }
}

// ==================== INICIO ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando aplicación...');
    
    loadState();
    setupLogin();
    setupLogout();
    setupAdminTabs();
    setupInstructions();
    
    console.log('Aplicación lista');
});