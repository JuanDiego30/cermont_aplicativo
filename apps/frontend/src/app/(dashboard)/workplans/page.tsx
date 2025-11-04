// app/(dashboard)/workplans/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WorkPlanForm from '@/features/workplans/components/WorkPlanForm';
import { Plus, Search } from 'lucide-react';

export default function WorkPlansPage() {
  const [showForm, setShowForm] = useState(false);

  const handleCreateWorkPlan = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // TODO: Refresh workplans list
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            className="mb-4"
          >
            ← Volver
          </Button>
        </div>
        <WorkPlanForm
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cermont-primary">Planes de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestiona los planes de trabajo para las órdenes de servicio
          </p>
        </div>
        <Button
          onClick={handleCreateWorkPlan}
          className="bg-cermont-primary hover:bg-cermont-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Plan de Trabajo
        </Button>
      </div>

      <div className="grid gap-6">
        {/* TODO: Workplans list */}
        <Card>
          <CardHeader>
            <CardTitle>Planes de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de planes de trabajo aparecerá aquí...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}