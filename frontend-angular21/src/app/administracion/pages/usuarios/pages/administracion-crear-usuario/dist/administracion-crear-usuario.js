"use strict";
/* apps/frontend/src/app/admin/usuarios/administracion-crear-usuario/administracion-crear-usuario.ts */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AdministracionCrearUsuario = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var table_1 = require("primeng/table");
var button_1 = require("primeng/button");
var tag_1 = require("primeng/tag");
var card_1 = require("primeng/card");
var inputtext_1 = require("primeng/inputtext");
var select_1 = require("primeng/select");
var password_1 = require("primeng/password");
var api_1 = require("primeng/api");
var toast_1 = require("primeng/toast");
var message_1 = require("primeng/message");
var confirmdialog_1 = require("primeng/confirmdialog");
var dialog_1 = require("primeng/dialog");
var tooltip_1 = require("primeng/tooltip");
var shared_table_container_component_1 = require("../../../../../shared/components/table.componente/shared-table-container.component");
var AdministracionCrearUsuario = /** @class */ (function () {
    function AdministracionCrearUsuario(router, usuarioService, authService, sedeService, cdr, confirmationService, messageService, roleService) {
        this.router = router;
        this.usuarioService = usuarioService;
        this.authService = authService;
        this.sedeService = sedeService;
        this.cdr = cdr;
        this.confirmationService = confirmationService;
        this.messageService = messageService;
        this.roleService = roleService;
        this.allUsers = [];
        this.cargandoUsuarios = false;
        this.errorUsuarios = '';
        this.filtroDni = '';
        this.filtroEstado = true;
        this.filtroSede = null;
        this.filtroRol = null;
        this.paginaActual = core_1.signal(1);
        this.limitePagina = core_1.signal(5);
        this.estados = [
            { label: 'Todos', value: null },
            { label: 'Activo', value: true },
            { label: 'Inactivo', value: false },
        ];
        this.Sede = [];
        this.Rol = [];
        this.dialogVisible = false;
        this.usuarioSeleccionado = core_1.signal(null);
        this.showCredModal = false;
        this.credLoading = false;
        this.credUsuarioId = 0;
        this.credUsuarioNombre = '';
        this.credNomUsu = '';
        this.credPassword = '';
        this.credConfirm = '';
    }
    Object.defineProperty(AdministracionCrearUsuario.prototype, "usuariosFiltrados", {
        get: function () {
            var _this = this;
            var result = __spreadArrays(this.allUsers);
            if (this.filtroDni.trim())
                result = result.filter(function (u) { return (u.dni || '').includes(_this.filtroDni.trim()); });
            if (this.filtroSede !== null)
                result = result.filter(function (u) { return u.id_sede === _this.filtroSede; });
            if (this.filtroRol !== null) {
                result = result.filter(function (u) {
                    var rol = (u.rolNombre || u.rol_nombre || u.rol || u.role || '').toUpperCase();
                    return rol === _this.filtroRol;
                });
            }
            return result;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AdministracionCrearUsuario.prototype, "usuariosPaginados", {
        get: function () {
            var inicio = (this.paginaActual() - 1) * this.limitePagina();
            return this.usuariosFiltrados.slice(inicio, inicio + this.limitePagina());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AdministracionCrearUsuario.prototype, "totalusers", {
        get: function () {
            return this.usuariosFiltrados.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AdministracionCrearUsuario.prototype, "totalPaginas", {
        get: function () {
            return Math.ceil(this.usuariosFiltrados.length / this.limitePagina());
        },
        enumerable: false,
        configurable: true
    });
    AdministracionCrearUsuario.prototype.onPageChange = function (page) {
        this.paginaActual.set(page);
    };
    AdministracionCrearUsuario.prototype.onLimitChange = function (limit) {
        this.limitePagina.set(limit);
        this.paginaActual.set(1);
    };
    AdministracionCrearUsuario.prototype.ngOnInit = function () {
        var _this = this;
        var _a;
        this.cargandoUsuarios = true;
        var currentUser = this.authService.getCurrentUser();
        this.filtroSede = (_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.idSede) !== null && _a !== void 0 ? _a : null;
        rxjs_1.forkJoin({
            sedes: this.sedeService.getSedes(),
            usuarios: this.usuarioService.getUsuariosPorEstado(true),
            roles: this.roleService.loadRoles()
        }).subscribe({
            next: function (_a) {
                var sedes = _a.sedes, usuarios = _a.usuarios, roles = _a.roles;
                _this.Sede = __spreadArrays([
                    { label: 'Todas', value: null }
                ], sedes.headquarters.map(function (s) { return ({ label: s.nombre, value: s.id_sede }); }));
                _this.Rol = __spreadArrays([
                    { label: 'Todos', value: null }
                ], roles
                    .filter(function (r) { return r.activo; })
                    .map(function (r) { return ({
                    label: r.nombre.toUpperCase(),
                    value: r.nombre.toUpperCase()
                }); }));
                _this.allUsers = usuarios.users;
                _this.cargandoUsuarios = false;
                _this.cdr.detectChanges();
            },
            error: function () {
                _this.cargandoUsuarios = false;
                _this.errorUsuarios = 'Error al cargar datos';
            }
        });
    };
    AdministracionCrearUsuario.prototype.onEstadoChange = function () {
        var _this = this;
        this.cargandoUsuarios = true;
        this.paginaActual.set(1);
        var request$ = this.filtroEstado === null
            ? this.usuarioService.getUsuarios()
            : this.usuarioService.getUsuariosPorEstado(this.filtroEstado);
        request$.subscribe({
            next: function (resp) {
                _this.allUsers = resp.users;
                _this.cargandoUsuarios = false;
                _this.cdr.detectChanges();
            },
            error: function () {
                _this.cargandoUsuarios = false;
                _this.errorUsuarios = 'Error al filtrar usuarios';
            }
        });
    };
    AdministracionCrearUsuario.prototype.onSedeChange = function () {
        this.paginaActual.set(1);
    };
    AdministracionCrearUsuario.prototype.onRolChange = function () {
        this.paginaActual.set(1);
    };
    AdministracionCrearUsuario.prototype.aplicarFiltros = function () {
        this.paginaActual.set(1);
    };
    AdministracionCrearUsuario.prototype.limpiarFiltro = function () {
        this.filtroDni = '';
        this.filtroEstado = null;
        this.filtroSede = null;
        this.filtroRol = null;
        this.paginaActual.set(1);
        this.onEstadoChange();
    };
    AdministracionCrearUsuario.prototype.nuevoUsuario = function () {
        this.router.navigate(['/admin/usuarios/crear-usuario']);
    };
    AdministracionCrearUsuario.prototype.verDetalle = function (usuario) {
        this.usuarioSeleccionado.set(usuario);
        this.dialogVisible = true;
    };
    AdministracionCrearUsuario.prototype.confirmToggleStatus = function (usuario) {
        var _this = this;
        var nextStatus = !usuario.activo;
        var verb = nextStatus ? 'activar' : 'desactivar';
        this.confirmationService.confirm({
            header: 'Confirmación',
            message: "\u00BFDeseas " + verb + " el usuario " + usuario.usu_nom + " (" + usuario.dni + ")?",
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: nextStatus ? 'Activar' : 'Desactivar',
            rejectLabel: 'Cancelar',
            acceptButtonProps: { severity: (nextStatus ? 'success' : 'danger') },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: function () {
                _this.usuarioService
                    .updateUsuarioStatus(usuario.id_usuario, { activo: nextStatus })
                    .subscribe({
                    next: function () {
                        usuario.activo = nextStatus;
                        _this.messageService.add({
                            severity: 'success',
                            summary: nextStatus ? 'Usuario activado' : 'Usuario desactivado',
                            detail: nextStatus
                                ? "Se activ\u00F3 el usuario " + usuario.usu_nom + "."
                                : "Se desactiv\u00F3 el usuario " + usuario.usu_nom + "."
                        });
                        _this.onEstadoChange();
                    },
                    error: function (err) {
                        var _a, _b;
                        _this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'No se pudo cambiar el estado del usuario.'
                        });
                    }
                });
            }
        });
    };
    AdministracionCrearUsuario.prototype.openCredModal = function (usuario) {
        var _this = this;
        this.credUsuarioId = usuario.id_usuario;
        this.credUsuarioNombre = (usuario.usu_nom + " " + usuario.ape_pat + " " + usuario.ape_mat).trim();
        this.credNomUsu = '';
        this.credPassword = '';
        this.credConfirm = '';
        this.credLoading = true;
        this.showCredModal = true;
        this.usuarioService.getAccountByUserId(usuario.id_usuario).subscribe({
            next: function (res) {
                _this.credNomUsu = res.nom_usu;
                _this.credLoading = false;
            },
            error: function () {
                _this.credLoading = false;
            }
        });
    };
    AdministracionCrearUsuario.prototype.closeCredModal = function () {
        this.showCredModal = false;
        this.credNomUsu = '';
        this.credPassword = '';
        this.credConfirm = '';
    };
    AdministracionCrearUsuario.prototype.saveCredentials = function () {
        var _this = this;
        var nom_usu = this.credNomUsu.trim();
        var nueva_contraseña = this.credPassword.trim();
        var confirmar = this.credConfirm.trim();
        if (!nom_usu && !nueva_contraseña) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'Debes completar al menos el nombre de usuario o la contraseña.',
                life: 4000
            });
            return;
        }
        if (nueva_contraseña && nueva_contraseña !== confirmar) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Las contraseñas no coinciden.',
                life: 4000
            });
            return;
        }
        var body = {};
        if (nom_usu)
            body.nom_usu = nom_usu;
        if (nueva_contraseña)
            body.nueva_contraseña = nueva_contraseña;
        this.credLoading = true;
        this.usuarioService.changeCredentials(this.credUsuarioId, body).subscribe({
            next: function () {
                _this.credLoading = false;
                _this.closeCredModal();
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Credenciales actualizadas',
                    detail: "Las credenciales de " + _this.credUsuarioNombre + " fueron actualizadas.",
                    life: 3500
                });
            },
            error: function (err) {
                var _a, _b;
                _this.credLoading = false;
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'No se pudieron actualizar las credenciales.',
                    life: 4000
                });
            }
        });
    };
    AdministracionCrearUsuario = __decorate([
        core_1.Component({
            selector: 'app-administracion-crear-usuario',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                table_1.TableModule,
                button_1.ButtonModule,
                tag_1.TagModule,
                card_1.CardModule,
                inputtext_1.InputTextModule,
                select_1.SelectModule,
                password_1.PasswordModule,
                router_1.RouterModule,
                toast_1.ToastModule,
                message_1.MessageModule,
                confirmdialog_1.ConfirmDialogModule,
                dialog_1.DialogModule,
                tooltip_1.TooltipModule,
                shared_table_container_component_1.SharedTableContainerComponent,
            ],
            providers: [api_1.ConfirmationService, api_1.MessageService],
            templateUrl: './administracion-crear-usuario.html',
            styleUrls: ['./administracion-crear-usuario.css']
        })
    ], AdministracionCrearUsuario);
    return AdministracionCrearUsuario;
}());
exports.AdministracionCrearUsuario = AdministracionCrearUsuario;
