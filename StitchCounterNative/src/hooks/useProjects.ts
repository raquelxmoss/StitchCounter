import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, Counter, InsertProject } from "../types/schema";
import { AppStorage } from "../lib/storage";
import { Alert } from "react-native";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("useProjects: Fetching projects from storage");
      const projects = await AppStorage.getProjects();
      console.log("useProjects: Fetched projects:", projects);
      return projects;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertProject) => {
      try {
        console.log("useAddProject: Starting project creation with data:", data);
        
        const project: Project = {
          ...data,
          id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          counters: [],
          isActive: true,
          isExpanded: true,
        };
        
        console.log("useAddProject: Created project object:", project);
        
        await AppStorage.addProject(project);
        console.log("useAddProject: Successfully added project to storage");
        
        return project;
      } catch (error) {
        console.error("useAddProject: Error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("useAddProject: onSuccess called with data:", data);
      console.log("useAddProject: Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.refetchQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("useAddProject: onError called with error:", error);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) =>
      AppStorage.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error updating project:", error);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => AppStorage.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
    },
  });
}

export function useIncrementCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) =>
      AppStorage.incrementCounter(projectId, counterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error incrementing counter:", error);
    },
  });
}

export function useDecrementCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) =>
      AppStorage.decrementCounter(projectId, counterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error decrementing counter:", error);
    },
  });
}

export function useResetCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) =>
      AppStorage.resetCounter(projectId, counterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error resetting counter:", error);
    },
  });
}

export function useAddCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counter }: { projectId: string; counter: Counter }) =>
      AppStorage.addCounter(projectId, counter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error adding counter:", error);
    },
  });
}

export function useDeleteCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counterId }: { projectId: string; counterId: string }) =>
      AppStorage.deleteCounter(projectId, counterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error deleting counter:", error);
    },
  });
}

export function useUpdateCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, counterId, updates }: { projectId: string; counterId: string; updates: Partial<Counter> }) =>
      AppStorage.updateCounter(projectId, counterId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error updating counter:", error);
    },
  });
}