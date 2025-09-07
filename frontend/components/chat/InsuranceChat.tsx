'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient, ChatResponse, Document } from '@/lib/api';
import { toast } from 'sonner';
import {
  HiOutlinePaperAirplane,
  HiOutlineUser,
  HiOutlineCpuChip,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: ChatResponse;
}

interface InsuranceChatProps {
  availableDocuments: Document[];
}

export const InsuranceChat: React.FC<InsuranceChatProps> = ({ availableDocuments }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processedDocs = availableDocuments.filter(doc => doc.processing_status === 'completed');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: processedDocs.length > 0 
          ? `Welcome to Insurance AI Assistant! I can help you analyze your ${processedDocs.length} processed insurance document${processedDocs.length > 1 ? 's' : ''}. Ask me questions like:\n\n• "46-year-old male, knee surgery in Pune, 3-month-old insurance policy"\n• "What is covered for dental treatment?"\n• "What are the claim procedures for hospitalization?"\n\nWhat would you like to know about your insurance?`
          : "Welcome to Insurance AI Assistant! You don't have any processed documents yet. Please upload and process your insurance documents first to start asking questions.",
        timestamp: new Date(),
      }]);
    }
  }, [processedDocs.length, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (processedDocs.length === 0) {
      toast.error('Please upload and process documents first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.sendChatQuery({
        query: userMessage.content,
        document_ids: selectedDocuments.length > 0 ? selectedDocuments : undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to process your query';
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm sorry, but I encountered an error processing your query: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleDocumentSelection = (docId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-trust flex items-center justify-center shadow-md">
            <HiOutlineCpuChip className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
          <Card 
            variant={isUser ? "default" : "glass"}
            className={`${isUser ? 'professional-gradient text-white shadow-lg' : 'glass-card interactive-lift'} transition-all duration-300`}
          >
            <CardContent className="p-3">
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              
              {/* Structured Response Display */}
              {message.response && (
                <div className="mt-4 space-y-3 border-t pt-3">
                  {/* Decision */}
                  {message.response.decision && (
                    <div className="flex items-center space-x-2">
                      {message.response.decision.toLowerCase().includes('approved') || 
                       message.response.decision.toLowerCase().includes('covered') ? (
                        <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">
                        Decision: {message.response.decision}
                      </span>
                    </div>
                  )}
                  
                  {/* Amount */}
                  {message.response.amount && message.response.amount > 0 && (
                    <div className="flex items-center space-x-2">
                      <HiOutlineCurrencyDollar className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">
                        Amount: {formatCurrency(message.response.amount)}
                      </span>
                    </div>
                  )}
                  
                  {/* Justification */}
                  {message.response.justification && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
                      <div className="font-medium mb-1">Justification:</div>
                      <div>{message.response.justification}</div>
                    </div>
                  )}
                  
                  {/* Sources */}
                  {message.response.sources && message.response.sources.length > 0 && (
                    <div>
                      <div className="font-medium text-xs mb-1">Sources:</div>
                      <div className="space-y-1">
                        {message.response.sources.map((source, index) => (
                          <div key={index} className="text-xs bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                            <HiOutlineDocumentText className="w-3 h-3 inline mr-1" />
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-md order-2">
            <HiOutlineUser className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[700px]">
      {/* Document Selection */}
      {processedDocs.length > 0 && (
        <Card variant="glass" className="mb-4 animate-fade-in-up interactive-lift">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HiOutlineDocumentText className="w-4 h-4" />
              <span className="font-medium text-sm">Select Documents (optional):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {processedDocs.map((doc) => (
                <Badge
                  key={doc.id}
                  variant={selectedDocuments.includes(doc.id) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  {doc.original_filename.replace('.pdf', '')}
                  {selectedDocuments.includes(doc.id) && (
                    <HiOutlineCheckCircle className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDocuments.length > 0 
                ? `Querying ${selectedDocuments.length} selected document${selectedDocuments.length > 1 ? 's' : ''}` 
                : `Will query all ${processedDocs.length} documents`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card variant="professional" className="flex-1 flex flex-col animate-scale-in shadow-glass">
        <ScrollArea className="flex-1 p-4">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex gap-3 justify-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <HiOutlineCpuChip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm">Analyzing your insurance documents...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Query Templates */}
        {processedDocs.length > 0 && messages.length <= 1 && (
          <div className="border-t border-b p-4 bg-gradient-to-r from-primary-soft/20 to-trust/10 backdrop-blur-sm animate-fade-in-up animate-delay-300">
            <div className="mb-2">
              <span className="text-sm font-medium">Quick Questions:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "46-year-old male, knee surgery in Pune, 3-month-old insurance policy",
                "What is covered for dental treatment?",
                "What are the claim procedures for hospitalization?",
                "Is maternity covered under this policy?",
                "What is the sum insured for critical illness?",
                "What documents are needed for cardiac surgery claim?"
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="glass"
                  size="sm"
                  className="text-left justify-start h-auto p-3 text-xs interactive-scale hover:shadow-md transition-all duration-200"
                  onClick={() => setInputValue(template)}
                  disabled={isLoading}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4 bg-gradient-to-r from-background/80 to-muted/20">
          <div className="flex space-x-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                processedDocs.length > 0 
                  ? "Ask about your insurance coverage..."
                  : "Upload documents first to start chatting"
              }
              onKeyPress={handleKeyPress}
              disabled={isLoading || processedDocs.length === 0}
              className="flex-1 h-12 glass-card border-primary/20 focus:shadow-glass transition-all duration-300"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || processedDocs.length === 0}
              size="lg"
              className="h-12 px-6 professional-gradient shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <HiOutlinePaperAirplane className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};