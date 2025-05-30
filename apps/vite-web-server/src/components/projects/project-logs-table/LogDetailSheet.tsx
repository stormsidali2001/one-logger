import type{ Log } from "@/types/log";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Maximize2, ArrowUpRightFromCircle } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

interface LogDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: Log | null;
}

// Helper function to check if a string is valid JSON
const tryParseJSON = (jsonString: string): object | false => {
  try {
    const o = JSON.parse(jsonString);
    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking below.
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) { /* Fall through */ }
  return false;
};

export function LogDetailSheet({ open, onOpenChange, log }: LogDetailSheetProps) {
  if (!log) return null;

  const getLevelBadgeColor = (level: string): string => {
    switch(level.toLowerCase()) {
      case 'error': return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm";
      case 'warn': return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm";
      case 'info': return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm";
      case 'debug': return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm";
      case 'trace': return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-sm";
      default: return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-sm";
    }
  };

  const copyLogToClipboard = () => {
    const formattedLog = `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`;
    navigator.clipboard.writeText(formattedLog)
      .then(() => toast.success("Log copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const copyMetadataToClipboard = () => {
    if (!log.metadata || log.metadata.length === 0) return;
    
    const metadataText = log.metadata.map(meta => `${meta.key}: ${meta.value}`).join('\\n');
    navigator.clipboard.writeText(metadataText)
      .then(() => toast.success("Metadata copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  const isStackTrace = (value: string): boolean => {
    return typeof value === 'string' && value.includes('\\n') && 
           (value.includes('at ') || value.includes('Error:')) && 
           (value.includes('.js:') || value.includes('.ts:'));
  };

  const shouldExpandByDefault = (key: string, value: string): boolean => {
    return isStackTrace(value) || (typeof value === 'string' && value.length < 100) || key.toLowerCase().includes('message');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 flex flex-col h-full max-h-screen bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-md border-l border-gray-200/60">
        <SheetHeader className="px-6 py-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Badge className={`${getLevelBadgeColor(log.level)} px-3 py-1.5 rounded-full font-semibold transition-all duration-200`}>
              {log.level.toUpperCase()}
            </Badge>
            <SheetTitle className="text-gray-900 font-bold">Log Details</SheetTitle>
          </div>
          <SheetDescription className="text-gray-700 font-medium">
            {new Date(log.timestamp).toLocaleString()}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Message Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Message</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyLogToClipboard}
                  className="h-8 px-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 rounded-lg"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
                  <span className="text-xs font-medium">Copy</span>
                </Button>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 p-5 rounded-xl font-mono text-sm whitespace-pre-wrap overflow-x-auto shadow-sm text-gray-800 leading-relaxed">
                {log.message}
              </div>
            </div>
            
            {/* Metadata Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Metadata</h3>
                {log.metadata && log.metadata.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={copyMetadataToClipboard}
                    className="h-8 px-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 rounded-lg"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
                    <span className="text-xs font-medium">Copy All</span>
                  </Button>
                )}
              </div>
              
              {log.metadata && log.metadata.length > 0 ? (
                <div className="space-y-3">
                  {log.metadata.map((meta, index) => {
                    const jsonValue = typeof meta.value === 'string' ? tryParseJSON(meta.value) : false;
                    const isStackTraceValue = typeof meta.value === 'string' ? isStackTrace(meta.value) : false;

                    return (
                      <Collapsible 
                        key={`${meta.key}-${index}`}
                        defaultOpen={typeof meta.value === 'string' ? shouldExpandByDefault(meta.key, meta.value) : true}
                        className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white/60 backdrop-blur-sm"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-100/50 cursor-pointer transition-all duration-200">
                          <div className="font-semibold text-sm text-blue-700">{meta.key}</div>
                          {/* Show expand icon only if content is potentially collapsible (not small JSON or already expanded) */}
                          {!(jsonValue && Object.keys(jsonValue).length < 5) && <Maximize2 className="h-4 w-4 text-gray-500" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Separator />
                          <div className={cn(
                            "p-4 font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto text-gray-800 leading-relaxed",
                            isStackTraceValue ? "bg-gradient-to-r from-red-50 to-orange-50" : "bg-gradient-to-r from-gray-50 to-blue-50",
                            jsonValue ? "json-pretty-container" : "" // Add a class for specific styling if needed
                          )}>
                            {jsonValue ? (
                              <JSONPretty data={jsonValue} themeClassName="__json-pretty__" />
                            ) : (
                              meta.value // Render as plain text if not JSON
                            )}
                            
                            {isStackTraceValue && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                onClick={() => {
                                  const win = window.open("", "_blank");
                                  if (win) {
                                    win.document.write(`
                                      <html>
                                        <head>
                                          <title>Stack Trace: ${meta.key}</title>
                                          <style>
                                            body { font-family: monospace; white-space: pre-wrap; line-height: 1.5; padding: 20px; }
                                          </style>
                                        </head>
                                        <body>${meta.value}</body>
                                      </html>
                                    `);
                                  }
                                }}
                              >
                                <ArrowUpRightFromCircle className="h-3.5 w-3.5 mr-1.5" />
                                View in Separate Window
                              </Button>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded-xl border border-gray-200">No metadata available</div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-5 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
          <Button 
            variant="outline"
            onClick={copyLogToClipboard}
            className="mr-auto hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Log
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}