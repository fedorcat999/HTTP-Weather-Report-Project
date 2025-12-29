const http = require('http');

const PORT = process.env.PORT || 3001;

// Данні для погоди (можете змінити)
const weatherData = {
    kyiv: {
        city: "Киев",
        temperature: 18,
        feels_like: 16,
        humidity: 75,
        wind_speed: 4.2,
        pressure: 1013,
        description: "Хмарно",
        icon: "⛅",
        forecast: [
            { day: "Сьогодні", temp: 18, condition: "Хмарно", icon: "⛅" },
            { day: "Завтра", temp: 20, condition: "Сонячно", icon: "☀️" },
            { day: "Середа", temp: 16, condition: "Дождь", icon: "🌧️" }
        ]
    },
    lviv: {
        city: "Львів",
        temperature: 15,
        feels_like: 13,
        humidity: 80,
        wind_speed: 3.5,
        pressure: 1015,
        description: "Невеликий дощ",
        icon: "🌦️",
        forecast: [
            { day: "Сьогодні", temp: 15, condition: "Невеликий дощ", icon: "🌦️" },
            { day: "Завтра", temp: 17, condition: "Хмарно", icon: "☁️" },
            { day: "Середа", temp: 19, condition: "Сонячно", icon: "☀️" }
        ]
    },
    odessa: {
        city: "Одесса",
        temperature: 22,
        feels_like: 20,
        humidity: 65,
        wind_speed: 5.0,
        pressure: 1012,
        description: "Солнечно",
        icon: "☀️",
        forecast: [
            { day: "Сьогодні", temp: 22, condition: "Сонячно", icon: "☀️" },
            { day: "Завтра", temp: 23, condition: "Сонячно", icon: "☀️" },
            { day: "Середа", temp: 21, condition: "Хмарно", icon: "⛅" }
        ]
    }
};


const server = http.createServer((req, res) => {
    // Дозволяєм CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Обробка OPTIONS запитів
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // Маршрутизація
    if (req.url === '/' || req.url === '/api') {
        res.writeHead(200);
        res.end(JSON.stringify({
            api: "Погодний API v1.0",
            endpoints: {
                root: "/",
                all_cities: "/weather",
                kyiv: "/weather/kyiv",
                lviv: "/weather/lviv",
                odessa: "/weather/odessa",
                forecast: "/forecast",
                health: "/health",
                time:"/current-time"
            },
            instructions: "використовуйте GET запити для получення данних про погоду"
        }, null, 2));

    } else if (req.url === '/weather') {
        res.writeHead(200);
        res.end(JSON.stringify({
            cities: Object.values(weatherData).map(city => ({
                name: city.city,
                temp: city.temperature,
                humidity:city.humidity
                windSpeed: city.wind_speed,
                condition: city.description,
                icon: city.icon
            }))
        }, null, 2));

    } else if (req.url === '/weather/kyiv' || req.url === '/weather?city=kyiv') {
        res.writeHead(200);
        res.end(JSON.stringify(weatherData.kyiv, null, 2));

    } else if (req.url === '/weather/lviv' || req.url === '/weather?city=lviv') {
        res.writeHead(200);
        res.end(JSON.stringify(weatherData.lviv, null, 2));

    } else if (req.url === '/weather/odessa' || req.url === '/weather?city=odessa') {
        res.writeHead(200);
        res.end(JSON.stringify(weatherData.odessa, null, 2));

    } else if (req.url === '/forecast') {
        res.writeHead(200);
        res.end(JSON.stringify({
            kyiv: weatherData.kyiv.forecast,
            lviv: weatherData.lviv.forecast,
            odessa: weatherData.odessa.forecast
        }, null, 2));

    } else if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: "OK",
            uptime: `${Math.floor(process.uptime())} секунд`,
            timestamp: new Date().toISOString(),
            memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        }, null, 2));

    } else if (req.url === '/current-time') {
        res.writeHead(200);
        res.end(JSON.stringify({
            time: new Date().toLocaleTimeString('ua-UA'),
            date: new Date().toLocaleDateString('ua-Ua'),
            timestamp: Date.now()
        }, null, 2));

    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            error: "Маршрут не знайден",
            requested: req.url,
            available: ["/", "/weather", "/weather/kyiv", "/weather/lviv", "/weather/odessa", "/forecast", "/health", "/current-time"]
        }, null, 2));
    }
});

// Запуск сервера
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🌤️  ПОГОДНИЙ СЕРВЕР API ЗАПУЩЕН');
    console.log('='.repeat(50));
    console.log(`📡  Порт: ${PORT}`);
    console.log(`🚀  URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('📋  ДОСТУПНІ МАРШРУТИ: ');
    console.log(`   http://localhost:${PORT}/            - Информация API`);
    console.log(`   http://localhost:${PORT}/weather      - Всі міста`);
    console.log(`   http://localhost:${PORT}/weather/kyiv - Погода у Києві`);
    console.log(`   http://localhost:${PORT}/weather/lviv - Погода у Львові`);
    console.log(`   http://localhost:${PORT}/weather/odessa - Погода в Одессі`);
    console.log(`   http://localhost:${PORT}/forecast     - Прогноз по городам`);
    console.log(`   http://localhost:${PORT}/health       - Статус сервера`);
    console.log(`   http://localhost:${PORT}/current-time - Поточний час`);
    console.log('='.repeat(50));
    console.log('💡  Для тестування відкрийту любой URL у браузері');
    console.log('⏸️  Для зупинки нажмите Ctrl + C');
    console.log('='.repeat(50));
});

// Обробка помилок
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Порт ${PORT} занятий! Зпробуйте:`);
        console.log(`   PORT=3002 node server.js`);
        console.log(`   або змініть PORT у коді`);
    } else {
        console.error('Помилка сервера:', error.message);
    }
});

// Обробка Ctrl+C
process.on('SIGINT', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🛑 Сервер зупинен');
    console.log('='.repeat(50));
    process.exit(0);
});