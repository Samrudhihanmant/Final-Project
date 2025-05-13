const appSection = document.getElementById('app-section');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Sales Variables
let currentSaleItems = [];
let products = [];

// Initialize Chart
const salesChartCtx = document.getElementById('sales-chart').getContext('2d');
let salesChart;

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        loadProducts();
        loadSales();
        loadAnalytics();
    } else {
        // User is signed out
        loginSection.classList.remove('hidden');
        appSection.classList.add('hidden');
    }
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// Load Products
function loadProducts() {
    const userId = auth.currentUser.uid;
    
    db.collection('products')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
            products = [];
            const productSelect = document.getElementById('product-select');
            
            // Clear existing options except the first one
            while (productSelect.options.length > 1) {
                productSelect.remove(1);
            }
            
            snapshot.forEach(doc => {
                const product = doc.data();
                product.id = doc.id;
                products.push(product);
                
                // Add to dropdown
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - $${product.price.toFixed(2)} (${product.stock} available)`;
                productSelect.appendChild(option);
            });
        });
}

// Add Product to Sale
document.getElementById('add-product-btn').addEventListener('click', () => {
    const productId = document.getElementById('product-select').value;
    const quantity = parseInt(document.getElementById('product-qty').value);
    
    if (!productId || isNaN(quantity)) {
        alert('Please select a product and enter a valid quantity');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (quantity > product.stock) {
        alert('Not enough stock available');
        return;
    }
// Add to current sale
    currentSaleItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
    });
    
    updateSaleItemsTable();
});

// Update Sale Items Table
function updateSaleItemsTable() {
    const tableBody = document.getElementById('sale-items-body');
    tableBody.innerHTML = '';
    
    let total = 0;
    
    currentSaleItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="remove-item-btn" data-index="${index}">Remove</button></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update total
    document.getElementById('sale-total').textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            currentSaleItems.splice(index, 1);
            updateSaleItemsTable();
        });
    });
}

// Complete Sale
document.getElementById('complete-sale-btn').addEventListener('click', () => {
    if (currentSaleItems.length === 0) {
        alert('Please add items to the sale');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value || 'Walk-in';
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = currentSaleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const userId = auth.currentUser.uid;
    
    // Create sale record
    db.collection('sales').add({
        customerName,
        items: currentSaleItems,
        total,
        paymentMethod,
        date: new Date(),
        userId
    }).then(() => {
        // Update product stock
        const batch = db.batch();
        
        currentSaleItems.forEach(item => {
            const productRef = db.collection('products').doc(item.productId);
            batch.update(productRef, {
                stock: firebase.firestore.FieldValue.increment(-item.quantity)
            });
        });
        
        return batch.commit();
    }).then(() => {
        alert('Sale completed successfully!');
        currentSaleItems = [];
        updateSaleItemsTable();
        document.getElementById('customer-name').value = '';
    }).catch(error => {
        alert('Error completing sale: ' + error.message);
    });
});

// Load Sales History
function loadSales() {
    const userId = auth.currentUser.uid;
    const salesTableBody = document.getElementById('sales-table-body');
    
    db.collection('sales')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .onSnapshot(snapshot => {
            salesTableBody.innerHTML = '';
            
            snapshot.forEach(doc => {
                const sale = doc.data();
                const date = sale.date.toDate();
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${date.toLocaleDateString()}</td>
                    <td>${sale.customerName}</td>
                    <td>
                        <ul>
                            ${sale.items.map(item => 
                                `<li>${item.quantity}x ${item.name} ($${item.price.toFixed(2)})</li>`
                            ).join('')}
                        </ul>
                    </td>
                    <td>$${sale.total.toFixed(2)}</td>
                    <td>${sale.paymentMethod.toUpperCase()}</td>
                `;
                
                salesTableBody.appendChild(row);
            });
        });
}

// Load Analytics
function loadAnalytics() {
    const userId = auth.currentUser.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's sales
    db.collection('sales')
        .where('userId', '==', userId)
        .where('date', '>=', today)
        .get()
        .then(snapshot => {
            const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);
            document.getElementById('today-sales').textContent = `$${total.toFixed(2)}`;
        });
    
    // Monthly sales
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    db.collection('sales')
        .where('userId', '==', userId)
        .where('date', '>=', firstDayOfMonth)
        .get()
        .then(snapshot => {
            const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);
            document.getElementById('monthly-sales').textContent = `$${total.toFixed(2)}`;
        });
    
    // Sales chart data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    db.collection('sales')
        .where('userId', '==', userId)
        .where('date', '>=', sevenDaysAgo)
        .get()
        .then(snapshot => {
            const salesByDay = {};
            
            // Initialize with 0 for each of the last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                salesByDay[date.toDateString()] = 0;
            }
            
            // Add actual sales
            snapshot.forEach(doc => {
                const sale = doc.data();
                const date = sale.date.toDate();
                date.setHours(0, 0, 0, 0);
                salesByDay[date.toDateString()] = (salesByDay[date.toDateString()] || 0) + sale.total;
            });
            
            // Prepare chart data
            const labels = Object.keys(salesByDay).map(date => 
                new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
            );
            const data = Object.values(salesByDay);
            
            // Create or update chart
            if (salesChart) {
                salesChart.data.labels = labels;
                salesChart.data.datasets[0].data = data;
                salesChart.update();
            } else {
                salesChart = new Chart(salesChartCtx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Daily Sales',
                            data: data,
                            backgroundColor: 'rgba(63, 81, 181, 0.2)',
                            borderColor: 'rgba(63, 81, 181, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        });
}