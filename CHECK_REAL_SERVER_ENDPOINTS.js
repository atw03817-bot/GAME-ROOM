// 🔍 سكريبت فحص مسارات السيرفر الحقيقي
// انسخ هذا الكود وشغله في كونسول المتصفح (F12)

console.log('🚀 بدء فحص مسارات السيرفر...');

// قائمة المسارات للاختبار
const endpoints = [
    '/api/health',
    '/api/orders',
    '/api/orders/all', 
    '/api/orders/admin/all',
    '/api/users',
    '/api/products',
    '/api/real-analytics/dashboard'
];

// دالة اختبار مسار واحد
async function testEndpoint(endpoint) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log(`🔗 اختبار: ${endpoint}`);
        
        const response = await fetch(endpoint, { headers });
        const contentType = response.headers.get('content-type');
        
        if (response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`✅ ${endpoint} - نجح (JSON):`, data);
                return { endpoint, success: true, type: 'json', data };
            } else {
                const text = await response.text();
                console.log(`⚠️ ${endpoint} - نجح (HTML):`, text.substring(0, 100));
                return { endpoint, success: true, type: 'html', data: text };
            }
        } else {
            console.log(`❌ ${endpoint} - فشل: ${response.status} ${response.statusText}`);
            return { endpoint, success: false, status: response.status, error: response.statusText };
        }
    } catch (error) {
        console.log(`💥 ${endpoint} - خطأ: ${error.message}`);
        return { endpoint, success: false, error: error.message };
    }
}

// اختبار جميع المسارات
async function checkAllEndpoints() {
    console.log('📋 بدء اختبار جميع المسارات...');
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // انتظار قصير بين الطلبات
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('📊 ملخص النتائج:');
    console.table(results);
    
    // البحث عن مسارات الطلبات الشغالة
    const workingOrderEndpoints = results.filter(r => 
        r.success && 
        r.type === 'json' && 
        r.endpoint.includes('order')
    );
    
    if (workingOrderEndpoints.length > 0) {
        console.log('🎯 مسارات الطلبات الشغالة:');
        workingOrderEndpoints.forEach(endpoint => {
            console.log(`✅ ${endpoint.endpoint}`);
            console.log('📦 نموذج البيانات:', endpoint.data);
        });
        
        // تجربة حساب الإحصائيات
        const firstWorkingEndpoint = workingOrderEndpoints[0];
        console.log('🧮 محاولة حساب الإحصائيات من:', firstWorkingEndpoint.endpoint);
        calculateStats(firstWorkingEndpoint.data);
    } else {
        console.log('❌ لا توجد مسارات طلبات شغالة');
    }
    
    return results;
}

// دالة حساب الإحصائيات
function calculateStats(ordersData) {
    console.log('🧮 حساب الإحصائيات من البيانات:', ordersData);
    
    let orders = [];
    if (Array.isArray(ordersData)) {
        orders = ordersData;
    } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
        orders = ordersData.orders;
    } else if (ordersData.data && Array.isArray(ordersData.data)) {
        orders = ordersData.data;
    }
    
    console.log(`📊 عدد الطلبات: ${orders.length}`);
    
    if (orders.length > 0) {
        console.log('📋 نموذج طلب:', orders[0]);
        
        const paidOrders = orders.filter(order => 
            order.paymentStatus === 'paid' || 
            order.paymentStatus === 'approved'
        );
        
        const totalRevenue = paidOrders.reduce((sum, order) => 
            sum + (parseFloat(order.total) || 0), 0
        );
        
        console.log('💰 الإحصائيات:');
        console.log(`- إجمالي الطلبات: ${orders.length}`);
        console.log(`- الطلبات المدفوعة: ${paidOrders.length}`);
        console.log(`- إجمالي الإيرادات: ${totalRevenue} ر.س`);
        
        return {
            totalOrders: orders.length,
            paidOrders: paidOrders.length,
            totalRevenue: totalRevenue
        };
    } else {
        console.log('⚠️ لا توجد طلبات في البيانات');
        return null;
    }
}

// تشغيل الفحص
checkAllEndpoints().then(results => {
    console.log('✅ انتهى الفحص. النتائج متاحة في المتغير results');
    window.serverCheckResults = results;
});

console.log('📝 تعليمات:');
console.log('1. انتظر انتهاء الفحص');
console.log('2. شوف النتائج في الكونسول');
console.log('3. انسخ النتائج وأرسلها لي');