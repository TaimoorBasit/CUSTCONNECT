
import axios from 'axios';

async function checkBackend() {
    console.log('🔍 Checking Backend Health...');
    try {
        const response = await axios.get('http://localhost:5000/api/ping');
        console.log('✅ Backend is responding:', response.data);
    } catch (error: any) {
        console.log('❌ Backend check failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('   Connection refused. Server is likely down.');
        }
    }

    console.log('\n🔍 Attempting Login simulation...');
    try {
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'bookshop@custconnect.com',
            password: 'Printer123!'
        });
        console.log('✅ Login successful:', loginResponse.data);
    } catch (error: any) {
        console.log('❌ Login failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
    }
}

checkBackend();
