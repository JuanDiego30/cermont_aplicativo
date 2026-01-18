import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotlightCardComponent } from '../../../../shared/components/spotlight-card/spotlight-card.component';
import { CompanyDataService, Service } from '../../../../core/services/company-data.service';

@Component({
  selector: 'app-services-section',
  imports: [CommonModule, SpotlightCardComponent],
  templateUrl: './services-section.component.html',
  styleUrls: ['./services-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesSectionComponent {
  protected readonly companyData = inject(CompanyDataService);
  readonly services: Service[] = this.companyData.getServices();
}
