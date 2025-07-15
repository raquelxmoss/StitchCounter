import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCounterSchema, type Counter } from "@shared/schema";
import { useAddCounter } from "@/hooks/use-projects";
import { z } from "zod";
import { useState } from "react";
import * as React from "react";

const DEFAULT_VALUES = {
  MIN: 0,
  MAX: 999999,
  STEP: 1,
} as const;

const formSchema = insertCounterSchema.extend({
  hasLink: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const createNumberFieldHandlers = (defaultValue: number | undefined) => ({
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    return value === '' ? '' : parseInt(value) || defaultValue;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    return value === '' ? defaultValue : parseInt(value) || defaultValue;
  },
});

interface AddCounterModalProps {
  projectId: string;
  existingCounters: Counter[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCounterModal({ projectId, existingCounters, open, onOpenChange }: AddCounterModalProps) {
  const addCounter = useAddCounter();
  const [hasLink, setHasLink] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: 0,
      min: DEFAULT_VALUES.MIN,
      max: DEFAULT_VALUES.MAX,
      step: DEFAULT_VALUES.STEP,
      hasLink: false,
      linkedToCounterId: undefined,
      triggerValue: undefined,
      isManuallyDisabled: false,
    },
  });

  // Reset form and state when modal opens
  React.useEffect(() => {
    if (open) {
      form.reset();
      setHasLink(false);
    }
  }, [open, form]);

  const onSubmit = (data: FormData) => {
    const { hasLink, ...counterData } = data;
    const counter = {
      ...counterData,
      value: counterData.min, // Start at minimum value
      linkedToCounterId: hasLink ? counterData.linkedToCounterId : undefined,
      triggerValue: hasLink ? counterData.triggerValue : undefined,
    };

    addCounter.mutate(
      { projectId, counter },
      {
        onSuccess: () => {
          form.reset();
          setHasLink(false);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Counter</DialogTitle>
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
                    <Input placeholder="e.g., Rows, Stitches" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => {
                  const handlers = createNumberFieldHandlers(DEFAULT_VALUES.MIN);
                  return (
                    <FormItem>
                      <FormLabel>Min</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(handlers.onChange(e))}
                          onBlur={(e) => field.onChange(handlers.onBlur(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="max"
                render={({ field }) => {
                  const handlers = createNumberFieldHandlers(DEFAULT_VALUES.MAX);
                  return (
                    <FormItem>
                      <FormLabel>Max</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(handlers.onChange(e))}
                          onBlur={(e) => field.onChange(handlers.onBlur(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="step"
                render={({ field }) => {
                  const handlers = createNumberFieldHandlers(DEFAULT_VALUES.STEP);
                  return (
                    <FormItem>
                      <FormLabel>Step</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field} 
                          onChange={(e) => field.onChange(handlers.onChange(e))}
                          onBlur={(e) => field.onChange(handlers.onBlur(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="hasLink"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setHasLink(!!checked);
                      }}
                      disabled={existingCounters.length === 0}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={existingCounters.length === 0 ? "text-slate-400" : ""}>
                      Link to another counter
                    </FormLabel>
                    {existingCounters.length === 0 && (
                      <p className="text-xs text-slate-400">
                        Create another counter first to enable linking
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {hasLink && existingCounters.length > 0 && (
              <div className="space-y-3 ml-8">
                <FormField
                  control={form.control}
                  name="linkedToCounterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to counter</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select counter to link to..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {existingCounters.map((counter) => (
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
                          placeholder="e.g., 10"
                          {...field} 
                          onChange={(e) => {
                            const handlers = createNumberFieldHandlers(undefined);
                            field.onChange(handlers.onChange(e));
                          }}
                          onBlur={(e) => {
                            const handlers = createNumberFieldHandlers(undefined);
                            field.onChange(handlers.onBlur(e));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="isManuallyDisabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={existingCounters.length === 0}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={existingCounters.length === 0 ? "text-slate-400" : ""}>
                      Disable manual increment
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      {existingCounters.length === 0 
                        ? "Only useful when you have other counters to link to"
                        : "Counter can only be incremented automatically via linking"
                      }
                    </p>
                  </div>
                </FormItem>
              )}
            />

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
                disabled={addCounter.isPending}
              >
                {addCounter.isPending ? "Adding..." : "Add Counter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
