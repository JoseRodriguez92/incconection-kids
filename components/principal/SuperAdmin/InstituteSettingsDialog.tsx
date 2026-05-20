"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Save, Loader2, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { InstituteStore } from "@/Stores/InstituteStore";
import { toast } from "sonner";

interface InstituteSettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (logoUrl: string) => void;
}

export function InstituteSettingsDialog({ open, onOpenChange, onSaved }: InstituteSettingsDialogProps) {
  const institute       = InstituteStore((s) => s.institute);
  const updateInstitute = InstituteStore((s) => s.updateInstitute);

  const [name,        setName]        = useState("");
  const [slogan,      setSlogan]      = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !institute) return;
    setName((institute as any).name    ?? "");
    setSlogan((institute as any).slogan ?? "");
    setLogoPreview((institute as any).logo_url ?? "");
  }, [open, institute]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institute) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext      = file.name.split(".").pop();
      const filePath = `institute/${(institute as any).id}_${Date.now()}.${ext}`;

      const { data: up, error: upErr } = await supabase.storage
        .from("profiles-avatars")
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("profiles-avatars").getPublicUrl(up.path);
      setLogoPreview(pub.publicUrl);
      toast.success("Logo subido — guarda para aplicar los cambios");
    } catch (err: any) {
      toast.error("Error al subir el logo: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInstitute?.({
        name:    name.trim()   || undefined,
        slogan:  slogan.trim() || undefined,
        logo_url: logoPreview  || undefined,
      } as any);
      onSaved?.(logoPreview);
      toast.success("Instituto actualizado correctamente");
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#25305D]">
            <Building2 className="w-4 h-4" />
            Configuración del Instituto
          </DialogTitle>
        </DialogHeader>

        {/* Logo upload */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative group w-40 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {logoPreview
              ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-2" />
              : <Camera className="w-8 h-8 text-gray-400" />
            }
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {uploading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />
              }
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Clic para cambiar el logo</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Nombre del instituto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Slogan / Subtítulo</Label>
            <Input
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="h-9 text-sm"
              placeholder="Aparece debajo del nombre en documentos"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full bg-[#25305D] hover:bg-[#1a2347]"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
            : <><Save className="w-4 h-4 mr-2" />Guardar cambios</>
          }
        </Button>
      </DialogContent>
    </Dialog>
  );
}
