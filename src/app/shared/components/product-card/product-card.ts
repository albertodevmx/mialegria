import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product: any;

  get iconSrc(): string {
    const name = (this.product?.familiaWeb || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[''`]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    return 'img/iconos/' + name + '.svg';
  }
}
