import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, Counter, InsertProject } from "@shared/schema";
import { LocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => LocalStorage.getProjects(),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertProject) => {
      try {
        console.log("useAddProject: Starting project creation with data:", data);
        
        const project: Project = {
          ...data,
          id: crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          counters: [],
        };
        
        console.log("useAddProject: Created project object:", project);
        
        LocalStorage.addProject(project);
        console.log("useAddProject: Successfully added project to localStorage");
        
        return Promise.resolve(project);
      } catch (error) {
        console.error("useAddProject: Error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("useAddProject: onSuccess called with data:", data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project created successfully!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("useAddProject: onError called with error:", error);
      toast({
        title: "Failed to create project",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
      LocalStorage.updateProject(projectId, updates);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast({
        title: "Failed to update project",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (projectId: string) => {
      LocalStorage.deleteProject(projectId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project deleted successfully!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete project",
        variant: "destructive",
      });
    },
  });
}

export function useIncrementCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) => {
      const result = LocalStorage.incrementCounter(projectId, counterId);
      return Promise.resolve(result);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast({
        title: "Failed to update counter",
        variant: "destructive",
      });
    },
  });
}

export function useDecrementCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) => {
      const result = LocalStorage.decrementCounter(projectId, counterId);
      return Promise.resolve(result);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast({
        title: "Failed to update counter",
        variant: "destructive",
      });
    },
  });
}

export function useResetCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) => {
      LocalStorage.resetCounter(projectId, counterId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Counter reset successfully!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reset counter",
        variant: "destructive",
      });
    },
  });
}

export function useAddCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counter }: { projectId: string; counter: Omit<Counter, "id"> }) => {
      const newCounter: Counter = {
        ...counter,
        id: crypto?.randomUUID?.() || `counter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      LocalStorage.addCounter(projectId, newCounter);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Counter added successfully!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add counter",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counterId, updates }: { projectId: string; counterId: string; updates: Partial<Counter> }) => {
      LocalStorage.updateCounter(projectId, counterId, updates);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Counter updated successfully!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update counter",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCounter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) => {
      LocalStorage.deleteCounter(projectId, counterId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Counter deleted successfully!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete counter",
        variant: "destructive",
      });
    },
  });
}
