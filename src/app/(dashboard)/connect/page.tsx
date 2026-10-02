'use client';

import { useState, useEffect } from 'react';
import { getOrCreateMcpToken } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ConnectPage() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
  const sseUrl = `${baseUrl}/api/mcp?token=${token}`;

  useEffect(() => {
    getOrCreateMcpToken().then((t) => {
      setToken(t);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const claudeDesktopConfig = `{
  "mcpServers": {
    "calflow": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/mcp-remote",
        "${baseUrl}/api/mcp",
        "--header",
        "Authorization: Bearer ${token}"
      ]
    }
  }
}`;

  const claudeCodeCommand = `claude mcp add calflow --transport sse "${sseUrl}"`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="h-[400px] w-full bg-muted rounded-xl"></div>
      </div>
    );
  }

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
          <CardTitle>Personal Access Token</CardTitle>
          <CardDescription>
            This token gives the AI agent access to your CalFlow account. Do not share it with others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-muted px-4 py-2 rounded-md font-mono text-sm break-all">
              {token}
            </code>
            <Button variant="outline" onClick={() => copyToClipboard(token, setCopiedToken)}>
              {copiedToken ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedToken ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect CalFlow to your AI client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="desktop">Claude Desktop</TabsTrigger>
              <TabsTrigger value="code">Claude Code (CLI)</TabsTrigger>
              <TabsTrigger value="web">Claude Web (OAuth)</TabsTrigger>
              <TabsTrigger value="cursor">Cursor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="desktop" className="space-y-4">
              <div className="space-y-2">
                <Label>1. Open your Claude Desktop config file:</Label>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                  <li>Windows: <code>%APPDATA%\Claude\claude_desktop_config.json</code></li>
                  <li>macOS: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                </ul>
              </div>
              <div className="space-y-2 mt-4">
                <Label>2. Add CalFlow to your mcpServers array:</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{claudeDesktopConfig}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard(claudeDesktopConfig, setCopiedJson)}
                  >
                    {copiedJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-md mt-4">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p>After saving the file, completely restart Claude Desktop. You should see a plug icon indicating the CalFlow tools (like <code>log_meal</code>) are available.</p>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label>Run this command in your terminal where you use Claude Code:</Label>
                <div className="relative mt-2">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>{claudeCodeCommand}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard(claudeCodeCommand, setCopiedCli)}
                  >
                    {copiedCli ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="web" className="space-y-4">
              <div className="space-y-4 text-sm">
                <p>
                  Claude Web does not natively support adding custom remote MCP servers manually yet. 
                </p>
                <p>
                  However, CalFlow is built with an OAuth authorization server (<code>/mcp/authorize</code>) so it can be added as an AI plugin/integration to platforms that support standard OAuth MCP discovery. 
                </p>
              </div>
            </TabsContent>

            <TabsContent value="cursor" className="space-y-4">
              <div className="space-y-4 text-sm">
                <p>To use CalFlow tools in Cursor:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Open Cursor Settings (<code>Ctrl/Cmd + Shift + J</code>).</li>
                  <li>Navigate to <strong>Features &gt; MCP</strong>.</li>
                  <li>Click <strong>+ Add New MCP Server</strong>.</li>
                  <li>Set Type to <strong>SSE</strong>.</li>
                  <li>Set URL to: <code className="bg-muted px-2 py-1 rounded break-all">{sseUrl}</code></li>
                  <li>Save and verify the connection.</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

