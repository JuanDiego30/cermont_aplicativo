import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CompanyDataService } from '../../../../core/services/company-data.service';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  protected readonly companyData = inject(CompanyDataService);
  readonly stats = this.companyData.getStats();
  readonly experience = this.companyData.experience;
}
