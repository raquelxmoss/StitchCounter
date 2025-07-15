import { Settings, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { AddProjectModal } from "@/components/add-project-modal";
import { useProjects } from "@/hooks/use-projects";
import { useState } from "react";

export default function Home() {
  const { data: projects = [], isLoading } = useProjects();
  const [showAddProject, setShowAddProject] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scissors className="text-primary text-xl" />
              <h1 className="text-xl font-semibold text-slate-900">StitchCounter</h1>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="text-slate-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="px-4 py-4 space-y-4">
          {projects.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Scissors className="text-slate-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Projects Yet</h3>
              <p className="text-slate-500 mb-6">Create your first knitting project to start tracking your progress.</p>
              <Button 
                className="bg-primary text-white px-6 py-3 hover:bg-primary/90"
                onClick={() => setShowAddProject(true)}
              >
                Create Project
              </Button>
            </div>
          ) : (
            // Projects List
            projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onAddCounter={() => {}} // Handled within ProjectCard
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-20"
        onClick={() => setShowAddProject(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>

      <AddProjectModal
        open={showAddProject}
        onOpenChange={setShowAddProject}
      />
    </div>
  );
}
