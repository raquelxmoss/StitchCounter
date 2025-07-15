import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCounterSchema, type Counter } from "@shared/schema";
import { useUpdateCounter } from "@/hooks/use-projects";
import { z } from "zod";
import { useState, useEffect } from "react";
import * as React from "react";

const DEFAULT_VALUES = {
  MIN: 0,
  MAX: 999999,
  STEP: 1,
} as const;

const formSchema = z.object({
  name: z.string().min(1, "Counter name is required"),
  min: z.number(),
  max: z.number(),
  step: z.number().min(1),
  linkedToCounterId: z.string().optional(),
  triggerValue: z.number().optional(),
  isManuallyDisabled: z.boolean().default(false),
  hasLink: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface EditCounterModalProps {
  projectId: string;
  counter: Counter | null;
  existingCounters: Counter[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCounterModal({ projectId, counter, existingCounters, open, onOpenChange }: EditCounterModalProps) {
  const updateCounter = useUpdateCounter();
  const [hasLink, setHasLink] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      min: DEFAULT_VALUES.MIN,
      max: DEFAULT_VALUES.MAX,
      step: DEFAULT_VALUES.STEP,
      hasLink: false,
      linkedToCounterId: undefined,
      triggerValue: undefined,
      isManuallyDisabled: false,
    },
  });

  // Update form when counter changes
  useEffect(() => {
    if (counter && open) {
      const hasLinkValue = !!(counter.linkedToCounterId && counter.triggerValue);
      setHasLink(hasLinkValue);
      
      form.reset({
        name: counter.name,
        min: counter.min,
        max: counter.max,
        step: counter.step,
        hasLink: hasLinkValue,
        linkedToCounterId: counter.linkedToCounterId,
        triggerValue: counter.triggerValue,
        isManuallyDisabled: counter.isManuallyDisabled,
      });
    }
  }, [counter, open, form]);

  const onSubmit = (data: FormData) => {
    if (!counter) return;

    const { hasLink: _, ...counterData } = data;
    
    const updatedCounter: Partial<Counter> = {
      ...counterData,
      // Preserve current value, but clamp it to new min/max if needed
      value: Math.max(counterData.min, Math.min(counter.value, counterData.max)),
      linkedToCounterId: hasLink ? counterData.linkedToCounterId : undefined,
      triggerValue: hasLink ? counterData.triggerValue : undefined,
    };

    updateCounter.mutate({ 
      projectId, 
      counterId: counter.id, 
      updates: updatedCounter 
    }, {
      onSuccess: () => {
        form.reset();
        setHasLink(false);
        onOpenChange(false);
      },
    });
  };

  // Filter out the current counter from linkable options
  const linkableCounters = existingCounters.filter(c => c.id !== counter?.id);

  if (!counter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Counter</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Counter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rows" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value) || DEFAULT_VALUES.MAX)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="step"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Step</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isManuallyDisabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto-increment only</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Disable manual increment/decrement buttons
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasLink"
                checked={hasLink}
                onCheckedChange={setHasLink}
              />
              <label htmlFor="hasLink" className="text-sm font-medium">
                Link to another counter
              </label>
            </div>

            {hasLink && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/20">
                <FormField
                  control={form.control}
                  name="linkedToCounterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to counter</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a counter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {linkableCounters.map((counter) => (
                            <SelectItem key={counter.id} value={counter.id}>
                              {counter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="triggerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger every X counts</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g., 2"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={updateCounter.isPending}
              >
                {updateCounter.isPending ? "Updating..." : "Update Counter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}