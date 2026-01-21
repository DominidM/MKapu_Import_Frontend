import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Cliente {
  id_cliente: string;
  tipo_doc: 'DNI' | 'RUC' | 'CE';
  num_doc: string;
  razon_social: string | null;
  nombres: string | null;
  apellidos: string | null;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public clientes$ = this.clientesSubject.asObservable();

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    const datosIniciales: Cliente[] = [
      {
        id_cliente: 'CLI-001',
        tipo_doc: 'DNI',
        num_doc: '12345678',
        razon_social: null,
        nombres: 'Juan',
        apellidos: 'Pérez García',
        direccion: 'Av. Lima 123, San Isidro',
        email: 'juan.perez@email.com',
        telefono: '987654321',
        estado: true
      },
      {
        id_cliente: 'CLI-002',
        tipo_doc: 'RUC',
        num_doc: '20123456789',
        razon_social: 'Empresa Ejemplo SAC',
        nombres: null,
        apellidos: null,
        direccion: 'Av. Arequipa 456, Miraflores',
        email: 'ventas@empresa.com',
        telefono: '987654322',
        estado: true
      },
      {
        id_cliente: 'CLI-003',
        tipo_doc: 'DNI',
        num_doc: '87654321',
        razon_social: null,
        nombres: 'María',
        apellidos: 'López Sánchez',
        direccion: 'Jr. Cusco 789, Lima',
        email: 'maria.lopez@email.com',
        telefono: '998877665',
        estado: true
      },
      {
        id_cliente: 'CLI-004',
        tipo_doc: 'RUC',
        num_doc: '20987654321',
        razon_social: 'Distribuidora Norte EIRL',
        nombres: null,
        apellidos: null,
        direccion: 'Av. Industrial 234, Los Olivos',
        email: 'contacto@norte.com',
        telefono: '987123456',
        estado: true
      },
      {
        id_cliente: 'CLI-005',
        tipo_doc: 'DNI',
        num_doc: '45678912',
        razon_social: null,
        nombres: 'Carlos',
        apellidos: 'Ramírez Torres',
        direccion: 'Calle Los Pinos 567, Surco',
        email: 'carlos.ramirez@email.com',
        telefono: '965432178',
        estado: true
      }
    ];

    this.clientesSubject.next(datosIniciales);
  }

  buscarPorDocumento(documento: string): Cliente | undefined {
    return this.clientesSubject.value.find(
      c => c.num_doc === documento && c.estado === true
    );
  }

  crearCliente(cliente: Omit<Cliente, 'id_cliente'>): Cliente {
    const clientes = this.clientesSubject.value;
    const nuevoId = `CLI-${String(clientes.length + 1).padStart(3, '0')}`;
    
    const nuevoCliente: Cliente = {
      ...cliente,
      id_cliente: nuevoId,
      estado: true
    };

    this.clientesSubject.next([...clientes, nuevoCliente]);
    return nuevoCliente;
  }

  getClientes(): Cliente[] {
    return this.clientesSubject.value.filter(c => c.estado === true);
  }

  getClientePorId(id: string): Cliente | undefined {
    return this.clientesSubject.value.find(c => c.id_cliente === id);
  }

  actualizarCliente(id: string, cambios: Partial<Cliente>): boolean {
    const clientes = [...this.clientesSubject.value];
    const index = clientes.findIndex(c => c.id_cliente === id);
    
    if (index !== -1) {
      clientes[index] = { ...clientes[index], ...cambios };
      this.clientesSubject.next(clientes);
      return true;
    }
    return false;
  }

  desactivarCliente(id: string): boolean {
    return this.actualizarCliente(id, { estado: false });
  }

  validarDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
  }

  validarRUC(ruc: string): boolean {
    return /^(10|20)\d{9}$/.test(ruc);
  }

  validarDocumento(documento: string, tipo: 'DNI' | 'RUC' | 'CE'): boolean {
    if (tipo === 'DNI') return this.validarDNI(documento);
    if (tipo === 'RUC') return this.validarRUC(documento);
    return documento.length >= 8; // CE básico
  }

  obtenerTipoDocumento(documento: string): 'DNI' | 'RUC' | 'INVALIDO' {
    if (this.validarDNI(documento)) return 'DNI';
    if (this.validarRUC(documento)) return 'RUC';
    return 'INVALIDO';
  }

  buscarPorNombre(termino: string): Cliente[] {
    const busqueda = termino.toLowerCase();
    return this.clientesSubject.value.filter(c => 
      c.estado === true && (
        (c.nombres && c.nombres.toLowerCase().includes(busqueda)) ||
        (c.razon_social && c.razon_social.toLowerCase().includes(busqueda))
      )
    );
  }

  getTotalClientes(): number {
    return this.getClientes().length;
  }

  getClientesPorTipo(tipo: 'DNI' | 'RUC' | 'CE'): Cliente[] {
    return this.getClientes().filter(c => c.tipo_doc === tipo);
  }
}
