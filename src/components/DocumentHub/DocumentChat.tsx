import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/types/supabase';
import { callApiGateway } from '@/utils/apiGateway';
import { useAuth } from '@/context/AuthContext';
import { Send, FileText, Save, ArrowLeft, Bot } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type DocumentChatProps = {
  projectId: string;
  documents: Document[];
  onSaveTranscript: (title: string, content: string) => Promise<void>;
  onBack: () => void;
};

export default function DocumentChat({
  projectId,
  documents,
  onSaveTranscript,
  onBack
}: DocumentChatProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [transcriptTitle, setTranscriptTitle] = useState('Chat Transcript');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Add initial system message
  useEffect(() => {
    const initialMessage: Message = {
      id: 'system-1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant. I can help you with questions about your project and its documents. What would you like to know?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Construct context from documents
      const documentContext = documents.map(doc => 
        `--- Document: ${doc.title} (${doc.type}) ---\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}\n\n`
      ).join('\n');
      
      // Format all previous messages
      const messageHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      // Send to AI
      const result = await callApiGateway('check-ai-router', {
        task: 'documentAnalysis',
        content: `
          You are an AI assistant helping with a project. You have access to the following project documents:
          
          ${documentContext}
          
          Previous conversation:
          ${messageHistory}
          
          User question: ${userMessage.content}
          
          Please provide a helpful response based on the available documents.
        `,
        userTier: profile?.subscription_tier || 'free',
        options: {
          systemPrompt: 'You are a helpful AI assistant specializing in project management and document analysis. Answer questions based on the provided project documents. If you cannot find relevant information in the documents, acknowledge this limitation and provide general advice.'
        }
      });
      
      // Add AI response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSaveTranscript = async () => {
    if (messages.length <= 1) return; // Don't save if only system message exists
    
    const transcript = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    await onSaveTranscript(transcriptTitle, transcript);
    setSaveDialogOpen(false);
  };
  
  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split('\n').map((line, i) => <p key={i}>{line}</p>);
  };
  
  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="h-4 w-4" />
          Save Transcript
        </Button>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Project Documents AI Chat
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <CardContent className="p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex items-start gap-3 max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    } p-3 rounded-lg`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-primary">
                        <Bot className="h-5 w-5 text-white" />
                      </Avatar>
                    )}
                    <div className="space-y-1">
                      <div className="text-sm">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 bg-muted p-3 rounded-lg">
                    <Avatar className="h-8 w-8 bg-primary">
                      <Bot className="h-5 w-5 text-white" />
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={endOfMessagesRef} />
            </div>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="border-t p-3">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Save Transcript Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Save Chat Transcript</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Transcript Title</label>
              <Input
                placeholder="Enter a title for this chat transcript"
                value={transcriptTitle}
                onChange={(e) => setTranscriptTitle(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTranscript}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}