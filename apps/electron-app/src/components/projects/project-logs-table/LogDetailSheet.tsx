import { Log } from "@/types/log";
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
      case 'error': return "bg-red-500";
      case 'warn': return "bg-amber-500";
      case 'info': return "bg-blue-500";
      case 'debug': return "bg-green-500";
      case 'trace': return "bg-slate-400";
      default: return "bg-slate-400";
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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Badge className={`${getLevelBadgeColor(log.level)} px-2 py-1 text-white`}>
              {log.level.toUpperCase()}
            </Badge>
            <SheetTitle>Log Details</SheetTitle>
          </div>
          <SheetDescription>
            {new Date(log.timestamp).toLocaleString()}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* Message Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Message</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyLogToClipboard}
                  className="h-7 px-2"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {log.message}
              </div>
            </div>
            
            {/* Metadata Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Metadata</h3>
                {log.metadata && log.metadata.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={copyMetadataToClipboard}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs">Copy All</span>
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
                        className="border rounded-md overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                          <div className="font-medium text-sm">{meta.key}</div>
                          {/* Show expand icon only if content is potentially collapsible (not small JSON or already expanded) */}
                          {!(jsonValue && Object.keys(jsonValue).length < 5) && <Maximize2 className="h-4 w-4 text-muted-foreground" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Separator />
                          <div className={cn(
                            "p-3 font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto",
                            isStackTraceValue ? "bg-muted/70" : "",
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
                                className="mt-3"
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
                <div className="text-muted-foreground text-sm">No metadata available</div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-4 border-t">
          <Button 
            variant="outline"
            onClick={copyLogToClipboard}
            className="mr-auto"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Log
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 