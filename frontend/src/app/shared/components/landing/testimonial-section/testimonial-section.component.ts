import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-testimonial-section',
  template: `
    <section class="bg-slate-900 py-20 text-white dark:bg-slate-950" aria-labelledby="trust-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mx-auto max-w-3xl text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-400">
            Confianza
          </p>
          <h2 id="trust-title" class="mt-4 text-3xl font-semibold sm:text-4xl">
            Operaciones seguras y cumplimiento reconocido
          </h2>
          <p class="mt-4 text-base/7 text-white/70">
            Certificaciones CCS y RUC respaldan nuestro compromiso con la seguridad, la calidad y el
            bienestar.
          </p>
        </header>

        <div class="mt-12 grid gap-6 lg:grid-cols-3">
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 class="text-lg font-semibold">Consejo Colombiano de Seguridad</h3>
            <p class="mt-3 text-sm/7 text-white/70">
              Implementamos practicas HSE auditadas y sistemas de gestion alineados con estandares
              nacionales.
            </p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 class="text-lg font-semibold">Registro Uniforme de Contratistas</h3>
            <p class="mt-3 text-sm/7 text-white/70">
              Cumplimos con los requisitos para operar en proyectos de alto impacto del sector
              hidrocarburos.
            </p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 class="text-lg font-semibold">Meta de cero accidentes</h3>
            <p class="mt-3 text-sm/7 text-white/70">
              Nuestra cultura de seguridad prioriza la prevencion, el entrenamiento continuo y el
              trabajo en equipo.
            </p>
          </article>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialSectionComponent {}
