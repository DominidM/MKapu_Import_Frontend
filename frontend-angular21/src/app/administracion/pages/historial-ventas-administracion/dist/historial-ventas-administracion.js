"use strict";
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
exports.HistorialVentasAdministracion = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var rxjs_1 = require("rxjs");
var card_1 = require("primeng/card");
var button_1 = require("primeng/button");
var select_1 = require("primeng/select");
var table_1 = require("primeng/table");
var tag_1 = require("primeng/tag");
var toast_1 = require("primeng/toast");
var confirmdialog_1 = require("primeng/confirmdialog");
var datepicker_1 = require("primeng/datepicker");
var tooltip_1 = require("primeng/tooltip");
var autocomplete_1 = require("primeng/autocomplete");
var api_1 = require("primeng/api");
var loading_overlay_component_1 = require("../../../shared/components/loading-overlay/loading-overlay.component");
var Paginador_component_1 = require("../../../shared/components/paginador/Paginador.component");
var ventas_service_1 = require("../../services/ventas.service");
var auth_service_1 = require("../../../auth/services/auth.service");
var excel_utils_1 = require("../../utils/excel.utils");
var date_peru_utils_1 = require("../../../shared/utils/date-peru.utils");
var HistorialVentasAdministracion = /** @class */ (function () {
    function HistorialVentasAdministracion() {
        this.router = core_1.inject(router_1.Router);
        this.ventasService = core_1.inject(ventas_service_1.VentasAdminService);
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.messageService = core_1.inject(api_1.MessageService);
        this.confirmationService = core_1.inject(api_1.ConfirmationService);
        this.cdr = core_1.inject(core_1.ChangeDetectorRef);
        this.tituloKicker = 'VENTAS - HISTORIAL DE VENTAS';
        this.subtituloKicker = 'CONSULTA Y GESTIÓN DE VENTAS';
        this.iconoCabecera = 'pi pi-list';
        this.subscriptions = new rxjs_1.Subscription();
        this.busquedaSubject = new rxjs_1.Subject();
        this.comprobantes = [];
        this.comprobantesFiltrados = [];
        this.sedes = [];
        this.sedesOptions = [];
        this.tiposComprobante = [{ label: 'Todos', value: null }];
        this.metodosPago = [{ label: 'Todos', value: null }];
        this.firstRow = 0;
        this.estadosComprobante = [
            { label: 'Todos', value: null },
            { label: 'Emitido', value: 'EMITIDO' },
            { label: 'Anulado', value: 'ANULADO' },
            { label: 'Rechazado', value: 'RECHAZADO' },
            { label: 'Pendiente', value: 'PENDIENTE' },
        ];
        this.filtros = {
            sedeSeleccionada: null,
            tipoComprobante: null,
            estado: 'EMITIDO',
            fechaInicio: date_peru_utils_1.getLunesSemanaActualPeru(),
            fechaFin: date_peru_utils_1.getDomingoSemanaActualPeru(),
            busqueda: '',
            tipoPago: null
        };
        this.rangoSemanaLabel = core_1.computed(function () {
            return "Semana: " + date_peru_utils_1.formatFechaPeru(date_peru_utils_1.getLunesSemanaActualPeru()) + " - " + date_peru_utils_1.formatFechaPeru(date_peru_utils_1.getDomingoSemanaActualPeru());
        });
        this.sugerenciasBusqueda = [];
        this.todasLasSugerencias = [];
        this.loading = false;
        this.paginaActual = 1;
        this.limitePorPagina = 5;
        this.totalRegistros = 0;
        this.totalPaginas = 0;
        this.totalVentas = 0;
        this.numeroVentas = 0;
        this.totalBoletas = 0;
        this.totalFacturas = 0;
    }
    HistorialVentasAdministracion.prototype.ngOnInit = function () {
        var _this = this;
        var user = this.authService.getCurrentUser();
        if (user === null || user === void 0 ? void 0 : user.idSede) {
            this.filtros.sedeSeleccionada = user.idSede;
        }
        this.cargarSedes();
        this.cargarTiposComprobante();
        this.cargarMetodosPago();
        this.cargarComprobantes();
        this.cargarKpis();
        var subBusqueda = this.busquedaSubject
            .pipe(rxjs_1.debounceTime(300), rxjs_1.distinctUntilChanged(), rxjs_1.switchMap(function (query) {
            var _a;
            if (query.length < 3)
                return [];
            return _this.ventasService.listarHistorialVentas({
                page: 1,
                limit: 10,
                search: query,
                sedeId: (_a = _this.filtros.sedeSeleccionada) !== null && _a !== void 0 ? _a : undefined
            });
        }))
            .subscribe({
            next: function (res) {
                var _a, _b, _c;
                var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.receipts) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : [];
                var set = new Set();
                data.forEach(function (c) {
                    var _a, _b;
                    var nombre = (_a = c.clienteNombre) === null || _a === void 0 ? void 0 : _a.trim();
                    var doc = (_b = c.clienteDocumento) === null || _b === void 0 ? void 0 : _b.trim();
                    if (nombre && doc)
                        set.add(nombre + " - " + doc); // ← juntos
                    else if (nombre)
                        set.add(nombre);
                    else if (doc)
                        set.add(doc);
                });
                _this.sugerenciasBusqueda = Array.from(set).slice(0, 15);
                _this.cdr.markForCheck();
            },
            error: function () { return (_this.sugerenciasBusqueda = []); }
        });
        this.subscriptions.add(subBusqueda);
        this.messageService.add({
            severity: 'success',
            summary: 'Modo Administración',
            detail: 'Visualizando ventas de todas las sedes',
            life: 3000
        });
    };
    HistorialVentasAdministracion.prototype.ngOnDestroy = function () {
        this.busquedaSubject.complete();
        this.subscriptions.unsubscribe();
    };
    HistorialVentasAdministracion.prototype.onSeleccionarSugerencia = function (event) {
        var _a;
        var valor = (_a = event.value) !== null && _a !== void 0 ? _a : '';
        // Extrae solo el nombre (parte antes del " - ")
        var partes = valor.split(' - ');
        this.filtros.busqueda = partes[0].trim();
        this.aplicarFiltros();
    };
    HistorialVentasAdministracion.prototype.onBusquedaKeyUp = function (event) {
        if (event.key === 'Enter') {
            this.aplicarFiltros();
        }
    };
    HistorialVentasAdministracion.prototype.cargarSedes = function () {
        var _this = this;
        var sub = this.ventasService.obtenerSedes().subscribe({
            next: function (data) {
                _this.sedes = data.filter(function (s) { return s.activo; });
                _this.sedesOptions = __spreadArrays([
                    { label: 'Todas las sedes', value: null }
                ], _this.sedes.map(function (s) { return ({ label: s.nombre, value: s.id_sede }); }));
                _this.cdr.markForCheck();
            },
            error: function () {
                return _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las sedes',
                    life: 3000
                });
            }
        });
        this.subscriptions.add(sub);
    };
    HistorialVentasAdministracion.prototype.cargarTiposComprobante = function () {
        var _this = this;
        var sub = this.ventasService.obtenerTiposComprobante().subscribe({
            next: function (tipos) {
                _this.tiposComprobante = __spreadArrays([
                    { label: 'Todos', value: null }
                ], tipos.map(function (t) { return ({ label: t.descripcion, value: t.id }); }));
                _this.cdr.markForCheck();
            },
            error: function () { return console.warn('No se pudieron cargar los tipos de comprobante'); }
        });
        this.subscriptions.add(sub);
    };
    HistorialVentasAdministracion.prototype.cargarMetodosPago = function () {
        var _this = this;
        var sub = this.ventasService.obtenerMetodosPago().subscribe({
            next: function (metodos) {
                _this.metodosPago = __spreadArrays([
                    { label: 'Todos', value: null }
                ], metodos.map(function (m) { return ({ label: m.descripcion, value: m.id }); }));
                _this.cdr.markForCheck();
            },
            error: function () { return console.warn('No se pudieron cargar los métodos de pago'); }
        });
        this.subscriptions.add(sub);
    };
    HistorialVentasAdministracion.prototype.cargarKpis = function () {
        var _this = this;
        var _a;
        var sub = this.ventasService
            .getKpiSemanal((_a = this.filtros.sedeSeleccionada) !== null && _a !== void 0 ? _a : undefined)
            .subscribe({
            next: function (kpi) {
                var _a, _b, _c, _d;
                _this.totalVentas = (_a = kpi.total_ventas) !== null && _a !== void 0 ? _a : 0;
                _this.numeroVentas = (_b = kpi.cantidad_ventas) !== null && _b !== void 0 ? _b : 0;
                _this.totalBoletas = (_c = kpi.cantidad_boletas) !== null && _c !== void 0 ? _c : 0;
                _this.totalFacturas = (_d = kpi.cantidad_facturas) !== null && _d !== void 0 ? _d : 0;
                _this.cdr.markForCheck();
            },
            error: function () { return console.warn('No se pudieron cargar KPIs'); }
        });
        this.subscriptions.add(sub);
    };
    HistorialVentasAdministracion.prototype.cargarComprobantes = function () {
        var _this = this;
        var _a, _b, _c, _d;
        this.loading = true;
        var query = {
            page: this.paginaActual,
            limit: this.limitePorPagina,
            sedeId: (_a = this.filtros.sedeSeleccionada) !== null && _a !== void 0 ? _a : undefined,
            receiptTypeId: (_b = this.filtros.tipoComprobante) !== null && _b !== void 0 ? _b : undefined,
            status: (_c = this.filtros.estado) !== null && _c !== void 0 ? _c : undefined,
            paymentMethodId: (_d = this.filtros.tipoPago) !== null && _d !== void 0 ? _d : undefined,
            dateFrom: this.filtros.fechaInicio
                ? this.filtros.fechaInicio.toISOString().split('T')[0]
                : undefined,
            dateTo: this.filtros.fechaFin ? this.filtros.fechaFin.toISOString().split('T')[0] : undefined,
            search: this.filtros.busqueda.trim() || undefined,
            _t: Date.now()
        };
        var sub = this.ventasService.listarHistorialVentas(query).subscribe({
            next: function (res) {
                var _a, _b, _c;
                var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.receipts) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : [];
                _this.comprobantes = Array.isArray(data) ? data : [];
                _this.comprobantesFiltrados = __spreadArrays(_this.comprobantes);
                _this.cargarSugerenciasBusqueda();
                _this.loading = false;
                setTimeout(function () {
                    var _a, _b;
                    _this.totalRegistros = (_a = res === null || res === void 0 ? void 0 : res.total) !== null && _a !== void 0 ? _a : _this.comprobantes.length;
                    _this.totalPaginas = (_b = res === null || res === void 0 ? void 0 : res.total_pages) !== null && _b !== void 0 ? _b : 1;
                    _this.cdr.markForCheck();
                });
            },
            error: function () {
                _this.loading = false;
                _this.comprobantes = [];
                _this.comprobantesFiltrados = [];
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el historial de ventas',
                    life: 3000
                });
            }
        });
        this.subscriptions.add(sub);
    };
    HistorialVentasAdministracion.prototype.cargarSugerenciasBusqueda = function () {
        var set = new Set();
        this.comprobantes.forEach(function (c) {
            var _a, _b;
            var nombre = (_a = c.clienteNombre) === null || _a === void 0 ? void 0 : _a.trim();
            var doc = (_b = c.clienteDocumento) === null || _b === void 0 ? void 0 : _b.trim();
            if (nombre && doc)
                set.add(nombre + " - " + doc); // ← juntos
            else if (nombre)
                set.add(nombre);
            else if (doc)
                set.add(doc);
        });
        this.todasLasSugerencias = Array.from(set).sort();
    };
    HistorialVentasAdministracion.prototype.buscarSugerencias = function (event) {
        var _a;
        var query = ((_a = event.query) !== null && _a !== void 0 ? _a : '').trim();
        if (query.length < 3) {
            this.sugerenciasBusqueda = this.todasLasSugerencias.slice(0, 10);
            return;
        }
        this.busquedaSubject.next(query);
    };
    HistorialVentasAdministracion.prototype.aplicarFiltros = function () {
        this.paginaActual = 1;
        this.cargarComprobantes();
        this.cargarKpis();
    };
    HistorialVentasAdministracion.prototype.limpiarFiltros = function () {
        this.filtros = {
            sedeSeleccionada: null,
            tipoComprobante: null,
            estado: null,
            fechaInicio: date_peru_utils_1.getLunesSemanaActualPeru(),
            fechaFin: date_peru_utils_1.getDomingoSemanaActualPeru(),
            busqueda: '',
            tipoPago: null
        };
        this.aplicarFiltros();
        this.messageService.add({
            severity: 'info',
            summary: 'Filtros limpiados',
            detail: 'Se restablecieron los filtros al rango semanal actual',
            life: 2000
        });
    };
    HistorialVentasAdministracion.prototype.onPageChange = function (event) {
        var _a, _b, _c, _d;
        this.firstRow = (_a = event.first) !== null && _a !== void 0 ? _a : 0;
        this.paginaActual = Math.floor(((_b = event.first) !== null && _b !== void 0 ? _b : 0) / ((_c = event.rows) !== null && _c !== void 0 ? _c : this.limitePorPagina)) + 1;
        this.limitePorPagina = (_d = event.rows) !== null && _d !== void 0 ? _d : this.limitePorPagina;
        this.cargarComprobantes();
    };
    HistorialVentasAdministracion.prototype.onLimitChange = function (nuevoLimite) {
        this.limitePorPagina = nuevoLimite;
        this.paginaActual = 1;
        this.firstRow = 0;
        this.cargarComprobantes();
    };
    HistorialVentasAdministracion.prototype.nuevaVenta = function () {
        this.router.navigate(['/admin/generar-ventas-administracion']);
    };
    HistorialVentasAdministracion.prototype.verDetalleVenta = function (comprobante) {
        this.router.navigate(['/admin/detalles-ventas-administracion', comprobante.idComprobante], {
            state: { rutaRetorno: '/admin/historial-ventas-administracion' }
        });
    };
    HistorialVentasAdministracion.prototype.imprimirComprobante = function (comprobante) {
        this.router.navigate(['/admin/imprimir-comprobante-administracion'], {
            state: { comprobante: comprobante, rutaRetorno: '/admin/historial-ventas-administracion' }
        });
    };
    HistorialVentasAdministracion.prototype.crearGuiaRemision = function (comprobante) {
        this.router.navigate(['/logistica/remision/nueva'], {
            queryParams: {
                ventaId: comprobante.id,
                comprobanteRef: this.getNumeroFormateado(comprobante)
            }
        });
    };
    HistorialVentasAdministracion.prototype.anularComprobante = function (comprobante) {
        var _this = this;
        if (comprobante.estado !== 'EMITIDO')
            return;
        this.confirmationService.confirm({
            message: "\u00BFEst\u00E1 seguro de anular el comprobante " + this.getNumeroFormateado(comprobante) + "?",
            header: 'Confirmar Anulación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, anular',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: function () {
                comprobante.estado = 'ANULADO';
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Comprobante anulado',
                    detail: _this.getNumeroFormateado(comprobante) + " fue anulado",
                    life: 3000
                });
                _this.aplicarFiltros();
            }
        });
    };
    HistorialVentasAdministracion.prototype.exportarExcel = function () {
        var _this = this;
        if (this.comprobantesFiltrados.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin datos',
                detail: 'No hay registros para exportar',
                life: 3000
            });
            return;
        }
        var datosExcel = this.comprobantesFiltrados.map(function (c) { return ({
            'N° Comprobante': _this.getNumeroFormateado(c),
            Tipo: _this.getTipoComprobanteLabel(c.tipoComprobante),
            'Fecha Emisión': new Date(c.fecEmision).toLocaleString('es-PE'),
            Cliente: c.clienteNombre,
            Documento: c.clienteDocumento,
            'Tipo Pago': _this.getTipoPagoLabel(c.metodoPago),
            Sede: c.sedeNombre,
            Total: c.total,
            Estado: c.estado
        }); });
        var nombreArchivo = excel_utils_1.ExcelUtils.generarNombreConFecha('ventas');
        excel_utils_1.ExcelUtils.exportarAExcel(datosExcel, nombreArchivo, 'Comprobantes');
        this.messageService.add({
            severity: 'success',
            summary: 'Exportación exitosa',
            detail: "Archivo " + nombreArchivo + ".xlsx descargado",
            life: 3000
        });
    };
    HistorialVentasAdministracion.prototype.getSeverityEstado = function (estado) {
        switch (estado) {
            case 'EMITIDO':
                return 'success';
            case 'ANULADO':
                return 'danger';
            case 'RECHAZADO':
                return 'warn';
            default:
                return 'info';
        }
    };
    HistorialVentasAdministracion.prototype.getTipoComprobanteLabel = function (tipo) {
        if (!tipo)
            return 'N/A';
        var t = tipo.toUpperCase();
        if (t.includes('BOLETA') || tipo === '03')
            return 'Boleta';
        if (t.includes('FACTURA') || tipo === '01')
            return 'Factura';
        return tipo;
    };
    HistorialVentasAdministracion.prototype.getNumeroFormateado = function (c) {
        return c.serie + "-" + String(c.numero).padStart(8, '0');
    };
    HistorialVentasAdministracion.prototype.getTipoPagoLabel = function (metodo) {
        return metodo !== null && metodo !== void 0 ? metodo : 'N/A';
    };
    HistorialVentasAdministracion.prototype.getSeverityTipoPago = function (metodo) {
        if (!metodo)
            return 'secondary';
        var m = metodo.toLowerCase();
        if (m.includes('efectivo'))
            return 'success';
        if (m.includes('yape') || m.includes('plin'))
            return 'info';
        if (m.includes('tarjeta'))
            return 'warn';
        return 'secondary';
    };
    HistorialVentasAdministracion = __decorate([
        core_1.Component({
            selector: 'app-historial-ventas-administracion',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                card_1.Card,
                button_1.Button,
                select_1.Select,
                table_1.TableModule,
                tag_1.Tag,
                toast_1.Toast,
                confirmdialog_1.ConfirmDialog,
                datepicker_1.DatePicker,
                tooltip_1.Tooltip,
                autocomplete_1.AutoComplete,
                loading_overlay_component_1.LoadingOverlayComponent,
                Paginador_component_1.PaginadorComponent,
            ],
            providers: [api_1.MessageService, api_1.ConfirmationService],
            templateUrl: './historial-ventas-administracion.html',
            styleUrl: './historial-ventas-administracion.css'
        })
    ], HistorialVentasAdministracion);
    return HistorialVentasAdministracion;
}());
exports.HistorialVentasAdministracion = HistorialVentasAdministracion;
