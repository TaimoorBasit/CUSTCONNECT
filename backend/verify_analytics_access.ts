
import http from 'http';

function makeRequest(path: string, method: string = 'GET', body: any = null, token: string | null = null) {
    return new Promise((resolve, reject) => {
        const options: any = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function verifyAnalytics() {
    console.log('🔍 Verifying Analytics Access...');

    // 1. Login
    try {
        console.log('🔑 Logging in as Printer Shop Owner...');
        const loginRes: any = await makeRequest('/api/auth/login', 'POST', {
            email: 'bookshop@custconnect.com',
            password: 'Printer123!'
        });

        if (loginRes.statusCode !== 200) {
            console.error('❌ Login failed:', loginRes.data);
            process.exit(1);
        }

        const token = loginRes.data.data.token;
        console.log('✅ Login successful. Token obtained.');

        // 2. Access Analytics
        console.log('📊 Fetching Analytics...');
        const analyticsRes: any = await makeRequest('/api/vendor/analytics', 'GET', null, token);

        if (analyticsRes.statusCode === 200) {
            console.log('✅ Analytics Access Successful! (200 OK)');
            const data = analyticsRes.data.analytics;
            console.log('   Data fields present:', Object.keys(data).join(', '));

            if (typeof data.averageOrderValue === 'number') {
                console.log(`✅ averageOrderValue is present: ${data.averageOrderValue}`);
            } else {
                console.error('❌ averageOrderValue is MISSING or invalid!');
                process.exit(1);
            }
        } else {
            console.error(`❌ Analytics Access Failed: ${analyticsRes.statusCode}`);
            console.error('   Error:', analyticsRes.data);
        }

    } catch (e: any) {
        console.error('❌ Verification failed:', e.message);
    }
}

verifyAnalytics();
