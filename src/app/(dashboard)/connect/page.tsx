'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ConnectPage() {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

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
          <Tabs defaultValue="chatgpt" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
              <TabsTrigger value="claude">Claude</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
            </TabsList>

            <TabsContent value="chatgpt" className="space-y-4">
              <div className="space-y-4 text-sm">
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to <strong>Plugins</strong> on the ChatGPT desktop website.</li>
                  <li>Click on <strong>Add</strong> on the top right.</li>
                  <li>Select <strong>Add custom MCP server</strong>.</li>
                  <li>Give it the name <code>calflow</code> and set the URL to:</li>
                </ol>
                <div className="relative mt-2 mb-4">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>https://cal-flow.vercel.app/api/mcp</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard('https://cal-flow.vercel.app/api/mcp', setCopiedUrl)}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-2" start={5}>
                  <li>Click <strong>Create as plugin</strong>.</li>
                  <li>This will open the CalFlow authorization page. Just click <strong>Authorize</strong>.</li>
                  <li>You can now ask ChatGPT to log/fetch your meals and analyze trends!</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="claude" className="space-y-4">
              <div className="space-y-4 text-sm">
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to Claude in the desktop website and log in with your Claude credentials.</li>
                  <li>Click on <strong>Customize</strong>, then click on <strong>Connectors</strong>, then click <strong>Add</strong> on the top right.</li>
                  <li>Select <strong>Add custom connector</strong>.</li>
                  <li>Give it the name <code>calflow</code> and set the MCP URL to:</li>
                </ol>
                <div className="relative mt-2 mb-4">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>https://cal-flow.vercel.app/api/mcp</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard('https://cal-flow.vercel.app/api/mcp', setCopiedUrl)}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-2" start={5}>
                  <li>Click <strong>Continue</strong>, keep the default selection, and click <strong>Add</strong>.</li>
                  <li>Our authorization page will open. Click on <strong>Authorize</strong>.</li>
                  <li>You can now ask Claude to log/fetch your meals and analyze trends!</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="gemini" className="space-y-4">
              <div className="space-y-4 text-sm">
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Open Gemini on desktop website and login with your google account.</li>
                  <li>Click on <strong>Customize</strong> then click on <strong>Connectors</strong>.</li>
                  <li>Click on <strong>Custom</strong>.</li>
                  <li>Add the following URL in MCP Server URL and click on <strong>Next</strong>:</li>
                </ol>
                <div className="relative mt-2 mb-4">
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>https://cal-flow.vercel.app/api/mcp</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard('https://cal-flow.vercel.app/api/mcp', setCopiedUrl)}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-2" start={5}>
                  <li>Tick the checkbox and click on <strong>Connect</strong>.</li>
                  <li>Then click on <strong>Agree and continue</strong>.</li>
                  <li>Our authorization page will open with your email shown, click on <strong>Authorize</strong> button.</li>
                  <li>Then Click on <strong>Connect</strong> where all actions are shown.</li>
                  <li>Then go to Spark and in new chat type <code>@Calflow</code> and select our app from dropdown.</li>
                  <li>Then log your meals, water and get insights!!!</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

