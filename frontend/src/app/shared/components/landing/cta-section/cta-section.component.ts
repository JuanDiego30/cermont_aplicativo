import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CompanyDataService } from '../../../../core/services/company-data.service';

@Component({
  selector: 'app-cta-section',
  imports: [CommonModule],
  template: `
    <section
      id="contacto"
      class="bg-slate-900 py-20 text-white dark:bg-slate-950"
      aria-labelledby="cta-heading"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <article
          class="rounded-3xl border border-white/10 bg-linear-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 p-8 shadow-xl"
        >
          <header class="text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-400">
              Contacto
            </p>
            <h2 id="cta-heading" class="mt-4 text-3xl font-semibold sm:text-4xl">
              Convirtamos tu proximo proyecto en una operacion segura y rentable
            </h2>
            <p class="mt-4 text-base/7 text-white/70">
              Nuestro equipo esta listo para cotizar obras civiles, montajes y servicios
              especializados en todo el pais.
            </p>
          </header>

          <nav
            class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            aria-label="Acciones de contacto"
          >
            <a
              href="#contacto"
              class="inline-flex items-center justify-center gap-3 rounded-xl bg-secondary-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-secondary-500/30 transition hover:-translate-y-0.5 hover:bg-secondary-600"
            >
              Cotizar proyecto
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <a
              [href]="phoneLink()"
              class="inline-flex items-center justify-center gap-3 rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/60 hover:text-white"
            >
              Llamar ahora
              <span>{{ contact.mobile }}</span>
            </a>
          </nav>

          <address class="mt-10 not-italic">
            <dl class="grid gap-4 text-sm text-white/70 sm:grid-cols-3">
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-white/50">Telefono</dt>
                <dd class="mt-2 text-base font-semibold text-white">{{ contact.phone }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-white/50">Email</dt>
                <dd class="mt-2 text-base font-semibold text-white">{{ contact.email }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-white/50">Ubicacion</dt>
                <dd class="mt-2 text-base font-semibold text-white">{{ contact.address }}</dd>
              </div>
            </dl>
          </address>
        </article>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CTASectionComponent {
  private readonly companyData = inject(CompanyDataService);
  readonly contact = this.companyData.getContact();

  readonly phoneLink = computed(() => `tel:${this.contact.mobile.replace(/\s/g, '')}`);
}
