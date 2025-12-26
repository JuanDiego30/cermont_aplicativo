import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotlightCardComponent } from '../../../../shared/components/spotlight-card/spotlight-card.component';
import { ServicesService } from '../../../../core/services/services.service';
import { Service } from '../../../../core/models/service.model';

@Component({
    selector: 'app-services-section',
    standalone: true,
    imports: [CommonModule, SpotlightCardComponent],
    templateUrl: './services-section.component.html',
    styleUrls: ['./services-section.component.css']
})
export class ServicesSectionComponent implements OnInit {
    private readonly servicesService = inject(ServicesService);

    services: Service[] = [];

    ngOnInit(): void {
        this.services = this.servicesService.getServices();
    }

    getColorClasses(color: string): string {
        const colorMap: Record<string, string> = {
            primary: 'from-cermont-primary-500 to-cermont-primary-700',
            secondary: 'from-cermont-secondary-500 to-cermont-secondary-700',
            success: 'from-success-500 to-success-700',
            warning: 'from-warning-500 to-warning-700'
        };
        return colorMap[color] || colorMap['primary'];
    }
}
