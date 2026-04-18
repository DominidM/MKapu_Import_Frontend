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
var select_1 = require("primeng/select");
var tag_1 = require("primeng/tag");
var inputnumber_1 = require("primeng/inputnumber");
var tooltip_1 = require("primeng/tooltip");
var drawer_1 = require("primeng/drawer");
var textarea_1 = require("primeng/textarea");
var auth_service_1 = require("../../../auth/services/auth.service");
var ventas_service_1 = require("../../services/ventas.service");
var account_receivable_service_1 = require("../../services/account-receivable.service");
var sede_almacen_service_1 = require("../../services/sede-almacen.service");
var quote_service_1 = require("../../services/quote.service");
var dispatch_service_1 = require("../../services/dispatch.service");
var loading_overlay_component_1 = require("../../../shared/components/loading-overlay/loading-overlay.component");
var roles_constants_1 = require("../../../core/constants/roles.constants");
var caja_service_1 = require("../../../ventas/services/caja.service");
var ventas_interface_1 = require("../../interfaces/ventas.interface");
var warranty_service_1 = require("../../services/warranty.service");
var GenerarVentasAdministracion = /** @class */ (function () {
    function GenerarVentasAdministracion() {
        var _this = this;
        var _a;
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.ventasService = core_1.inject(ventas_service_1.VentasAdminService);
        this.messageService = core_1.inject(api_1.MessageService);
        this.confirmationService = core_1.inject(api_1.ConfirmationService);
        this.router = core_1.inject(router_1.Router);
        this.sedeAlmacenService = core_1.inject(sede_almacen_service_1.SedeAlmacenService);
        this.route = core_1.inject(router_1.ActivatedRoute);
        this.quoteService = core_1.inject(quote_service_1.QuoteService);
        this.arService = core_1.inject(account_receivable_service_1.AccountReceivableService);
        this.dispatchService = core_1.inject(dispatch_service_1.DispatchService);
        this.cajaService = core_1.inject(caja_service_1.CajaService);
        this.warrantyService = core_1.inject(warranty_service_1.WarrantyService);
        this.loading = core_1.signal(false);
        this.SIZE_PAGE = 10;
        this.COMISION_TARJETA = 0.05;
        this.COD_SUNAT_TARJETAS = ['005', '006'];
        this.COD_SUNAT_CON_BANCO = ['005', '006'];
        this.searchTimeout = null;
        this.sidebarClienteVisible = false;
        this.sidebarGarantiaVisible = false;
        this.promosBuscadas = false;
        this.queryBusqueda = core_1.signal('');
        this.panelVisible = core_1.signal(false);
        this.buscandoProductos = core_1.signal(false);
        this.modoRemate = core_1.signal(false);
        this.rematesSugeridos = core_1.signal([]);
        this.buscandoRemates = core_1.signal(false);
        this.reniecLoading = core_1.signal(false);
        this.nombreDesdeReniec = core_1.signal(false);
        this.idUsuarioActual = core_1.signal('0');
        this.nombreUsuarioActual = core_1.signal('');
        this.sedes = core_1.signal([]);
        this.sedesLoading = core_1.signal(false);
        this.sedeSeleccionada = core_1.signal(null);
        this.almacenSeleccionado = core_1.signal(null);
        this.isLoading = core_1.signal(false);
        this.tipoComprobante = core_1.signal(2);
        this.clienteDocumento = core_1.signal('');
        this.clienteEncontrado = core_1.signal(null);
        this.clienteLoading = core_1.signal(false);
        this.busquedaRealizada = core_1.signal(false);
        this.tiposDocumento = core_1.signal([]);
        this.tiposVenta = core_1.signal([]);
        this.tiposComprobante = core_1.signal([]);
        this.tipoDocBoleta = core_1.signal(null);
        this.creandoCliente = core_1.signal(false);
        this.editandoCliente = core_1.signal(false);
        this.guardandoCliente = core_1.signal(false);
        this.metodosPago = core_1.signal([]);
        this.cotizacionOrigen = core_1.signal(null);
        this.tipoPagoOrigen = core_1.signal('contado');
        this.bancosDisponibles = core_1.signal([]);
        this.bancosLoading = core_1.signal(false);
        this.bancoSeleccionado = core_1.signal(null);
        this.tiposServicio = core_1.signal([]);
        this.tiposServicioLoading = core_1.signal(false);
        this.tipoServicioSeleccionado = core_1.signal(null);
        this.codSunatMetodoPago = core_1.signal('');
        this.guardandoGarantia = core_1.signal(false);
        this.garantiaRegistrada = core_1.signal(null);
        this.garantiaForm = { cod_prod: '', prod_nombre: '', motivo: '', observaciones: '' };
        this.nuevoClienteForm = { documentTypeId: null, documentValue: '', name: '', address: '', email: '', phone: '' };
        this.editarClienteForm = {
            name: '',
            address: '',
            email: '',
            phone: ''
        };
        this.productosLoading = core_1.signal(true);
        this.familiasLoading = core_1.signal(true);
        this.productosCargados = core_1.signal([]);
        this.productosFiltrados = core_1.signal([]);
        this.productosSugeridos = core_1.signal([]);
        this.paginaActual = core_1.signal(1);
        this.totalRegistros = core_1.signal(0);
        this.cargandoMas = core_1.signal(false);
        this.familiaSeleccionada = core_1.signal(null);
        this.familiasDisponibles = core_1.signal([]);
        this.productosPendientes = core_1.signal([]);
        this.productosSeleccionados = core_1.signal([]);
        this.promocionesDisponibles = core_1.signal([]);
        this.promocionesFiltradas = core_1.signal([]);
        this.promocionAplicada = core_1.signal(null);
        this.promocionesLoading = core_1.signal(false);
        this.tipoEntrega = core_1.signal('recojo');
        this.direccionDelivery = core_1.signal('');
        this.costoDelivery = core_1.signal(0);
        this.metodoPagoSeleccionado = core_1.signal(null);
        this.montoRecibido = core_1.signal(0);
        this.numeroOperacion = core_1.signal('');
        this.comprobanteGenerado = core_1.signal(null);
        this.snapshotCliente = core_1.signal(null);
        this.snapshotSede = core_1.signal('');
        this.snapshotMetodoPago = core_1.signal('');
        this.snapshotTipoComprobante = core_1.signal(2);
        this.tipoVentaSeleccionado = core_1.signal(1);
        this.codigoPromocionInput = core_1.signal('');
        this.promoNoEncontrada = core_1.signal(false);
        this.promoYaAplicada = core_1.signal(false);
        this.saldoCaja = core_1.signal(null);
        this.provinciaDestino = core_1.signal('');
        this.distritoDestino = core_1.signal('');
        this.ciudadDestino = core_1.signal('');
        this.idMetodoPagoEfectivo = core_1.computed(function () { var _a, _b; return (_b = (_a = _this.metodosPago().find(function (m) { return m.codSunat === '008'; })) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null; });
        this.metodoPagoEsTarjeta = core_1.computed(function () {
            var _a;
            var id = _this.metodoPagoSeleccionado();
            var metodo = _this.metodosPago().find(function (m) { return m.id === id; });
            return _this.COD_SUNAT_TARJETAS.includes((_a = metodo === null || metodo === void 0 ? void 0 : metodo.codSunat) !== null && _a !== void 0 ? _a : '');
        });
        this.metodoPagoRequiereBanco = core_1.computed(function () {
            var _a;
            var id = _this.metodoPagoSeleccionado();
            var metodo = _this.metodosPago().find(function (m) { return m.id === id; });
            return _this.COD_SUNAT_CON_BANCO.includes((_a = metodo === null || metodo === void 0 ? void 0 : metodo.codSunat) !== null && _a !== void 0 ? _a : '');
        });
        this.tipoComprobanteSeleccionadoObj = core_1.computed(function () { var _a; return (_a = _this.tiposComprobante().find(function (t) { return t.id === _this.tipoComprobante(); })) !== null && _a !== void 0 ? _a : null; });
        this.totalBrutoCarrito = core_1.computed(function () {
            var base = _this.productosSeleccionados().reduce(function (s, i) { return s + Number(i.total); }, 0);
            var delivery = _this.tipoEntrega() === 'delivery' || _this.tipoEntrega() === 'provincia'
                ? _this.costoDelivery()
                : 0;
            return Number((base - _this.descuentoPromocion() + delivery).toFixed(2));
        });
        this.totalesCarrito = core_1.computed(function () {
            return _this.ventasService.calcularTotalesCarrito(_this.productosSeleccionados().map(function (i) { return ({
                precioVenta: Number(i.total) / Math.max(Number(i.quantity), 1),
                cantidad: Number(i.quantity)
            }); }), _this.tipoComprobanteSeleccionadoObj());
        });
        this.subtotal = core_1.computed(function () { return _this.totalesCarrito().subtotal; });
        this.igv = core_1.computed(function () { return _this.totalesCarrito().igv; });
        this.total = core_1.computed(function () {
            var subtotal = _this.totalesCarrito().subtotal;
            var igv = _this.totalesCarrito().igv;
            var descuento = _this.descuentoPromocion();
            var delivery = _this.tipoEntrega() === 'delivery' || _this.tipoEntrega() === 'provincia'
                ? _this.costoDelivery()
                : 0;
            var baseSinExtras = Number((subtotal + igv - descuento).toFixed(2));
            if (!_this.ventasService.aplicaIgv(_this.tipoComprobanteSeleccionadoObj())) {
                return Number((baseSinExtras + delivery).toFixed(2));
            }
            return Number((baseSinExtras + delivery).toFixed(2));
        });
        this.comisionMonto = core_1.computed(function () {
            return _this.metodoPagoEsTarjeta() && _this.bancoSeleccionado()
                ? Number((_this.total() * _this.COMISION_TARJETA).toFixed(2))
                : 0;
        });
        this.totalFinal = core_1.computed(function () { return Number((_this.total() + _this.comisionMonto()).toFixed(2)); });
        this.bancosOptions = core_1.computed(function () {
            return _this.bancosDisponibles().map(function (b) { return ({ label: b.nombre_banco, value: b.id_banco }); });
        });
        this.productosDelComprobante = core_1.computed(function () {
            return _this.productosSeleccionados().map(function (p) { return ({
                label: p.codigo + " \u2014 " + p.description,
                value: { cod_prod: p.codigo, prod_nombre: p.description }
            }); });
        });
        this.tiposServicioOptions = core_1.computed(function () {
            var codSunat = _this.codSunatMetodoPago();
            var servicios = _this.tiposServicio();
            if (codSunat === '006') {
                var filtrados = servicios.filter(function (s) {
                    return _this.normalizarTexto(s.nombre_servicio).includes('CREDITO');
                });
                return (filtrados.length > 0 ? filtrados : servicios).map(function (s) { return ({
                    label: s.nombre_servicio,
                    value: s.id_servicio
                }); });
            }
            if (codSunat === '005') {
                var filtrados = servicios.filter(function (s) {
                    return _this.normalizarTexto(s.nombre_servicio).includes('DEBITO');
                });
                return (filtrados.length > 0 ? filtrados : servicios).map(function (s) { return ({
                    label: s.nombre_servicio,
                    value: s.id_servicio
                }); });
            }
            if (codSunat === '003') {
                var filtrados = servicios.filter(function (s) {
                    var n = _this.normalizarTexto(s.nombre_servicio);
                    return n.includes('TRANSFERENCIA') || n.includes('YAPE') || n.includes('PLIN');
                });
                return (filtrados.length > 0 ? filtrados : servicios).map(function (s) { return ({
                    label: s.nombre_servicio,
                    value: s.id_servicio
                }); });
            }
            return servicios.map(function (s) { return ({ label: s.nombre_servicio, value: s.id_servicio }); });
        });
        this.metodoPagoOptions = core_1.computed(function () {
            return _this.metodosPago().map(function (m) { return ({
                label: m.descripcion,
                value: m.id,
                icon: _this.iconoPorMetodoPago(m.codSunat)
            }); });
        });
        this.tipoDocRucId = core_1.computed(function () { var _a, _b; return (_b = (_a = _this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); })) === null || _a === void 0 ? void 0 : _a.documentTypeId) !== null && _b !== void 0 ? _b : null; });
        this.documentoConfig = core_1.computed(function () {
            var _a, _b;
            var docActual = _this.clienteDocumento();
            if (docActual.length === 11 && /^\d+$/.test(docActual)) {
                return {
                    maxLength: 11,
                    minLength: 11,
                    soloNumeros: true,
                    placeholder: 'Ingrese RUC (11 dígitos)'
                };
            }
            if (_this.tipoComprobante() === 1) {
                return {
                    maxLength: 11,
                    minLength: 11,
                    soloNumeros: true,
                    placeholder: 'Ingrese RUC (11 dígitos)'
                };
            }
            var tipo = _this.tiposDocumento().find(function (t) { return t.documentTypeId === _this.tipoDocBoleta(); });
            var desc = (_b = (_a = tipo === null || tipo === void 0 ? void 0 : tipo.description) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
            if (desc.includes('DNI')) {
                return {
                    maxLength: 8,
                    minLength: 8,
                    soloNumeros: true,
                    placeholder: 'Ingrese DNI (8 dígitos)'
                };
            }
            if (desc.includes('CARNET') || desc.includes('EXTRANJERI')) {
                return {
                    maxLength: 12,
                    minLength: 9,
                    soloNumeros: false,
                    placeholder: 'Ingrese Carnet de Extranjería'
                };
            }
            if (desc.includes('PASAPORTE')) {
                return {
                    maxLength: 20,
                    minLength: 5,
                    soloNumeros: false,
                    placeholder: 'Ingrese número de pasaporte'
                };
            }
            return {
                maxLength: 20,
                minLength: 1,
                soloNumeros: false,
                placeholder: 'Ingrese número de documento'
            };
        });
        this.longitudDocumento = core_1.computed(function () { return _this.documentoConfig().maxLength; });
        this.botonClienteHabilitado = core_1.computed(function () {
            var _a, _b;
            var len = (_b = (_a = _this.clienteDocumento()) === null || _a === void 0 ? void 0 : _a.trim().length) !== null && _b !== void 0 ? _b : 0;
            var cfg = _this.documentoConfig();
            return len >= cfg.minLength && len <= cfg.maxLength;
        });
        this.descuentoPromocion = core_1.computed(function () {
            var _a;
            var promo = _this.promocionAplicada();
            if (!promo)
                return 0;
            var regla = (_a = promo.reglas) === null || _a === void 0 ? void 0 : _a.find(function (r) { return r.tipoCondicion === 'PRODUCTO'; });
            var base;
            if (regla) {
                var item = _this.productosSeleccionados().find(function (i) { return i.codigo === regla.valorCondicion || i.productId.toString() === regla.valorCondicion; });
                base = item ? item.total : 0;
            }
            else {
                base = _this.productosSeleccionados().reduce(function (s, i) { return s + Number(i.total); }, 0);
            }
            return _this.esPorcentaje(promo.tipo)
                ? Number(((base * Number(promo.valor)) / 100).toFixed(2))
                : Number(Number(promo.valor).toFixed(2));
        });
        this.vuelto = core_1.computed(function () {
            var v = _this.montoRecibido() - _this.totalFinal();
            return v >= 0 ? v : 0;
        });
        this.hayMasPaginas = core_1.computed(function () { return _this.productosCargados().length < _this.totalRegistros(); });
        this.nombreSedeSeleccionada = core_1.computed(function () {
            var _a, _b;
            var id = _this.sedeSeleccionada();
            if (!id)
                return 'Sin sede';
            if (_this.esAdmin)
                return (_b = (_a = _this.sedes().find(function (s) { return s.id_sede === id; })) === null || _a === void 0 ? void 0 : _a.nombre) !== null && _b !== void 0 ? _b : '';
            return _this.sedeNombreVentas;
        });
        this.sedesOptions = core_1.computed(function () {
            return _this.sedes().map(function (s) { return ({ label: s.nombre, value: s.id_sede }); });
        });
        this.productoGarantiaSeleccionadoSignal = core_1.signal(null);
        var user = this.authService.getCurrentUser();
        this.esAdmin = this.authService.getRoleId() === roles_constants_1.UserRole.ADMIN;
        this.sedeNombreVentas = (_a = user === null || user === void 0 ? void 0 : user.sedeNombre) !== null && _a !== void 0 ? _a : 'Mi sede';
    }
    GenerarVentasAdministracion.prototype.normalizarTexto = function (s) {
        return s
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    };
    GenerarVentasAdministracion.prototype.iconoPorMetodoPago = function (codSunat) {
        var _a;
        var map = {
            '008': 'pi pi-money-bill',
            '005': 'pi pi-credit-card',
            '006': 'pi pi-credit-card',
            '003': 'pi pi-arrow-right-arrow-left',
            '001': 'pi pi-building'
        };
        return (_a = map[codSunat]) !== null && _a !== void 0 ? _a : 'pi pi-wallet';
    };
    GenerarVentasAdministracion.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading.set(true);
        this.cargarSesion();
        this.cargarTiposDocumento();
        this.cargarMetodosPago();
        this.cargarTiposVenta();
        this.cargarTiposComprobante();
        this.leerParamsCotizacion();
        this.cargarSaldoCaja();
        if (this.esAdmin) {
            this.cargarSedes();
        }
        else {
            setTimeout(function () { return _this.isLoading.set(false); }, 800);
        }
    };
    GenerarVentasAdministracion.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () { return _this.cargarFamilias(); }, 0);
    };
    GenerarVentasAdministracion.prototype.onQueryChange = function (value) {
        var _this = this;
        this.queryBusqueda.set(value);
        this.productosSugeridos.set([]);
        this.rematesSugeridos.set([]);
        this.panelVisible.set(false);
        if (this.searchTimeout)
            clearTimeout(this.searchTimeout);
        if (!value || value.trim().length < 3)
            return;
        if (this.modoRemate()) {
            this.buscandoRemates.set(true);
            this.searchTimeout = setTimeout(function () {
                var _a;
                _this.ventasService
                    .buscarRematesAutocomplete(value.trim(), (_a = _this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : undefined)
                    .subscribe({
                    next: function (items) {
                        _this.rematesSugeridos.set(items);
                        _this.panelVisible.set(true);
                        _this.buscandoRemates.set(false);
                    },
                    error: function () {
                        _this.rematesSugeridos.set([]);
                        _this.buscandoRemates.set(false);
                    }
                });
            }, 300);
        }
        else {
            this.buscandoProductos.set(true);
            this.searchTimeout = setTimeout(function () {
                var _a, _b;
                _this.ventasService
                    .buscarProductosVentas(value.trim(), (_a = _this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : undefined, (_b = _this.familiaSeleccionada()) !== null && _b !== void 0 ? _b : undefined)
                    .subscribe({
                    next: function (res) {
                        _this.productosSugeridos.set(res.data.map(function (p) { return _this.ventasService.mapearAutocompleteVentas(p); }));
                        _this.panelVisible.set(true);
                        _this.buscandoProductos.set(false);
                    },
                    error: function () {
                        _this.productosSugeridos.set([]);
                        _this.buscandoProductos.set(false);
                    }
                });
            }, 300);
        }
    };
    GenerarVentasAdministracion.prototype.cerrarPanelConDelay = function () {
        var _this = this;
        setTimeout(function () { return _this.panelVisible.set(false); }, 200);
    };
    GenerarVentasAdministracion.prototype.estaEnPendientes = function (idProducto) {
        return this.productosPendientes().some(function (p) { return !p.esRemate && p.id === idProducto; });
    };
    GenerarVentasAdministracion.prototype.onProductoToggle = function (producto) {
        var _a, _b, _c, _d, _e, _f;
        if (!producto || typeof producto !== 'object' || !producto.nombre)
            return;
        if (producto.stock <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin stock',
                detail: producto.nombre + " no tiene stock disponible",
                life: 3000
            });
            return;
        }
        var lista = __spreadArrays(this.productosPendientes());
        var idx = lista.findIndex(function (p) { return !p.esRemate && p.id === producto.id; });
        if (idx >= 0) {
            lista.splice(idx, 1);
            this.productosPendientes.set(lista);
            return;
        }
        var almacenesConStock = producto.almacenes.filter(function (a) { return a.stock > 0; });
        var almacenDefault = (_b = (_a = almacenesConStock[0]) !== null && _a !== void 0 ? _a : producto.almacenes[0]) !== null && _b !== void 0 ? _b : null;
        var pendiente = {
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            stock: (_c = almacenDefault === null || almacenDefault === void 0 ? void 0 : almacenDefault.stock) !== null && _c !== void 0 ? _c : producto.stock,
            stockTotal: producto.stock,
            precioUnidad: producto.precioUnidad,
            precioCaja: producto.precioCaja,
            precioMayorista: producto.precioMayorista,
            tipoPrecio: 'unidad',
            cantidad: 1,
            sede: (_d = producto.sede) !== null && _d !== void 0 ? _d : '',
            categoriaId: producto.categoriaId,
            almacenes: producto.almacenes,
            almacenSeleccionado: (_e = almacenDefault === null || almacenDefault === void 0 ? void 0 : almacenDefault.id_almacen) !== null && _e !== void 0 ? _e : null,
            unidadesPorCaja: (_f = producto.unidadesPorCaja) !== null && _f !== void 0 ? _f : undefined
        };
        this.productosPendientes.set(__spreadArrays(lista, [pendiente]));
    };
    GenerarVentasAdministracion.prototype.estaEnPendientesRemate = function (idDetalleRemate) {
        return this.productosPendientes().some(function (p) { return p.esRemate && p.idDetalleRemate === idDetalleRemate; });
    };
    GenerarVentasAdministracion.prototype.onRemateToggle = function (item) {
        if (item.stock_remate <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin stock',
                detail: (item.nombre_producto || item.descripcion_remate) + " no tiene stock en remate",
                life: 3000
            });
            return;
        }
        var lista = __spreadArrays(this.productosPendientes());
        var idx = lista.findIndex(function (p) { return p.esRemate && p.idDetalleRemate === item.id_detalle_remate; });
        if (idx >= 0) {
            lista.splice(idx, 1);
            this.productosPendientes.set(lista);
            return;
        }
        var pendiente = {
            id: item.id_producto,
            codigo: item.cod_remate,
            nombre: (item.nombre_producto + " " + item.descripcion_remate).trim(),
            stock: item.stock_remate,
            stockTotal: item.stock_remate,
            precioUnidad: item.pre_remate,
            precioCaja: item.pre_remate,
            precioMayorista: item.pre_remate,
            tipoPrecio: 'unidad',
            cantidad: 1,
            sede: '',
            esRemate: true,
            idDetalleRemate: item.id_detalle_remate,
            preOriginal: item.pre_original,
            almacenes: [],
            almacenSeleccionado: null
        };
        this.productosPendientes.set(__spreadArrays(lista, [pendiente]));
    };
    GenerarVentasAdministracion.prototype.getPrecioPendiente = function (p) {
        if (p.esRemate)
            return p.precioUnidad;
        switch (p.tipoPrecio) {
            case 'caja':
                return p.precioCaja;
            case 'mayorista':
                return p.precioMayorista;
            default:
                return p.precioUnidad;
        }
    };
    GenerarVentasAdministracion.prototype.actualizarPrecioPendiente = function (i) {
        var l = __spreadArrays(this.productosPendientes());
        l[i] = __assign({}, l[i]);
        this.productosPendientes.set(l);
    };
    GenerarVentasAdministracion.prototype.onAlmacenPendienteChange = function (i, idAlmacen) {
        var l = __spreadArrays(this.productosPendientes());
        var p = __assign({}, l[i]);
        p.almacenSeleccionado = idAlmacen;
        var almacen = p.almacenes.find(function (a) { return a.id_almacen === idAlmacen; });
        p.stock = almacen ? almacen.stock : p.stockTotal;
        if (p.cantidad > p.stock)
            p.cantidad = p.stock;
        l[i] = p;
        this.productosPendientes.set(l);
    };
    GenerarVentasAdministracion.prototype.decrementarPendiente = function (i) {
        var l = __spreadArrays(this.productosPendientes());
        if (l[i].cantidad > 1) {
            l[i] = __assign(__assign({}, l[i]), { cantidad: l[i].cantidad - 1 });
            this.productosPendientes.set(l);
        }
    };
    GenerarVentasAdministracion.prototype.incrementarPendiente = function (i) {
        var l = __spreadArrays(this.productosPendientes());
        if (l[i].cantidad < l[i].stock) {
            l[i] = __assign(__assign({}, l[i]), { cantidad: l[i].cantidad + 1 });
            this.productosPendientes.set(l);
        }
    };
    GenerarVentasAdministracion.prototype.clampCantidadPendiente = function (i) {
        var l = __spreadArrays(this.productosPendientes());
        var c = l[i].cantidad;
        if (isNaN(c) || c < 1)
            c = 1;
        if (c > l[i].stock)
            c = l[i].stock;
        l[i] = __assign(__assign({}, l[i]), { cantidad: c });
        this.productosPendientes.set(l);
    };
    GenerarVentasAdministracion.prototype.quitarPendiente = function (i) {
        var l = __spreadArrays(this.productosPendientes());
        l.splice(i, 1);
        this.productosPendientes.set(l);
    };
    GenerarVentasAdministracion.prototype.limpiarPendientes = function () {
        this.productosPendientes.set([]);
    };
    GenerarVentasAdministracion.prototype.agregarTodosAlCarrito = function () {
        var _this = this;
        var _a, _b;
        var pendientes = this.productosPendientes();
        if (!pendientes.length)
            return;
        var lista = __spreadArrays(this.productosSeleccionados());
        var errores = [];
        var tipoComprobanteActual = this.tipoComprobanteSeleccionadoObj();
        var _loop_1 = function (p) {
            var precioBase = this_1.getPrecioPendiente(p);
            var aplicaIgv = this_1.ventasService.aplicaIgv(tipoComprobanteActual);
            var precioVentaUnitario = aplicaIgv
                ? Number((precioBase * (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2))
                : Number(precioBase.toFixed(2));
            var igvUnitario = this_1.ventasService.calcularIgvUnitario(precioVentaUnitario, tipoComprobanteActual);
            var item = {
                productId: p.id,
                codigo: p.codigo,
                quantity: p.cantidad,
                unitPrice: precioBase,
                description: p.nombre,
                total: Number((precioVentaUnitario * p.cantidad).toFixed(2)),
                igvUnitario: igvUnitario,
                categoriaId: p.categoriaId,
                idDetalleRemate: p.esRemate ? ((_a = p.idDetalleRemate) !== null && _a !== void 0 ? _a : null) : null,
                tipoPrecio: p.esRemate
                    ? 'UNITARIO'
                    : p.tipoPrecio === 'caja'
                        ? 'CAJA'
                        : p.tipoPrecio === 'mayorista'
                            ? 'MAYORISTA'
                            : 'UNITARIO',
                almacenId: p.esRemate ? null : ((_b = p.almacenSeleccionado) !== null && _b !== void 0 ? _b : null),
                unidadesPorCaja: p.unidadesPorCaja
            };
            var idx = p.esRemate
                ? lista.findIndex(function (x) { return x.idDetalleRemate != null && x.idDetalleRemate === item.idDetalleRemate; })
                : lista.findIndex(function (x) {
                    return !x.idDetalleRemate &&
                        x.productId === item.productId &&
                        x.unitPrice === item.unitPrice &&
                        x.almacenId === item.almacenId;
                });
            if (idx >= 0) {
                var actualizado = __assign({}, lista[idx]);
                var nuevaCant = actualizado.quantity + p.cantidad;
                if (nuevaCant > p.stock) {
                    errores.push(p.nombre + ": stock insuficiente (m\u00E1x. " + p.stock + ")");
                    return "continue";
                }
                actualizado.quantity = nuevaCant;
                actualizado.total = Number((precioVentaUnitario * nuevaCant).toFixed(2));
                actualizado.igvUnitario = igvUnitario;
                lista[idx] = actualizado;
            }
            else {
                lista.push(item);
            }
        };
        var this_1 = this;
        for (var _i = 0, pendientes_1 = pendientes; _i < pendientes_1.length; _i++) {
            var p = pendientes_1[_i];
            _loop_1(p);
        }
        this.productosSeleccionados.set(lista);
        this.productosPendientes.set([]);
        this.productosSugeridos.set([]);
        this.rematesSugeridos.set([]);
        if (errores.length) {
            errores.forEach(function (e) {
                return _this.messageService.add({
                    severity: 'warn',
                    summary: 'Stock insuficiente',
                    detail: e,
                    life: 4000
                });
            });
        }
        var agregados = pendientes.length - errores.length;
        if (agregados > 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Productos agregados',
                detail: agregados + " producto" + (agregados > 1 ? 's' : '') + " a\u00F1adido" + (agregados > 1 ? 's' : '') + " al carrito",
                life: 3000
            });
        }
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
                var f = data.filter(function (m) { return ['008', '005', '006', '003'].includes(m.codSunat); });
                _this.metodosPago.set(f);
                var e = f.find(function (m) { return m.codSunat === '008'; });
                if (e)
                    _this.metodoPagoSeleccionado.set(e.id);
            }
        });
    };
    GenerarVentasAdministracion.prototype.cargarTiposVenta = function () {
        var _this = this;
        this.ventasService.obtenerTiposVenta().subscribe({ next: function (d) { return _this.tiposVenta.set(d); } });
    };
    GenerarVentasAdministracion.prototype.cargarTiposComprobante = function () {
        var _this = this;
        this.ventasService.obtenerTiposComprobante().subscribe({
            next: function (d) {
                return _this.tiposComprobante.set(d.filter(function (t) { return t.codSunat === '03' || t.codSunat === '01' || t.codSunat === 'NV'; }));
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
    GenerarVentasAdministracion.prototype.cargarSaldoCaja = function () {
        var _this = this;
        var sedeId = this.sedeSeleccionada();
        if (!sedeId)
            return;
        this.cajaService.getResumenDia(sedeId).subscribe({
            next: function (res) { var _a; return _this.saldoCaja.set((_a = res === null || res === void 0 ? void 0 : res.dineroEnCaja) !== null && _a !== void 0 ? _a : null); },
            error: function () { return _this.saldoCaja.set(null); }
        });
    };
    GenerarVentasAdministracion.prototype.cargarSedes = function () {
        var _this = this;
        if (!this.esAdmin)
            return;
        this.sedesLoading.set(true);
        this.ventasService.obtenerSedes().subscribe({
            next: function (data) {
                _this.sedes.set(data.filter(function (s) { return s.activo; }));
                _this.sedesLoading.set(false);
                _this.isLoading.set(false);
                var cotizId = _this.cotizacionOrigen();
                if (cotizId)
                    _this.cargarDatosDeCotizacion(cotizId);
            },
            error: function () {
                _this.sedesLoading.set(false);
                _this.isLoading.set(false);
                _this.messageService.add({
                    severity: 'warn',
                    summary: 'Sedes',
                    detail: 'No se pudieron cargar las sedes'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onSedeChange = function (sedeId) {
        var _this = this;
        if (!this.esAdmin) {
            var user = this.authService.getCurrentUser();
            if (sedeId !== (user === null || user === void 0 ? void 0 : user.idSede))
                return;
        }
        this.sedeSeleccionada.set(sedeId);
        this.almacenSeleccionado.set(null);
        this.familiaSeleccionada.set(null);
        this.productosPendientes.set([]);
        this.cargarProductos(true);
        this.cargarFamilias();
        this.cargarSaldoCaja();
        if (!sedeId)
            return;
        this.sedeAlmacenService.loadWarehouseOptionsBySede(sedeId).subscribe({
            next: function (opts) {
                if (opts.length > 0)
                    _this.almacenSeleccionado.set(opts[0].value);
            },
            error: function () { return console.warn('No se pudieron cargar almacenes'); }
        });
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
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los productos'
                });
            }
        });
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
                console.error(err);
                _this.familiasLoading.set(false);
            }
        });
    };
    GenerarVentasAdministracion.prototype.onFamiliaChange = function (idCategoria) {
        this.familiaSeleccionada.set(idCategoria);
        this.cargarProductos(true);
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
                _this.messageService.add({
                    severity: 'info',
                    summary: 'Producto Eliminado',
                    detail: 'El producto fue removido del carrito'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onTipoDocBoleta = function (id) {
        this.tipoDocBoleta.set(id);
        this.limpiarCliente();
    };
    GenerarVentasAdministracion.prototype.validarSoloNumeros = function (event) {
        var input = event.target;
        var cfg = this.documentoConfig();
        input.value = cfg.soloNumeros
            ? input.value.replace(/[^0-9]/g, '').slice(0, cfg.maxLength)
            : input.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, cfg.maxLength);
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
        this.ventasService.buscarCliente(this.clienteDocumento()).subscribe({
            next: function (res) {
                _this.clienteEncontrado.set(res);
                _this.busquedaRealizada.set(true);
                _this.clienteLoading.set(false);
                _this.editandoCliente.set(false);
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente Encontrado',
                    detail: res.name
                });
            },
            error: function () {
                _this.clienteEncontrado.set(null);
                _this.busquedaRealizada.set(true);
                _this.clienteLoading.set(false);
                _this.sincronizarDocumentoEnForm();
                _this.creandoCliente.set(false);
            }
        });
    };
    GenerarVentasAdministracion.prototype.onDocumentoNuevoClienteChange = function (valor) {
        var _this = this;
        var _a, _b;
        this.nuevoClienteForm.documentValue = valor;
        this.nombreDesdeReniec.set(false);
        var tipoId = this.nuevoClienteForm.documentTypeId;
        if (!tipoId)
            return;
        var tipoSel = this.tiposDocumento().find(function (t) { return t.documentTypeId === tipoId; });
        var desc = (_b = (_a = tipoSel === null || tipoSel === void 0 ? void 0 : tipoSel.description) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        var esDni = desc.includes('DNI') || desc.includes('IDENTIDAD');
        var esRuc = desc.includes('RUC') || desc.includes('CONTRIBUYENTE');
        if (!((esDni && valor.length === 8) || (esRuc && valor.length === 11)))
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
                    _this.messageService.add({
                        severity: 'success',
                        summary: esRuc ? 'SUNAT' : 'RENIEC',
                        detail: res.nombreCompleto,
                        life: 3000
                    });
                }
                else {
                    _this.messageService.add({
                        severity: 'warn',
                        summary: 'No encontrado',
                        detail: 'Ingrese el nombre manualmente.',
                        life: 3000
                    });
                }
            },
            error: function () {
                _this.reniecLoading.set(false);
                _this.messageService.add({
                    severity: 'warn',
                    summary: 'Sin conexión',
                    detail: 'Ingrese el nombre manualmente.',
                    life: 3000
                });
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
        this.nuevoClienteForm.documentValue = doc;
        var tipoActivo;
        if (doc.length === 11 && /^\d+$/.test(doc)) {
            tipoActivo = this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); });
        }
        else if (doc.length === 8 && /^\d+$/.test(doc)) {
            tipoActivo = this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
        }
        else {
            tipoActivo = this.tiposDocumento().find(function (t) { return t.documentTypeId === _this.tipoDocBoleta(); });
        }
        if (tipoActivo)
            this.nuevoClienteForm.documentTypeId = tipoActivo.documentTypeId;
    };
    GenerarVentasAdministracion.prototype.resetNuevoClienteForm = function () {
        this.nuevoClienteForm = {
            documentTypeId: null,
            documentValue: '',
            name: '',
            address: '',
            email: '',
            phone: ''
        };
    };
    GenerarVentasAdministracion.prototype.crearNuevoCliente = function () {
        var _this = this;
        var _a = this.nuevoClienteForm, documentTypeId = _a.documentTypeId, documentValue = _a.documentValue, name = _a.name;
        if (!documentTypeId || !documentValue.trim() || !name.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Tipo de documento, número y nombre son obligatorios'
            });
            return;
        }
        this.guardandoCliente.set(true);
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
                _this.guardandoCliente.set(false);
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
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente Creado',
                    detail: nuevo.name + " fue registrado y seleccionado"
                });
            },
            error: function (err) {
                var _a, _b;
                _this.guardandoCliente.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error al crear cliente',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.iniciarEdicionCliente = function () {
        var _a, _b, _c, _d;
        var c = this.clienteEncontrado();
        if (!c)
            return;
        this.editarClienteForm = {
            name: (_a = c.name) !== null && _a !== void 0 ? _a : '',
            address: (_b = c.address) !== null && _b !== void 0 ? _b : '',
            email: (_c = c.email) !== null && _c !== void 0 ? _c : '',
            phone: (_d = c.phone) !== null && _d !== void 0 ? _d : ''
        };
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
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente Actualizado',
                    detail: 'Datos actualizados correctamente'
                });
            },
            error: function (err) {
                var _a, _b;
                _this.guardandoCliente.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Error al actualizar'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onTipoComprobanteChange = function () {
        var _this = this;
        this.limpiarCliente();
        if (this.tipoComprobante() === 2) {
            var dni = this.tiposDocumento().find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
            if (dni)
                this.tipoDocBoleta.set(dni.documentTypeId);
        }
        var tipoComprobanteActual = this.tipoComprobanteSeleccionadoObj();
        var aplicaIgv = this.ventasService.aplicaIgv(tipoComprobanteActual);
        this.productosSeleccionados.update(function (items) {
            return items.map(function (item) {
                var _a;
                var precioBase = Number((_a = item.unitPrice) !== null && _a !== void 0 ? _a : 0);
                var precioVentaUnitario = aplicaIgv
                    ? Number((precioBase * (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2))
                    : Number(precioBase.toFixed(2));
                return __assign(__assign({}, item), { total: Number((precioVentaUnitario * item.quantity).toFixed(2)), igvUnitario: _this.ventasService.calcularIgvUnitario(precioVentaUnitario, tipoComprobanteActual) });
            });
        });
    };
    GenerarVentasAdministracion.prototype.abrirSidebarCliente = function () {
        this.sidebarClienteVisible = true;
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
            next: function (c) {
                _this.loading.set(false);
                _this.prefillDesdeCotizacion(c);
            },
            error: function () {
                _this.loading.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar la cotización'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.prefillDesdeCotizacion = function (cotizacion) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (cotizacion.id_sede && this.esAdmin)
            this.onSedeChange(cotizacion.id_sede);
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
            var tipoComprobanteActual_1 = this.tipoComprobanteSeleccionadoObj();
            var items = cotizacion.detalles.map(function (d) {
                var precioBase = Number(d.precio);
                var aplicaIgv = _this.ventasService.aplicaIgv(tipoComprobanteActual_1);
                var precioVentaUnitario = aplicaIgv
                    ? Number((precioBase * (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2))
                    : Number(precioBase.toFixed(2));
                var cantidad = Number(d.cantidad);
                return {
                    productId: d.id_prod_ref,
                    codigo: d.cod_prod,
                    quantity: cantidad,
                    unitPrice: precioBase,
                    description: d.descripcion,
                    total: Number((precioVentaUnitario * cantidad).toFixed(2)),
                    igvUnitario: _this.ventasService.calcularIgvUnitario(precioVentaUnitario, tipoComprobanteActual_1),
                    idDetalleRemate: null
                };
            });
            this.productosSeleccionados.set(items);
        }
        if (this.tipoPagoOrigen() === 'credito') {
            var credito = this.metodosPago().find(function (m) { return m.codSunat === '003' || m.codSunat === '005'; });
            if (credito)
                this.metodoPagoSeleccionado.set(credito.id);
        }
        this.messageService.add({
            severity: 'info',
            summary: 'Cotización cargada',
            detail: "Datos pre-llenados desde cotizaci\u00F3n #" + this.cotizacionOrigen(),
            life: 4000
        });
    };
    GenerarVentasAdministracion.prototype.cargarPromociones = function () {
        var _this = this;
        if (this.promocionesDisponibles().length > 0)
            return;
        this.promocionesLoading.set(true);
        this.promosBuscadas = true;
        this.ventasService.obtenerPromocionesActivas().subscribe({
            next: function (promos) {
                var activas = promos
                    .map(function (p) { return (__assign(__assign({}, p), { activo: _this.normalizarActivo(p.activo) })); })
                    .filter(function (p) { return p.activo; });
                _this.promocionesDisponibles.set(activas);
                _this.promocionesLoading.set(false);
            },
            error: function (err) {
                var _a;
                _this.promocionesLoading.set(false);
                _this.promocionesDisponibles.set([]);
                if (((_a = err) === null || _a === void 0 ? void 0 : _a.status) !== 404) {
                    _this.messageService.add({
                        severity: 'warn',
                        summary: 'Promociones',
                        detail: 'No se pudieron cargar',
                        life: 3000
                    });
                }
            }
        });
    };
    GenerarVentasAdministracion.prototype.filtrarPromociones = function () {
        var texto = this.codigoPromocionInput().trim().toLowerCase();
        if (!texto) {
            this.promocionesFiltradas.set([]);
            return;
        }
        if (this.promocionesDisponibles().length === 0)
            this.cargarPromociones();
        this.promocionesFiltradas.set(this.promocionesDisponibles().filter(function (p) { return p.concepto.toLowerCase().includes(texto); }));
    };
    GenerarVentasAdministracion.prototype.aplicarPromocion = function (promo) {
        var _a;
        var reglaProducto = (_a = promo.reglas) === null || _a === void 0 ? void 0 : _a.find(function (r) { return r.tipoCondicion === 'PRODUCTO'; });
        if (reglaProducto) {
            var productoEnCarrito = this.productosSeleccionados().some(function (i) {
                return i.codigo === reglaProducto.valorCondicion ||
                    i.productId.toString() === reglaProducto.valorCondicion;
            });
            if (!productoEnCarrito) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Producto requerido',
                    detail: "Esta promoci\u00F3n requiere el producto \"" + reglaProducto.valorCondicion + "\" en el carrito",
                    life: 4000
                });
                return;
            }
        }
        this.promocionAplicada.set(promo);
        this.codigoPromocionInput.set('');
        this.promocionesFiltradas.set([]);
        this.promoNoEncontrada.set(false);
        this.messageService.add({
            severity: 'success',
            summary: 'Promoción aplicada',
            detail: promo.concepto + " \u2014 descuento: " + (this.esPorcentaje(promo.tipo) ? promo.valor + "%" : "S/. " + Number(promo.valor).toFixed(2)),
            life: 3000
        });
    };
    GenerarVentasAdministracion.prototype.promoAplicaAlCarrito = function (promo) {
        var _a;
        var regla = (_a = promo.reglas) === null || _a === void 0 ? void 0 : _a.find(function (r) { return r.tipoCondicion === 'PRODUCTO'; });
        if (!regla)
            return true;
        return this.productosSeleccionados().some(function (i) { return i.codigo === regla.valorCondicion || i.productId.toString() === regla.valorCondicion; });
    };
    GenerarVentasAdministracion.prototype.buscarYAplicarPromocion = function () {
        var codigo = this.codigoPromocionInput().trim();
        if (!codigo)
            return;
        this.promoNoEncontrada.set(false);
        if (this.promocionAplicada())
            return;
        if (this.promocionesDisponibles().length === 0) {
            this.cargarPromociones();
            this.messageService.add({
                severity: 'info',
                summary: 'Cargando...',
                detail: 'Intente nuevamente.',
                life: 2000
            });
            return;
        }
        var encontrada = this.promocionesDisponibles().find(function (p) { return p.concepto.toLowerCase() === codigo.toLowerCase(); });
        if (!encontrada) {
            this.promoNoEncontrada.set(true);
            return;
        }
        this.aplicarPromocion(encontrada);
    };
    GenerarVentasAdministracion.prototype.quitarPromocion = function () {
        this.promocionAplicada.set(null);
        this.codigoPromocionInput.set('');
        this.promocionesFiltradas.set([]);
        this.promoNoEncontrada.set(false);
        this.promoYaAplicada.set(false);
        this.messageService.add({
            severity: 'info',
            summary: 'Promoción removida',
            detail: 'Se quitó el descuento',
            life: 2000
        });
    };
    GenerarVentasAdministracion.prototype.onTipoEntregaChange = function (tipo) {
        var _a, _b;
        this.tipoEntrega.set(tipo);
        if (tipo === 'recojo' || tipo === 'fisico') {
            this.direccionDelivery.set('');
            this.costoDelivery.set(0);
            this.provinciaDestino.set('');
            this.distritoDestino.set('');
            this.ciudadDestino.set('');
        }
        else if (tipo === 'delivery') {
            this.provinciaDestino.set('');
            this.distritoDestino.set('');
            this.ciudadDestino.set('');
            var dir = (_b = (_a = this.clienteEncontrado()) === null || _a === void 0 ? void 0 : _a.address) !== null && _b !== void 0 ? _b : '';
            if (dir)
                this.direccionDelivery.set(dir);
        }
        else if (tipo === 'provincia') {
            this.direccionDelivery.set('');
            this.costoDelivery.set(0);
        }
    };
    GenerarVentasAdministracion.prototype.onMetodoPagoChange = function (id) {
        var _a;
        this.metodoPagoSeleccionado.set(id);
        var metodo = this.metodosPago().find(function (m) { return m.id === id; });
        this.codSunatMetodoPago.set((_a = metodo === null || metodo === void 0 ? void 0 : metodo.codSunat) !== null && _a !== void 0 ? _a : '');
        this.bancoSeleccionado.set(null);
        this.tiposServicio.set([]);
        this.tipoServicioSeleccionado.set(null);
        this.bancosDisponibles.set([]);
        if (this.metodoPagoRequiereBanco())
            this.cargarBancos();
    };
    GenerarVentasAdministracion.prototype.cargarBancos = function () {
        var _this = this;
        if (this.bancosDisponibles().length > 0)
            return;
        this.bancosLoading.set(true);
        this.ventasService.obtenerBancos().subscribe({
            next: function (data) {
                _this.bancosDisponibles.set(data);
                _this.bancosLoading.set(false);
            },
            error: function () {
                _this.bancosLoading.set(false);
                _this.messageService.add({
                    severity: 'warn',
                    summary: 'Bancos',
                    detail: 'No se pudieron cargar los bancos',
                    life: 3000
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onBancoChange = function (bancoId) {
        var _this = this;
        this.bancoSeleccionado.set(bancoId);
        this.tiposServicio.set([]);
        this.tipoServicioSeleccionado.set(null);
        if (!bancoId)
            return;
        this.tiposServicioLoading.set(true);
        this.ventasService.obtenerTiposServicio(bancoId).subscribe({
            next: function (data) {
                _this.tiposServicio.set(data);
                _this.tiposServicioLoading.set(false);
                var normalizar = function (s) {
                    return s
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toUpperCase();
                };
                var cod = _this.codSunatMetodoPago();
                var keyword = cod === '006'
                    ? 'CREDITO'
                    : cod === '005'
                        ? 'DEBITO'
                        : cod === '003'
                            ? 'TRANSFERENCIA'
                            : '';
                if (keyword) {
                    var match = data.find(function (s) { return normalizar(s.nombre_servicio).includes(keyword); });
                    if (match)
                        _this.tipoServicioSeleccionado.set(match.id_servicio);
                }
            },
            error: function () {
                _this.tiposServicioLoading.set(false);
                _this.messageService.add({
                    severity: 'warn',
                    summary: 'Servicios',
                    detail: 'No se pudieron cargar los tipos de servicio',
                    life: 3000
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.abrirSidebarGarantia = function () {
        this.garantiaForm = { cod_prod: '', prod_nombre: '', motivo: '', observaciones: '' };
        this.garantiaRegistrada.set(null);
        this.productoGarantiaSeleccionadoSignal.set(null);
        if (this.productosSeleccionados().length === 1) {
            var p = this.productosSeleccionados()[0];
            this.garantiaForm.cod_prod = p.codigo;
            this.garantiaForm.prod_nombre = p.description;
            this.productoGarantiaSeleccionadoSignal.set({
                cod_prod: p.codigo,
                prod_nombre: p.description
            });
        }
        this.sidebarGarantiaVisible = true;
    };
    GenerarVentasAdministracion.prototype.onProductoGarantiaChange = function (val) {
        if (!val)
            return;
        this.garantiaForm.cod_prod = val.cod_prod;
        this.garantiaForm.prod_nombre = val.prod_nombre;
        this.productoGarantiaSeleccionadoSignal.set(val);
    };
    GenerarVentasAdministracion.prototype.registrarGarantia = function () {
        var _this = this;
        var comprobante = this.comprobanteGenerado();
        if (!comprobante)
            return;
        if (!this.garantiaForm.cod_prod || !this.garantiaForm.motivo.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Selecciona el producto e ingresa el motivo'
            });
            return;
        }
        this.guardandoGarantia.set(true);
        var dto = {
            id_comprobante: comprobante.idComprobante,
            cod_prod: this.garantiaForm.cod_prod,
            prod_nombre: this.garantiaForm.prod_nombre,
            motivo: this.garantiaForm.motivo.trim(),
            observaciones: this.garantiaForm.observaciones.trim() || undefined,
            id_sede_ref: this.sedeSeleccionada(),
            id_usuario_ref: this.idUsuarioActual()
        };
        this.warrantyService.registerWarranty(dto).subscribe({
            next: function (res) {
                _this.guardandoGarantia.set(false);
                _this.garantiaRegistrada.set(res);
                _this.messageService.add({
                    severity: 'success',
                    summary: '¡Garantía registrada!',
                    detail: "N\u00B0 " + res.num_garantia,
                    life: 5000
                });
            },
            error: function (err) {
                var _a, _b;
                _this.guardandoGarantia.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'No se pudo registrar la garantía',
                    life: 5000
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.generarVenta = function () {
        var _this = this;
        if (!this.clienteEncontrado()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cliente Requerido',
                detail: 'Seleccione un cliente'
            });
            return;
        }
        if (!this.sedeSeleccionada()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sede Requerida',
                detail: 'Seleccione una sede'
            });
            return;
        }
        if (this.productosSeleccionados().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Carrito Vacío',
                detail: 'Agregue al menos un producto'
            });
            return;
        }
        if (this.tipoEntrega() === 'delivery' && !this.direccionDelivery().trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Dirección Requerida',
                detail: 'Ingrese la dirección de delivery'
            });
            return;
        }
        if (this.tipoEntrega() === 'provincia' && !this.provinciaDestino().trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Provincia Requerida',
                detail: 'Ingrese la provincia de destino'
            });
            return;
        }
        if (this.tipoPagoOrigen() !== 'credito' &&
            this.metodoPagoRequiereBanco() &&
            !this.bancoSeleccionado()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Banco Requerido',
                detail: 'Selecciona el banco emisor de tu tarjeta (débito o crédito)'
            });
            return;
        }
        if (this.tipoPagoOrigen() !== 'credito') {
            var esEfectivo = this.metodoPagoSeleccionado() === this.idMetodoPagoEfectivo();
            if (esEfectivo && this.montoRecibido() < this.totalFinal()) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Monto Insuficiente',
                    detail: 'El monto recibido es menor al total'
                });
                return;
            }
            if (!esEfectivo) {
                var numOp = this.numeroOperacion().trim();
                if (!numOp) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Nº Operación Requerido',
                        detail: 'Ingrese el número de operación'
                    });
                    return;
                }
                var numOpRegex = /^\d{20}$/;
                if (!numOpRegex.test(numOp)) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Nº Operación Inválido',
                        detail: 'El número de operación debe tener exactamente 20 dígitos numéricos.'
                    });
                    return;
                }
            }
        }
        if (this.loading())
            return;
        this.confirmationService.confirm({
            message: '¿Está seguro de generar esta venta?',
            header: 'Confirmar Venta',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, generar',
            rejectLabel: 'Cancelar',
            accept: function () {
                if (!_this.loading())
                    _this.procesarVenta();
            }
        });
    };
    GenerarVentasAdministracion.prototype.procesarVenta = function () {
        var _this = this;
        var _a, _b;
        this.loading.set(true);
        this.snapshotCliente.set(this.clienteEncontrado());
        this.snapshotSede.set(this.nombreSedeSeleccionada());
        this.snapshotMetodoPago.set(this.getLabelMetodoPago(this.metodoPagoSeleccionado()));
        this.snapshotTipoComprobante.set(this.tipoComprobante());
        var esCredito = this.tipoPagoOrigen() === 'credito';
        var promo = this.promocionAplicada();
        var tipoComprobanteActual = this.tipoComprobanteSeleccionadoObj();
        var aplicaIgv = this.ventasService.aplicaIgv(tipoComprobanteActual);
        var delivery = this.tipoEntrega() === 'delivery' || this.tipoEntrega() === 'provincia'
            ? this.costoDelivery()
            : 0;
        var subtotalBase = this.subtotal();
        var igvBase = this.igv();
        var totalBase = this.total();
        var totalConComision = this.totalFinal();
        var serie = this.tipoComprobante() === 1 ? 'F001' : 'B001';
        var cotizId = this.cotizacionOrigen();
        var esEfectivo = this.metodoPagoSeleccionado() === this.idMetodoPagoEfectivo();
        var request = __assign(__assign(__assign(__assign(__assign({ customerId: this.clienteEncontrado().customerId, receiptTypeId: this.tipoComprobante(), saleTypeId: this.tipoVentaSeleccionado(), serie: serie, subtotal: subtotalBase, igv: aplicaIgv ? igvBase : 0, isc: 0, total: totalConComision, descuento: this.descuentoPromocion(), responsibleId: this.idUsuarioActual(), branchId: this.sedeSeleccionada(), warehouseId: (_a = this.almacenSeleccionado()) !== null && _a !== void 0 ? _a : undefined, paymentMethodId: esCredito ? undefined : ((_b = this.metodoPagoSeleccionado()) !== null && _b !== void 0 ? _b : undefined), operationNumber: esEfectivo ? null : this.numeroOperacion(), esCreditoPendiente: esCredito, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, (promo && { promotionId: promo.idPromocion })), (this.bancoSeleccionado() && { bankId: this.bancoSeleccionado() })), (this.tipoServicioSeleccionado() && { serviceTypeId: this.tipoServicioSeleccionado() })), (this.comisionMonto() > 0 && { comisionBancaria: this.comisionMonto() })), { items: this.productosSeleccionados().map(function (i) {
                var _a, _b, _c;
                return ({
                    productId: String(i.productId),
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    description: i.description,
                    total: i.total,
                    codigo: i.codigo,
                    categoriaId: i.categoriaId,
                    id_detalle_remate: (_a = i.idDetalleRemate) !== null && _a !== void 0 ? _a : null,
                    tipoPrecio: (_b = i.tipoPrecio) !== null && _b !== void 0 ? _b : 'UNITARIO',
                    almacenId: (_c = i.almacenId) !== null && _c !== void 0 ? _c : null
                });
            }) });
        this.ventasService.registrarVenta(request).subscribe({
            next: function (response) {
                var _a, _b, _c;
                _this.loading.set(false);
                _this.comprobanteGenerado.set(response);
                var numeroCompleto = (_a = response.numeroCompleto) !== null && _a !== void 0 ? _a : response.serie + "-" + String(response.numero).padStart(8, '0');
                _this.messageService.add({
                    severity: 'success',
                    summary: '¡Venta Exitosa!',
                    detail: "Comprobante " + numeroCompleto + " generado",
                    life: 5000
                });
                var almacenDespacho = (_c = (_b = _this.almacenSeleccionado()) !== null && _b !== void 0 ? _b : request.warehouseId) !== null && _c !== void 0 ? _c : 0;
                if (response.idComprobante > 0 && almacenDespacho) {
                    var direccion = _this.tipoEntrega() === 'delivery'
                        ? _this.direccionDelivery().trim()
                        : _this.tipoEntrega() === 'provincia'
                            ? (_this.provinciaDestino() + ", " + _this.distritoDestino() + ", " + _this.ciudadDestino()).trim()
                            : _this.tipoEntrega() === 'fisico'
                                ? 'Venta en físico - retiro en tienda'
                                : 'Recojo en tienda';
                    var dispatchPayload = {
                        id_venta_ref: response.idComprobante,
                        id_usuario_ref: _this.idUsuarioActual(),
                        id_almacen_origen: Number(almacenDespacho),
                        direccion_entrega: direccion,
                        observacion: "Venta " + numeroCompleto,
                        detalles: _this.productosSeleccionados().map(function (item) { return ({
                            id_producto: Number(item.productId),
                            cantidad_solicitada: item.quantity
                        }); })
                    };
                    _this.dispatchService.createDispatch(dispatchPayload).subscribe({
                        next: function (d) {
                            return _this.messageService.add({
                                severity: 'info',
                                summary: 'Despacho Creado',
                                detail: "Despacho #" + d.id_despacho + " generado",
                                life: 4000
                            });
                        },
                        error: function () {
                            return _this.messageService.add({
                                severity: 'warn',
                                summary: 'Venta registrada',
                                detail: 'No se pudo crear el despacho.',
                                life: 5000
                            });
                        }
                    });
                }
                if (cotizId) {
                    _this.quoteService.updateQuoteStatus(cotizId, 'APROBADA').subscribe({ error: function () { } });
                }
                if (esCredito) {
                    var fechaVenc = new Date();
                    fechaVenc.setDate(fechaVenc.getDate() + 30);
                    _this.arService
                        .create({
                        salesReceiptId: response.idComprobante,
                        userRef: _this.clienteEncontrado().name,
                        totalAmount: totalBase + delivery,
                        dueDate: fechaVenc.toISOString().split('T')[0],
                        paymentTypeId: _this.metodoPagoSeleccionado(),
                        currencyCode: 'PEN',
                        observation: cotizId ? "Cr\u00E9dito desde cotizaci\u00F3n #" + cotizId : 'Venta a crédito'
                    })
                        .then(function (ar) {
                        var _a, _b;
                        if (ar) {
                            _this.messageService.add({
                                severity: 'info',
                                summary: 'Cuenta por Cobrar Creada',
                                detail: "Saldo: S/. " + ((_b = (_a = ar.pendingBalance) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !== null && _b !== void 0 ? _b : (totalBase + delivery).toFixed(2)),
                                life: 5000
                            });
                        }
                    });
                }
            },
            error: function (err) {
                var _a, _b;
                _this.loading.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error al registrar venta',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Error inesperado',
                    life: 6000
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.nuevaVenta = function () {
        this.productosSeleccionados.set([]);
        this.productosPendientes.set([]);
        this.clienteEncontrado.set(null);
        this.clienteDocumento.set('');
        this.busquedaRealizada.set(false);
        this.promocionAplicada.set(null);
        this.codigoPromocionInput.set('');
        this.promocionesFiltradas.set([]);
        this.montoRecibido.set(0);
        this.numeroOperacion.set('');
        this.tipoEntrega.set('recojo');
        this.direccionDelivery.set('');
        this.costoDelivery.set(0);
        this.comprobanteGenerado.set(null);
        this.tipoPagoOrigen.set('contado');
        this.cotizacionOrigen.set(null);
        this.promoNoEncontrada.set(false);
        this.queryBusqueda.set('');
        this.panelVisible.set(false);
        this.productosSugeridos.set([]);
        this.rematesSugeridos.set([]);
        this.modoRemate.set(false);
        this.sidebarClienteVisible = false;
        this.sidebarGarantiaVisible = false;
        this.garantiaRegistrada.set(null);
        this.bancoSeleccionado.set(null);
        this.tipoServicioSeleccionado.set(null);
        this.tiposServicio.set([]);
        this.bancosDisponibles.set([]);
        this.codSunatMetodoPago.set('');
    };
    GenerarVentasAdministracion.prototype.verListado = function () {
        this.router.navigate(['/admin/historial-ventas-administracion']);
    };
    GenerarVentasAdministracion.prototype.getLabelMetodoPago = function (id) {
        var _a, _b;
        return (_b = (_a = this.metodosPago().find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.descripcion) !== null && _b !== void 0 ? _b : 'N/A';
    };
    GenerarVentasAdministracion.prototype.obtenerSeveridadStock = function (stock) {
        if (stock > 10)
            return 'success';
        if (stock > 0)
            return 'warn';
        return 'danger';
    };
    GenerarVentasAdministracion.prototype.esPorcentaje = function (tipo) {
        return (tipo === null || tipo === void 0 ? void 0 : tipo.toUpperCase().includes('PORCENTAJE')) || (tipo === null || tipo === void 0 ? void 0 : tipo.toUpperCase().includes('PERCENT'));
    };
    GenerarVentasAdministracion.prototype.normalizarActivo = function (activo) {
        var _a;
        if (typeof activo === 'boolean')
            return activo;
        if (typeof activo === 'number')
            return activo === 1;
        if (activo && typeof activo === 'object' && 'data' in activo)
            return ((_a = activo.data) === null || _a === void 0 ? void 0 : _a[0]) === 1;
        return false;
    };
    GenerarVentasAdministracion.prototype.itemCalificaPromocion = function (item) {
        var _a;
        var promo = this.promocionAplicada();
        if (!promo)
            return false;
        var regla = (_a = promo.reglas) === null || _a === void 0 ? void 0 : _a.find(function (r) { return r.tipoCondicion === 'PRODUCTO'; });
        if (!regla)
            return true;
        return (item.codigo === regla.valorCondicion || item.productId.toString() === regla.valorCondicion);
    };
    GenerarVentasAdministracion.prototype.formatearDocumentoCompleto = function () {
        var _a;
        var c = this.clienteEncontrado();
        if (!c)
            return '';
        return c.documentTypeDescription
            ? c.documentTypeDescription + ": " + c.documentValue
            : ((_a = c.documentValue) !== null && _a !== void 0 ? _a : '');
    };
    GenerarVentasAdministracion.prototype.validarNumeroOperacion = function (event) {
        var input = event.target;
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 20);
        this.numeroOperacion.set(input.value);
    };
    GenerarVentasAdministracion.prototype.getOpcionesTipoPrecioDinamicas = function (producto) {
        var upx = producto.unidadesPorCaja;
        var labelCaja = upx && upx > 1 ? "Caja (x" + upx + " und)" : 'Precio Caja';
        return [
            { label: 'Unidad', value: 'unidad' },
            { label: labelCaja, value: 'caja' },
            { label: 'Mayorista', value: 'mayorista' },
        ];
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
                select_1.SelectModule,
                tag_1.TagModule,
                inputnumber_1.InputNumberModule,
                tooltip_1.TooltipModule,
                loading_overlay_component_1.LoadingOverlayComponent,
                drawer_1.DrawerModule,
                textarea_1.TextareaModule,
            ],
            providers: [api_1.MessageService, api_1.ConfirmationService],
            templateUrl: './generar-ventas-administracion.html',
            styleUrls: ['./generar-ventas-administracion.css']
        })
    ], GenerarVentasAdministracion);
    return GenerarVentasAdministracion;
}());
exports.GenerarVentasAdministracion = GenerarVentasAdministracion;
