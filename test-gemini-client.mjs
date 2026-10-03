import fetch from "node-fetch";

async function main() {
    const res = await fetch("https://cal-flow.vercel.app/api/mcp?token=cb713b6b9a9c8c61a08ee1b7eabb8314b68234f9856c49768fefe9fa7ec3cabe");
    console.log("GET status:", res.status);
    
    // Read the stream to get endpoint
    const body = res.body;
    let sessionId = null;
    let endpoint = null;
    
    // Simple reader
    for await (const chunk of body) {
        const text = chunk.toString();
        console.log("SSE Received:", text);
        const match = text.match(/data:\s*([^\n]+)/);
        if (match) {
            endpoint = match[1];
            break;
        }
    }
    
    if (!endpoint) {
        console.log("No endpoint found.");
        return;
    }
    
    console.log("Found endpoint:", endpoint);
    
    // Send POST
    const postUrl = `https://cal-flow.vercel.app${endpoint}`;
    console.log("Sending POST to", postUrl);
    
    const postRes = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })
    });
    
    console.log("POST status:", postRes.status);
    console.log("POST response body:", await postRes.text());
    
    // Read more from GET stream
    for await (const chunk of body) {
        console.log("SSE Received after POST:", chunk.toString());
        break; // just read one
    }
}
main().catch(console.error);
