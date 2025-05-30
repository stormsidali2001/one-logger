import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { name: string; description?: string };
  onSubmit: (data: { name: string; description: string }) => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export function ProjectFormModal({ open, onOpenChange, initialData, onSubmit, loading, mode }: ProjectFormModalProps) {
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (open) {
      setForm({ name: initialData?.name || '', description: initialData?.description || '' });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="project-desc">Description</Label>
            <Input
              id="project-desc"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 