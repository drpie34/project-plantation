import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { 
  Sparkles, 
  Pencil, 
  RefreshCcw, 
  Save, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export interface ContentGeneratorProps {
  sectionTitle: string;
  sectionDescription?: string;
  userContent: string;
  generatedContent: string;
  guidedQuestions: string[];
  onContentChange: (content: string) => void;
  onSaveContent: () => void;
  onGenerateContent: (userThoughts?: string) => Promise<void>;
  onExpandContent?: (content: string) => Promise<void>;
  isLoading: boolean;
}

export default function ContentGenerator({
  sectionTitle,
  sectionDescription,
  userContent,
  generatedContent,
  guidedQuestions,
  onContentChange,
  onSaveContent,
  onGenerateContent,
  onExpandContent,
  isLoading
}: ContentGeneratorProps) {
  const [userThoughts, setUserThoughts] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<string[]>(Array(guidedQuestions.length).fill(''));
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState(false);

  // Handle guided questions
  const handleAnswerQuestion = (answer: string, index: number) => {
    const newAnswers = [...questionAnswers];
    newAnswers[index] = answer;
    setQuestionAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < guidedQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      // Combine all answers into the final content
      const combinedContent = questionAnswers.map((answer, index) => {
        return `## ${guidedQuestions[index].split('?')[0]}?\n${answer}\n\n`;
      }).join('');
      
      onContentChange(combinedContent);
      setIsAnsweringQuestions(false);
    }
  };

  const startGuidedQuestions = () => {
    setIsAnsweringQuestions(true);
    setActiveQuestionIndex(0);
    setQuestionAnswers(Array(guidedQuestions.length).fill(''));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{sectionTitle}</h3>
          {sectionDescription && <p className="text-sm text-gray-500">{sectionDescription}</p>}
        </div>
      </div>

      {!generatedContent ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="write">
                <Pencil className="w-4 h-4 mr-2" />
                Write
              </TabsTrigger>
              <TabsTrigger value="ai-generate">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="ai-assist">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assist
              </TabsTrigger>
              <TabsTrigger value="guided">
                <HelpCircle className="w-4 h-4 mr-2" />
                Guided
              </TabsTrigger>
            </TabsList>

            {/* Write Content Tab */}
            <TabsContent value="write" className="space-y-4 pt-4">
              <Textarea
                placeholder={`Write your ${sectionTitle.toLowerCase()} content here...`}
                className="min-h-[300px]"
                value={userContent}
                onChange={(e) => onContentChange(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={onSaveContent}
                  disabled={!userContent.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Content
                </Button>
                {onExpandContent && (
                  <Button
                    variant="outline"
                    onClick={() => onExpandContent(userContent)}
                    disabled={!userContent.trim() || isLoading}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {isLoading ? "Processing..." : "Expand with AI"}
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* AI Generate Tab */}
            <TabsContent value="ai-generate" className="space-y-4 pt-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800 mb-2">The AI will generate complete content for this section based on project context.</p>
                <Button
                  onClick={() => onGenerateContent()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate Complete Content"}
                </Button>
              </div>
            </TabsContent>

            {/* AI Assist Tab */}
            <TabsContent value="ai-assist" className="space-y-4 pt-4">
              <p className="text-sm text-gray-500 mb-2">Share your thoughts and let AI generate content based on them</p>
              <Textarea
                placeholder="Describe what you're thinking for this section..."
                className="min-h-[200px]"
                value={userThoughts}
                onChange={(e) => setUserThoughts(e.target.value)}
              />
              <Button
                onClick={() => onGenerateContent(userThoughts)}
                disabled={!userThoughts.trim() || isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? "Generating..." : "Generate from My Thoughts"}
              </Button>
            </TabsContent>

            {/* Guided Questions Tab */}
            <TabsContent value="guided" className="space-y-4 pt-4">
              {isAnsweringQuestions ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="font-medium mb-2">Question {activeQuestionIndex + 1} of {guidedQuestions.length}</p>
                    <p className="mb-4">{guidedQuestions[activeQuestionIndex]}</p>
                    <Textarea
                      placeholder="Type your answer here..."
                      className="min-h-[150px]"
                      value={questionAnswers[activeQuestionIndex]}
                      onChange={(e) => handleAnswerQuestion(e.target.value, activeQuestionIndex)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => activeQuestionIndex > 0 && setActiveQuestionIndex(activeQuestionIndex - 1)}
                      disabled={activeQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!questionAnswers[activeQuestionIndex]?.trim()}
                    >
                      {activeQuestionIndex === guidedQuestions.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-center">
                  <p className="mb-4">Answer a series of guided questions to help create your content.</p>
                  <Button onClick={startGuidedQuestions}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Start Guided Questions
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="border rounded-md p-4 prose prose-blue max-w-none">
          <div className="mb-2 flex justify-between items-center">
            <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
            <AIModelIndicator model="GPT-4" features={{ webSearch: false }} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br/>') }} />
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onContentChange('')}
              size="sm"
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onGenerateContent()}
              size="sm"
              disabled={isLoading}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}