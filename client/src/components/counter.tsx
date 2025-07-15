import { Counter as CounterType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Minus, Plus, RotateCcw, MoreVertical, Link, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  counter: CounterType;
  projectId: string;
  isLinked: boolean;
  linkedCounters: CounterType[];
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function Counter({
  counter,
  projectId,
  isLinked,
  linkedCounters,
  onIncrement,
  onDecrement,
  onReset,
  onDelete,
}: CounterProps) {
  const getLinkedDescription = () => {
    if (counter.linkedToCounterId && counter.triggerValue) {
      const linkedCounter = linkedCounters.find(c => c.id === counter.linkedToCounterId);
      if (linkedCounter) {
        return `+${counter.step} every ${counter.triggerValue} ${linkedCounter.name.toLowerCase()}`;
      }
    }
    if (counter.isManuallyDisabled) {
      return "Auto-increment only";
    }
    return `+${counter.step} per tap`;
  };

  const formatRange = () => {
    const min = counter.min;
    const max = counter.max;
    
    // For very large max values, show a cleaner format
    if (max >= 999999) {
      return min === 0 ? "0+" : `${min}+`;
    }
    if (max >= 1000) {
      return `${min}-${Math.round(max / 1000)}k`;
    }
    return `${min}-${max}`;
  };

  const shouldShowRange = () => {
    // Only show range if max is not the default value (999999) or min is not 0
    return counter.max < 999999 || counter.min !== 0;
  };

  const isAtMax = counter.value >= counter.max;
  const isAtMin = counter.value <= counter.min;
  const isManuallyDisabled = counter.isManuallyDisabled;

  return (
    <div className={cn(
      "bg-slate-50 rounded-lg p-4 relative transition-all",
      isLinked && "ring-2 ring-accent/20",
      isAtMax && "ring-2 ring-red-200 bg-red-50",
      isManuallyDisabled && "bg-blue-50 ring-2 ring-blue-200"
    )}>
      {isLinked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse">
          <Link className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900">{counter.name}</h3>
        <div className="flex items-center space-x-2">
          {isLinked && (
            <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
              Linked
            </span>
          )}
          {isManuallyDisabled && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Auto-only
            </span>
          )}
          {shouldShowRange() && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              isAtMax ? "text-red-700 bg-red-100" : "text-slate-500 bg-slate-100"
            )}>
              {formatRange()}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isManuallyDisabled && (
                <DropdownMenuItem onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </DropdownMenuItem>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Counter</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{counter.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "w-12 h-12 rounded-full border-slate-300 hover:border-primary hover:text-primary transition-all active:scale-95",
            isManuallyDisabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={onDecrement}
          disabled={isAtMin || isManuallyDisabled}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className={cn(
            "text-3xl font-bold",
            isAtMax ? "text-red-600" : "text-slate-900"
          )}>
            {counter.value}
          </div>
          <div className={cn(
            "text-xs",
            isManuallyDisabled ? "text-blue-600" : "text-slate-500"
          )}>
            {getLinkedDescription()}
          </div>
          {isAtMax && (
            <div className="text-xs text-red-500 font-medium mt-1">
              Maximum reached
            </div>
          )}
        </div>

        <Button
          size="icon"
          className={cn(
            "w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-all active:scale-95",
            isManuallyDisabled && "opacity-50 cursor-not-allowed bg-slate-400",
            isAtMax && !isManuallyDisabled && "bg-red-500 hover:bg-red-600"
          )}
          onClick={onIncrement}
          disabled={isAtMax || isManuallyDisabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {!isManuallyDisabled ? (
        <div className="mt-3 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-700 h-auto p-1"
            onClick={onReset}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset to {counter.min}
          </Button>
        </div>
      ) : (
        <div className="mt-3 h-8"></div>
      )}
    </div>
  );
}
