import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  FolderIcon,
  PlusIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { statePersistence } from "@/lib/state-persistence";
import type { Project } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      await storage.init();
      const projects = await storage.getAllProjects();
      setRecentProjects(projects);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    try {
      const project = await storage.createProject({
        name: projectName,
        description: projectDescription,
      });

      toast({
        title: "Project Created",
        description: `${project.name} is ready to use`,
      });

      setCreateDialogOpen(false);
      setProjectName("");
      setProjectDescription("");
      setLocation(`/editor?project=${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleRestoreSnapshot = async () => {
    try {
      const snapshot = await statePersistence.restoreLatestSnapshot();
      if (snapshot) {
        toast({
          title: "Snapshot Restored",
          description: "Your last session has been restored",
        });
      } else {
        toast({
          title: "No Snapshot Found",
          description: "No previous session to restore",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore snapshot",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject || !projectName.trim()) return;

    try {
      await storage.updateProject(editingProject.id, {
        name: projectName,
        description: projectDescription,
      });

      toast({
        title: "Project Updated",
        description: "Project details have been saved",
      });

      setEditDialogOpen(false);
      setEditingProject(null);
      setProjectName("");
      setProjectDescription("");
      await loadProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProject(project);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    try {
      await storage.deleteProject(deletingProject.id);

      toast({
        title: "Project Deleted",
        description: `${deletingProject.name} has been removed`,
      });

      setDeleteConfirmOpen(false);
      setDeletingProject(null);
      await loadProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (recentProjects.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-2xl w-full px-4 sm:px-6 space-y-8 sm:space-y-12">
            {/* Welcome Section */}
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg">
                  <CodeBracketIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-welcome-title">
                  Welcome to AindroCode
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  A fully local, browser-based IDE that runs 50+ programming languages using WebAssembly. Edit, run, and manage code entirely offline.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-4 sm:p-5 space-y-2 rounded-xl bg-white/50 dark:bg-white/5 border border-primary/10 hover-elevate">
                <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <CodeBracketIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">50+ Languages</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Python, JavaScript, C++, Go, Rust, and more
                </p>
              </div>
              <div className="text-center p-4 sm:p-5 space-y-2 rounded-xl bg-white/50 dark:bg-white/5 border border-secondary/10 hover-elevate">
                <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">Fully Offline</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Auto-save & state recovery
                </p>
              </div>
              <div className="text-center p-4 sm:p-5 space-y-2 rounded-xl bg-white/50 dark:bg-white/5 border border-accent/10 hover-elevate">
                <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
                  <InformationCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">AI Assist</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  With your API key
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <Badge variant="default" className="flex-shrink-0">Future</Badge>
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <CardTitle className="text-base sm:text-lg">Native Android APK</CardTitle>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                      Embedded Linux userspace with full compilers, package managers, and persistent filesystem.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Create Project Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 px-6 py-2.5 text-base sm:text-base w-full sm:w-auto shadow-lg hover-elevate"
                data-testid="button-create-project"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Create Your First Project</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent data-testid="dialog-create-project">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Give your project a name to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  data-testid="input-project-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description (Optional)</Label>
                <Input
                  id="project-description"
                  placeholder="What's this project about?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  data-testid="input-project-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                data-testid="button-confirm-create"
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Projects list view
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <CodeBracketIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AindroCode</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestoreSnapshot}
            data-testid="button-restore-snapshot"
            title="Restore"
            className="h-8 w-8"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            data-testid="button-settings"
            title="Settings"
            className="h-8 w-8"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
            data-testid="button-new-project"
          >
            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-auto w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">Your Projects</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Saved locally and persist across sessions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover-elevate transition-all group bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900 dark:to-slate-800"
                onClick={() => setLocation(`/editor?project=${project.id}`)}
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderIcon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditProject(project, e)}
                        className="h-7 w-7"
                        title="Edit project"
                        data-testid={`button-edit-project-${project.id}`}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(project, e)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Delete project"
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 sm:pt-0">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-project">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Give your project a name to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="my-awesome-project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="input-project-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Input
                id="project-description"
                placeholder="What's this project about?"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                data-testid="input-project-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setCreateDialogOpen(false)}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim()}
              data-testid="button-confirm-create"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-project">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                placeholder="my-awesome-project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="input-edit-project-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description (Optional)</Label>
              <Input
                id="edit-project-description"
                placeholder="What's this project about?"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                data-testid="input-edit-project-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!projectName.trim()}
              data-testid="button-confirm-edit"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deletingProject?.name}</strong> and all its files. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(false)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
