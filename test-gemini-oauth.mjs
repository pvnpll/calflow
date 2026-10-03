import fetch from "node-fetch";

async function main() {
    console.log("Step 1: GET /api/mcp");
    const res1 = await fetch("https://cal-flow.vercel.app/api/mcp");
    console.log("Status:", res1.status);
    const authHeader = res1.headers.get("www-authenticate");
    console.log("WWW-Authenticate:", authHeader);
    
    if (!authHeader) {
        console.error("Missing WWW-Authenticate header");
        return;
    }
    
    const resourceMetadataUrl = authHeader.match(/resource_metadata="([^"]+)"/)?.[1];
    if (!resourceMetadataUrl) {
        console.error("Missing resource_metadata in WWW-Authenticate header");
        return;
    }
    
    console.log("\nStep 3: GET", resourceMetadataUrl);
    // Note: Gemini likely appends the path of the resource it's trying to access
    const resourcePathUrl = resourceMetadataUrl + "?resource=https://cal-flow.vercel.app/api/mcp";
    console.log("Fetching", resourcePathUrl);
    
    // Actually, RFC 8414 says resource metadata is fetched from /.well-known/oauth-protected-resource
    // Our server expects the path to be appended: /.well-known/oauth-protected-resource/api/mcp
    const res3 = await fetch("https://cal-flow.vercel.app/.well-known/oauth-protected-resource/api/mcp");
    console.log("Status:", res3.status);
    const protectedResource = await res3.json();
    console.log(protectedResource);
    
    const authorizationServer = protectedResource.authorization_servers[0];
    
    console.log("\nStep 5: GET", authorizationServer + "/.well-known/oauth-authorization-server");
    const res5 = await fetch(authorizationServer + "/.well-known/oauth-authorization-server");
    console.log("Status:", res5.status);
    const oauthServer = await res5.json();
    console.log(oauthServer);
    
    console.log("\nStep 7: POST", oauthServer.registration_endpoint);
    const res7 = await fetch(oauthServer.registration_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            client_name: "Gemini",
            redirect_uris: ["https://gemini.google.com/oauth/callback"] // Guessing
        })
    });
    console.log("Status:", res7.status);
    const registration = await res7.json();
    console.log(registration);
}

main().catch(console.error);
