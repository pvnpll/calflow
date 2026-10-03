import { ReadableStream } from "node:stream/web";
const encoder = new TextEncoder();
const stream = new ReadableStream({
    start(controller) {
        controller.enqueue(encoder.encode("event: endpoint\ndata: /api/mcp\n\n"));
        controller.close();
    }
});
const reader = stream.getReader();
reader.read().then(console.log);
