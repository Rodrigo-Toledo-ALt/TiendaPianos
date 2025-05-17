import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PedidoService } from '../../../1-Servicios/pedido.service';
import { PedidoResponse } from '../../../1-Servicios/models';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PedidosComponent implements OnInit {
  pedidos: PedidoResponse[] = [];
  cargando = false;
  error = '';

  constructor(private pedidoService: PedidoService) { }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.error = '';
    
    this.pedidoService.obtenerTodosLosPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pedidos';
        this.cargando = false;
        console.error('Error al cargar pedidos', err);
      }
    });
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CONFIRMADO': return 'primary';
      case 'EN_PREPARACION': return 'secondary';
      case 'ENVIADO': return 'tertiary';
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }
}