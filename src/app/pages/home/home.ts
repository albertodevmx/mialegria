import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchesService } from './../../services/branches.service';
import { BranchesStore } from './../../stores/branches.store';
import { MatIconModule } from '@angular/material/icon';

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
		MatIconModule
	],
	templateUrl: './home.html',
	styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
	private branchesService = inject(BranchesService);
	private branchesStore = inject(BranchesStore);

	familias = this.branchesStore.webFamilies;
	topProducts = this.branchesStore.topProducts;

	categoryPage = signal(0);
	categoryTotalPages = computed(() => Math.ceil(this.familias().length / 4));
	categoryPageItems = computed(() => {
		const all = this.familias();
		const start = this.categoryPage() * 4;
		return all.slice(start, start + 4);
	});
	categoryPagesArray = computed(() =>
		Array.from({ length: this.categoryTotalPages() }, (_, i) => i)
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

	prevCategory(): void {
		if (this.categoryPage() > 0) {
			this.categoryPage.update(p => p - 1);
		}
	}

	nextCategory(): void {
		if (this.categoryPage() < this.categoryTotalPages() - 1) {
			this.categoryPage.update(p => p + 1);
		}
	}

	onFamiliaClick(fam: { idFamiliaWeb: number; familiaWeb: string }) {
		console.log('Familia clickeada:', fam);
	}
}