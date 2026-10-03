import 'dotenv/config';

async function main() {
    const res = await fetch("http://localhost:3000/api/mcp?token=test");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let sessionId = null;
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        console.log("SSE Received:", text);
        
        if (text.includes("event: endpoint")) {
            sessionId = text.match(/sessionId=([^&\n]+)/)[1];
            console.log("Found session ID:", sessionId);
            break;
        }
    }
    
    // Now POST a tools/list request
    const postRes = await fetch(`http://localhost:3000/api/mcp?token=test&sessionId=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })
    });
    
    console.log("POST Response status:", postRes.status);
    console.log("POST Response body:", await postRes.text());
    
    // Read the rest of the stream
    const { done, value } = await reader.read();
    if (!done) {
        console.log("SSE Received after POST:", decoder.decode(value));
    }
}
main().catch(console.error);
