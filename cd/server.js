const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/') {
        res.end(JSON.stringify({
            message: '🌤️ Погодний HTTP API Працює!',
            endpoints: ['/weather', '/forecast', '/health'],
            instructions: 'використовуйте браузер для тестування endpoints'
        }));
    } else if (req.url === '/weather') {
        res.end(JSON.stringify({
            city: 'Киев',
            temperature: 18,
            feels_like: 18,
            humidity: 75,
            description: 'Хмарно',
            timestamp: new Date().toISOString()
        }));
    } else if (req.url === '/forecast') {
        res.end(JSON.stringify([
            { day: 'Сонячно', temp: 20, weather: 'Хмарно' },
            { day: 'Завтра', temp: 18, weather: 'Облачно' },
            { day: 'Після завтра', temp: 15, weather: 'Невеликий дощ' }
        ]));
    } else if (req.url === '/health') {
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'API працює нормально' 
        }));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint не знайден' }));
    }
});

server.listen(3000, () => {
    console.log('='.repeat(50));
    console.log('🌤️  Погодний HTTP API запущен!');
    console.log('📡  Порт: 3000');
    console.log('🚀  URL: http://localhost:3000');
    console.log('='.repeat(50));
    console.log('Доступні endpoints:');
    console.log('  /          - інформація об API');
    console.log('  /weather   - поточна погода');
    console.log('  /forecast  - прогноз на 3 дні');
    console.log('  /health    - перевірка роботи');
    console.log('  /current-time    - перевірка роботи');
});