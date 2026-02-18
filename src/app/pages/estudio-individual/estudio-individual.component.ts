import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-estudio-individual',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './estudio-individual.component.html',
	styleUrl: './estudio-individual.component.scss',
})
export class EstudioIndividualComponent {
	// Hardcoded data matching Figma design
	estudio = {
		idProducto: 101,
		producto: 'Química sanguínea 45 elementos',
		familiaWeb: 'Estudios Clínicos',
		precio: 300.00,
		precioOriginal: 600.00,
		imagen: 'img/estudios/quimica-sanguinea.jpg',
		informacion: 'Conjunto de análisis que evalúa 45 diferentes sustancias en tu sangre, ayuda a tu médico a conocer cómo están funcionando varios órganos de tu cuerpo.',
		indicaciones: [
			'Ayuno de 8 a 12 horas',
			'Evitar bebidas alcohólicas 24 horas antes',
			'No realizar ejercicio intenso el día previo',
			'Informar al personal si tomas algún medicamento',
		],
		paquetesSugeridos: [
			'Check up Hombres II',
			'Diabetes II',
			'Diabetes II',
		],
		promocion: 'Miércoles de perfiles',
	};

	unidad = {
		nombre: 'Tlalpan 1',
		direccion: 'Calz. de Tlalpan 754-Local 2, Iztaccíhuatl, Benito Juárez, 03520 Ciudad de México, CDMX',
		horarios: {
			semana: 'Lunes a viernes: 6am-7pm',
			sabado: 'Sábados: 6am-5pm',
			domingo: 'Domingos: 7am-1pm',
		},
		telefono: '55 5555 5555',
	};

	recomendados = [
		{
			idProducto: 101,
			producto: 'Química sanguínea de 45 elementos',
			familiaWeb: 'Estudios Clínicos',
			precio: 300.00,
			precioOriginal: 600.00,
			promocion: 'Miércoles de perfiles',
			tieneUnidad: true,
		},
		{
			idProducto: 102,
			producto: 'Interpretación de imagenología a domicilio Interpretación de placas a domicilio Interpretación de toma de placas a domicilio Interpretación de servicio de RX a domicilio',
			familiaWeb: 'Estudios Clínicos',
			precio: 300.00,
			precioOriginal: 600.00,
			promocion: null,
			tieneUnidad: true,
		},
		{
			idProducto: 103,
			producto: 'Anticuerpos anti HTLV 1+ 2 (virus linfotrópico de células t humanas)',
			familiaWeb: 'Estudios Clínicos',
			precio: 300.00,
			precioOriginal: 600.00,
			promocion: 'Miércoles de perfiles',
			tieneUnidad: true,
		},
		{
			idProducto: 104,
			producto: 'Imagenología a domicilio Placas a domicilio Toma de placas a domicilio Servicio de RX a domicilio',
			familiaWeb: 'Estudios Clínicos',
			precio: null,
			precioOriginal: null,
			promocion: null,
			tieneUnidad: false,
		},
	];

	goBack() {
		window.history.back();
	}
}
