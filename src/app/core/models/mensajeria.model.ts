export type TipoExchange = 'direct' | 'topic' | 'fanout' | 'headers';

export interface RabbitQueue {
  name: string;
  durable: boolean;
  /** Exchange al que RabbitMQ reenvía los mensajes rechazados/expirados (DLX). */
  deadLetterExchange?: string | null;
  /** Routing key con la que se reenvía a la DLQ. */
  deadLetterRoutingKey?: string | null;
  /** TTL de los mensajes en milisegundos. */
  messageTtl?: number | null;
  // Solo lectura (estadísticas)
  messages?: number;
  consumers?: number;
}

export interface RabbitExchange {
  name: string;
  type: TipoExchange;
  durable: boolean;
  autoDelete?: boolean;
}

export interface RabbitBinding {
  exchange: string;
  queue: string;
  routingKey: string;
}

export interface PublicarMensaje {
  exchange: string;
  routingKey: string;
  payload: string;
}

export type TipoNotificacion = 'NOTIFICACION' | 'TICKET' | 'DOCUMENTO';
export type EstadoNotificacion = 'PENDIENTE' | 'PROCESADO' | 'FALLIDO';

/** Resultado de una tarea asíncrona procesada por un consumidor RabbitMQ. */
export interface Notificacion {
  id?: number;
  tipo: TipoNotificacion;
  destinatario?: string;
  mensaje: string;
  estado: EstadoNotificacion;
  cola?: string;
  fecha?: string; // ISO date-time
}
