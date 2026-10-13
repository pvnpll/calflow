'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { McpConnectInstructions } from '@/components/shared/McpConnectInstructions';

export default function ConnectPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connect to AI Agents</h1>
        <p className="text-muted-foreground mt-2">
          Add CalFlow as an MCP (Model Context Protocol) tool to your favorite AI assistant to log meals and track nutrition directly from chat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect CalFlow to your AI client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <McpConnectInstructions />
        </CardContent>
      </Card>
    </div>
  );
}
