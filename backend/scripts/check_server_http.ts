/// <reference types="node" />
import * as http from 'http';

function makeRequest(path: string, method: string = 'GET', body: any = null) {
    return new Promise((resolve, reject) => {
        const headers: http.OutgoingHttpHeaders = {
            'Content-Type': 'application/json',
        };

        if (body) {
            headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
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

async function main() {
    console.log('🔍 Checking Backend Health (HTTP)...');

    // 1. Check Ping
    try {
        const pingRes: any = await makeRequest('/api/ping');
        console.log(`✅ Ping Status: ${pingRes.statusCode}`);
        console.log('   Response:', pingRes.data);
    } catch (e: any) {
        console.error('❌ Ping failed:', e.message);
        if (e.code === 'ECONNREFUSED') {
            console.error('   FATAL: Connection refused. Server is NOT running or listening on port 5000.');
            process.exit(1);
        }
    }

    // 2. Check Login
    console.log('\n🔍 Attempting Login simulation...');
    try {
        const loginRes: any = await makeRequest('/api/auth/login', 'POST', {
            email: 'admin@custconnect.com',
            password: 'admin123'
        });
        console.log(`✅ Login Status: ${loginRes.statusCode}`);
        if (loginRes.statusCode === 200 || loginRes.statusCode === 201) {
            console.log('   Login Successful!');
            console.log('   User:', loginRes.data.data?.user?.email);
            console.log('   Role:', loginRes.data.data?.user?.roles?.[0]?.role?.name);
        } else {
            console.log('   Login Failed Response:', loginRes.data);
        }

    } catch (e: any) {
        console.error('❌ Login request failed:', e.message);
    }

    // 3. Check Messages Route (if login succeeded)
    try {
        const loginRes: any = await makeRequest('/api/auth/login', 'POST', {
            email: 'admin@custconnect.com',
            password: 'admin123'
        });

        if (loginRes.statusCode === 200 && loginRes.data.data?.token) {
            console.log('\n🔍 Testing Messages Route...');
            const token = loginRes.data.data.token;

            // Need to manually add Auth header to makeRequest, but simple version doesn't support it easily
            // We'll redefine makeRequest or just use a custom request here

            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/messages/conversations',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            await new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    console.log(`✅ Messages Route Status: ${res.statusCode}`);
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        console.log('   Response:', data.substring(0, 200) + '...');
                        resolve(null);
                    });
                });
                req.on('error', (e) => console.error('❌ Messages request failed:', e.message));
                req.end();
            });
        }
    } catch (e: any) {
        console.error('❌ Message test failed:', e.message);
    }
}

main();
