export async function onRequest() {
  return new Response(JSON.stringify({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 