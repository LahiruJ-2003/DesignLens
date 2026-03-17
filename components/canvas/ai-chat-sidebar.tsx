"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCanvasStore } from "@/lib/canvas-store";
import {
  analyzeDesign,
  calculateDesignScore,
  generateIssueSummary,
} from "@/lib/design-analyzer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Scan,
} from "lucide-react";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function AIChatSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const {
    elements,
    issues,
    setIssues,
    setIsAnalyzing,
    showIssueHighlights,
    toggleIssueHighlights,
  } = useCanvasStore();

  // Use a ref to always get the latest elements
  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const getLatestDesignContext = () => {
    const currentElements = elementsRef.current;
    
    if (currentElements.length === 0) {
      return "The canvas is currently empty. No design elements have been added yet.";
    }

    const textElements = currentElements.filter((el) => el.type === "text");
    const shapeElements = currentElements.filter((el) =>
      ["rectangle", "circle", "frame"].includes(el.type)
    );
    const lineElements = currentElements.filter((el) => el.type === "line");

    const colors = [...new Set(currentElements.map((el) => el.fill).filter(Boolean))];
    const fontSizes = [
      ...new Set(textElements.map((el) => el.fontSize).filter(Boolean)),
    ];

    const currentIssues = analyzeDesign(currentElements);
    const score = calculateDesignScore(currentIssues);
    const summary = generateIssueSummary(currentIssues);

    return `Design Overview:
- Total Elements: ${currentElements.length}
- Shapes: ${shapeElements.length} (rectangles, circles, frames)
- Text Elements: ${textElements.length}
- Lines: ${lineElements.length}
- Colors Used: ${colors.join(", ") || "None"}
- Font Sizes: ${fontSizes.join("px, ")}${fontSizes.length ? "px" : "None"}

Current Analysis Score: ${score}/100
${summary}

${
  currentIssues.length > 0
    ? `Detected Issues:
${currentIssues
  .map(
    (issue) =>
      `- [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`
  )
  .join("\n")}`
    : "No issues detected."
}

Element Details:
${currentElements
  .slice(0, 10)
  .map(
    (el) =>
      `- ${el.type}: position(${Math.round(el.x)}, ${Math.round(el.y)}), size(${Math.round(el.width)}x${Math.round(el.height)}), fill: ${el.fill || "none"}, stroke: ${el.stroke || "none"}`
  )
  .join("\n")}
${currentElements.length > 10 ? `... and ${currentElements.length - 10} more elements` : ""}`;
  };

  const [rateLimitError, setRateLimitError] = useState(false);
  const [localFallbackMessage, setLocalFallbackMessage] = useState<string | null>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          designContext: getLatestDesignContext(),
        },
      }),
    }),
    onError: (error) => {
      if (error.message.includes("429") || error.message.includes("rate") || error.message.includes("quota")) {
        setRateLimitError(true);
        // Generate local fallback response
        const fallback = generateLocalAnalysis();
        setLocalFallbackMessage(fallback);
      }
    },
  });

  // Generate local analysis as fallback when Gemini is rate limited
  const generateLocalAnalysis = () => {
    const currentElements = elementsRef.current;
    const currentIssues = analyzeDesign(currentElements);
    const score = calculateDesignScore(currentIssues);
    const summary = generateIssueSummary(currentIssues);

    if (currentElements.length === 0) {
      return "Your canvas is empty. Add some elements (shapes, text, frames) to get design feedback!";
    }

    let response = `**Local Analysis** (Gemini rate limited - waiting to retry)\n\n`;
    response += `**Design Score: ${score}/100**\n${summary}\n\n`;

    if (currentIssues.length > 0) {
      response += `**Issues Found (${currentIssues.length}):**\n`;
      currentIssues.forEach((issue, i) => {
        const icon = issue.severity === "error" ? "🔴" : issue.severity === "warning" ? "🟡" : "🔵";
        response += `${i + 1}. ${icon} **${issue.type}**: ${issue.message}\n   → ${issue.suggestion}\n`;
      });
    } else {
      response += "No major issues detected. Great work so far!";
    }

    return response;
  };

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const analyzeDesignAction = () => {
    setIsAnalyzing(true);
    const currentIssues = analyzeDesign(elements);
    setIssues(currentIssues);

    sendMessage({
      text: "Please analyze my current design and provide detailed UI/UX feedback. Focus on color contrast, typography, spacing, alignment, and accessibility issues. Give me specific, actionable suggestions for improvement.",
    });

    setTimeout(() => setIsAnalyzing(false), 1000);
  };

  const clearChat = () => {
    setMessages([]);
    setIssues([]);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  if (!isExpanded) {
    return (
      <div className="w-12 bg-card border-l border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 mb-4"
          onClick={() => setIsExpanded(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          {issues.length > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5">
              {issues.length}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              DL Assistant
            </h3>
            <p className="text-[10px] text-muted-foreground">
              AI-Powered UI/UX Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={clearChat}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 h-9 bg-transparent"
          onClick={analyzeDesignAction}
          disabled={isLoading}
        >
          <Scan className="h-4 w-4" />
          {isLoading ? "Analyzing..." : "Analyze Design"}
        </Button>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Show issue highlights
          </span>
          <Button
            variant={showIssueHighlights ? "default" : "outline"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={toggleIssueHighlights}
          >
            {showIssueHighlights ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitError && (
        <div className="p-3 border-b border-border bg-yellow-500/10">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-500">Gemini Rate Limited</p>
              <p className="text-muted-foreground mt-0.5">
                Using local analyzer. Wait ~20s before retrying Gemini.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 h-7 text-xs bg-transparent"
            onClick={() => {
              setRateLimitError(false);
              setLocalFallbackMessage(null);
            }}
          >
            Retry Gemini
          </Button>
        </div>
      )}

      {/* Issues Panel */}
      {issues.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Issues Found
            </h4>
            <Badge variant="outline" className="text-[10px]">
              {issues.length}
            </Badge>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-1.5">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-md text-xs",
                    issue.severity === "error" && "bg-destructive/10",
                    issue.severity === "warning" && "bg-yellow-500/10",
                    issue.severity === "info" && "bg-blue-500/10"
                  )}
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {issue.message}
                    </p>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2">
                      {issue.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Ask Gemini about your design!
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Get AI-powered feedback on colors, typography, spacing, and
                  accessibility.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {[
                    "Analyze my design",
                    "Check color contrast",
                    "Improve typography",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 bg-transparent"
                      onClick={() => setInputValue(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {getUIMessageText(message)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            {localFallbackMessage && (
              <div className="flex gap-2 justify-start">
                <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-yellow-500/10 border border-yellow-500/20">
                  <div className="whitespace-pre-wrap text-foreground">
                    {localFallbackMessage.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.includes('**')) {
                        const parts = line.split(/\*\*(.*?)\*\*/);
                        return (
                          <p key={i}>
                            {parts.map((part, j) => 
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Gemini about your design..."
            className="flex-1 h-9 text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 w-9 p-0"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
