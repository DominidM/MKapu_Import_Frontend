"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.GenerarVentasAdministracion = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var api_1 = require("primeng/api");
var toast_1 = require("primeng/toast");
var confirmdialog_1 = require("primeng/confirmdialog");
var card_1 = require("primeng/card");
var button_1 = require("primeng/button");
var divider_1 = require("primeng/divider");
var inputtext_1 = require("primeng/inputtext");
var selectbutton_1 = require("primeng/selectbutton");
var autocomplete_1 = require("primeng/autocomplete");
var select_1 = require("primeng/select");
var tag_1 = require("primeng/tag");
var inputnumber_1 = require("primeng/inputnumber");
var table_1 = require("primeng/table");
var tooltip_1 = require("primeng/tooltip");
var auth_service_1 = require("../../../auth/services/auth.service");
var ventas_service_1 = require("../../services/ventas.service");
var account_receivable_service_1 = require("../../services/account-receivable.service");
var sede_almacen_service_1 = require("../../services/sede-almacen.service");
var router_2 = require("@angular/router");
var quote_service_1 = require("../../services/quote.service");
var ventas_interface_1 = require("../../interfaces/ventas.interface");
var GenerarVentasAdministracion = /** @class */ (function () {
    function GenerarVentasAdministracion() {
        var _this = this;
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.ventasService = core_1.inject(ventas_service_1.VentasAdminService);
        this.messageService = core_1.inject(api_1.MessageService);
        this.confirmationService = core_1.inject(api_1.ConfirmationService);
        this.router = core_1.inject(router_1.Router);
        this.sedeAlmacenService = core_1.inject(sede_almacen_service_1.SedeAlmacenService);
        this.route = core_1.inject(router_2.ActivatedRoute);
        this.quoteService = core_1.inject(quote_service_1.QuoteService);
        this.arService = core_1.inject(account_receivable_service_1.AccountReceivableService);
        this.tituloKicker = 'VENTAS - GENERAR VENTAS';
        this.subtituloKicker = 'GENERAR NUEVA VENTA (ADMIN)';
        this.iconoCabecera = 'pi pi-shopping-cart';
        this.steps = [
            'Productos',
            'Cliente y Comprobante',
            'Pago, Promociones y Entrega',
            'Confirmar Venta',
        ];
        this.tipoComprobanteOptions = [
            { label: 'Boleta', value: 2, icon: 'pi pi-file' },
            { label: 'Factura', value: 1, icon: 'pi pi-file-edit' },
        ];
        this.opcionesTipoPrecio = [
            { label: 'Unidad', value: 'unidad' },
            { label: 'Caja', value: 'caja' },
            { label: 'Mayorista', value: 'mayorista' },
        ];
        this.tipoEntregaOptions = [
            { label: 'Recojo en tienda', value: 'recojo', icon: 'pi pi-shop' },
            { label: 'Delivery', value: 'delivery', icon: 'pi pi-truck' },
        ];
        this.SIZE_PAGE = 10;
        this.tipoDocBusqueda = core_1.signal(null);
        this.reniecLoading = core_1.signal(false);
        this.nombreDesdeReniec = core_1.signal(false);
        this.idUsuarioActual = core_1.signal('0');
        this.nombreUsuarioActual = core_1.signal('');
        this.sedes = core_1.signal([]);
        this.sedesLoading = core_1.signal(false);
        this.sedeSeleccionada = core_1.signal(null);
        this.activeStep = core_1.signal(0);
        this.tipoComprobante = core_1.signal(2);
        this.clienteDocumento = core_1.signal('');
        this.clienteEncontrado = core_1.signal(null);
        this.clienteLoading = core_1.signal(false);
        this.busquedaRealizada = core_1.signal(false);
        this.tiposDocumento = core_1.signal([]);
        this.tipoDocBoleta = core_1.signal(null);
        this.creandoCliente = core_1.signal(false);
        this.editandoCliente = core_1.signal(false);
        this.guardandoCliente = core_1.signal(false);
        this.metodosPago = core_1.signal([]);
        this.almacenSeleccionado = core_1.signal(null);
        this.almacenesOptions = core_1.signal([]);
        this.almacenesLoading = core_1.signal(false);
        this.cotizacionOrigen = core_1.signal(null);
        this.tipoPagoOrigen = core_1.signal('contado');
        this.nuevoClienteForm = { documentTypeId: null, documentValue: '', name: '', address: '', email: '', phone: '' };
        this.editarClienteForm = { name: '', address: '', email: '', phone: '' };
        this.productosLoading = core_1.signal(true);
        this.familiasLoading = core_1.signal(true);
        this.productosCargados = core_1.signal([]);
        this.productosFiltrados = core_1.signal([]);
        this.productosSugeridos = core_1.signal([]);
        this.productoSeleccionadoBusqueda = core_1.signal(null);
        this.paginaActual = core_1.signal(1);
        this.totalRegistros = core_1.signal(0);
        this.cargandoMas = core_1.signal(false);
        this.familiaSeleccionada = core_1.signal(null);
        this.familiasDisponibles = core_1.signal([]);
        this.productoTemp = core_1.signal(null);
        this.cantidadTemp = core_1.signal(1);
        this.tipoPrecioTemp = core_1.signal('unidad');
        this.productosSeleccionados = core_1.signal([]);
        this.promocionesDisponibles = core_1.signal([]);
        this.promocionAplicada = core_1.signal(null);
        this.promocionesLoading = core_1.signal(false);
        this.tipoEntrega = core_1.signal('recojo');
        this.direccionDelivery = core_1.signal('');
        this.costoDelivery = core_1.signal(0);
        this.metodoPagoSeleccionado = core_1.signal(null);
        this.montoRecibido = core_1.signal(0);
        this.numeroOperacion = core_1.signal('');
        this.comprobanteGenerado = core_1.signal(null);
        this.loading = core_1.signal(false);
        this.snapshotCliente = core_1.signal(null);
        this.snapshotSede = core_1.signal('');
        this.snapshotMetodoPago = core_1.signal('');
        this.snapshotTipoComprobante = core_1.signal(2);
        this.metodoPagoOptions = core_1.computed(function () {
            return _this.metodosPago().map(function (m) { return ({
                label: m.descripcion,
                value: m.id,
                icon: _this.iconoPorMetodoPago(m.codSunat)
            }); });
        });
        this.tiposDocumentoBoleta = core_1.computed(function () {
            return _this.tiposDocumento().filter(function (t) { var _a; return !((_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC')); });
        });
        this.documentoConfig = core_1.computed(function () {
            var _a, _b;
            if (_this.tipoComprobante() === 1) {
                return { maxLength: 11, minLength: 11, soloNumeros: true, placeholder: 'Ingrese RUC (11 dígitos)' };
            }
            var tipo = _this.tiposDocumento().find(function (t) { return t.documentTypeId === _this.tipoDocBoleta(); });
            var desc = (_b = (_a = tipo === null || tipo === void 0 ? void 0 : tipo.description) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
            if (desc.includes('DNI'))
                return { maxLength: 8, minLength: 8, soloNumeros: true, placeholder: 'Ingrese DNI (8 dígitos)' };
            if (desc.includes('CARNET') || desc.includes('EXTRANJERI'))
                return { maxLength: 12, minLength: 9, soloNumeros: false, placeholder: 'Ingrese Carnet de Extranjería' };
            if (desc.includes('PASAPORTE'))
                return { maxLength: 20, minLength: 5, soloNumeros: false, placeholder: 'Ingrese número de pasaporte' };
            return { maxLength: 20, minLength: 1, soloNumeros: false, placeholder: 'Ingrese número de documento' };
        });
        this.longitudDocumento = core_1.computed(function () { return _this.documentoConfig().maxLength; });
        this.botonClienteHabilitado = core_1.computed(function () {
            var _a, _b;
            var len = (_b = (_a = _this.clienteDocumento()) === null || _a === void 0 ? void 0 : _a.trim().length) !== null && _b !== void 0 ? _b : 0;
            var config = _this.documentoConfig();
            return len >= config.minLength && len <= config.maxLength;
        });
        this.descuentoPromocion = core_1.computed(function () {
            var promo = _this.promocionAplicada();
            if (!promo)
                return 0;
            var base = _this.productosSeleccionados().reduce(function (s, i) { return s + i.total; }, 0);
            return _this.esPorcentaje(promo.tipo)
                ? Number(((base * promo.valor) / 100).toFixed(2))
                : Number(promo.valor.toFixed(2));
        });
        this.total = core_1.computed(function () {
            var base = _this.productosSeleccionados().reduce(function (s, i) { return s + i.total; }, 0);
            var delivery = _this.tipoEntrega() === 'delivery' ? _this.costoDelivery() : 0;
            return Number((base - _this.descuentoPromocion() + delivery).toFixed(2));
        });
        this.subtotal = core_1.computed(function () { return _this.total() / (1 + ventas_interface_1.IGV_RATE_ADMIN); });
        this.igv = core_1.computed(function () { return _this.subtotal() * ventas_interface_1.IGV_RATE_ADMIN; });
        this.vuelto = core_1.computed(function () {
            var v = _this.montoRecibido() - _this.total();
            return v >= 0 ? v : 0;
        });
        this.precioSegunTipo = core_1.computed(function () {
            var p = _this.productoTemp();
            if (!p)
                return 0;
            switch (_this.tipoPrecioTemp()) {
                case 'caja': return p.precioCaja;
                case 'mayorista': return p.precioMayorista;
                default: return p.precioUnidad;
            }
        });
        this.hayMasPaginas = core_1.computed(function () { return _this.productosCargados().length < _this.totalRegistros(); });
        this.nombreSedeSeleccionada = core_1.computed(function () {
            var _a, _b;
            var id = _this.sedeSeleccionada();
            if (!id)
                return 'Sin sede seleccionada';
            return (_b = (_a = _this.sedes().find(function (s) { return s.id_sede === id; })) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : '';
        });
        this.sedesOptions = core_1.computed(function () {
            return _this.sedes().map(function (s) { return ({ label: s.nombre, value: s.id_sede }); });
        });
        this.tiposDocumentoBoleta2 = core_1.computed(function () {
            return _this.tiposDocumento().filter(function (t) { var _a; return !((_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC')); });
        });
        this.tiposDocumentoParaBusqueda = core_1.computed(function () {
            return _this.tipoComprobante() === 1
                ? _this.tiposDocumento().filter(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); })
                : _this.tiposDocumento();
        });
        this.tipoDocRucId = core_1.computed(function () { var _a, _b; return (_b = (_a = _this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); })) === null || _a === void 0 ? void 0 : _a.documentTypeId) !== null && _b !== void 0 ? _b : null; });
        this.esDniSeleccionado = core_1.computed(function () {
            var _a, _b;
            var tipoId = _this.nuevoClienteForm.documentTypeId;
            if (!tipoId)
                return false;
            var tipo = _this.tiposDocumento().find(function (t) { return t.documentTypeId === tipoId; });
            var desc = (_b = (_a = tipo === null || tipo === void 0 ? void 0 : tipo.description) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
            return desc.includes('DNI') || desc.includes('IDENTIDAD') || desc.includes('RUC') || desc.includes('CONTRIBUYENTE');
        });
    }
    GenerarVentasAdministracion.prototype.iconoPorMetodoPago = function (codSunat) {
        var _a;
        var iconos = {
            '008': 'pi pi-money-bill',
            '005': 'pi pi-credit-card',
            '006': 'pi pi-credit-card',
            '003': 'pi pi-arrow-right-arrow-left',
            '001': 'pi pi-building'
        };
        return (_a = iconos[codSunat]) !== null && _a !== void 0 ? _a : 'pi pi-wallet';
    };
    GenerarVentasAdministracion.prototype.esPorcentaje = function (tipo) {
        return (tipo === null || tipo === void 0 ? void 0 : tipo.toUpperCase().trim()) === 'PORCENTAJE';
    };
    GenerarVentasAdministracion.prototype.normalizarActivo = function (activo) {
        if (typeof activo === 'boolean')
            return activo;
        if (typeof activo === 'number')
            return activo === 1;
        if (activo && typeof activo === 'object' && 'data' in activo)
            return activo.data[0] === 1;
        return false;
    };
    GenerarVentasAdministracion.prototype.ngOnInit = function () {
        this.cargarSesion();
        this.cargarTiposDocumento();
        this.cargarSedes();
        this.leerParamsCotizacion();
        this.cargarMetodosPago();
    };
    GenerarVentasAdministracion.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () { return _this.cargarFamilias(); }, 0);
    };
    GenerarVentasAdministracion.prototype.cargarSesion = function () {
        var _a, _b;
        var user = this.authService.getCurrentUser();
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }
        this.idUsuarioActual.set((_b = (_a = user.userId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '0');
        this.nombreUsuarioActual.set((user.nombres + " " + user.apellidos).trim());
        if (user.idSede) {
            this.sedeSeleccionada.set(user.idSede);
            this.onSedeChange(user.idSede);
        }
    };
    GenerarVentasAdministracion.prototype.cargarMetodosPago = function () {
        var _this = this;
        this.ventasService.obtenerMetodosPago().subscribe({
            next: function (data) {
                _this.metodosPago.set(data);
                var efectivo = data.find(function (m) { return m.codSunat === '008'; });
                if (efectivo)
                    _this.metodoPagoSeleccionado.set(efectivo.id);
            }
        });
    };
    GenerarVentasAdministracion.prototype.cargarSedes = function () {
        var _this = this;
        this.sedesLoading.set(true);
        this.ventasService.obtenerSedes().subscribe({
            next: function (data) {
                _this.sedes.set(data.filter(function (s) { return s.activo; }));
                _this.sedesLoading.set(false);
                var cotizId = _this.cotizacionOrigen();
                if (cotizId)
                    _this.cargarDatosDeCotizacion(cotizId);
            },
            error: function () {
                _this.sedesLoading.set(false);
                _this.messageService.add({ severity: 'warn', summary: 'Sedes', detail: 'No se pudieron cargar las sedes' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onSedeChange = function (sedeId) {
        var _this = this;
        this.sedeSeleccionada.set(sedeId);
        this.almacenSeleccionado.set(null);
        this.almacenesOptions.set([]);
        this.familiaSeleccionada.set(null);
        this.productoTemp.set(null);
        this.cargarProductos(true);
        this.cargarFamilias();
        if (!sedeId)
            return;
        this.almacenesLoading.set(true);
        this.sedeAlmacenService.loadWarehouseOptionsBySede(sedeId).subscribe({
            next: function (options) {
                _this.almacenesOptions.set(options);
                _this.almacenesLoading.set(false);
            },
            error: function () {
                _this.almacenesLoading.set(false);
                _this.messageService.add({ severity: 'warn', summary: 'Almacenes', detail: 'No se pudieron cargar los almacenes de esta sede' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onAlmacenChange = function (almacenId) {
        this.almacenSeleccionado.set(almacenId);
    };
    GenerarVentasAdministracion.prototype.cargarProductos = function (resetear) {
        var _this = this;
        var _a, _b;
        if (resetear === void 0) { resetear = true; }
        if (!this.sedeSeleccionada()) {
            this.productosCargados.set([]);
            this.productosFiltrados.set([]);
            this.productosLoading.set(false);
            return;
        }
        if (resetear) {
            this.paginaActual.set(1);
            this.productosCargados.set([]);
            this.productosFiltrados.set([]);
            this.productosLoading.set(true);
        }
        else {
            this.cargandoMas.set(true);
        }
        this.ventasService
            .obtenerProductosConStock((_a = this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : undefined, (_b = this.familiaSeleccionada()) !== null && _b !== void 0 ? _b : undefined, this.paginaActual(), this.SIZE_PAGE)
            .subscribe({
            next: function (response) {
                _this.totalRegistros.set(response.pagination.total_records);
                var nuevos = response.data.map(function (p) { return _this.ventasService.mapearProductoConStock(p); });
                if (resetear) {
                    _this.productosCargados.set(nuevos);
                }
                else {
                    _this.productosCargados.update(function (prev) { return __spreadArrays(prev, nuevos); });
                }
                _this.productosFiltrados.set(__spreadArrays(_this.productosCargados()));
                _this.productosLoading.set(false);
                _this.cargandoMas.set(false);
            },
            error: function () {
                _this.productosLoading.set(false);
                _this.cargandoMas.set(false);
                _this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.leerParamsCotizacion = function () {
        var cotizacionId = this.route.snapshot.queryParamMap.get('cotizacion');
        var tipo = this.route.snapshot.queryParamMap.get('tipo');
        if (!cotizacionId)
            return;
        this.cotizacionOrigen.set(Number(cotizacionId));
        this.tipoPagoOrigen.set(tipo !== null && tipo !== void 0 ? tipo : 'contado');
    };
    GenerarVentasAdministracion.prototype.cargarDatosDeCotizacion = function (id) {
        var _this = this;
        this.loading.set(true);
        this.quoteService.getQuoteById(id).subscribe({
            next: function (cotizacion) {
                _this.loading.set(false);
                _this.prefillDesdeCotizacion(cotizacion);
            },
            error: function () {
                _this.loading.set(false);
                _this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cotización' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.prefillDesdeCotizacion = function (cotizacion) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (cotizacion.id_sede) {
            this.onSedeChange(cotizacion.id_sede);
            var waitAlmacen_1 = setInterval(function () {
                if (!_this.almacenesLoading() && _this.almacenesOptions().length > 0) {
                    clearInterval(waitAlmacen_1);
                    _this.almacenSeleccionado.set(_this.almacenesOptions()[0].value);
                }
            }, 100);
        }
        var tipoDoc = (_a = cotizacion.cliente) === null || _a === void 0 ? void 0 : _a.id_tipo_documento;
        this.tipoComprobante.set(tipoDoc === 1 ? 1 : 2);
        if ((_b = cotizacion.cliente) === null || _b === void 0 ? void 0 : _b.valor_doc) {
            this.clienteDocumento.set(cotizacion.cliente.valor_doc);
            var nombreCompleto = cotizacion.cliente.razon_social
                ? cotizacion.cliente.razon_social
                : (((_c = cotizacion.cliente.nombre_cliente) !== null && _c !== void 0 ? _c : '') + " " + ((_d = cotizacion.cliente.apellidos_cliente) !== null && _d !== void 0 ? _d : '')).trim();
            this.clienteEncontrado.set({
                customerId: String(cotizacion.id_cliente),
                name: nombreCompleto,
                documentValue: cotizacion.cliente.valor_doc,
                documentTypeDescription: tipoDoc === 1 ? 'RUC' : 'DNI',
                documentTypeSunatCode: tipoDoc === 1 ? '6' : '1',
                invoiceType: tipoDoc === 1 ? 'FACTURA' : 'BOLETA',
                status: 'ACTIVO',
                address: (_e = cotizacion.cliente.direccion) !== null && _e !== void 0 ? _e : '',
                email: (_f = cotizacion.cliente.email) !== null && _f !== void 0 ? _f : '',
                phone: (_g = cotizacion.cliente.telefono) !== null && _g !== void 0 ? _g : '',
                displayName: nombreCompleto
            });
            this.busquedaRealizada.set(true);
        }
        if ((_h = cotizacion.detalles) === null || _h === void 0 ? void 0 : _h.length) {
            var items = cotizacion.detalles.map(function (d) {
                var precio = Number(d.precio);
                var cantidad = Number(d.cantidad);
                return {
                    productId: d.id_prod_ref,
                    codigo: d.cod_prod,
                    quantity: cantidad,
                    unitPrice: precio,
                    description: d.descripcion,
                    total: cantidad * precio,
                    igvUnitario: Number((precio - precio / (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2))
                };
            });
            this.productosSeleccionados.set(items);
        }
        if (this.tipoPagoOrigen() === 'credito') {
            var credito = this.metodosPago().find(function (m) { return m.codSunat === '003' || m.codSunat === '005'; });
            if (credito)
                this.metodoPagoSeleccionado.set(credito.id);
        }
        this.activeStep.set(1);
        this.messageService.add({
            severity: 'info',
            summary: 'Cotización cargada',
            detail: "Datos pre-llenados desde cotizaci\u00F3n #" + this.cotizacionOrigen(),
            life: 4000
        });
    };
    GenerarVentasAdministracion.prototype.cargarMasProductos = function () {
        if (!this.hayMasPaginas() || this.cargandoMas())
            return;
        this.paginaActual.update(function (p) { return p + 1; });
        this.cargarProductos(false);
    };
    GenerarVentasAdministracion.prototype.cargarFamilias = function () {
        var _this = this;
        var sedeId = this.sedeSeleccionada();
        if (!sedeId)
            return;
        this.familiasLoading.set(true);
        this.ventasService.obtenerCategoriasConStock(Number(sedeId)).subscribe({
            next: function (cats) {
                _this.familiasDisponibles.set(cats.map(function (c) { return ({ label: c.nombre, value: c.id_categoria }); }));
                _this.familiasLoading.set(false);
            },
            error: function (err) {
                console.error('Error al cargar familias:', err);
                _this.familiasLoading.set(false);
            }
        });
    };
    GenerarVentasAdministracion.prototype.onFamiliaChange = function (idCategoria) {
        this.familiaSeleccionada.set(idCategoria);
        this.cargarProductos(true);
    };
    GenerarVentasAdministracion.prototype.buscarProductos = function (event) {
        var _this = this;
        var _a, _b;
        var query = event.query.trim();
        if (query.length < 3) {
            this.productosSugeridos.set([]);
            return;
        }
        this.ventasService
            .buscarProductosVentas(query, (_a = this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : undefined, (_b = this.familiaSeleccionada()) !== null && _b !== void 0 ? _b : undefined)
            .subscribe({
            next: function (res) {
                _this.productosSugeridos.set(res.data.map(function (p) { return _this.ventasService.mapearAutocompleteVentas(p); }));
            },
            error: function () { return _this.productosSugeridos.set([]); }
        });
    };
    GenerarVentasAdministracion.prototype.onProductoSeleccionado = function (productoOEvento) {
        var _this = this;
        var _a;
        var producto = (_a = productoOEvento === null || productoOEvento === void 0 ? void 0 : productoOEvento.value) !== null && _a !== void 0 ? _a : productoOEvento;
        if (!producto || typeof producto !== 'object' || !producto.nombre)
            return;
        this.seleccionarProducto(producto);
        setTimeout(function () {
            _this.productoSeleccionadoBusqueda.set(null);
            _this.productosSugeridos.set([]);
        }, 50);
    };
    GenerarVentasAdministracion.prototype.seleccionarProducto = function (producto) {
        this.productoTemp.set(producto);
        this.cantidadTemp.set(1);
        this.tipoPrecioTemp.set('unidad');
    };
    GenerarVentasAdministracion.prototype.agregarProducto = function () {
        var producto = this.productoTemp();
        var cantidad = this.cantidadTemp();
        if (!producto || cantidad <= 0)
            return;
        if (cantidad > producto.stock) {
            this.messageService.add({ severity: 'error', summary: 'Stock Insuficiente', detail: "Solo hay " + producto.stock + " unidades disponibles en " + producto.sede });
            return;
        }
        var precioUnitario = this.precioSegunTipo();
        var item = {
            productId: producto.id,
            codigo: producto.codigo,
            quantity: cantidad,
            unitPrice: precioUnitario,
            description: producto.nombre,
            total: precioUnitario * cantidad,
            igvUnitario: Number((precioUnitario - precioUnitario / (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2))
        };
        var lista = __spreadArrays(this.productosSeleccionados());
        var idx = lista.findIndex(function (p) { return p.productId === item.productId && p.unitPrice === item.unitPrice; });
        if (idx >= 0) {
            var actualizado = __assign({}, lista[idx]);
            actualizado.quantity += cantidad;
            actualizado.total = actualizado.quantity * actualizado.unitPrice;
            if (actualizado.quantity > producto.stock) {
                this.messageService.add({ severity: 'error', summary: 'Stock Insuficiente', detail: "Solo hay " + producto.stock + " unidades disponibles" });
                return;
            }
            lista[idx] = actualizado;
        }
        else {
            lista.push(item);
        }
        this.productosSeleccionados.set(lista);
        this.messageService.add({ severity: 'success', summary: 'Producto Agregado', detail: cantidad + " \u00D7 " + producto.nombre });
        this.productoTemp.set(null);
        this.cantidadTemp.set(1);
    };
    GenerarVentasAdministracion.prototype.eliminarProducto = function (index) {
        var _this = this;
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este producto del carrito?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: function () {
                var lista = __spreadArrays(_this.productosSeleccionados());
                lista.splice(index, 1);
                _this.productosSeleccionados.set(lista);
                _this.messageService.add({ severity: 'info', summary: 'Producto Eliminado', detail: 'El producto fue removido del carrito' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.cargarTiposDocumento = function () {
        var _this = this;
        this.ventasService.obtenerTiposDocumento().subscribe({
            next: function (tipos) {
                _this.tiposDocumento.set(tipos);
                var dni = tipos.find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
                if (dni)
                    _this.tipoDocBoleta.set(dni.documentTypeId);
            },
            error: function () { return console.warn('No se pudieron cargar tipos de documento'); }
        });
    };
    GenerarVentasAdministracion.prototype.onTipoDocBoleta = function (id) {
        this.tipoDocBoleta.set(id);
        this.limpiarCliente();
    };
    GenerarVentasAdministracion.prototype.validarSoloNumeros = function (event) {
        var input = event.target;
        var config = this.documentoConfig();
        input.value = config.soloNumeros
            ? input.value.replace(/[^0-9]/g, '').slice(0, config.maxLength)
            : input.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, config.maxLength);
        this.clienteDocumento.set(input.value);
        if (this.clienteEncontrado())
            this.limpiarCliente();
        this.busquedaRealizada.set(false);
    };
    GenerarVentasAdministracion.prototype.buscarCliente = function () {
        var _this = this;
        if (!this.botonClienteHabilitado() || this.clienteEncontrado())
            return;
        this.clienteLoading.set(true);
        this.busquedaRealizada.set(false);
        this.ventasService.buscarCliente(this.clienteDocumento(), this.tipoComprobante()).subscribe({
            next: function (res) {
                _this.clienteEncontrado.set(res);
                _this.busquedaRealizada.set(true);
                _this.clienteLoading.set(false);
                _this.editandoCliente.set(false);
                _this.messageService.add({ severity: 'success', summary: 'Cliente Encontrado', detail: res.name });
            },
            error: function () {
                _this.clienteEncontrado.set(null);
                _this.busquedaRealizada.set(true);
                _this.clienteLoading.set(false);
                _this.sincronizarDocumentoEnForm();
            }
        });
    };
    GenerarVentasAdministracion.prototype.onDocumentoNuevoClienteChange = function (valor) {
        var _this = this;
        var _a, _b;
        this.nuevoClienteForm.documentValue = valor;
        this.nombreDesdeReniec.set(false);
        var tipos = this.tiposDocumento();
        var tipoId = this.nuevoClienteForm.documentTypeId;
        if (!tipoId)
            return;
        var tipoSeleccionado = tipos.find(function (t) { return t.documentTypeId === tipoId; });
        var desc = (_b = (_a = tipoSeleccionado === null || tipoSeleccionado === void 0 ? void 0 : tipoSeleccionado.description) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        var esDni = desc.includes('DNI') || desc.includes('IDENTIDAD');
        var esRuc = desc.includes('RUC') || desc.includes('CONTRIBUYENTE');
        var debeConsultar = (esDni && valor.length === 8) || (esRuc && valor.length === 11);
        if (!debeConsultar)
            return;
        this.reniecLoading.set(true);
        this.ventasService.consultarDocumentoIdentidad(valor).subscribe({
            next: function (res) {
                _this.reniecLoading.set(false);
                if (res === null || res === void 0 ? void 0 : res.nombreCompleto) {
                    _this.nuevoClienteForm.name = res.nombreCompleto;
                    _this.nombreDesdeReniec.set(true);
                    if (esRuc && res.direccion)
                        _this.nuevoClienteForm.address = res.direccion;
                    _this.messageService.add({ severity: 'success', summary: esRuc ? 'SUNAT' : 'RENIEC', detail: res.nombreCompleto, life: 3000 });
                }
                else {
                    _this.messageService.add({ severity: 'warn', summary: esRuc ? 'RUC no encontrado' : 'DNI no encontrado', detail: 'No se encontraron datos. Ingrese el nombre manualmente.', life: 3000 });
                }
            },
            error: function () {
                _this.reniecLoading.set(false);
                _this.messageService.add({ severity: 'warn', summary: 'Sin conexión a RENIEC', detail: 'Ingrese el nombre manualmente.', life: 3000 });
            }
        });
    };
    GenerarVentasAdministracion.prototype.limpiarCliente = function () {
        this.clienteEncontrado.set(null);
        this.clienteDocumento.set('');
        this.busquedaRealizada.set(false);
        this.editandoCliente.set(false);
        this.resetNuevoClienteForm();
    };
    GenerarVentasAdministracion.prototype.sincronizarDocumentoEnForm = function () {
        var _this = this;
        var doc = this.clienteDocumento().trim();
        var tipos = this.tiposDocumento();
        this.nuevoClienteForm.documentValue = doc;
        var tipoActivo = this.tipoComprobante() === 1
            ? tipos.find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); })
            : tipos.find(function (t) { return t.documentTypeId === _this.tipoDocBoleta(); });
        if (tipoActivo)
            this.nuevoClienteForm.documentTypeId = tipoActivo.documentTypeId;
    };
    GenerarVentasAdministracion.prototype.resetNuevoClienteForm = function () {
        this.nuevoClienteForm = { documentTypeId: null, documentValue: '', name: '', address: '', email: '', phone: '' };
    };
    GenerarVentasAdministracion.prototype.crearNuevoCliente = function () {
        var _this = this;
        var _a = this.nuevoClienteForm, documentTypeId = _a.documentTypeId, documentValue = _a.documentValue, name = _a.name;
        if (!documentTypeId || !documentValue.trim() || !name.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Tipo de documento, número y nombre son obligatorios' });
            return;
        }
        this.creandoCliente.set(true);
        var request = {
            documentTypeId: documentTypeId,
            documentValue: documentValue.trim(),
            name: name.trim(),
            address: this.nuevoClienteForm.address.trim() || undefined,
            email: this.nuevoClienteForm.email.trim() || undefined,
            phone: this.nuevoClienteForm.phone.trim() || undefined
        };
        this.ventasService.crearCliente(request).subscribe({
            next: function (res) {
                _this.creandoCliente.set(false);
                var nuevo = {
                    customerId: res.customerId,
                    name: res.name,
                    documentValue: res.documentValue,
                    documentTypeDescription: res.documentTypeDescription,
                    documentTypeSunatCode: res.documentTypeSunatCode,
                    invoiceType: res.invoiceType,
                    status: res.status,
                    address: res.address,
                    email: res.email,
                    phone: res.phone,
                    displayName: res.displayName
                };
                _this.clienteDocumento.set(res.documentValue);
                _this.clienteEncontrado.set(nuevo);
                _this.busquedaRealizada.set(true);
                _this.editandoCliente.set(false);
                _this.resetNuevoClienteForm();
                _this.messageService.add({ severity: 'success', summary: 'Cliente Creado', detail: nuevo.name + " fue registrado y seleccionado" });
            },
            error: function (err) {
                var _a, _b;
                _this.creandoCliente.set(false);
                _this.messageService.add({ severity: 'error', summary: 'Error al crear cliente', detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al registrar el cliente' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.iniciarEdicionCliente = function () {
        var _a, _b, _c, _d;
        var c = this.clienteEncontrado();
        if (!c)
            return;
        this.editarClienteForm = { name: (_a = c.name) !== null && _a !== void 0 ? _a : '', address: (_b = c.address) !== null && _b !== void 0 ? _b : '', email: (_c = c.email) !== null && _c !== void 0 ? _c : '', phone: (_d = c.phone) !== null && _d !== void 0 ? _d : '' };
        this.editandoCliente.set(true);
    };
    GenerarVentasAdministracion.prototype.cancelarEdicionCliente = function () {
        this.editandoCliente.set(false);
    };
    GenerarVentasAdministracion.prototype.guardarCambiosCliente = function () {
        var _this = this;
        var cliente = this.clienteEncontrado();
        if (!cliente)
            return;
        this.guardandoCliente.set(true);
        var payload = {
            name: this.editarClienteForm.name.trim() || undefined,
            address: this.editarClienteForm.address.trim() || undefined,
            email: this.editarClienteForm.email.trim() || undefined,
            phone: this.editarClienteForm.phone.trim() || undefined
        };
        this.ventasService.actualizarCliente(cliente.customerId, payload).subscribe({
            next: function (res) {
                _this.guardandoCliente.set(false);
                _this.editandoCliente.set(false);
                _this.clienteEncontrado.set(__assign(__assign({}, cliente), { name: res.name, address: res.address, email: res.email, phone: res.phone }));
                _this.messageService.add({ severity: 'success', summary: 'Cliente Actualizado', detail: 'Los datos del cliente se actualizaron correctamente' });
            },
            error: function (err) {
                var _a, _b;
                _this.guardandoCliente.set(false);
                _this.messageService.add({ severity: 'error', summary: 'Error al actualizar cliente', detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al actualizar el cliente' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.cargarPromociones = function () {
        var _this = this;
        this.promocionesLoading.set(true);
        this.ventasService.obtenerPromocionesActivas().subscribe({
            next: function (promos) {
                var normalizadas = promos.map(function (p) { return (__assign(__assign({}, p), { activo: _this.normalizarActivo(p.activo) })); });
                var activas = normalizadas.filter(function (p) { return p.activo; });
                _this.promocionesDisponibles.set(activas);
                _this.promocionesLoading.set(false);
                if (!activas.length) {
                    _this.messageService.add({ severity: 'info', summary: 'Sin promociones', detail: 'No hay promociones disponibles', life: 3000 });
                }
            },
            error: function (err) {
                _this.promocionesLoading.set(false);
                _this.promocionesDisponibles.set([]);
                if ((err === null || err === void 0 ? void 0 : err.status) !== 404) {
                    _this.messageService.add({ severity: 'warn', summary: 'Promociones', detail: 'No se pudieron cargar las promociones', life: 3000 });
                }
            }
        });
    };
    GenerarVentasAdministracion.prototype.aplicarPromocion = function (promo) {
        this.promocionAplicada.set(promo);
        this.messageService.add({
            severity: 'success',
            summary: 'Promoción aplicada',
            detail: promo.concepto + " \u2014 descuento: " + (this.esPorcentaje(promo.tipo) ? promo.valor + "%" : "S/. " + promo.valor.toFixed(2)),
            life: 3000
        });
    };
    GenerarVentasAdministracion.prototype.quitarPromocion = function () {
        this.promocionAplicada.set(null);
        this.messageService.add({ severity: 'info', summary: 'Promoción removida', life: 2000 });
    };
    GenerarVentasAdministracion.prototype.onTipoEntregaChange = function (tipo) {
        var _a, _b;
        this.tipoEntrega.set(tipo);
        if (tipo === 'recojo') {
            this.direccionDelivery.set('');
            this.costoDelivery.set(0);
        }
        else {
            var dir = (_b = (_a = this.clienteEncontrado()) === null || _a === void 0 ? void 0 : _a.address) !== null && _b !== void 0 ? _b : '';
            if (dir)
                this.direccionDelivery.set(dir);
        }
    };
    GenerarVentasAdministracion.prototype.nextStep = function () {
        if (!this.validarPasoActual())
            return;
        var curr = this.activeStep();
        if (curr < this.steps.length - 1) {
            this.activeStep.set(curr + 1);
            if (curr + 1 === 2)
                this.cargarPromociones();
        }
    };
    GenerarVentasAdministracion.prototype.prevStep = function () {
        var curr = this.activeStep();
        if (curr > 0)
            this.activeStep.set(curr - 1);
    };
    GenerarVentasAdministracion.prototype.validarPasoActual = function () {
        switch (this.activeStep()) {
            case 0:
                if (!this.sedeSeleccionada()) {
                    this.messageService.add({ severity: 'warn', summary: 'Sede Requerida', detail: 'Debe seleccionar una sede para continuar' });
                    return false;
                }
                if (!this.almacenSeleccionado()) {
                    this.messageService.add({ severity: 'warn', summary: 'Almacén Requerido', detail: 'Debe seleccionar un almacén para continuar' });
                    return false;
                }
                if (this.productosSeleccionados().length === 0) {
                    this.messageService.add({ severity: 'warn', summary: 'Carrito Vacío', detail: 'Debe agregar al menos un producto' });
                    return false;
                }
                return true;
            case 1:
                if (!this.clienteEncontrado()) {
                    this.messageService.add({ severity: 'warn', summary: 'Cliente Requerido', detail: 'Debe buscar y seleccionar un cliente' });
                    return false;
                }
                return true;
            case 2:
                if (this.tipoEntrega() === 'delivery' && !this.direccionDelivery().trim()) {
                    this.messageService.add({ severity: 'warn', summary: 'Dirección Requerida', detail: 'Ingrese la dirección de delivery' });
                    return false;
                }
                if (this.tipoPagoOrigen() === 'credito')
                    return true;
                if (this.metodoPagoSeleccionado() === 1 && this.montoRecibido() < this.total()) {
                    this.messageService.add({ severity: 'warn', summary: 'Monto Insuficiente', detail: 'El monto recibido debe ser mayor o igual al total' });
                    return false;
                }
                if (this.metodoPagoSeleccionado() !== 1 && !this.numeroOperacion().trim()) {
                    this.messageService.add({ severity: 'warn', summary: 'Número de Operación Requerido', detail: 'Debe ingresar el número de operación' });
                    return false;
                }
                return true;
            default:
                return true;
        }
    };
    GenerarVentasAdministracion.prototype.generarVenta = function () {
        var _this = this;
        if (!this.clienteEncontrado())
            return;
        this.confirmationService.confirm({
            message: '¿Está seguro de generar esta venta?',
            header: 'Confirmar Venta',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, generar',
            rejectLabel: 'Cancelar',
            accept: function () { return _this.procesarVenta(); }
        });
    };
    GenerarVentasAdministracion.prototype.procesarVenta = function () {
        var _this = this;
        var _a, _b, _c, _d;
        this.loading.set(true);
        this.snapshotCliente.set(this.clienteEncontrado());
        this.snapshotSede.set(this.nombreSedeSeleccionada());
        this.snapshotMetodoPago.set(this.getLabelMetodoPago(this.metodoPagoSeleccionado()));
        this.snapshotTipoComprobante.set(this.tipoComprobante());
        var subtotal = Number(this.subtotal().toFixed(2));
        var igv = Number(this.igv().toFixed(2));
        var total = Number(this.total().toFixed(2));
        var serie = this.tipoComprobante() === 1 ? 'F001' : 'B001';
        var cotizId = this.cotizacionOrigen();
        var fechaVencimiento = new Date();
        if (this.metodoPagoSeleccionado() !== 1)
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        var request = {
            customerId: this.clienteEncontrado().customerId,
            saleTypeId: 1,
            serie: serie,
            receiptTypeId: this.tipoComprobante(),
            dueDate: fechaVencimiento.toISOString(),
            operationType: ventas_interface_1.OPERATION_TYPE_VENTA_INTERNA,
            subtotal: subtotal,
            igv: igv,
            isc: 0,
            total: total,
            descuento: Number(this.descuentoPromocion().toFixed(2)),
            promotionId: (_b = (_a = this.promocionAplicada()) === null || _a === void 0 ? void 0 : _a.idPromocion) !== null && _b !== void 0 ? _b : null,
            deliveryType: this.tipoEntrega(),
            deliveryAddress: this.tipoEntrega() === 'delivery' ? this.direccionDelivery().trim() : null,
            esCreditoPendiente: this.tipoPagoOrigen() === 'credito',
            currencyCode: ventas_interface_1.CURRENCY_PEN_ADMIN,
            responsibleId: this.idUsuarioActual().toString(),
            branchId: (_c = this.sedeSeleccionada()) !== null && _c !== void 0 ? _c : 0,
            warehouseId: (_d = this.almacenSeleccionado()) !== null && _d !== void 0 ? _d : 0,
            paymentMethodId: this.metodoPagoSeleccionado(),
            operationNumber: this.metodoPagoSeleccionado() === 1 ? null : this.numeroOperacion(),
            items: this.productosSeleccionados().map(function (item) {
                var producto = _this.productosCargados().find(function (p) { return p.id === item.productId; });
                return {
                    productId: producto ? producto.id.toString() : item.productId.toString(),
                    quantity: item.quantity,
                    unitPrice: Number(Number(item.unitPrice).toFixed(2)),
                    description: item.description,
                    total: Number(Number(item.total).toFixed(2))
                };
            })
        };
        this.ventasService.registrarVenta(request).subscribe({
            next: function (response) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                _this.loading.set(false);
                _this.comprobanteGenerado.set({
                    numero_completo: ((_a = response.serie) !== null && _a !== void 0 ? _a : serie) + "-" + String((_c = (_b = response.receiptNumber) !== null && _b !== void 0 ? _b : response.numero) !== null && _c !== void 0 ? _c : '').padStart(8, '0'),
                    fec_emision: (_e = (_d = response.createdAt) !== null && _d !== void 0 ? _d : response.fec_emision) !== null && _e !== void 0 ? _e : new Date().toISOString(),
                    total: (_f = response.total) !== null && _f !== void 0 ? _f : total,
                    serie: (_g = response.serie) !== null && _g !== void 0 ? _g : serie,
                    numero: (_j = (_h = response.receiptNumber) !== null && _h !== void 0 ? _h : response.numero) !== null && _j !== void 0 ? _j : 0,
                    id_comprobante: (_l = (_k = response.receiptId) !== null && _k !== void 0 ? _k : response.id_comprobante) !== null && _l !== void 0 ? _l : 0
                });
                _this.messageService.add({
                    severity: 'success',
                    summary: '¡Venta Exitosa!',
                    detail: "Comprobante " + serie + "-" + String((_o = (_m = response.receiptNumber) !== null && _m !== void 0 ? _m : response.numero) !== null && _o !== void 0 ? _o : '').padStart(8, '0') + " generado",
                    life: 5000
                });
                if (cotizId) {
                    _this.quoteService.updateQuoteStatus(cotizId, 'APROBADA').subscribe({
                        next: function () { return console.log("Cotizaci\u00F3n #" + cotizId + " marcada como APROBADA"); },
                        error: function () { return console.warn('No se pudo actualizar estado de cotización'); }
                    });
                }
                if (_this.tipoPagoOrigen() === 'credito') {
                    var receiptId = typeof response.receiptId === 'number' && response.receiptId > 0
                        ? response.receiptId
                        : typeof response.id_comprobante === 'number' && response.id_comprobante > 0
                            ? response.id_comprobante
                            : typeof response.idComprobante === 'number' && response.idComprobante > 0
                                ? response.idComprobante
                                : undefined;
                    if (!receiptId) {
                        _this.messageService.add({ severity: 'error', summary: 'Error interno', detail: 'No se pudo registrar la cuenta por cobrar porque el comprobante no tiene ID.' });
                        return;
                    }
                    var fechaVenc = new Date();
                    fechaVenc.setDate(fechaVenc.getDate() + 30);
                    _this.arService
                        .create({
                        salesReceiptId: receiptId,
                        userRef: _this.clienteEncontrado().name,
                        totalAmount: total,
                        dueDate: fechaVenc.toISOString().split('T')[0],
                        paymentTypeId: _this.metodoPagoSeleccionado(),
                        currencyCode: ventas_interface_1.CURRENCY_PEN_ADMIN,
                        observation: cotizId ? "Cr\u00E9dito generado desde cotizaci\u00F3n #" + cotizId : 'Venta a crédito'
                    })
                        .then(function (ar) {
                        var _a;
                        if (ar) {
                            _this.messageService.add({ severity: 'info', summary: 'Cuenta por Cobrar Creada', detail: "Cuenta #" + ar.id + " registrada. Saldo: S/. " + ar.pendingBalance.toFixed(2), life: 5000 });
                        }
                        else {
                            _this.messageService.add({ severity: 'error', summary: 'Error al crear cuenta por cobrar', detail: (_a = _this.arService.error()) !== null && _a !== void 0 ? _a : undefined });
                        }
                    });
                }
            },
            error: function (err) {
                var _a, _b;
                _this.loading.set(false);
                _this.messageService.add({ severity: 'error', summary: 'Error al Generar Venta', detail: (_b = (_a = err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al procesar la venta' });
            }
        });
    };
    GenerarVentasAdministracion.prototype.nuevaVenta = function () {
        var _this = this;
        this.confirmationService.confirm({
            message: '¿Desea realizar una nueva venta?',
            header: 'Nueva Venta',
            icon: 'pi pi-refresh',
            accept: function () { return _this.resetearFormulario(); }
        });
    };
    GenerarVentasAdministracion.prototype.verListado = function () {
        this.router.navigate(['/admin/historial-ventas-administracion']);
    };
    GenerarVentasAdministracion.prototype.resetearFormulario = function () {
        var _a, _b;
        this.tipoComprobante.set(2);
        var dni = this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
        this.tipoDocBoleta.set((_a = dni === null || dni === void 0 ? void 0 : dni.documentTypeId) !== null && _a !== void 0 ? _a : null);
        this.clienteDocumento.set('');
        this.clienteEncontrado.set(null);
        this.busquedaRealizada.set(false);
        this.editandoCliente.set(false);
        this.resetNuevoClienteForm();
        this.productoTemp.set(null);
        this.cantidadTemp.set(1);
        this.tipoPrecioTemp.set('unidad');
        this.productosSeleccionados.set([]);
        this.familiaSeleccionada.set(null);
        var efectivo = this.metodosPago().find(function (m) { return m.codSunat === '008'; });
        this.metodoPagoSeleccionado.set((_b = efectivo === null || efectivo === void 0 ? void 0 : efectivo.id) !== null && _b !== void 0 ? _b : null);
        this.montoRecibido.set(0);
        this.numeroOperacion.set('');
        this.comprobanteGenerado.set(null);
        this.snapshotCliente.set(null);
        this.snapshotSede.set('');
        this.snapshotMetodoPago.set('');
        this.snapshotTipoComprobante.set(2);
        this.promocionesDisponibles.set([]);
        this.promocionAplicada.set(null);
        this.tipoEntrega.set('recojo');
        this.direccionDelivery.set('');
        this.costoDelivery.set(0);
        this.activeStep.set(0);
        this.almacenSeleccionado.set(null);
        this.almacenesOptions.set([]);
        this.cargarProductos(true);
        this.cargarFamilias();
    };
    GenerarVentasAdministracion.prototype.obtenerSeveridadStock = function (stock) {
        if (!stock || stock === 0)
            return 'danger';
        if (stock <= 5)
            return 'danger';
        if (stock <= 20)
            return 'warn';
        return 'success';
    };
    GenerarVentasAdministracion.prototype.getLabelMetodoPago = function (id) {
        var _a, _b;
        if (id === null)
            return 'N/A';
        return (_b = (_a = this.metodosPago().find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.descripcion) !== null && _b !== void 0 ? _b : 'N/A';
    };
    GenerarVentasAdministracion.prototype.obtenerSiglasDocumento = function (desc) {
        if (!desc)
            return '';
        if (desc.includes('DNI'))
            return 'DNI';
        if (desc.includes('RUC'))
            return 'RUC';
        var match = desc.match(/\(([^)]+)\)/);
        return match ? match[1] : desc;
    };
    GenerarVentasAdministracion.prototype.formatearDocumentoCompleto = function () {
        var c = this.clienteEncontrado();
        if (!(c === null || c === void 0 ? void 0 : c.documentTypeDescription))
            return '';
        return this.obtenerSiglasDocumento(c.documentTypeDescription) + " " + c.documentValue;
    };
    GenerarVentasAdministracion.prototype.onTipoComprobanteChange = function () {
        this.limpiarCliente();
        if (this.tipoComprobante() === 2) {
            var dni = this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
            if (dni)
                this.tipoDocBoleta.set(dni.documentTypeId);
        }
    };
    GenerarVentasAdministracion = __decorate([
        core_1.Component({
            selector: 'app-generar-ventas-administracion',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                toast_1.ToastModule,
                confirmdialog_1.ConfirmDialogModule,
                card_1.CardModule,
                button_1.ButtonModule,
                divider_1.DividerModule,
                inputtext_1.InputTextModule,
                selectbutton_1.SelectButtonModule,
                autocomplete_1.AutoCompleteModule,
                select_1.SelectModule,
                tag_1.TagModule,
                inputnumber_1.InputNumberModule,
                table_1.TableModule,
                tooltip_1.TooltipModule,
            ],
            providers: [api_1.MessageService, api_1.ConfirmationService],
            templateUrl: './generar-ventas-administracion.html',
            styleUrls: ['./generar-ventas-administracion.css']
        })
    ], GenerarVentasAdministracion);
    return GenerarVentasAdministracion;
}());
exports.GenerarVentasAdministracion = GenerarVentasAdministracion;
