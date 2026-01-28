import { Injectable } from '@angular/core';

export interface Empleado {
  id_empleado: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono?: string;
  cargo: 'ADMIN' | 'VENTAS' | 'ALMACENERO';
  id_sede: string;
  nombre_sede?: string;
  usuario: string;
  password: string;
  estado: boolean;
  fecha_contratacion: Date;
}

@Injectable({
  providedIn: 'root',
})
export class EmpleadosService {
  private empleadoActual: Empleado | null = null;

  // Datos mock de empleados asociados a las sedes reales
  private empleados: Empleado[] = [
    // ==========================================
    // SEDE LAS FLORES (SEDE001) - San Juan de Lurigancho
    // ==========================================
    {
      id_empleado: 'EMP-001',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      dni: '12345678',
      email: 'juan.perez@mkapapu.com',
      telefono: '987654321',
      cargo: 'ADMIN',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'jperez',
      password: 'admin123',
      estado: true,
      fecha_contratacion: new Date('2023-01-15'),
    },
    {
      id_empleado: 'EMP-002',
      nombres: 'María Elena',
      apellidos: 'Rodríguez López',
      dni: '87654321',
      email: 'maria.rodriguez@mkapapu.com',
      telefono: '912345678',
      cargo: 'VENTAS',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'mrodriguez',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2023-03-20'),
    },
    {
      id_empleado: 'EMP-003',
      nombres: 'Carlos Alberto',
      apellidos: 'Sánchez Díaz',
      dni: '45678912',
      email: 'carlos.sanchez@mkapapu.com',
      telefono: '998877665',
      cargo: 'ALMACENERO',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'csanchez',
      password: 'almacen123',
      estado: true,
      fecha_contratacion: new Date('2023-06-10'),
    },
    {
      id_empleado: 'EMP-004',
      nombres: 'Ana Patricia',
      apellidos: 'Morales Vega',
      dni: '78945612',
      email: 'ana.morales@mkapapu.com',
      telefono: '923456789',
      cargo: 'VENTAS',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'amorales',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2024-02-15'),
    },

    // ==========================================
    // SEDE LURÍN (SEDE002)
    // ==========================================
    {
      id_empleado: 'EMP-005',
      nombres: 'Luis Fernando',
      apellidos: 'Gutiérrez Ramos',
      dni: '65432178',
      email: 'luis.gutierrez@mkapapu.com',
      telefono: '954123456',
      cargo: 'ADMIN',
      id_sede: 'SEDE002',
      nombre_sede: 'LURÍN',
      usuario: 'lgutierrez',
      password: 'admin123',
      estado: true,
      fecha_contratacion: new Date('2023-04-10'),
    },
    {
      id_empleado: 'EMP-006',
      nombres: 'Rosa María',
      apellidos: 'Flores Pérez',
      dni: '32165498',
      email: 'rosa.flores@mkapapu.com',
      telefono: '965874123',
      cargo: 'VENTAS',
      id_sede: 'SEDE002',
      nombre_sede: 'LURÍN',
      usuario: 'rflores',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2023-07-22'),
    },
    {
      id_empleado: 'EMP-007',
      nombres: 'Pedro José',
      apellidos: 'Chávez Torres',
      dni: '14785236',
      email: 'pedro.chavez@mkapapu.com',
      telefono: '978451236',
      cargo: 'ALMACENERO',
      id_sede: 'SEDE002',
      nombre_sede: 'LURÍN',
      usuario: 'pchavez',
      password: 'almacen123',
      estado: true,
      fecha_contratacion: new Date('2023-08-05'),
    },
    {
      id_empleado: 'EMP-008',
      nombres: 'Carmen Julia',
      apellidos: 'Ríos Castillo',
      dni: '96325874',
      email: 'carmen.rios@mkapapu.com',
      telefono: '945123678',
      cargo: 'VENTAS',
      id_sede: 'SEDE002',
      nombre_sede: 'LURÍN',
      usuario: 'crios',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2024-01-18'),
    },

    // ==========================================
    // SEDE VES (SEDE003) - Villa El Salvador
    // ==========================================
    {
      id_empleado: 'EMP-009',
      nombres: 'Diana Carolina',
      apellidos: 'Quispe Mamani',
      dni: '85274136',
      email: 'diana.quispe@mkapapu.com',
      telefono: '912347856',
      cargo: 'VENTAS',
      id_sede: 'SEDE003',
      nombre_sede: 'VES',
      usuario: 'dquispe',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2024-01-10'),
    },
    {
      id_empleado: 'EMP-010',
      nombres: 'Jorge Luis',
      apellidos: 'Huamán Ccahuana',
      dni: '96385274',
      email: 'jorge.huaman@mkapapu.com',
      telefono: '987456321',
      cargo: 'ALMACENERO',
      id_sede: 'SEDE003',
      nombre_sede: 'VES',
      usuario: 'jhuaman',
      password: 'almacen123',
      estado: true,
      fecha_contratacion: new Date('2024-03-15'),
    },
    {
      id_empleado: 'EMP-011',
      nombres: 'Roberto Carlos',
      apellidos: 'Vega Mendoza',
      dni: '74185296',
      email: 'roberto.vega@mkapapu.com',
      telefono: '956789123',
      cargo: 'ADMIN',
      id_sede: 'SEDE003',
      nombre_sede: 'VES',
      usuario: 'rvega',
      password: 'admin123',
      estado: true,
      fecha_contratacion: new Date('2023-09-12'),
    },
    {
      id_empleado: 'EMP-012',
      nombres: 'Sofía Alejandra',
      apellidos: 'Torres Lima',
      dni: '85296374',
      email: 'sofia.torres@mkapapu.com',
      telefono: '934567891',
      cargo: 'VENTAS',
      id_sede: 'SEDE003',
      nombre_sede: 'VES',
      usuario: 'storres',
      password: 'ventas123',
      estado: true,
      fecha_contratacion: new Date('2024-04-20'),
    },

    // ==========================================
    // USUARIOS DE PRUEBA (credenciales simples)
    // Por defecto en SEDE LAS FLORES
    // ==========================================
    {
      id_empleado: 'EMP-099',
      nombres: 'Admin',
      apellidos: 'Sistema',
      dni: '11111111',
      email: 'admin@mkapapu.com',
      telefono: '999999999',
      cargo: 'ADMIN',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'admin',
      password: 'admin',
      estado: true,
      fecha_contratacion: new Date('2023-01-01'),
    },
    {
      id_empleado: 'EMP-098',
      nombres: 'Vendedor',
      apellidos: 'Sistema',
      dni: '22222222',
      email: 'ventas@mkapapu.com',
      telefono: '988888888',
      cargo: 'VENTAS',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'ventas',
      password: 'ventas',
      estado: true,
      fecha_contratacion: new Date('2023-01-01'),
    },
    {
      id_empleado: 'EMP-097',
      nombres: 'Almacenero',
      apellidos: 'Sistema',
      dni: '33333333',
      email: 'almacen@mkapapu.com',
      telefono: '977777777',
      cargo: 'ALMACENERO',
      id_sede: 'SEDE001',
      nombre_sede: 'LAS FLORES',
      usuario: 'almacen',
      password: 'almacen',
      estado: true,
      fecha_contratacion: new Date('2023-01-01'),
    },
  ];

  constructor() {
    this.inicializarSesion();
  }

  private inicializarSesion(): void {
    const sesionGuardada = localStorage.getItem('empleado_sesion');

    if (sesionGuardada) {
      this.empleadoActual = JSON.parse(sesionGuardada);
    }
  }

  private guardarSesion(): void {
    if (this.empleadoActual) {
      localStorage.setItem('empleado_sesion', JSON.stringify(this.empleadoActual));
    }
  }

  getEmpleadoActual(): Empleado | null {
    return this.empleadoActual;
  }

  getSedeEmpleadoActual(): string {
    return this.empleadoActual?.id_sede || '';
  }

  getNombreCompletoEmpleadoActual(): string {
    if (!this.empleadoActual) return 'Sin asignar';
    return `${this.empleadoActual.nombres} ${this.empleadoActual.apellidos}`;
  }

  getEmpleados(): Empleado[] {
    return this.empleados;
  }

  getEmpleadosPorSede(idSede: string): Empleado[] {
    return this.empleados.filter((emp) => emp.id_sede === idSede && emp.estado);
  }

  getEmpleadosPorCargo(cargo: Empleado['cargo']): Empleado[] {
    return this.empleados.filter((emp) => emp.cargo === cargo && emp.estado);
  }

  login(usuario: string, password: string): boolean {
    const empleado = this.empleados.find(
      (emp) => emp.usuario === usuario && emp.password === password && emp.estado
    );

    if (empleado) {
      this.empleadoActual = empleado;
      this.guardarSesion();
      return true;
    }

    return false;
  }

  logout(): void {
    this.empleadoActual = null;
    localStorage.removeItem('empleado_sesion');
  }

  isAutenticado(): boolean {
    return this.empleadoActual !== null;
  }

  tieneCargo(cargo: Empleado['cargo']): boolean {
    return this.empleadoActual?.cargo === cargo;
  }

  esAdmin(): boolean {
    return this.empleadoActual?.cargo === 'ADMIN';
  }

  esVentas(): boolean {
    return this.empleadoActual?.cargo === 'VENTAS';
  }

  esAlmacenero(): boolean {
    return this.empleadoActual?.cargo === 'ALMACENERO';
  }

  puedeRealizarVentas(): boolean {
    return this.empleadoActual?.cargo === 'ADMIN' || this.empleadoActual?.cargo === 'VENTAS';
  }

  puedeGestionarAlmacen(): boolean {
    return this.empleadoActual?.cargo === 'ADMIN' || this.empleadoActual?.cargo === 'ALMACENERO';
  }

  cambiarEmpleado(idEmpleado: string): boolean {
    const empleado = this.empleados.find(
      (emp) => emp.id_empleado === idEmpleado && emp.estado
    );

    if (empleado) {
      this.empleadoActual = empleado;
      this.guardarSesion();
      return true;
    }

    return false;
  }

  getEtiquetaCargo(cargo: Empleado['cargo']): string {
    const etiquetas = {
      ADMIN: 'Administrador',
      VENTAS: 'Vendedor',
      ALMACENERO: 'Almacenero',
    };
    return etiquetas[cargo];
  }

  actualizarEmpleado(empleadoActualizado: Empleado): boolean {
    const index = this.empleados.findIndex(
      e => e.id_empleado === empleadoActualizado.id_empleado
    );
  
    if (index !== -1) {
      this.empleados[index] = { ...empleadoActualizado };
      return true;
    }
  
    return false;
  }
  
  agregarEmpleado(nuevoEmpleado: Empleado): void {
    this.empleados.push(nuevoEmpleado);
  }
  

}
