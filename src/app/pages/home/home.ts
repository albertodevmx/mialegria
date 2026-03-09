import { Component, OnInit, inject, computed, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchesService } from './../../services/branches.service';
import { BranchesStore } from './../../stores/branches.store';
import { MatIconModule } from '@angular/material/icon';
import { ProductCard } from './../../shared/components/product-card/product-card';
import { MatDialog } from '@angular/material/dialog';
import { BranchesDialogComponent } from './../../shared/components/direccion/branches-dialog/branches-dialog.component';

type FamiliaWebItem = {
	idFamiliaWeb: number;
	familiaWeb: string;
	idSubFamiliaWeb: number;
	subFamiliaWeb: string;
};

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		ProductCard
	],
	templateUrl: './home.html',
	styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
	private branchesService = inject(BranchesService);
	private branchesStore = inject(BranchesStore);
	private el = inject(ElementRef);
	private dialog = inject(MatDialog);

	familias = this.branchesStore.webFamilies;
	topProducts = this.branchesStore.topProducts;
	selectedSucursal = this.branchesStore.selectedSucursal;

	constructor() {
		effect(() => {
			const fams = this.familias();
			if (fams.length > 0) {
				setTimeout(() => this.equalizeCategoryCarouselHeight(), 200);
				setTimeout(() => this.equalizeCategoryCarouselHeight(), 600);
			}
		});
	}

	categoryTotalPages = computed(() => Math.ceil(this.familias().length / 4));
	categoryPagesArray = computed(() =>
		Array.from({ length: this.categoryTotalPages() }, (_, i) => i)
	);

	productTotalPages = computed(() => Math.ceil(this.topProducts().length / 2));
	productPagesArray = computed(() =>
		Array.from({ length: this.productTotalPages() }, (_, i) => i)
	);

	productTotalPagesMd = computed(() => Math.ceil(this.topProducts().length / 3));
	productPagesArrayMd = computed(() =>
		Array.from({ length: this.productTotalPagesMd() }, (_, i) => i)
	);

	ngOnInit(): void {
		this.loadWebFamilies();
		this.loadTopProducts();
	}

	loadWebFamilies(): void {
		this.branchesService.getAllWebFamily().subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';
				if (!statusOk || !Array.isArray(res?.data)) {
					this.branchesStore.setWebFamilies([]);
					return;
				}

				const data = res.data as FamiliaWebItem[];

				// Guardar data completa (familias + subfamilias) para el sidebar
				this.branchesStore.setWebFamiliesAll(data);

				// Guardar familias únicas para la sección de Estudios del home
				const map = new Map<string, { idFamiliaWeb: number; familiaWeb: string }>();
				for (const item of data) {
					if (!map.has(item.familiaWeb)) {
						map.set(item.familiaWeb, {
							idFamiliaWeb: item.idFamiliaWeb,
							familiaWeb: item.familiaWeb,
						});
					}
				}

				this.branchesStore.setWebFamilies(Array.from(map.values()));
			},
			error: (err) => {
				console.error('Error AllWebFamily:', err);
				this.branchesStore.setWebFamilies([]);
			},
		});
	}

	loadTopProducts(max: number = 6): void {
		this.branchesService.getTopProducts(max).subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';
				const list = statusOk && Array.isArray(res?.data) ? res.data : [];
				this.branchesStore.setTopProducts(list);
			},
			error: (err) => {
				console.error('Error topProducts:', err);
				this.branchesStore.setTopProducts([]);
			},
		});
	}

	iconName(familiaWeb: string): string {
		return (familiaWeb || '')
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/['’`]/g, '')
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_');
	}

	getCategoryPage(page: number): { idFamiliaWeb: number; familiaWeb: string }[] {
		const all = this.familias();
		return all.slice(page * 4, page * 4 + 4);
	}

	getProductPage(page: number): any[] {
		const all = this.topProducts();
		return all.slice(page * 2, page * 2 + 2);
	}

	getProductPageMd(page: number): any[] {
		const all = this.topProducts();
		return all.slice(page * 3, page * 3 + 3);
	}

	onFamiliaClick(fam: { idFamiliaWeb: number; familiaWeb: string }) {
		console.log('Familia clickeada:', fam);
	}

	abrirSelectorSucursal(): void {
		this.dialog.open(BranchesDialogComponent, {
			width: '420px',
			height: '80vh',
			disableClose: true,
			panelClass: 'custom-dialog',
		});
	}

	private equalizeCategoryCarouselHeight(): void {
		const carouselInner = this.el.nativeElement.querySelector('#categoriesCarousel .carousel-inner') as HTMLElement;
		if (!carouselInner) return;
		const firstItem = carouselInner.querySelector('.carousel-item.active') as HTMLElement;
		if (!firstItem) return;
		const height = firstItem.offsetHeight;
		if (height > 0) {
			carouselInner.style.minHeight = height + 'px';
		}
	}
}