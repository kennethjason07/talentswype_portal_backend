import './src/configs/dotenv.js';

async function testFlowmingo() {
    const apiKey = process.env.FLOWMINGO_API_KEY?.trim();
    const setId = 'f0521edd-bf49-4a26-a799-815f0433dcf6';
    const endpoint = process.env.FLOWMINGO_INVITE_API_URL || 'https://apis.flowmingo.ai/company/integration/interview/candidate/invite/v1';

    console.log('--- Flowmingo Diagnostic ---');
    console.log('Endpoint:', endpoint);
    console.log('Set ID:', setId);
    console.log('API Key starts with:', apiKey?.substring(0, 15) + '...');

    const payloads = [
        {
            name: 'Doc Sample Payload (candidates)',
            data: {
                com_interview_set_id: setId,
                candidates: [{ name: 'Test User', email: 'test_diag@example.com' }],
                send_invite: false
            }
        },
        {
            name: 'Troubleshooting Suggestion (to)',
            data: {
                com_interview_set_id: setId,
                to: [{ name: 'Test User', email: 'test_diag@example.com' }],
                send_invite: false
            }
        },
        {
            name: 'Valid Invitation Message (>= 10 chars)',
            data: {
                com_interview_set_id: setId,
                candidates: [{ name: 'Test User', email: 'test_diag@example.com' }],
                invitation_message: 'This is a long enough invitation message for testing.',
                send_invite: false
            }
        },
        {
            name: 'Payload with Valid CV Link',
            data: {
                com_interview_set_id: setId,
                candidates: [{ 
                    name: 'Test CV User', 
                    email: 'test_cv@example.com',
                    cv_link: 'https://storage.googleapis.com/flowmingo-demo/cv/alex.pdf'
                }],
                send_invite: false
            }
        },
        {
            name: 'Payload with interview_set_id (no com_ prefix)',
            data: {
                interview_set_id: setId,
                candidates: [{ name: 'Test User', email: 'test_diag@example.com' }],
                send_invite: false
            }
        }
    ];

    for (const p of payloads) {
        console.log(`\nTesting: ${p.name}...`);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey,
                },
                body: JSON.stringify(p.data),
            });

            const body = await res.text();
            console.log('Status:', res.status);
            console.log('Response:', body);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

testFlowmingo();
