import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Counter } from "./counter";
import { AddCounterModal } from "./add-counter-modal";
import { EditCounterModal } from "./edit-counter-modal";
import { useState } from "react";
import { 
  useUpdateProject, 
  useDeleteProject, 
  useIncrementCounter, 
  useDecrementCounter, 
  useResetCounter, 
  useDeleteCounter 
} from "@/hooks/use-projects";

interface ProjectCardProps {
  project: Project;
  onAddCounter: () => void;
}

export function ProjectCard({ project, onAddCounter }: ProjectCardProps) {
  const [showAddCounter, setShowAddCounter] = useState(false);
  const [showEditCounter, setShowEditCounter] = useState(false);
  const [editingCounter, setEditingCounter] = useState<typeof project.counters[0] | null>(null);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const incrementCounter = useIncrementCounter();
  const decrementCounter = useDecrementCounter();
  const resetCounter = useResetCounter();
  const deleteCounter = useDeleteCounter();

  const toggleExpanded = () => {
    updateProject.mutate({
      projectId: project.id,
      updates: { isExpanded: !project.isExpanded }
    });
  };

  const toggleActive = () => {
    updateProject.mutate({
      projectId: project.id,
      updates: { isActive: !project.isActive }
    });
  };

  const handleDeleteProject = () => {
    deleteProject.mutate(project.id);
  };

  const handleIncrementCounter = (counterId: string) => {
    incrementCounter.mutate({ projectId: project.id, counterId });
  };

  const handleDecrementCounter = (counterId: string) => {
    decrementCounter.mutate({ projectId: project.id, counterId });
  };

  const handleResetCounter = (counterId: string) => {
    resetCounter.mutate({ projectId: project.id, counterId });
  };

  const handleDeleteCounter = (counterId: string) => {
    deleteCounter.mutate({ projectId: project.id, counterId });
  };

  const handleEditCounter = (counter: typeof project.counters[0]) => {
    setEditingCounter(counter);
    setShowEditCounter(true);
  };

  const getLinkedCounters = (counterId: string) => {
    return project.counters.filter(c => c.linkedToCounterId === counterId);
  };

  const isCounterLinked = (counterId: string) => {
    return project.counters.some(c => c.linkedToCounterId === counterId);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${project.isActive ? 'bg-secondary' : 'bg-slate-400'}`} />
              <h2 className="text-lg font-medium text-slate-900">{project.name}</h2>
              <Badge variant={project.isActive ? "default" : "secondary"} className={project.isActive ? "bg-secondary/10 text-secondary" : ""}>
                {project.isActive ? "Active" : "Completed"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleActive}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Mark as {project.isActive ? "Completed" : "Active"}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This will also delete all counters. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleExpanded}
              >
                {project.isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {!project.isExpanded && (
            <div className="text-sm text-slate-500">
              {project.counters.length} counter{project.counters.length !== 1 ? 's' : ''}
            </div>
          )}

          {project.isExpanded && (
            <div className="space-y-4">
              {project.counters.map((counter) => (
                <Counter
                  key={counter.id}
                  counter={counter}
                  projectId={project.id}
                  isLinked={isCounterLinked(counter.id)}
                  linkedCounters={project.counters}
                  onIncrement={() => handleIncrementCounter(counter.id)}
                  onDecrement={() => handleDecrementCounter(counter.id)}
                  onReset={() => handleResetCounter(counter.id)}
                  onEdit={() => handleEditCounter(counter)}
                  onDelete={() => handleDeleteCounter(counter.id)}
                />
              ))}

              <Button
                variant="outline"
                className="w-full p-4 border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-colors h-auto"
                onClick={() => setShowAddCounter(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Counter
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddCounterModal
        projectId={project.id}
        existingCounters={project.counters}
        open={showAddCounter}
        onOpenChange={setShowAddCounter}
      />

      <EditCounterModal
        projectId={project.id}
        counter={editingCounter}
        existingCounters={project.counters}
        open={showEditCounter}
        onOpenChange={setShowEditCounter}
      />
    </>
  );
}
