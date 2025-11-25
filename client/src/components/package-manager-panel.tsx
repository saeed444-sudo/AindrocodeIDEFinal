import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Package {
  name: string;
  version: string;
  type: 'npm' | 'pip';
}

interface PackageManagerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
}

export function PackageManagerPanel({ open, onOpenChange, language }: PackageManagerPanelProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [newPackage, setNewPackage] = useState("");

  const pkgType = language === 'python' ? 'pip' : 'npm';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-packages">
        <DialogHeader>
          <DialogTitle>Package Manager - {pkgType.toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Search ${pkgType} packages...`}
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              data-testid="input-package-search"
            />
            <Button
              size="sm"
              onClick={() => {
                if (newPackage) {
                  setPackages([...packages, { name: newPackage, version: 'latest', type: pkgType }]);
                  setNewPackage("");
                }
              }}
              data-testid="button-add-package"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="h-60">
            <div className="pr-4 space-y-2">
              {packages.length === 0 ? (
                <Card className="p-4">
                  <p className="text-xs text-secondary text-center py-4">
                    No packages installed. Coming in Week 4!
                  </p>
                </Card>
              ) : (
                packages.map((pkg, idx) => (
                  <Card key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{pkg.name}</p>
                      <p className="text-xs text-secondary">{pkg.version}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                      data-testid={`button-remove-package-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
