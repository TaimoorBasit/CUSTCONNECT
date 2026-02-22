async function testRegister() {
    console.log('--- Registering Test User ---');
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@gmail.com`; // Unique email

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
                universityId: 'some-id',
                year: '1',
                studentId: 'S12345'
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        console.error('❌ Request failed:', error.message);
    }
}

testRegister();
