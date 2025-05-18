// Modelos de datos para la aplicación

// Usuario
export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  fechaRegistro: Date;
  ultimoLogin: Date;
}

// Piano
export interface PianoDTO {
  id?: number;
  nombre: string;
  modelo: string;
  precio: number;
  opcionAlquiler?: number;
  imagen: string;
  descripcion?: string;
  fechaCreacion?: Date;
  estado: string;
  caracteristicas: CaracteristicaDTO[];
  especificaciones: ValorEspecificacionDTO[];
}

export interface CaracteristicaDTO {
  id?: number;
  descripcion: string;
}

export interface TipoEspecificacionDTO {
  id?: number;
  nombre: string;
}

export interface ValorEspecificacionDTO {
  id?: number;
  tipo: TipoEspecificacionDTO;
  valor: string;
}

// Carrito
export interface CarritoResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  pianoId: number;
  nombrePiano: string;
  modeloPiano: string;
  precioPiano: number;
  cantidad: number;
  fechaAgregado: Date;
}

export interface AgregarAlCarritoRequest {
  pianoId: number;
  cantidad: number;
}

export interface ActualizarCantidadRequest {
  cantidad: number;
}

// Pedidos
export interface PedidoResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  fechaPedido: Date;
  estado: string;
  total: number;
  direccionEnvio: string;
  metodoPago: string;
  items: ItemPedidoResponse[];
}

export interface ItemPedidoResponse {
  id: number;
  pianoId: number;
  nombrePiano: string;
  modeloPiano: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CrearPedidoRequest {
  direccionEnvio: string;
  metodoPago: string;
}

export interface ActualizarEstadoPedidoRequestDTO {
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'EN_PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
}

export interface MensajeResponseDTO {
  mensaje: string;
}
