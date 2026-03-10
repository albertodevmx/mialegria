import { Component, OnInit, OnDestroy, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BranchesService } from '../../services/branches.service';
import { BranchesStore } from '../../stores/branches.store';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { BranchesDialogComponent } from '../../shared/components/direccion/branches-dialog/branches-dialog.component';

@Component({
	selector: 'app-categorias',
	standalone: true,
	imports: [CommonModule, MatIconModule, ProductCard],
	templateUrl: './categorias.html',
	styleUrls: ['./categorias.scss'],
})
export class Categorias implements OnInit, OnDestroy {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private branchesService = inject(BranchesService);
	private store = inject(BranchesStore);
	private dialog = inject(MatDialog);

	familias = this.store.webFamilies;
	selectedSucursal = this.store.selectedSucursal;

	selectedFamiliaId = signal<number | null>(null);
	products = signal<any[]>([]);
	loadingProducts = signal(false);
	viewMode = signal<'tarjetas' | 'listado'>('tarjetas');
	filterOpen = signal(false);
	selectedFilter = signal<string>('');

	// Mobile infinite scroll
	private readonly MOBILE_PAGE_SIZE = 10;
	private readonly MOBILE_BREAKPOINT = 768;
	mobileVisibleCount = signal(10);
	isMobile = signal(false);

	displayedProducts = computed(() => {
		const all = this.products();
		if (!this.isMobile()) return all;
		return all.slice(0, this.mobileVisibleCount());
	});

	allMobileLoaded = computed(() => {
		if (!this.isMobile()) return false;
		return this.products().length > 0
			&& this.mobileVisibleCount() >= this.products().length;
	});

	selectedFamiliaName = computed(() => {
		const id = this.selectedFamiliaId();
		const fam = this.familias().find(f => f.idFamiliaWeb === id);
		return fam?.familiaWeb ?? 'Todos';
	});

	// Carousel pagination: 6 items per page (2 rows x 3 cols)
	private readonly ITEMS_PER_PAGE = 12;

	categoryTotalPages = computed(() => Math.ceil(this.familias().length / this.ITEMS_PER_PAGE));
	categoryPagesArray = computed(() =>
		Array.from({ length: this.categoryTotalPages() }, (_, i) => i)
	);

	getCategoryPage(page: number): { idFamiliaWeb: number; familiaWeb: string }[] {
		const all = this.familias();
		return all.slice(page * this.ITEMS_PER_PAGE, page * this.ITEMS_PER_PAGE + this.ITEMS_PER_PAGE);
	}

	filtersWithBranch = ['Ofertas', 'Menor a mayor precio', 'Salud femenina', 'Salud masculina'];
	filtersWithoutBranch = ['Ofertas', 'Salud femenina', 'Salud masculina'];

	availableFilters = computed(() =>
		this.selectedSucursal() ? this.filtersWithBranch : this.filtersWithoutBranch
	);

	@HostListener('window:scroll')
	onScroll(): void {
		if (!this.isMobile() || this.allMobileLoaded() || this.loadingProducts()) return;
		const scrollPos = window.innerHeight + window.scrollY;
		const docHeight = document.documentElement.scrollHeight;
		if (scrollPos >= docHeight - 200) {
			this.mobileVisibleCount.update(v => v + this.MOBILE_PAGE_SIZE);
		}
	}

	@HostListener('window:resize')
	onResize(): void {
		this.isMobile.set(window.innerWidth < this.MOBILE_BREAKPOINT);
	}

	ngOnInit(): void {
		this.isMobile.set(window.innerWidth < this.MOBILE_BREAKPOINT);

		// Load families if not already loaded
		if (this.familias().length === 0) {
			this.loadFamilies();
		}

		// Read query param
		this.route.queryParams.subscribe(params => {
			const id = params['idFamilia'] ? Number(params['idFamilia']) : null;
			this.selectedFamiliaId.set(id);
			this.loadProducts();
		});
	}

	ngOnDestroy(): void {
		// HostListener handles cleanup automatically
	}

	private loadFamilies(): void {
		this.branchesService.getAllWebFamily().subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';
				if (!statusOk || !Array.isArray(res?.data)) return;
				const data = res.data;
				this.store.setWebFamiliesAll(data);
				const map = new Map<string, { idFamiliaWeb: number; familiaWeb: string }>();
				for (const item of data) {
					if (!map.has(item.familiaWeb)) {
						map.set(item.familiaWeb, {
							idFamiliaWeb: item.idFamiliaWeb,
							familiaWeb: item.familiaWeb,
						});
					}
				}
				this.store.setWebFamilies(Array.from(map.values()));

				// If no family was selected via queryParam, select the first one
				if (!this.selectedFamiliaId() && this.familias().length > 0) {
					this.selectFamilia(this.familias()[0]);
				}
			},
		});
	}

	loadProducts(): void {
		const id = this.selectedFamiliaId();
		if (!id) return;

		this.loadingProducts.set(true);

		const params: any = { IDFamiliaWeb: id };

		// Add sucursal if selected
		const suc = this.selectedSucursal();
		if (suc?.idSucursal) {
			params.IDSucursal = suc.idSucursal;
		}

		// Apply active filter
		const filter = this.selectedFilter();
		if (filter === 'Ofertas') params.Ofertas = true;
		if (filter === 'Salud femenina') params.SaludFem = true;
		if (filter === 'Salud masculina') params.SaludMas = true;
		if (filter === 'Menor a mayor precio') params.PrecioMenor = true;

		this.branchesService.getProductsByFamily(params).subscribe({
			next: (res: any) => {
				const statusOk = String(res?.status) === '200';
				const list = statusOk && Array.isArray(res?.data) ? res.data : [];
				this.products.set(list);
				this.mobileVisibleCount.set(this.MOBILE_PAGE_SIZE);
				this.loadingProducts.set(false);
			},
			error: () => {
				this.products.set([]);
				this.loadingProducts.set(false);
			},
		});
	}

	onMobileSelectChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		const fam = this.familias().find(f => f.idFamiliaWeb === id);
		if (fam) this.selectFamilia(fam);
	}

	selectFamilia(fam: { idFamiliaWeb: number; familiaWeb: string }): void {
		this.selectedFamiliaId.set(fam.idFamiliaWeb);
		this.router.navigate([], {
			queryParams: { idFamilia: fam.idFamiliaWeb },
			queryParamsHandling: 'merge',
		});
	}

	iconName(familiaWeb: string): string {
		return (familiaWeb || '')
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[''`]/g, '')
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_');
	}

	toggleFilter(): void {
		this.filterOpen.update(v => !v);
	}

	applyFilter(filter: string): void {
		// Toggle: if same filter clicked again, clear it
		this.selectedFilter.set(this.selectedFilter() === filter ? '' : filter);
		this.filterOpen.set(false);
		this.loadProducts();
	}

	setViewMode(mode: 'tarjetas' | 'listado'): void {
		this.viewMode.set(mode);
	}

	abrirSelectorSucursal(): void {
		this.dialog.open(BranchesDialogComponent, {
			width: '420px',
			height: '80vh',
			disableClose: true,
			panelClass: 'custom-dialog',
		});
	}
}
