import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CompanyDataService } from '../../../../core/services/company-data.service';

@Component({
  selector: 'app-about-section',
  imports: [CommonModule],
  template: `
    <section
      id="about"
      class="bg-white py-20 text-slate-900 dark:bg-slate-900 dark:text-white"
      aria-labelledby="about-title"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mx-auto max-w-3xl text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-500">
            Desde <time datetime="2008-06-12">2008</time>
          </p>
          <h2 id="about-title" class="mt-4 text-3xl font-semibold sm:text-4xl">
            Cermont SAS, aliados para cada fase del proyecto
          </h2>
          <p class="mt-4 text-base/7 text-slate-600 dark:text-slate-300">
            Operamos en todo el territorio nacional con equipos tecnicos especializados, procesos de
            calidad y compromiso sostenible para el sector de hidrocarburos y construccion.
          </p>
        </header>

        <article class="mt-12 grid gap-6 lg:grid-cols-2">
          <section
            class="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800"
          >
            <header class="flex items-center justify-between gap-4">
              <h3 class="text-lg font-semibold">Mision</h3>
              <span class="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-500"
                >Servicio</span
              >
            </header>
            <p class="mt-4 text-sm/7 text-slate-600 dark:text-slate-200">
              {{ mission }}
            </p>
          </section>

          <section
            class="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800"
          >
            <header class="flex items-center justify-between gap-4">
              <h3 class="text-lg font-semibold">Vision 2026</h3>
              <span class="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-500"
                >Crecimiento</span
              >
            </header>
            <p class="mt-4 text-sm/7 text-slate-600 dark:text-slate-200">
              {{ vision }}
            </p>
          </section>
        </article>

        <section class="mt-12" aria-labelledby="values-title">
          <header class="text-center">
            <h3 id="values-title" class="text-2xl font-semibold">Valores corporativos</h3>
            <p class="mt-3 text-sm/7 text-slate-600 dark:text-slate-300">
              Guiamos cada operacion con seguridad, trabajo en equipo y mejora continua.
            </p>
          </header>
          <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (value of values; track value) {
              <li
                class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {{ value }}
              </li>
            }
          </ul>
        </section>

        <section class="mt-12" aria-labelledby="certifications-title">
          <header class="text-center">
            <h3 id="certifications-title" class="text-2xl font-semibold">Certificaciones</h3>
            <p class="mt-3 text-sm/7 text-slate-600 dark:text-slate-300">
              Cumplimos con los estandares exigidos por el Consejo Colombiano de Seguridad y el RUC.
            </p>
          </header>
          <ul class="mt-6 grid gap-4 sm:grid-cols-2">
            @for (certification of certifications; track certification.acronym) {
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 text-center dark:border-slate-800 dark:bg-slate-800"
              >
                <strong class="text-xl font-semibold text-slate-900 dark:text-white">
                  {{ certification.acronym }}
                </strong>
                <p class="mt-2 text-sm/7 text-slate-600 dark:text-slate-300">
                  {{ certification.name }}
                </p>
              </li>
            }
          </ul>
        </section>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSectionComponent {
  private readonly companyData = inject(CompanyDataService);
  readonly mission = this.companyData.getMission();
  readonly vision = this.companyData.getVision();
  readonly values = this.companyData.getValues();
  readonly certifications = this.companyData.getCertifications();
}
