"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FormularioSede = exports.NoNumbersDirective = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var button_1 = require("primeng/button");
var card_1 = require("primeng/card");
var divider_1 = require("primeng/divider");
var inputtext_1 = require("primeng/inputtext");
var inputnumber_1 = require("primeng/inputnumber");
var confirmdialog_1 = require("primeng/confirmdialog");
var toast_1 = require("primeng/toast");
var autocomplete_1 = require("primeng/autocomplete");
var message_1 = require("primeng/message");
var api_1 = require("primeng/api");
var rxjs_1 = require("rxjs");
var sede_service_1 = require("../../../../services/sede.service");
var departamentos_provincias_1 = require("../../../../shared/data/departamentos-provincias");
// ── Directiva ────────────────────────────────────────────────────────────────
var NoNumbersDirective = /** @class */ (function () {
    function NoNumbersDirective(el) {
        this.el = el;
    }
    NoNumbersDirective.prototype.onKeyPress = function (event) {
        var allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
        if (allowed.includes(event.key))
            return true;
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    };
    NoNumbersDirective.prototype.onPaste = function (event) {
        var _a;
        var text = ((_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text')) || '';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text)) {
            event.preventDefault();
            return false;
        }
        return true;
    };
    __decorate([
        core_1.HostListener('keypress', ['$event'])
    ], NoNumbersDirective.prototype, "onKeyPress");
    __decorate([
        core_1.HostListener('paste', ['$event'])
    ], NoNumbersDirective.prototype, "onPaste");
    NoNumbersDirective = __decorate([
        core_1.Directive({ selector: '[appNoNumbers]', standalone: true })
    ], NoNumbersDirective);
    return NoNumbersDirective;
}());
exports.NoNumbersDirective = NoNumbersDirective;
// ── Componente ───────────────────────────────────────────────────────────────
var FormularioSede = /** @class */ (function () {
    function FormularioSede(confirmationService, messageService, router) {
        var _this = this;
        this.confirmationService = confirmationService;
        this.messageService = messageService;
        this.router = router;
        // ── Servicios ──────────────────────────────────────────────────────────────
        this.sedeService = core_1.inject(sede_service_1.SedeService);
        this.route = core_1.inject(router_1.ActivatedRoute);
        // ── Estado de modo ─────────────────────────────────────────────────────────
        this.sedeId = null;
        this.isEditMode = core_1.signal(false);
        this.submitted = core_1.signal(false);
        this.allowNavigate = false;
        this.title = core_1.computed(function () {
            return _this.isEditMode() ? 'EDITAR SEDE' : 'REGISTRAR SEDE';
        });
        this.submitLabel = core_1.computed(function () {
            return _this.isEditMode() ? 'Guardar cambios' : 'Registrar Sede';
        });
        this.submitIcon = core_1.computed(function () {
            return _this.isEditMode() ? 'pi pi-save' : 'pi pi-plus';
        });
        // ── Señales del servicio ───────────────────────────────────────────────────
        this.loading = this.sedeService.loading;
        this.error = this.sedeService.error;
        // ── Modelo del formulario ──────────────────────────────────────────────────
        this.sede = {
            codigo: '',
            nombre: '',
            departamento: '',
            provincia: '',
            ciudad: '',
            telefono: '',
            direccion: ''
        };
        // ── Autocomplete data ──────────────────────────────────────────────────────
        this.departamentos = Object.keys(departamentos_provincias_1.DEPARTAMENTOS_PROVINCIAS);
        this.filteredDepartamentos = [];
        this.provincias = [];
        this.filteredProvincias = [];
        this.distritos = [];
        this.filteredDistritos = [];
    }
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    FormularioSede.prototype.ngOnInit = function () {
        var _a;
        var idStr = (_a = this.route.snapshot.paramMap.get('id')) !== null && _a !== void 0 ? _a : this.route.snapshot.queryParamMap.get('id');
        if (idStr) {
            this.sedeId = parseInt(idStr, 10);
            this.isEditMode.set(true);
            this.loadSede();
        }
    };
    FormularioSede.prototype.loadSede = function () {
        var _this = this;
        if (!this.sedeId)
            return;
        this.sedeService.getSedeById(this.sedeId).subscribe({
            next: function (data) {
                var _a;
                _this.sede = {
                    codigo: data.codigo,
                    nombre: data.nombre,
                    departamento: data.departamento,
                    provincia: '',
                    ciudad: data.ciudad,
                    telefono: (_a = data.telefono) !== null && _a !== void 0 ? _a : '',
                    direccion: data.direccion
                };
                _this.resolveProvinciaFromCiudad();
            },
            error: function () {
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar la sede.'
                });
            }
        });
    };
    FormularioSede.prototype.resolveProvinciaFromCiudad = function () {
        var _this = this;
        var provinciasData = departamentos_provincias_1.DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
        var encontrada = provinciasData.find(function (p) {
            return p.distritos.includes(_this.sede.ciudad);
        });
        if (encontrada) {
            this.sede.provincia = encontrada.nombre;
            this.provincias = provinciasData.map(function (p) { return p.nombre; });
            this.distritos = encontrada.distritos;
        }
    };
    // ── Helpers de input ───────────────────────────────────────────────────────
    FormularioSede.prototype.toUpperCase = function (field) {
        this.sede[field] = this.sede[field].toUpperCase();
    };
    FormularioSede.prototype.onlyNumbers = function (event) {
        var allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
        if (allowed.includes(event.key))
            return true;
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    };
    // ── Autocomplete ───────────────────────────────────────────────────────────
    FormularioSede.prototype.filterDepartamentos = function (event) {
        var q = event.query.toLowerCase();
        this.filteredDepartamentos = this.departamentos.filter(function (d) {
            return d.toLowerCase().includes(q);
        });
    };
    FormularioSede.prototype.filterProvincias = function (event) {
        var q = event.query.toLowerCase();
        this.filteredProvincias = this.provincias.filter(function (p) {
            return p.toLowerCase().includes(q);
        });
    };
    FormularioSede.prototype.filterDistritos = function (event) {
        var q = event.query.toLowerCase();
        this.filteredDistritos = this.distritos.filter(function (d) {
            return d.toLowerCase().includes(q);
        });
    };
    FormularioSede.prototype.onDepartamentoSelect = function () {
        var provinciasData = departamentos_provincias_1.DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
        this.provincias = provinciasData.map(function (p) { return p.nombre; });
        this.sede.provincia = '';
        this.sede.ciudad = '';
        this.distritos = [];
        this.filteredProvincias = [];
        this.filteredDistritos = [];
    };
    FormularioSede.prototype.onProvinciaSelect = function () {
        var _this = this;
        var provinciasData = departamentos_provincias_1.DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
        var seleccionada = provinciasData.find(function (p) { return p.nombre === _this.sede.provincia; });
        this.distritos = (seleccionada === null || seleccionada === void 0 ? void 0 : seleccionada.distritos) || [];
        this.sede.ciudad = '';
        this.filteredDistritos = [];
    };
    // ── Validaciones de selección ──────────────────────────────────────────────
    FormularioSede.prototype.validarCamposUbicacion = function () {
        if (!this.departamentos.includes(this.sede.departamento)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Departamento inválido',
                detail: 'Seleccione un departamento de la lista.'
            });
            return false;
        }
        if (!this.provincias.includes(this.sede.provincia)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Provincia inválida',
                detail: 'Seleccione una provincia de la lista.'
            });
            return false;
        }
        if (!this.distritos.includes(this.sede.ciudad)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Distrito inválido',
                detail: 'Seleccione un distrito de la lista.'
            });
            return false;
        }
        return true;
    };
    FormularioSede.prototype.validarTelefono = function () {
        var _a;
        var tel = String((_a = this.sede.telefono) !== null && _a !== void 0 ? _a : '').trim();
        if (tel.length !== 9 || !/^\d{9}$/.test(tel)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Teléfono inválido',
                detail: 'El teléfono debe tener exactamente 9 dígitos numéricos.'
            });
            return null;
        }
        return tel;
    };
    FormularioSede.prototype.buildPayload = function (telefonoStr) {
        return {
            codigo: this.sede.codigo.trim().toUpperCase(),
            nombre: this.sede.nombre.trim().toUpperCase(),
            ciudad: this.sede.ciudad.trim(),
            departamento: this.sede.departamento.trim(),
            direccion: this.sede.direccion.trim().toUpperCase(),
            telefono: telefonoStr
        };
    };
    // ── Submit ─────────────────────────────────────────────────────────────────
    FormularioSede.prototype.onSubmit = function (form) {
        this.submitted.set(true);
        if (form.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos incompletos',
                detail: 'Completa los campos obligatorios.'
            });
            return;
        }
        if (!this.validarCamposUbicacion())
            return;
        var telefonoStr = this.validarTelefono();
        if (!telefonoStr)
            return;
        var payload = this.buildPayload(telefonoStr);
        this.isEditMode() ? this.update(payload) : this.create(payload);
    };
    FormularioSede.prototype.create = function (payload) {
        var _this = this;
        this.sedeService.createSede(payload, 'Administrador').subscribe({
            next: function (created) {
                _this.allowNavigate = true;
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Sede registrada',
                    detail: "Se registr\u00F3 la sede " + created.nombre + " (" + created.codigo + ")."
                });
                _this.router.navigate(['/admin/sedes']);
            },
            error: function (err) {
                var normalized = _this.normalizeMessage(_this.extractServerMessage(err));
                var isDuplicate = _this.isDuplicateCodeError(normalized);
                _this.messageService.add({
                    severity: isDuplicate ? 'warn' : 'error',
                    summary: isDuplicate ? 'Código duplicado' : 'Error',
                    detail: isDuplicate
                        ? 'Ya existe una sede con ese código.'
                        : 'No se pudo registrar la sede.',
                    styleClass: isDuplicate ? 'duplicate-entity-toast' : undefined
                });
            }
        });
    };
    FormularioSede.prototype.update = function (payload) {
        var _this = this;
        if (!this.sedeId)
            return;
        this.sedeService.updateSede(this.sedeId, payload, 'Administrador').subscribe({
            next: function () {
                _this.allowNavigate = true;
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Sede actualizada',
                    detail: 'La sede se actualizó correctamente.'
                });
                setTimeout(function () { return _this.router.navigate(['/admin/sedes']); }, 1500);
            },
            error: function () {
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar la sede.'
                });
            }
        });
    };
    // ── Cancelar / Guard ───────────────────────────────────────────────────────
    FormularioSede.prototype.confirmCancel = function () {
        var _this = this;
        var _a;
        if (!((_a = this.sedeForm) === null || _a === void 0 ? void 0 : _a.dirty)) {
            this.navigateWithToast();
            return;
        }
        this.confirmDiscardChanges().subscribe(function (confirmed) {
            if (confirmed) {
                _this.allowNavigate = true;
                _this.navigateWithToast();
            }
        });
    };
    FormularioSede.prototype.canDeactivate = function () {
        var _a;
        if (this.allowNavigate || !((_a = this.sedeForm) === null || _a === void 0 ? void 0 : _a.dirty))
            return true;
        return this.confirmDiscardChanges();
    };
    FormularioSede.prototype.confirmDiscardChanges = function () {
        var _this = this;
        var result = new rxjs_1.Subject();
        this.confirmationService.confirm({
            header: 'Cambios sin guardar',
            message: 'Tienes cambios sin guardar. ¿Deseas salir?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Salir',
            rejectLabel: 'Continuar',
            acceptButtonProps: { severity: 'danger' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: function () {
                _this.allowNavigate = true;
                result.next(true);
                result.complete();
            },
            reject: function () {
                result.next(false);
                result.complete();
            }
        });
        return result.asObservable();
    };
    FormularioSede.prototype.navigateWithToast = function () {
        var _this = this;
        this.messageService.add({
            severity: 'info',
            summary: 'Cancelado',
            detail: this.isEditMode()
                ? 'Se canceló la edición de la sede.'
                : 'Se canceló el registro de la sede.'
        });
        setTimeout(function () { return _this.router.navigate(['/admin/sedes']); }, 1500);
    };
    // ── Helpers de error ───────────────────────────────────────────────────────
    FormularioSede.prototype.extractServerMessage = function (error) {
        if (!error || typeof error !== 'object')
            return '';
        var candidate = error;
        if (typeof candidate.error === 'string')
            return candidate.error;
        if (candidate.error && typeof candidate.error === 'object') {
            var nested = candidate.error.message;
            if (Array.isArray(nested))
                return nested.filter(Boolean).join(' | ');
            if (typeof nested === 'string')
                return nested;
            if (typeof candidate.error.error === 'string')
                return candidate.error.error;
        }
        if (typeof candidate.message === 'string')
            return candidate.message;
        return '';
    };
    FormularioSede.prototype.normalizeMessage = function (value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };
    FormularioSede.prototype.isDuplicateCodeError = function (msg) {
        var isDuplicate = msg.includes('ya existe') ||
            msg.includes('duplicate') ||
            msg.includes('already exists') ||
            msg.includes('duplicado');
        var isCode = msg.includes('codigo') ||
            msg.includes('code') ||
            msg.includes('sede.codigo');
        return isDuplicate && isCode;
    };
    __decorate([
        core_1.ViewChild('sedeForm')
    ], FormularioSede.prototype, "sedeForm");
    FormularioSede = __decorate([
        core_1.Component({
            selector: 'app-formulario-sede',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                button_1.ButtonModule,
                card_1.CardModule,
                divider_1.DividerModule,
                inputtext_1.InputTextModule,
                inputnumber_1.InputNumberModule,
                confirmdialog_1.ConfirmDialogModule,
                toast_1.ToastModule,
                autocomplete_1.AutoCompleteModule,
                message_1.Message,
                NoNumbersDirective,
            ],
            providers: [api_1.ConfirmationService, api_1.MessageService],
            templateUrl: './formulario-sede.html',
            styleUrl: './formulario-sede.css'
        })
    ], FormularioSede);
    return FormularioSede;
}());
exports.FormularioSede = FormularioSede;
