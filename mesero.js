// ==================== ESTADO GLOBAL ====================
let state = {
    selectedTable: null,
    cart: {},
    currentEditingItem: null,
};

// ==================== DATOS DE MENÚ ====================
const MENU = {
    burgers: [
        { id: 1, name: 'Special AB', desc: 'Cheddar, bacon, mozzarella', price: 6500 },
        { id: 2, name: 'Xlibra Beef', desc: 'American cheese, pink sauce', price: 5000 },
        { id: 3, name: 'A-50/50', desc: 'Beef and pork, Provolone', price: 6000 },
        { id: 4, name: 'B-Bacon', desc: 'American cheese, pink sauce', price: 6000 },
        { id: 5, name: 'C-Cheese', desc: 'Cheddar, mozzarella', price: 6000 },
        { id: 6, name: 'D-Hot', desc: 'PeperJack, chili, habanero', price: 6000 },
        { id: 7, name: 'Texas', desc: 'Bacon, cheddar, BBQ', price: 6500 },
        { id: 8, name: 'B-Bacon Beef', desc: 'Cheddar, bacon', price: 5500 },
        { id: 9, name: 'Italian', desc: 'Mozzarella, pomodoro, basil', price: 6500 },
        { id: 10, name: 'Hawaiian', desc: 'Beef, mozzarella, pineapple', price: 6500 },
    ],
    chicken: [
        { id: 11, name: 'Classic Chicken', desc: 'Chicken breast, lettuce', price: 5500 },
        { id: 12, name: 'Classic Chicken II', desc: 'Brisket, Cheddar, Dressing', price: 6000 },
        { id: 13, name: 'Italian Chicken', desc: 'Breaded chicken, basil', price: 7000 },
        { id: 14, name: 'Chicken Texan', desc: 'Breaded chicken, BBQ', price: 7000 },
        { id: 15, name: 'Buffalo', desc: 'Breaded brisket, bacon', price: 6500 },
    ],
    combos: [
        { id: 101, name: 'Italian Smashed', desc: 'Beef, mozzarella', price: 7000 },
        { id: 102, name: 'Crispy Mushroom', desc: 'Beef, portobello', price: 7000 },
        { id: 103, name: 'Hawaiian Smashed', desc: 'Beef, pineapple', price: 7000 },
        { id: 104, name: 'Smoked Pork', desc: 'Short rib, BBQ sauce', price: 8000 },
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
        { id: 302, name: 'Gaseosa Lata', desc: 'Canned soda', price: 1500 },
        { id: 303, name: 'Té Frío', desc: 'Iced tea', price: 1500 },
        { id: 304, name: 'Smoothie', desc: 'Fresh smoothie', price: 2000 },
        { id: 305, name: 'Natural', desc: 'Fresh juice', price: 1000 },
        { id: 306, name: 'Botella de Agua', desc: 'Water bottle', price: 1000 },
    ]
};

// ==================== UTILIDADES ====================
function formatPrice(amount) {
    return '₡' + Math.round(amount).toLocaleString('es-CR', { minimumFractionDigits: 0 });
}

function getProductById(id) {
    for (const category of Object.values(MENU)) {
        const product = category.find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = time;
}

function loadState() {
    const saved = localStorage.getItem('abgb_mesero_state');
    if (saved) {
        const data = JSON.parse(saved);
        state.cart = data.cart || {};
        state.selectedTable = data.selectedTable || null;
    }
}

function saveState() {
    localStorage.setItem('abgb_mesero_state', JSON.stringify({
        cart: state.cart,
        selectedTable: state.selectedTable
    }));
    // Notificar a chef y admin
    broadcastUpdate('MESERO_STATE_CHANGED');
}

function broadcastUpdate(eventType) {
    const event = new CustomEvent('storageChange', { 
        detail: { type: eventType, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
}

// ==================== PRODUCTOS ==================== 
function getAvailableProducts() {
    const availability = JSON.parse(localStorage.getItem('abgb_availability') || '{}');
    return availability;
}

function renderProducts(category = 'all') {
    const availability = getAvailableProducts();
    let products = [];

    if (category === 'all') {
        products = Object.values(MENU).flat();
    } else {
        products = MENU[category] || [];
    }

    // Filtrar por búsqueda
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (search) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.desc.toLowerCase().includes(search)
        );
    }

    const productsList = document.getElementById('productsList');
    productsList.innerHTML = products.map(product => {
        const isUnavailable = availability[product.id] === false;
        const unavailableClass = isUnavailable ? 'unavailable' : '';

        return `
            <div class="product-card ${unavailableClass}" ${!isUnavailable ? `onclick="addToCart(${product.id})"` : ''}>
                ${isUnavailable ? '<div class="product-unavailable-label">Agotado</div>' : ''}
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${!isUnavailable ? '<button class="btn-add">+</button>' : '<button class="btn-add" disabled>×</button>'}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== CARRITO ====================
function addToCart(productId) {
    if (!state.selectedTable) {
        alert('Selecciona una mesa primero');
        return;
    }

    const product = getProductById(productId);
    if (!product) return;

    const availability = getAvailableProducts();
    if (availability[productId] === false) {
        alert('Producto agotado');
        return;
    }

    if (state.cart[productId]) {
        state.cart[productId].qty++;
    } else {
        state.cart[productId] = {
            ...product,
            qty: 1,
            special: []
        };
    }

    updateOrderUI();
    saveState();
}

function changeQty(productId, change) {
    if (!state.cart[productId]) return;

    state.cart[productId].qty += change;

    if (state.cart[productId].qty <= 0) {
        delete state.cart[productId];
    }

    updateOrderUI();
    saveState();
}

function removeItem(productId) {
    delete state.cart[productId];
    updateOrderUI();
    saveState();
}

function openSpecialInstructions(productId) {
    state.currentEditingItem = productId;
    const product = state.cart[productId];
    
    document.getElementById('modalProductName').textContent = product.name;
    
    // Cargar instrucciones guardadas
    const checks = document.querySelectorAll('.instruction-check');
    checks.forEach(check => {
        check.checked = product.special.includes(check.value);
    });
    
    document.getElementById('customInstructions').value = product.customNotes || '';
    document.getElementById('modalInstrucciones').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalInstrucciones').style.display = 'none';
    state.currentEditingItem = null;
}

function saveSpecialInstructions() {
    if (state.currentEditingItem === null) return;

    const item = state.cart[state.currentEditingItem];
    const checks = document.querySelectorAll('.instruction-check:checked');
    const special = Array.from(checks).map(c => c.value);
    const notes = document.getElementById('customInstructions').value;

    item.special = special;
    item.customNotes = notes;

    closeModal();
    updateOrderUI();
    saveState();
}

function updateOrderUI() {
    // Actualizar contador de mesa
    const tableBadge = document.getElementById('tableBadge');
    tableBadge.textContent = state.selectedTable || '-';

    // Actualizar items
    const orderItems = document.getElementById('orderItems');
    const items = Object.entries(state.cart);

    if (items.length === 0) {
        orderItems.innerHTML = '<div class="empty-message">Selecciona productos</div>';
    } else {
        orderItems.innerHTML = items.map(([productId, item]) => {
            const specialText = item.special.length > 0 
                ? `<div class="item-special">Especial: ${item.special.join(', ')}</div>`
                : '';

            return `
                <div class="order-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${formatPrice(item.price * item.qty)}</div>
                        ${specialText}
                    </div>
                    <div class="item-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="changeQty(${productId}, -1)">−</button>
                            <span class="qty-display">${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${productId}, 1)">+</button>
                        </div>
                        <button class="btn-notes" onclick="openSpecialInstructions(${productId})" title="Instrucciones especiales">≡</button>
                        <button class="btn-remove" onclick="removeItem(${productId})">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Actualizar resumen
    let subtotal = 0;
    Object.values(state.cart).forEach(item => {
        subtotal += item.price * item.qty;
    });

    const tax = Math.round(subtotal * 0.13);
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);

    // Habilitar/deshabilitar botón confirmar
    const btnConfirm = document.getElementById('btnConfirm');
    btnConfirm.disabled = Object.keys(state.cart).length === 0 || !state.selectedTable;
}

// ==================== MESAS ====================
function selectTable(tableNum) {
    state.selectedTable = tableNum;
    
    document.querySelectorAll('.table-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.table) === tableNum);
    });

    updateOrderUI();
    saveState();
}

// ==================== CONFIRMAR ORDEN ====================
function confirmOrder() {
    if (!state.selectedTable || Object.keys(state.cart).length === 0) return;

    let subtotal = 0;
    const items = [];

    Object.entries(state.cart).forEach(([productId, item]) => {
        subtotal += item.price * item.qty;
        items.push({
            id: item.id,
            name: item.name,
            qty: item.qty,
            price: item.price,
            special: item.special || [],
            customNotes: item.customNotes || ''
        });
    });

    const order = {
        id: Date.now(),
        table: state.selectedTable,
        items: items,
        subtotal: subtotal,
        tax: Math.round(subtotal * 0.13),
        total: subtotal + Math.round(subtotal * 0.13),
        status: 'nuevo',
        createdAt: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Guardar orden
    const orders = JSON.parse(localStorage.getItem('abgb_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('abgb_orders', JSON.stringify(orders));

    // Guardar historial
    const history = JSON.parse(localStorage.getItem('abgb_history') || '[]');
    history.push(order);
    localStorage.setItem('abgb_history', JSON.stringify(history));

    // Limpiar carrito
    state.cart = {};
    state.selectedTable = null;
    
    updateOrderUI();
    document.querySelectorAll('.table-btn').forEach(btn => btn.classList.remove('active'));
    
    saveState();
    broadcastUpdate('NEW_ORDER');

    alert('Orden #' + order.id + ' confirmada');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderProducts('all');
    updateTime();
    setInterval(updateTime, 60000);

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.category);
        });
    });

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active');
        renderProducts(activeFilter?.dataset.category || 'all');
    });

    // Mesas
    document.querySelectorAll('.table-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectTable(parseInt(btn.dataset.table));
        });
    });

    // Botón confirmar
    document.getElementById('btnConfirm').addEventListener('click', confirmOrder);

    // Modal instrucciones
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('btnCancelModal').addEventListener('click', closeModal);
    document.getElementById('btnSaveInstructions').addEventListener('click', saveSpecialInstructions);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    // Cerrar sesión
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('abgb_mesero_state');
            location.reload();
        }
    });

    // Sincronización: detectar cambios desde admin
    window.addEventListener('storage', () => {
        renderProducts(document.querySelector('.filter-btn.active')?.dataset.category || 'all');
    });

    // Restaurar tabla seleccionada si existe
    if (state.selectedTable) {
        const btn = document.querySelector(`[data-table="${state.selectedTable}"]`);
        if (btn) btn.click();
    }
});