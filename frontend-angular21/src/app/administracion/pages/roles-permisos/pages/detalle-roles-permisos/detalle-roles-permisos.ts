import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  convertToParamMap,
} from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import {
  RoleWithPermissionsResponseDto,
  PermissionInRoleDto,
  PermissionTier,
} from '../../../../interfaces/role-permission.interface';
import { RolePermissionService } from '../../../../services/role-permission.service';
import { RoleService } from '../../../../services/role.service';

interface PermissionGroup {
  modulo: string;
  permisos: PermissionInRoleDto[];
  total: number;
  activos: number;
}

function inferTier(nombre: string): PermissionTier {
  const normalized = nombre.toUpperCase();

  if (
    normalized.startsWith('VER_') ||
    normalized.startsWith('CONTEO_') ||
    normalized === 'CERRAR_CAJA'
  ) {
    return 'ver';
  }

  if (
    normalized.startsWith('CREAR_') ||
    normalized.startsWith('AGREGAR_') ||
    normalized.startsWith('ASIGNAR_')
  ) {
    return 'crear';
  }

  if (normalized.startsWith('EDITAR_') || normalized.startsWith('MODIFICAR_')) {
    return 'editar';
  }

  return 'especial';
}

@Component({
  selector: 'app-detalle-roles-permisos',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule],
  templateUrl: './detalle-roles-permisos.html',
  styleUrl: './detalle-roles-permisos.css',
})
export class DetalleRolesPermisos {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roleSvc = inject(RoleService);
  private readonly rolePermissionSvc = inject(RolePermissionService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<RoleWithPermissionsResponseDto | null>(null);

  readonly roleId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly roleCode = computed(() => {
    const id = this.detalle()?.id_rol;
    return id ? `R${id.toString().padStart(4, '0')}` : 'R0000';
  });

  readonly totalPermisos = computed(() => this.detalle()?.permisos.length ?? 0);

  readonly permisosActivos = computed(
    () => this.detalle()?.permisos.filter((permiso) => permiso.activo).length ?? 0,
  );

  readonly permisosInactivos = computed(() => this.totalPermisos() - this.permisosActivos());

  readonly permisosPorId = computed(
    () => new Map(this.detalle()?.permisos.map((permiso) => [permiso.id_permiso, permiso]) ?? []),
  );

  readonly gruposPermisos = computed<PermissionGroup[]>(() => {
    const detail = this.detalle();
    if (!detail) {
      return [];
    }

    const order: Record<PermissionTier, number> = {
      ver: 0,
      crear: 1,
      editar: 2,
      especial: 3,
    };

    const grouped = new Map<string, PermissionInRoleDto[]>();

    for (const permiso of detail.permisos) {
      const modulo = permiso.modulo?.trim() || 'General';
      if (!grouped.has(modulo)) {
        grouped.set(modulo, []);
      }
      grouped.get(modulo)!.push(permiso);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([modulo, permisos]) => {
        const sorted = [...permisos].sort((left, right) => {
          const tierDiff = order[inferTier(left.nombre)] - order[inferTier(right.nombre)];
          if (tierDiff !== 0) {
            return tierDiff;
          }

          if (left.activo !== right.activo) {
            return Number(right.activo) - Number(left.activo);
          }

          return left.nombre.localeCompare(right.nombre);
        });

        return {
          modulo,
          permisos: sorted,
          total: sorted.length,
          activos: sorted.filter((permiso) => permiso.activo).length,
        };
      });
  });

  readonly totalModulos = computed(() => this.gruposPermisos().length);

  readonly canEdit = computed(() => {
    const rol = this.detalle();
    return !!rol && rol.id_rol !== 1;
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.roleId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de rol inválido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = forkJoin({
        rol: this.roleSvc.getRoleById(id),
        detalle: this.rolePermissionSvc.loadPermissionsByRole(id),
      }).subscribe({
        next: ({ rol, detalle }) => {
          this.detalle.set({
            id_rol: rol.id_rol,
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            activo: rol.activo,
            permisos: detalle.permisos ?? [],
          });
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(
            error?.error?.message ?? 'No se pudo cargar el detalle del rol y sus permisos.',
          );
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/admin/roles-permisos']);
  }

  irEditar(): void {
    const id = this.detalle()?.id_rol;
    if (!id || id === 1) {
      return;
    }

    this.router.navigate(['/admin/roles-permisos/editar-roles-permisos', id]);
  }

  getPermisosLabel(count: number): string {
    if (count === 0) return 'Sin permisos';
    if (count === 1) return '1 permiso';
    return `${count} permisos`;
  }

  getPermisosTagSeverity(count: number): 'success' | 'warn' | 'danger' {
    if (count === 0) return 'danger';
    if (count < 5) return 'warn';
    return 'success';
  }

  tierLabel(nombre: string): string {
    const tier = inferTier(nombre);
    return {
      ver: 'Listado',
      crear: 'Crear',
      editar: 'Editar',
      especial: 'Especial',
    }[tier];
  }

  tierClass(nombre: string): string {
    return `permission-tier-dot permission-tier-dot--${inferTier(nombre)}`;
  }

  dependencyName(dependeDe: number | null): string {
    if (!dependeDe) {
      return '';
    }

    return this.permisosPorId().get(dependeDe)?.nombre ?? `Permiso #${dependeDe}`;
  }
}
