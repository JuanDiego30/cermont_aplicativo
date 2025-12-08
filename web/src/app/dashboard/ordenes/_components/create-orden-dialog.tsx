// 📁 web/src/app/dashboard/ordenes/_components/create-orden-dialog.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateOrden } from '@/features/ordenes/hooks/use-ordenes';
import { useState } from 'react';

export function CreateOrdenDialog() {
    const [open, setOpen] = useState(false);
    const { mutate: createOrden, isPending } = useCreateOrden(); // Updated isLoading to isPending for generic use

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified submission logic
        console.log("Create orden not fully implemented yet");
        setOpen(false);
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button>Nueva Orden</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Orden de Trabajo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Placeholder form fields */}
                    <Input placeholder="Número de Orden" required />
                    <Input placeholder="Cliente" required />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isPending}>Crear</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
