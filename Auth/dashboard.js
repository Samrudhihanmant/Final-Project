document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    const trafficCtx = document.getElementById('traffic-chart').getContext('2d');
    
    let salesChart, trafficChart;
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            document.querySelector('.user-avatar').textContent = 
                user.displayName ? user.displayName.charAt(0) : 'U';
            loadDashboardData();
        } else {
            // No user is signed in
            window.location.href = 'login.html'; // Redirect to login page
        }
    });
    
    // Load dashboard data from Firebase
    function loadDashboardData() {
        // Load total revenue
        database.ref('orders').once('value').then(snapshot => {
            let totalRevenue = 0;
            let pendingOrders = 0;
            
            snapshot.forEach(order => {
                const orderData = order.val();
                totalRevenue += orderData.total || 0;
                if (orderData.status === 'pending') {
                    pendingOrders++;
                }
            });
            
            document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
            document.getElementById('pending-orders').textContent = pendingOrders;
            
            // Initialize sales chart with order data
            initSalesChart(snapshot);
        });
        
        // Load total users
        database.ref('users').once('value').then(snapshot => {
            const userCount = snapshot.numChildren();
            document.getElementById('total-users').textContent = userCount;
        });
        
        // Load total products
        database.ref('products').once('value').then(snapshot => {
            const productCount = snapshot.numChildren();
            document.getElementById('total-products').textContent = productCount;
        });
        
        // Load recent activities
        database.ref('activities').orderByChild('timestamp').limitToLast(5).once('value').then(snapshot => {
            const activityList = document.getElementById('activity-list');
            activityList.innerHTML = '';
            
            // Convert to array and reverse to show latest first
            const activities = [];
            snapshot.forEach(activity => {
                activities.push(activity.val());
            });
            
            activities.reverse().forEach(activity => {
                const activityItem = document.createElement('li');
                activityItem.className = 'activity-item';
                
                let icon = '';
                let iconBg = 'e8f0fe';
                let iconColor = '4285f4';
                
                switch(activity.type) {
                    case 'login':
                        icon = 'login';
                        break;
                    case 'order':
                        icon = 'shopping_cart';
                        iconBg = 'e6f4ea';
                        iconColor = '34a853';
                        break;
                    case 'user':
                        icon = 'person_add';
                        iconBg = 'f3e8fd';
                        iconColor = '9c27b0';
                        break;
                    default:
                        icon = 'notifications';
                }
                
                activityItem.innerHTML = `
                    <div class="activity-icon" style="background-color: #${iconBg}; color: #${iconColor}">
                        <i class="material-icons">${icon}</i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.message}</h4>
                        <p>User ID: ${activity.userId}</p>
                    </div>
                    <div class="activity-time">${formatTime(activity.timestamp)}</div>
                `;
                
                activityList.appendChild(activityItem);
            });
        });
    }
    
    // Initialize sales chart
    function initSalesChart(ordersSnapshot) {
        // Group orders by date (simplified example)
        const salesData = {};
        const period = document.getElementById('sales-period').value;
        
        ordersSnapshot.forEach(order => {
            const orderData = order.val();
            const orderDate = new Date(orderData.date || orderData.timestamp);
            let key;
            
            if (period === 'week') {
                key = `Day ${orderDate.getDay()}`;
            } else if (period === 'month') {
                key = `Week ${Math.ceil(orderDate.getDate() / 7)}`;
            } else {
                key = orderDate.toLocaleString('default', { month: 'short' });
            }
            
            salesData[key] = (salesData[key] || 0) + orderData.total;
        });
        
        const labels = Object.keys(salesData);
        const data = Object.values(salesData);
        
        if (salesChart) {
            salesChart.destroy();
        }
        
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales',
                    data: data,
                    backgroundColor: 'rgba(66, 133, 244, 0.2)',
                    borderColor: 'rgba(66, 133, 244, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Initialize traffic chart
    function initTrafficChart() {
        // Simplified traffic sources data
        const trafficData = {
            labels: ['Direct', 'Social', 'Email', 'Referral', 'Organic'],
            datasets: [{
                data: [35, 20, 15, 15, 15],
                backgroundColor: [
                    '#4285f4',
                    '#ea4335',
                    '#fbbc05',
                    '#34a853',
                    '#9c27b0'
                ]
            }]
        };
        
        trafficChart = new Chart(trafficCtx, {
            type: 'doughnut',
            data: trafficData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Format timestamp
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    // Event listeners
    document.getElementById('sales-period').addEventListener('change', () => {
        database.ref('orders').once('value').then(snapshot => {
            initSalesChart(snapshot);
        });
    });
    
    // Initialize traffic chart
    initTrafficChart();
});
