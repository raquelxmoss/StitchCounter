import { Project, Counter } from "@shared/schema";

const STORAGE_KEY = "stitchcounter_projects";

export class LocalStorage {
  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const projects = JSON.parse(data);
      return projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        counters: p.counters.map((c: any) => ({
          ...c,
          isManuallyDisabled: c.isManuallyDisabled ?? false,
        })),
      }));
    } catch (error) {
      console.error("Failed to load projects:", error);
      return [];
    }
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects:", error);
    }
  }

  static addProject(project: Project): void {
    const projects = this.getProjects();
    projects.push(project);
    this.saveProjects(projects);
  }

  static updateProject(projectId: string, updates: Partial<Project>): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      this.saveProjects(projects);
    }
  }

  static deleteProject(projectId: string): void {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    this.saveProjects(projects);
  }

  static updateCounter(projectId: string, counterId: string, updates: Partial<Counter>): void {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const counter = project.counters.find(c => c.id === counterId);
      if (counter) {
        Object.assign(counter, updates);
        this.saveProjects(projects);
      }
    }
  }

  static incrementCounter(projectId: string, counterId: string): { project: Project; triggeredCounters: Counter[] } {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    const triggeredCounters: Counter[] = [];
    
    if (project) {
      const counter = project.counters.find(c => c.id === counterId);
      if (counter) {
        const newValue = Math.min(counter.value + counter.step, counter.max);
        counter.value = newValue;
        
        // Check for linked counters
        project.counters.forEach(linkedCounter => {
          if (linkedCounter.linkedToCounterId === counterId && linkedCounter.triggerValue) {
            if (newValue % linkedCounter.triggerValue === 0 && newValue > 0) {
              const linkedNewValue = Math.min(linkedCounter.value + linkedCounter.step, linkedCounter.max);
              linkedCounter.value = linkedNewValue;
              triggeredCounters.push(linkedCounter);
            }
          }
        });
        
        this.saveProjects(projects);
      }
    }
    
    return { project: project!, triggeredCounters };
  }

  static decrementCounter(projectId: string, counterId: string): void {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const counter = project.counters.find(c => c.id === counterId);
      if (counter) {
        counter.value = Math.max(counter.value - counter.step, counter.min);
        this.saveProjects(projects);
      }
    }
  }

  static resetCounter(projectId: string, counterId: string): void {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const counter = project.counters.find(c => c.id === counterId);
      if (counter) {
        // Reset the main counter
        counter.value = counter.min;
        
        // Reset all child counters that are linked to this counter
        project.counters.forEach(childCounter => {
          if (childCounter.linkedToCounterId === counterId) {
            childCounter.value = childCounter.min;
          }
        });
        
        this.saveProjects(projects);
      }
    }
  }

  static addCounter(projectId: string, counter: Counter): void {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // Ensure the new field has a default value for existing data
      const counterWithDefaults = {
        ...counter,
        isManuallyDisabled: counter.isManuallyDisabled ?? false,
      };
      project.counters.push(counterWithDefaults);
      this.saveProjects(projects);
    }
  }

  static deleteCounter(projectId: string, counterId: string): void {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.counters = project.counters.filter(c => c.id !== counterId);
      this.saveProjects(projects);
    }
  }
}
