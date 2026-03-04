// terminos-condiciones.component.ts
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

export interface SeccionTerminos {
  id:       string;
  numero:   string;
  titulo:   string;
  contenido: string[];
  items?:   string[];
}

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule],
  templateUrl: './terminos-condiciones.html',
  styleUrls: ['./terminos-condiciones.css'],
})
export class TerminosCondicionesComponent {

  @ViewChild('contenidoRef') contenidoRef!: ElementRef;

  // ── Datos de la empresa ──────────────────────────────────────────
  readonly nombreEmpresa          = 'Mkapu Import S.A.C.';
  readonly direccionEmpresa       = 'Av. Example 123, Lima, Perú';
  readonly emailContacto          = 'contacto@mkapu.com';
  readonly telefonoContacto       = '+51 987 654 321';
  readonly version                = '1.0';
  readonly fechaVigencia          = 'enero 2025';
  readonly fechaUltimaActualizacion = 'enero 2025';
  readonly anioActual             = new Date().getFullYear();

  seccionActiva = 'sec-1';

  // ── Contenido ────────────────────────────────────────────────────
  readonly secciones: SeccionTerminos[] = [
    {
      id:      'sec-1',
      numero:  '01',
      titulo:  'Aceptación de los Términos',
      contenido: [
        'Al acceder y utilizar la plataforma de gestión de Mkapu Import S.A.C., usted acepta estar sujeto a estos Términos y Condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.',
        'Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sistema. Los materiales contenidos en este sistema están protegidos por las leyes de derechos de autor y marcas comerciales aplicables.',
      ],
    },
    {
      id:      'sec-2',
      numero:  '02',
      titulo:  'Uso de la Plataforma',
      contenido: [
        'El sistema de gestión es de uso exclusivo para personal autorizado de Mkapu Import S.A.C. Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.',
      ],
      items: [
        'No compartir credenciales de acceso con terceros.',
        'Reportar inmediatamente cualquier uso no autorizado de su cuenta.',
        'No intentar acceder a áreas restringidas del sistema.',
        'Usar el sistema únicamente para fines laborales autorizados.',
        'No extraer, copiar o distribuir información confidencial de la empresa.',
      ],
    },
    {
      id:      'sec-3',
      numero:  '03',
      titulo:  'Privacidad y Protección de Datos',
      contenido: [
        'Mkapu Import S.A.C. se compromete a proteger la privacidad de la información procesada a través de esta plataforma, en cumplimiento con la Ley N° 29733 - Ley de Protección de Datos Personales del Perú y su reglamento aprobado por D.S. N° 003-2013-JUS.',
        'Los datos personales de clientes, empleados y proveedores registrados en el sistema serán tratados con absoluta confidencialidad y utilizados únicamente para los fines operativos de la empresa.',
      ],
      items: [
        'Los datos se almacenan en servidores seguros con acceso restringido.',
        'No se comparte información personal con terceros sin consentimiento explícito.',
        'Los usuarios tienen derecho a acceder, rectificar y suprimir sus datos.',
        'Se aplican medidas técnicas y organizativas para proteger la información.',
      ],
    },
    {
      id:      'sec-4',
      numero:  '04',
      titulo:  'Operaciones Comerciales',
      contenido: [
        'Las operaciones de venta, cotización, inventario y cobranza registradas en el sistema tienen validez legal y contable para Mkapu Import S.A.C. Todo registro debe realizarse con información veraz y oportuna.',
        'Los comprobantes electrónicos emitidos a través del sistema están sujetos a las disposiciones de la SUNAT y las normativas tributarias vigentes en el Perú.',
      ],
      items: [
        'Las ventas registradas generan obligaciones fiscales y contables.',
        'Los ajustes de inventario deben contar con justificación documentada.',
        'Las cuentas por cobrar deben gestionarse dentro de los plazos establecidos.',
        'Cualquier anulación requiere autorización del nivel jerárquico correspondiente.',
      ],
    },
    {
      id:      'sec-5',
      numero:  '05',
      titulo:  'Responsabilidades del Usuario',
      contenido: [
        'Cada usuario del sistema es directamente responsable de las acciones realizadas con sus credenciales de acceso. El registro incorrecto, manipulación indebida o uso fraudulento del sistema constituye falta grave y puede derivar en acciones legales.',
      ],
      items: [
        'Registrar información verídica y completa en todas las operaciones.',
        'No alterar registros históricos sin la debida autorización.',
        'Notificar errores o irregularidades detectadas al área correspondiente.',
        'Respetar los niveles de acceso y permisos asignados a su rol.',
      ],
    },
    {
      id:      'sec-6',
      numero:  '06',
      titulo:  'Propiedad Intelectual',
      contenido: [
        'El sistema de gestión, incluyendo su diseño, código fuente, bases de datos, interfaces y toda la documentación asociada, es propiedad exclusiva de Mkapu Import S.A.C. Queda estrictamente prohibida su reproducción, distribución, modificación o uso comercial sin autorización expresa por escrito.',
      ],
    },
    {
      id:      'sec-7',
      numero:  '07',
      titulo:  'Limitación de Responsabilidad',
      contenido: [
        'Mkapu Import S.A.C. no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del sistema, incluyendo pérdidas de datos por causas de fuerza mayor, fallos de conectividad externos o errores del usuario.',
        'La empresa implementa procedimientos de respaldo periódico para minimizar el riesgo de pérdida de información, pero no garantiza la disponibilidad ininterrumpida del sistema.',
      ],
    },
    {
      id:      'sec-8',
      numero:  '08',
      titulo:  'Modificaciones a los Términos',
      contenido: [
        'Mkapu Import S.A.C. se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sistema.',
        'El uso continuado de la plataforma después de cualquier modificación constituye la aceptación de los nuevos términos. Se notificará a los usuarios sobre cambios significativos mediante el sistema de notificaciones interno.',
      ],
    },
    {
      id:      'sec-9',
      numero:  '09',
      titulo:  'Legislación Aplicable',
      contenido: [
        'Estos Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier disputa o controversia relacionada con el uso de este sistema será sometida a la jurisdicción de los tribunales competentes de la ciudad de Lima, Perú.',
        'Para consultas legales o reportes de incidentes de seguridad, puede contactarnos a través de los canales oficiales indicados al pie de este documento.',
      ],
    },
  ];

  // ── Scroll spy ───────────────────────────────────────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    for (const seccion of this.secciones) {
      const el = document.getElementById(seccion.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          this.seccionActiva = seccion.id;
          break;
        }
      }
    }
  }

  irASeccion(id: string): void {
    this.seccionActiva = id;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  imprimir(): void {
    window.print();
  }

  descargarPDF(): void {
    window.print();
  }
}