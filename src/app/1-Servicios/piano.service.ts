// piano.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PianoDTO } from './models';

// Interfaz que representa un Piano en el formato de la interfaz de usuario
export interface Piano {
  id?: number;
  image: string;
  name: string;
  model: string;
  price: string;
  rentOption?: string;
  description?: string;
  specifications?: { name: string; value: string }[];
  features?: string[];
  estado?: string;  // Propiedad para rastrear si está activo/inactivo
}

@Injectable({
  providedIn: 'root'
})
export class PianoService {
  private apiUrl = 'http://localhost:8080/api';
  private pianos: PianoDTO[] = [];
  private pianosCargados = false;


  // BehaviorSubjects para compartir datos entre componentes
  private selectedPianoSource = new BehaviorSubject<Piano | null>(null);
  selectedPiano$ = this.selectedPianoSource.asObservable();

  private pianosSource = new BehaviorSubject<PianoDTO[]>([]);
  pianos$ = this.pianosSource.asObservable();

  constructor(private http: HttpClient) {}

  // MÉTODOS PARA INTERACTUAR CON LA API REST

  // Endpoint para obtener pianos (para usuarios normales - solo activos)
  obtenerPianos(): Observable<PianoDTO[]> {
    return this.http.get<PianoDTO[]>(`${this.apiUrl}/pianos`).pipe(
      tap(pianos => {
        this.pianos = pianos;
        this.pianosCargados = true;
        this.pianosSource.next(pianos);
      }),
      catchError(error => {
        console.error('Error al obtener pianos', error);
        return of([]);
      })
    );
  }

  // Endpoint para obtener un piano específico por ID
  obtenerPianoPorId(id: number): Observable<PianoDTO> {
    return this.http.get<PianoDTO>(`${this.apiUrl}/pianos/${id}`);
  }

  // ENDPOINTS PARA ADMINISTRADORES

  // Obtener todos los pianos (incluyendo activos e inactivos)
  obtenerTodosLosPianos(): Observable<PianoDTO[]> {
    return this.http.get<PianoDTO[]>(`${this.apiUrl}/admin/pianos`);
  }

  // Crear un nuevo piano
  crearPiano(piano: PianoDTO): Observable<PianoDTO> {
    return this.http.post<PianoDTO>(`${this.apiUrl}/admin/pianos`, piano);
  }

  // Actualizar un piano existente
  actualizarPiano(id: number, piano: PianoDTO): Observable<PianoDTO> {
    return this.http.put<PianoDTO>(`${this.apiUrl}/admin/pianos/${id}`, piano);
  }

  // Eliminar/desactivar un piano
  eliminarPiano(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/pianos/${id}`);
  }


  // Establecer el piano seleccionado
  setSelectedPiano(piano: Piano): void {
    this.selectedPianoSource.next(piano);
  }

  // MÉTODOS DE CONVERSIÓN DE DATOS

  // Convertir un PianoDTO a un Piano (formato de la interfaz)
  convertirDTOAPiano(pianoDTO: PianoDTO): Piano {
    return {
      id: pianoDTO.id,
      image: pianoDTO.imagen,
      name: pianoDTO.nombre,
      model: pianoDTO.modelo,
      price: pianoDTO.precio.toString(),
      rentOption: pianoDTO.opcionAlquiler?.toString(),
      description: pianoDTO.descripcion,
      specifications: pianoDTO.especificaciones?.map(spec => ({
        name: spec.tipo.nombre,
        value: spec.valor
      })),
      features: pianoDTO.caracteristicas?.map(car => car.descripcion),
      estado: pianoDTO.estado  // Incluir estado
    };
  }

  // Convertir un array de PianoDTO a un array de Piano
  convertirDTOsAPianos(pianosDTO: PianoDTO[]): Piano[] {
    return pianosDTO.map(dto => this.convertirDTOAPiano(dto));
  }

  // Convertir un Piano a un PianoDTO (formato de la API)
  convertirPianoADTO(piano: Piano): PianoDTO {
    return {
      id: piano.id,
      nombre: piano.name,
      modelo: piano.model,
      precio: this.parsePrice(piano.price),
      opcionAlquiler: piano.rentOption ? this.parsePrice(piano.rentOption) : undefined,
      imagen: piano.image,
      descripcion: piano.description,
      estado: piano.estado || 'activo',
      caracteristicas: piano.features?.map(feature => ({
        descripcion: feature
      })) || [],
      especificaciones: piano.specifications?.map(spec => ({
        tipo: { nombre: spec.name },
        valor: spec.value
      })) || []
    };
  }

  // MÉTODOS AUXILIARES

  // Convertir un precio en formato string a número
  parsePrice(price: string): number {
    return parseFloat(price.replace(/\./g, '').replace(',', '.'));
  }

  // Formatear un precio para mostrar
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}
