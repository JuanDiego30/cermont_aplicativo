import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CompanyDataService } from '../../../../core/services/company-data.service';

@Component({
  selector: 'app-landing-footer',
  imports: [CommonModule],
  template: `
    <footer
      class="bg-slate-100 py-16 text-slate-900 dark:bg-slate-950 dark:text-white"
      role="contentinfo"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-4">
          <section aria-labelledby="footer-company">
            <h2 id="footer-company" class="text-lg font-semibold">CERMONT S.A.S.</h2>
            <p class="mt-4 text-sm/7 text-slate-600 dark:text-white/70">
              Mas de {{ companyData.experience() }} anos aportando soluciones en construccion,
              energia, refrigeracion y telecomunicaciones.
            </p>
            <div class="mt-4 flex gap-2">
              @for (cert of companyData.getCertifications(); track cert.acronym) {
                <span
                  class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-white/70"
                >
                  {{ cert.acronym }}
                </span>
              }
            </div>
          </section>

          <nav aria-labelledby="footer-services">
            <h2
              id="footer-services"
              class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/60"
            >
              Servicios
            </h2>
            <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-white/70">
              <li>
                <a href="#servicios" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Construccion</a
                >
              </li>
              <li>
                <a href="#servicios" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Electricidad</a
                >
              </li>
              <li>
                <a href="#servicios" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Refrigeracion</a
                >
              </li>
              <li>
                <a href="#servicios" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Montajes</a
                >
              </li>
              <li>
                <a href="#servicios" class="transition hover:text-slate-900 dark:hover:text-white">
                  Telecomunicaciones
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-company-links">
            <h2
              id="footer-company-links"
              class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/60"
            >
              Empresa
            </h2>
            <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-white/70">
              <li>
                <a href="#about" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Nosotros</a
                >
              </li>
              <li>
                <a href="#about" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Mision y vision</a
                >
              </li>
              <li>
                <a href="#about" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Certificaciones</a
                >
              </li>
              <li>
                <a href="#contacto" class="transition hover:text-slate-900 dark:hover:text-white"
                  >Contacto</a
                >
              </li>
            </ul>
          </nav>

          <address class="not-italic" aria-labelledby="footer-contact">
            <h2
              id="footer-contact"
              class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/60"
            >
              Contacto
            </h2>
            <dl class="mt-4 space-y-4 text-sm text-slate-600 dark:text-white/70">
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/50">
                  Telefonos
                </dt>
                <dd class="mt-2">
                  <a
                    [href]="phoneLink()"
                    class="transition hover:text-slate-900 dark:hover:text-white"
                    >{{ contact.phone }}</a
                  ><br />
                  <a
                    [href]="mobileLink()"
                    class="transition hover:text-slate-900 dark:hover:text-white"
                    >{{ contact.mobile }}</a
                  >
                </dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/50">
                  Email
                </dt>
                <dd class="mt-2">
                  <a
                    [href]="emailLink()"
                    class="transition hover:text-slate-900 dark:hover:text-white"
                    >{{ contact.email }}</a
                  >
                </dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-white/50">
                  Ubicacion
                </dt>
                <dd class="mt-2">{{ contact.address }}</dd>
              </div>
            </dl>
          </address>
        </div>

        <div
          class="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500 dark:border-white/10 dark:text-white/50"
        >
          © <time [attr.datetime]="currentYear">{{ currentYear }}</time> CERMONT S.A.S. Todos los
          derechos reservados.
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {
  readonly companyData = inject(CompanyDataService);
  readonly contact = this.companyData.getContact();
  readonly currentYear = new Date().getFullYear();

  phoneLink = computed(() => `tel:${this.contact.phone.replace(/\s/g, '')}`);
  mobileLink = computed(() => `tel:${this.contact.mobile.replace(/\s/g, '')}`);
  emailLink = computed(() => `mailto:${this.contact.email}`);
}
