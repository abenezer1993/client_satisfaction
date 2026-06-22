"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  _count: { services: number };
}

interface ServiceWithCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

interface ServicesManagerProps {
  officeId: string;
}

export function ServicesManager({ officeId }: ServicesManagerProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<ServiceWithCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "service"; item: any } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcCategoryId, setSvcCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Notification
  const [notif, setNotif] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotif = useCallback((message: string, type: "success" | "error") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetch(`/api/service-categories?officeId=${officeId}`),
        fetch(`/api/services?officeId=${officeId}`),
      ]);
      const catData = await catRes.json();
      const svcData = await svcRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
      setServices(Array.isArray(svcData) ? svcData : []);
    } catch {
      setCategories([]);
      setServices([]);
      showNotif("Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  }, [officeId, showNotif]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Category CRUD ──

  const openCreateCategory = () => {
    setEditingCat(null);
    setCatName("");
    setCatDesc("");
    setError("");
    setCatDialogOpen(true);
  };

  const openEditCategory = (cat: ServiceCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || "");
    setError("");
    setCatDialogOpen(true);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSaving(true);
    setError("");

    try {
      const url = editingCat
        ? `/api/service-categories/${editingCat.id}`
        : "/api/service-categories";
      const method = editingCat ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDesc.trim() || null,
          officeId,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      setCatDialogOpen(false);
      fetchData();
      showNotif(
        editingCat ? "Category updated" : "Category created",
        "success"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Service CRUD ──

  const openCreateService = (preselectedCategoryId?: string) => {
    setEditingService(null);
    setSvcName("");
    setSvcDesc("");
    setSvcCategoryId(preselectedCategoryId || "");
    setError("");
    setServiceDialogOpen(true);
  };

  const openEditService = (svc: ServiceWithCategory) => {
    setEditingService(svc);
    setSvcName(svc.name);
    setSvcDesc(svc.description || "");
    setSvcCategoryId(svc.categoryId || "");
    setError("");
    setServiceDialogOpen(true);
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName.trim()) return;
    setSaving(true);
    setError("");

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svcName.trim(),
          description: svcDesc.trim() || null,
          categoryId: svcCategoryId || null,
          officeId,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      setServiceDialogOpen(false);
      fetchData();
      showNotif(
        editingService ? "Service updated" : "Service created",
        "success"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──

  const confirmDelete = (type: "category" | "service", item: any) => {
    setDeleteTarget({ type, item });
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");

    try {
      const url =
        deleteTarget.type === "category"
          ? `/api/service-categories/${deleteTarget.item.id}`
          : `/api/services/${deleteTarget.item.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
      setDeleteOpen(false);
      fetchData();
      showNotif(
        deleteTarget.type === "category"
          ? "Category and its services deleted"
          : "Service deleted",
        "success"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Uncategorized services ──
  const uncategorizedServices = services.filter((s) => !s.categoryId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notif && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg border text-sm",
            notif.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          {notif.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{notif.message}</span>
          <button onClick={() => setNotif(null)} className="shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={openCreateCategory}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openCreateService()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services by Category */}
      {categories.length === 0 && uncategorizedServices.length === 0 ? (
        <EmptyState
          title="No services configured"
          description="Add service categories and services that your office offers. Users will select these when giving feedback."
          actionLabel="Add First Category"
          onAction={openCreateCategory}
        />
      ) : (
        <div className="space-y-4">
          {/* Categories with services */}
          {categories.map((cat) => {
            const catServices = services.filter(
              (s) => s.categoryId === cat.id
            );
            return (
              <Card key={cat.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-sm font-semibold">
                      {cat.name}
                    </CardTitle>
                    <span className="text-xs text-slate-400">
                      ({catServices.length} service
                      {catServices.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openCreateService(cat.id)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Add service to this category"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Edit category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete("category", cat)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardHeader>
                {cat.description && (
                  <p className="px-4 pb-2 text-xs text-slate-500">
                    {cat.description}
                  </p>
                )}
                <CardContent className="px-4 pb-4">
                  {catServices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No services in this category yet.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {catServices.map((svc) => (
                        <div
                          key={svc.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 group"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {svc.name}
                            </p>
                            {svc.description && (
                              <p className="text-xs text-slate-500">
                                {svc.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditService(svc)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete("service", svc)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Uncategorized services */}
          {uncategorizedServices.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    Uncategorized
                  </CardTitle>
                  <span className="text-xs text-slate-400">
                    ({uncategorizedServices.length} service
                    {uncategorizedServices.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {uncategorizedServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 group"
                  >
                    <p className="text-sm text-slate-900">{svc.name}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditService(svc)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete("service", svc)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Category Dialog ── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveCategory} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cat-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Technical Support"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCatDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !catName.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingCat ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Service Dialog ── */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveService} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="svc-name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="svc-name"
                placeholder="e.g. Phone Support"
                value={svcName}
                onChange={(e) => setSvcName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Description</Label>
              <Textarea
                id="svc-desc"
                placeholder="Brief description..."
                value={svcDesc}
                onChange={(e) => setSvcDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-cat">Category</Label>
              <Select
                value={svcCategoryId}
                onValueChange={setSvcCategoryId}
              >
                <SelectTrigger id="svc-cat">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !svcName.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingService ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Are you sure?</p>
                <p className="text-amber-700 mt-1">
                  {deleteTarget?.type === "category"
                    ? `This will delete "${deleteTarget?.item?.name}" and ALL services within it.`
                    : `This will delete "${deleteTarget?.item?.name}". Feedback linked to this service will be unlinked.`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
