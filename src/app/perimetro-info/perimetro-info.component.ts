import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PerimetroData {
  name: string;
  method: string;
  sectionCount: number;
  sections: string[];
  description: string;
  pointsCount: number | string;
}

@Component({
  selector: 'app-perimetro-info',
  templateUrl: './perimetro-info.component.html',
  styleUrls: ['./perimetro-info.component.scss'],
  imports: [CommonModule]
})
export class PerimetroInfoComponent {
  @Input() isVisible: boolean = false;
  @Input() perimetroData: PerimetroData | null = null;
  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
