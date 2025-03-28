import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilePenIcon, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketResearchDocumentProps {
  content: string;
  lastUpdated: Date | null;
}

export default function MarketResearchDocument({ content, lastUpdated }: MarketResearchDocumentProps) {
  const { toast } = useToast();
  
  const handleDownload = () => {
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element to download it
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-research-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Document downloaded",
      description: "Your market research document has been downloaded",
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "Document sharing functionality will be implemented soon",
    });
  };

  // Convert markdown content to HTML (very basic conversion for display)
  const formatContent = (text: string) => {
    if (!text) return <p className="text-gray-500">No content available</p>;
    
    // Split by line breaks and process each line
    const lines = text.split('\n');
    
    return (
      <div>
        {lines.map((line, index) => {
          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
          }
          // Lists
          if (line.startsWith('- ')) {
            return <li key={index} className="ml-6">{line.replace('- ', '')}</li>;
          }
          // Tables (simplified, proper rendering would require more complex parsing)
          if (line.includes('|')) {
            return <div key={index} className="font-mono text-sm overflow-x-auto">{line}</div>;
          }
          // Empty lines
          if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
          }
          // Regular paragraphs
          return <p key={index} className="mb-2">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="flex items-center">
            <FilePenIcon className="h-5 w-5 mr-2" />
            Market Research Document
          </CardTitle>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Badge variant="outline" className="ml-2">Auto-Generated</Badge>
      </CardHeader>
      
      <CardContent className="prose prose-blue max-w-none">
        {formatContent(content)}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}