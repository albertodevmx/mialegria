import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BranchesService {
	private baseUrl = 'https://portal.ssdrsimi.com.mx/APISIMILABDEV';

	constructor(private http: HttpClient) { }


	getStates(query: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branches/States`, {
			params: { Estado: query }
		});
	}


	getRecentBranches(EstadoId: any): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branch/nerestsBranches?IDEstado=${EstadoId}`);
	}


	getTopBranches(): Observable<any> {
		return this.http.get(`${this.baseUrl}/api/Branches/topBranches?Max=3`);
	}

	getServicesInSearcher(query: string, skip: number = 0, idSucursal?: number): Observable<any> {
		let url = `${this.baseUrl}/api/Products/searchProducts?Producto=${query}&Skip=${skip}`;
		if (idSucursal != null) {
			url += `&IDSucursal=${idSucursal}`;
		}
		return this.http.get(url);
	}


	// Familias
	getAllWebFamily(): Observable<any> {
		return this.http.get(
			`${this.baseUrl}/api/Products/AllWebFamily`
		);
	}


	getTopProducts(max: number = 6): Observable<any> {
		return this.http.get(
			`${this.baseUrl}/api/Products/topProducts?Max=${max}`
		);
	}

	getProductDetail(idProduct: number, idSucursal?: number): Observable<any> {
		const params: any = { IDProduct: idProduct };
		if (idSucursal != null) params.IDSucursal = idSucursal;
		return this.http.get(`${this.baseUrl}/api/Products/ProductDetailes`, { params });
	}

	getProductsByFamily(params: {
		IDFamiliaWeb: number;
		IDSucursal?: number;
		IDSubFamiliaWeb?: number;
		Ofertas?: boolean;
		SaludFem?: boolean;
		SaludMas?: boolean;
		PrecioMenor?: boolean;
	}): Observable<any> {
		const query: any = { IDFamiliaWeb: params.IDFamiliaWeb };
		if (params.IDSucursal != null) query.IDSucursal = params.IDSucursal;
		if (params.IDSubFamiliaWeb != null) query.IDSubFamiliaWeb = params.IDSubFamiliaWeb;
		if (params.Ofertas != null) query.Ofertas = params.Ofertas;
		if (params.SaludFem != null) query.SaludFem = params.SaludFem;
		if (params.SaludMas != null) query.SaludMas = params.SaludMas;
		if (params.PrecioMenor != null) query.PrecioMenor = params.PrecioMenor;
		return this.http.get(`${this.baseUrl}/api/Products/ProductByWebFamily`, { params: query });
	}

}
