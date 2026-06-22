"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Star,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeAdmin {
  id: string;
  name: string;
  email: string;
}

interface OfficeChildren {
  id: string;
  name: string;
  _count: { members: number };
}

interface Office {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: OfficeChildren[];
  globalAdmin: OfficeAdmin | null;
  globalAdminId: string | null;
  _count: { members: number; feedbackGiven: number };
}

interface OfficeFormData {
  name: string;
  description: string;
  parentId: string;
  globalAdminId: string;
}

const emptyForm: OfficeFormData = {
  name: "",
  description: "",
  parentId: "",
  globalAdminId: "",
};

// ── Hierarchy Tree Node ──────────────────────────────────────────

function TreeNode({
  office,
  allOffices,
  depth = 0,
  onEdit,
  onDelete,
}: {
  office: Office;
  allOffices: Office[];
  depth: number;
  onEdit: (o: Office) => void;
  onDelete: (o: Office) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const children = allOffices.filter((o) => o.parentId === office.id);

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors group",
          depth === 0
            ? "bg-blue-50 border border-blue-100"
            : "hover:bg-slate-50"
        )}
        style={{ marginLeft: depth * 24 }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {children.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {children.length === 0 && <div className="w-4 shrink-0" />}
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {office.name}
            </p>
            <p className="text-xs text-slate-500">
              {office._count.members} members · {office._count.feedbackGiven}{" "}
              feedback
              {office.globalAdmin && ` · Admin: ${office.globalAdmin.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(office)}
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            title="Edit office"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(office)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Delete office"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded &&
        children.map((child) => (
          <TreeNode
            key={child.id}
            office={child}
            allOffices={allOffices}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

// ── Office Form Dialog (Create / Edit) ────────────────────────────

function OfficeFormDialog({
  open,
  onOpenChange,
  offices,
  globalAdmins,
  editingOffice,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  offices: Office[];
  globalAdmins: OfficeAdmin[];
  editingOffice: Office | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<OfficeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingOffice;

  const resetForm = useCallback(() => {
    if (editingOffice) {
      setForm({
        name: editingOffice.name,
        description: editingOffice.description || "",
        parentId: editingOffice.parentId || "",
        globalAdminId: editingOffice.globalAdminId || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [editingOffice]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  // Don't allow selecting the office itself or its children as parent
  const getAvailableParents = () => {
    const excludeIds = new Set<string>();
    if (editingOffice) {
      excludeIds.add(editingOffice.id);
      // Add all descendants
      const addDescendants = (id: string) => {
        offices
          .filter((o) => o.parentId === id)
          .forEach((child) => {
            excludeIds.add(child.id);
            addDescendants(child.id);
          });
      };
      addDescendants(editingOffice.id);
    }
    return offices.filter((o) => !excludeIds.has(o.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/offices/${editingOffice.id}`
        : "/api/offices";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          parentId: form.parentId || null,
          globalAdminId: form.globalAdminId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save office");
      }

      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const availableParents = getAvailableParents();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${editingOffice.name}` : "Create Office"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Office Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. North America HQ"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Brief description of this office..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Office</Label>
            <Select
              value={form.parentId}
              onValueChange={(v) => setForm({ ...form, parentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="None (top-level office)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (top-level office)</SelectItem>
                {availableParents.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Set a parent to create a sub-office in the hierarchy.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin">Office Admin</Label>
            <Select
              value={form.globalAdminId}
              onValueChange={(v) => setForm({ ...form, globalAdminId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No admin assigned</SelectItem>
                {globalAdmins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Assign a Global Admin to manage this office.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Office"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────────────

function DeleteDialog({
  office,
  open,
  onOpenChange,
  onDeleted,
}: {
  office: Office | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!office) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/offices/${office.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.children) {
          throw new Error(
            `Cannot delete "${office.name}" — it has child offices: ${data.children.join(", ")}. Remove or reassign the children first.`
          );
        }
        throw new Error(data.error || "Failed to delete office");
      }

      onOpenChange(false);
      onDeleted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Office</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Are you sure?</p>
              <p className="text-amber-700 mt-1">
                This will delete <strong>{office.name}</strong> and unlink all
                its members. Users will lose their office association.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Office
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Notification Banner ───────────────────────────────────────────

function Notification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm animate-slide-up max-w-md",
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [globalAdmins, setGlobalAdmins] = useState<OfficeAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingOffice, setDeletingOffice] = useState<Office | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Notification
  const [notif, setNotif] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const closeNotif = useCallback(() => setNotif(null), []);

  const showNotif = useCallback(
    (message: string, type: "success" | "error") => {
      setNotif({ message, type });
    },
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const [officesRes, usersRes] = await Promise.all([
        fetch("/api/offices"),
        fetch("/api/users?role=GLOBAL_ADMIN"),
      ]);
      const officesData: Office[] = await officesRes.json();
      const usersData: OfficeAdmin[] = await usersRes.json();
      setOffices(officesData);
      setGlobalAdmins(usersData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rootOffices = offices.filter((o) => !o.parentId);
  const filteredRootOffices = rootOffices.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Flat list of all offices (for search mode)
  const filteredAll = offices.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (office: Office) => {
    setEditingOffice(office);
    setEditOpen(true);
  };

  const handleDelete = (office: Office) => {
    setDeletingOffice(office);
    setDeleteOpen(true);
  };

  const handleSaved = useCallback(() => {
    fetchData();
    showNotif("Office saved successfully.", "success");
  }, [fetchData, showNotif]);

  const handleDeleted = useCallback(() => {
    fetchData();
    showNotif("Office deleted successfully.", "success");
  }, [fetchData, showNotif]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Notification */}
      {notif && (          <Notification
              message={notif.message}
              type={notif.type}
              onClose={closeNotif}
            />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Offices</h2>
          <p className="text-sm text-slate-500">
            Manage your organizational hierarchy
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Office
            </Button>
          </DialogTrigger>
          <OfficeFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            offices={offices}
            globalAdmins={globalAdmins}
            editingOffice={null}
            onSaved={handleSaved}
          />
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Offices"
          value={offices.length}
          icon={Building2}
          color="blue"
        />
        <KpiCard
          title="Total Members"
          value={offices.reduce((s, o) => s + o._count.members, 0)}
          icon={Users}
          color="teal"
        />
        <KpiCard
          title="Total Feedback"
          value={offices.reduce((s, o) => s + o._count.feedbackGiven, 0)}
          icon={Star}
          color="amber"
        />
        <KpiCard
          title="Top-Level Offices"
          value={rootOffices.length}
          icon={Building2}
          color="slate"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search offices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Office List / Hierarchy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {search ? "Search Results" : "Organization Hierarchy"}
          </CardTitle>
          {offices.length > 0 && !search && (
            <span className="text-xs text-slate-400">
              Hover over an office to edit or delete
            </span>
          )}
        </CardHeader>
        <CardContent>
          {offices.length === 0 ? (
            <EmptyState
              title="No offices"
              description="Create your first office to start building your organizational hierarchy."
              actionLabel="Create Office"
              onAction={() => setCreateOpen(true)}
            />
          ) : search ? (
            // Flat search results
            <div className="space-y-1">
              {filteredAll.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No offices match your search.
                </p>
              ) : (
                filteredAll.map((office) => (
                  <div
                    key={office.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {office.parent && (
                            <span className="text-xs text-slate-400 font-normal">
                              {office.parent.name} /{" "}
                            </span>
                          )}
                          {office.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {office._count.members} members ·{" "}
                          {office._count.feedbackGiven} feedback
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(office)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(office)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`/dashboard/office/${office.id}`}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="View"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : filteredRootOffices.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No offices match your search.
            </p>
          ) : (
            // Hierarchy tree
            <div className="space-y-1">
              {filteredRootOffices.map((office) => (
                <TreeNode
                  key={office.id}
                  office={office}
                  allOffices={offices}
                  depth={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <OfficeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        offices={offices}
        globalAdmins={globalAdmins}
        editingOffice={editingOffice}
        onSaved={handleSaved}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        office={deletingOffice}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
