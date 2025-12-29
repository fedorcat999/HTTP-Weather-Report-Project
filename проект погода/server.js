const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Дані про погоду
const weatherData = {
    kyiv: {
        city: "Київ",
        temperature: 18,
        feels_like: 16,
        humidity: 75,
        wind_speed: 4.2,
        pressure: 1013,
        description: "Хмарно, можливі невеликі дощі",
        icon: "⛅"
    },
    lviv: {
        city: "Львів",
        temperature: 15,
        feels_like: 13,
        humidity: 80,
        wind_speed: 3.5,
        pressure: 1015,
        description: "Похмуро, мряка",
        icon: "🌫️"
    },
    odesa: {
        city: "Одеса",
        temperature: 22,
        feels_like: 20,
        humidity: 65,
        wind_speed: 5.0,
        pressure: 1012,
        description: "Сонячно, легкий бриз",
        icon: "☀️"
    },
    kharkiv: {
        city: "Харків",
        temperature: 17,
        feels_like: 15,
        humidity: 70,
        wind_speed: 4.8,
        pressure: 1014,
        description: "Змінна хмарність",
        icon: "🌤️"
    },
    dnipro: {
        city: "Дніпро",
        temperature: 19,
        feels_like: 17,
        humidity: 68,
        wind_speed: 4.0,
        pressure: 1013,
        description: "Малохмарно",
        icon: "🌥️"
    }
};

// Функція для обробки статичних файлів
function serveStaticFile(filePath, res) {
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Файл не знайдено
                res.writeHead(404);
                res.end('Файл не знайдено');
            } else {
                // Інша помилка сервера
                res.writeHead(500);
                res.end(`Помилка сервера: ${error.code}`);
            }
        } else {
            // Успішне читання файлу
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
}

// Створюємо HTTP сервер
const server = http.createServer((req, res) => {
    // Дозволяємо CORS для всіх запитів
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Обробка OPTIONS запитів (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`[${new Date().toLocaleTimeString('uk-UA')}] ${req.method} ${req.url}`);
    
    // Роутинг
    const url = req.url;
    
    // Головна сторінка - віддаємо HTML
    if (url === '/' || url === '/index.html') {
        serveStaticFile(path.join(__dirname, 'index.html'), res);
        return;
    }
    
    // API маршрути
    if (url === '/api' || url === '/api/') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            api: "Погодний API Україна v1.0",
            version: "1.0.0",
            endpoints: {
                root: "/",
                weather: "/weather",
                forecast: "/forecast",
                cities: "/cities",
                health: "/health"
            },
            documentation: "Використовуйте GET запити",
            example: "GET /weather/kyiv"
        }, null, 2));
        return;
    }
    
    if (url === '/weather' || url === '/api/weather') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(weatherData.kyiv, null, 2));
        return;
    }
    
    if (url.startsWith('/weather/') || url.startsWith('/api/weather/')) {
        const parts = url.split('/');
        const cityName = parts[parts.length - 1];
        
        if (weatherData[cityName]) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(weatherData[cityName], null, 2));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                error: "Місто не знайдено",
                available_cities: Object.keys(weatherData),
                message: "Доступні міста: kyiv, lviv, odesa, kharkiv, dnipro"
            }, null, 2));
        }
        return;
    }
    
    if (url === '/forecast' || url === '/api/forecast') {
        const forecast = {
            kyiv: [
                { day: "Сьогодні", temp: 18, condition: "Хмарно", icon: "⛅" },
                { day: "Завтра", temp: 20, condition: "Сонячно", icon: "☀️" },
                { day: "Післязавтра", temp: 16, condition: "Дощ", icon: "🌧️" }
            ],
            lviv: [
                { day: "Сьогодні", temp: 15, condition: "Мряка", icon: "🌫️" },
                { day: "Завтра", temp: 17, condition: "Хмарно", icon: "☁️" },
                { day: "Післязавтра", temp: 19, condition: "Сонячно", icon: "☀️" }
            ]
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(forecast, null, 2));
        return;
    }
    
    if (url === '/cities' || url === '/api/cities') {
        const cities = Object.values(weatherData).map(city => ({
            id: city.city.toLowerCase().replace(' ', '_'),
            name: city.city,
            temperature: city.temperature,
            condition: city.description,
            icon: city.icon
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(cities, null, 2));
        return;
    }
    
    if (url === '/health' || url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: "healthy",
            uptime: `${Math.floor(process.uptime())} секунд`,
            timestamp: new Date().toISOString(),
            memory_usage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            node_version: process.version
        }, null, 2));
        return;
    }
    
    if (url === '/current-time' || url === '/api/current-time') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            time: new Date().toLocaleTimeString('uk-UA'),
            date: new Date().toLocaleDateString('uk-UA'),
            timestamp: Date.now(),
            timezone: 'Europe/Kyiv'
        }, null, 2));
        return;
    }
    
    // Спроба обробити як статичний файл (CSS, JS, іконки)
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    
    if (ext === '.css' || ext === '.js' || ext === '.png' || ext === '.jpg' || ext === '.ico') {
        serveStaticFile(filePath, res);
        return;
    }
    
    // Якщо нічого не знайдено - повертаємо HTML (для SPA роутингу)
    if (url.includes('.') === false) {
        serveStaticFile(path.join(__dirname, 'index.html'), res);
        return;
    }
    
    // 404 - не знайдено
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
        error: "Ресурс не знайдено",
        requested_url: url,
        available_endpoints: [
            "/",
            "/weather",
            "/weather/kyiv",
            "/weather/lviv", 
            "/weather/odesa",
            "/weather/kharkiv",
            "/weather/dnipro",
            "/forecast",
            "/cities",
            "/health",
            "/current-time",
            "/api"
        ],
        help: "Відкрийте / для отримання інтерфейсу"
    }, null, 2));
});

// Запускаємо сервер
server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 СЕРВЕР ПОГОДНОГО МОНІТОРИНГУ ЗАПУЩЕНО');
    console.log('='.repeat(60));
    console.log(`📡 Порт: ${PORT}`);
    console.log(`🌐 Головна сторінка: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log('='.repeat(60));
    console.log('📋 ДОСТУПНІ МАРШРУТИ:');
    console.log(`   http://localhost:${PORT}/              - Український візуал`);
    console.log(`   http://localhost:${PORT}/weather       - Погода у Києві`);
    console.log(`   http://localhost:${PORT}/weather/kyiv  - Погода у Києві`);
    console.log(`   http://localhost:${PORT}/weather/lviv  - Погода у Львові`);
    console.log(`   http://localhost:${PORT}/weather/odesa - Погода в Одесі`);
    console.log(`   http://localhost:${PORT}/forecast      - Прогноз погоди`);
    console.log(`   http://localhost:${PORT}/cities        - Список міст`);
    console.log(`   http://localhost:${PORT}/health        - Статус сервера`);
    console.log('='.repeat(60));
    console.log('💡 Для зупинки сервера натисніть Ctrl + C');
    console.log('='.repeat(60));
});

// Обробка помилок сервера
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ ПОМИЛКА: Порт ${PORT} вже використовується!`);
        console.log(`💡 Спробуйте:`);
        console.log(`   1. Змінити порт у коді (const PORT = 3002)`);
        console.log(`   2. Завершити процес: npx kill-port ${PORT}`);
        console.log(`   3. Зачекати 60 секунд і спробувати знову`);
    } else {
        console.error(`❌ Помилка сервера: ${error.message}`);
    }
    process.exit(1);
});

// Обробка завершення роботи (Ctrl + C)
process.on('SIGINT', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🛑 Сервер зупинено користувачем');
    console.log('='.repeat(60));
    process.exit(0);
});