import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {
  @Input() points: { x: string; y: number }[] = [];

  get pointsAttr(): string {
    if (!this.points || this.points.length <= 1) {
      return '';
    }
    const step = 100 / (this.points.length - 1);
    return this.points
      .map((p, index) => `${index * step},${40 - (p.y || 0)}`)
      .join(' ');
  }
}

