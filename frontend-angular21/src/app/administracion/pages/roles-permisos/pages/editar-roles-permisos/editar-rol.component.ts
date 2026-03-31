import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder, Validators,
  ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import { CardModule }      from 'primeng/card';
import { ButtonModule }    from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule }  from 'primeng/checkbox';
import { ToastModule }     from 'primeng/toast';
import { TagModule }       from 'primeng/tag';
import { PanelModule }     from 'primeng/panel';
import { TooltipModule }   from 'primeng/tooltip';
import { MessageService }  from 'primeng/api';
import { forkJoin }        from 'rxjs';
import { take }            from 'rxjs/operators';

import { RoleService }           from '../../../../services/role.service';
import { PermissionService }     from '../../../../services/permission.service';
import { RolePermissionService } from '../../../../services/role-permission.service';
import {
  PermissionInRoleDto,
  PermissionTier,
}                                from '../../../../interfaces/role-permission.interface';

type Step = 1 | 2;

// Helper puro — infiere tier desde el nombre del permiso
function inferTier(nombre: string): PermissionTier {
  const n = nombre.toUpperCase();
  if (n.startsWith('VER_') || n.startsWith('CONTEO_') || n === 'CERRAR_CAJA') return 'ver';
  if (n.startsWith('CREAR_') || n.startsWith('AGREGAR_') || n.startsWith('ASIGNAR_')) return 'crear';
  if (n.startsWith('EDITAR_') || n.startsWith('MODIFICAR_')) return 'editar';
  return 'especial';
}

@Component({
  selector: 'app-editar-rol',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    CardModule, ButtonModule, InputTextModule,
    CheckboxModule, ToastModule, TagModule,
    PanelModule, TooltipModule,
  ],
  templateUrl: './editar-rol.component.html',
  styleUrl: './editar-rol.component.css',
})
export class EditarRolComponent implements OnInit {
  private readonly fb       = inject(FormBuilder);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly msg      = inject(MessageService);
  readonly rolSvc           = inject(RoleService);
  readonly permSvc          = inject(PermissionService);
  readonly rolePermSvc      = inject(RolePermissionService);

  step       = signal<Step>(1);
  submitting = signal(false);
  rolId      = signal<number | null>(null);
  rolNombre  = signal('');
  filtro     = signal('');

  todosLosPermisos = signal<PermissionInRoleDto[]>([]);
  selectedPermIds  = signal<number[]>([]);

  // Mapa id → permiso para lookups O(1)
  private permMap = computed(() =>
    new Map(this.todosLosPermisos().map(p => [p.id_permiso, p]))
  );

  // Permisos agrupados por módulo, filtrados y ordenados VER→CREAR→EDITAR
  readonly permisosAgrupados = computed(() => {
    const fl = this.filtro().toLowerCase();
    const TIER_ORDER: Record<PermissionTier, number> =
      { ver: 0, crear: 1, editar: 2, especial: 3 };

    const filtered = this.todosLosPermisos().filter(p =>
      !fl ||
      p.nombre.toLowerCase().includes(fl) ||
      p.descripcion.toLowerCase().includes(fl) ||
      p.modulo.toLowerCase().includes(fl)
    );

    const map = new Map<string, PermissionInRoleDto[]>();
    for (const p of filtered) {
      if (!map.has(p.modulo)) map.set(p.modulo, []);
      map.get(p.modulo)!.push(p);
    }

    map.forEach(arr =>
      arr.sort((a, b) =>
        TIER_ORDER[inferTier(a.nombre)] - TIER_ORDER[inferTier(b.nombre)]
      )
    );

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([modulo, permisos]) => ({ modulo, permisos }));
  });

  form = this.fb.group({
    nombre:      ['', [Validators.required, Validators.maxLength(45)]],
    descripcion: ['', Validators.maxLength(255)],
    activo:      [true],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/admin/roles-permisos']); return; }
    this.rolId.set(id);

    forkJoin({
      rol:         this.rolSvc.getRoleById(id).pipe(take(1)),
      permisos:    this.permSvc.loadPermissions().pipe(take(1)),
      rolPermisos: this.rolePermSvc.loadPermissionsByRole(id).pipe(take(1)),
    }).subscribe({
      next: ({ rol, permisos, rolPermisos }) => {
        this.form.patchValue({
          nombre:      rol.nombre,
          descripcion: rol.descripcion ?? '',
          activo:      rol.activo,
        });
        this.rolNombre.set(rol.nombre);

        // ← mapeo actualizado con modulo y depende_de
        this.todosLosPermisos.set(
          permisos.map(p => ({
            id_permiso:  p.id_permiso,
            nombre:      p.nombre,
            descripcion: p.descripcion ?? '',
            activo:      p.activo,
            modulo:      p.modulo      ?? 'General',
            depende_de:  p.depende_de  ?? null,
          }))
        );

        this.selectedPermIds.set(
          rolPermisos.permisos.map(p => p.id_permiso)
        );
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el rol.' });
        setTimeout(() => this.router.navigate(['/admin/roles-permisos']), 1500);
      },
    });
  }

  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  cancelar() { this.router.navigate(['/admin/roles-permisos']); }

  guardarDatos() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const val = this.form.getRawValue();

    this.rolSvc.updateRole(this.rolId()!, {
      nombre:      val.nombre!,
      descripcion: val.descripcion ?? undefined,
      activo:      val.activo ?? true,
    }).pipe(take(1)).subscribe({
      next: rol => {
        this.rolNombre.set(rol.nombre);
        this.submitting.set(false);
        this.step.set(2);
        this.msg.add({
          severity: 'success',
          summary: 'Datos actualizados',
          detail: `"${rol.nombre}" actualizado. Ahora edita sus permisos.`,
        });
      },
      error: err => {
        this.msg.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo actualizar el rol.',
        });
        this.submitting.set(false);
      },
    });
  }

  // ← togglePerm con lógica de dependencias
  togglePerm(id: number) {
    const cur  = new Set(this.selectedPermIds());
    const perm = this.permMap().get(id);

    if (cur.has(id)) {
      cur.delete(id);
      // Deseleccionar hijos que dependían de este
      this.todosLosPermisos()
        .filter(p => p.depende_de === id)
        .forEach(p => cur.delete(p.id_permiso));
    } else {
      // Auto-seleccionar el padre (VER) si existe
      if (perm?.depende_de != null && !cur.has(perm.depende_de)) {
        cur.add(perm.depende_de);
      }
      cur.add(id);
    }
    this.selectedPermIds.set([...cur]);
  }

  seleccionarTodos() {
    this.selectedPermIds.set(
      this.todosLosPermisos().filter(p => p.activo).map(p => p.id_permiso)
    );
  }

  limpiarSeleccion() { this.selectedPermIds.set([]); }

  guardarPermisos() {
    const rolId = this.rolId();
    if (!rolId) return;

    if (this.selectedPermIds().length === 0) {
      this.msg.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes seleccionar al menos un permiso.',
      });
      return;
    }

    this.submitting.set(true);

    this.rolePermSvc.syncPermissions({
      roleId:        rolId,
      permissionIds: this.selectedPermIds(),
    }).pipe(take(1)).subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: 'Permisos actualizados',
          detail: `"${this.rolNombre()}" actualizado con ${this.selectedPermIds().length} permiso(s).`,
        });
        setTimeout(() => this.router.navigate(['/admin/roles-permisos']), 1200);
      },
      error: err => {
        this.msg.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo actualizar los permisos.',
        });
        this.submitting.set(false);
      },
    });
  }

  // Helpers para el template
  getPermisosLabel(count: number): string {
    if (count === 0) return 'Sin permisos';
    if (count === 1) return '1 permiso';
    return `${count} permisos`;
  }

  cuentaSeleccionados(permisos: PermissionInRoleDto[]): string {
    const n = permisos.filter(p => this.selectedPermIds().includes(p.id_permiso)).length;
    return `${n}/${permisos.length}`;
  }

  tierLabel(nombre: string): string {
    const t = inferTier(nombre);
    return { ver: 'Listado', crear: 'Crear', editar: 'Editar', especial: 'Especial' }[t];
  }

  tierDot(nombre: string): string {
    return `tier-dot tier-${inferTier(nombre)}`;
  }

  nombrePadre(depende_de: number | null): string {
    if (!depende_de) return '';
    return this.permMap().get(depende_de)?.nombre ?? String(depende_de);
  }
}