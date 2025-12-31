import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ai-sidebar-history',
    standalone: true,
    imports: [CommonModule],
    template: `<div>AI Sidebar History</div>`
})
export class AiSidebarHistoryComponent {
    @Input() isSidebarOpen = false;
    @Output() closeSidebar = new EventEmitter<void>();
}
