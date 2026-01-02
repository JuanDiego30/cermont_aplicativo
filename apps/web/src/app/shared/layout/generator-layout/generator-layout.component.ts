
import { Component } from '@angular/core';
import { AiSidebarHistoryComponent } from '../../components/ai/ai-sidebar-history/ai-sidebar-history.component';

@Component({
  selector: 'app-generator-layout',
  imports: [AiSidebarHistoryComponent],
  templateUrl: './generator-layout.component.html',
  styles: ``,
})
export class GeneratorLayoutComponent {
  sidebarOpen = true;

  closeSidebar = () => {
    this.sidebarOpen = false;
  };
}
