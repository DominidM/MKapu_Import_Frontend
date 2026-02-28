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
var ventas_interface_1 = require("../../interfaces/ventas.interface");
var GenerarVentasAdministracion = /** @class */ (function () {
    function GenerarVentasAdministracion() {
        var _this = this;
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.ventasService = core_1.inject(ventas_service_1.VentasAdminService);
        this.messageService = core_1.inject(api_1.MessageService);
        this.confirmationService = core_1.inject(api_1.ConfirmationService);
        this.router = core_1.inject(router_1.Router);
        this.tituloKicker = 'VENTAS - GENERAR VENTAS';
        this.subtituloKicker = 'GENERAR NUEVA VENTA (ADMIN)';
        this.iconoCabecera = 'pi pi-shopping-cart';
        this.steps = ['Sede, Comprobante y Cliente', 'Productos', 'Forma de Pago', 'Confirmar Venta'];
        this.tipoComprobanteOptions = [
            { label: 'Boleta', value: 2, icon: 'pi pi-file' },
            { label: 'Factura', value: 1, icon: 'pi pi-file-edit' },
        ];
        this.opcionesTipoPrecio = [
            { label: 'Unidad', value: 'unidad' },
            { label: 'Caja', value: 'caja' },
            { label: 'Mayorista', value: 'mayorista' },
        ];
        this.metodoPagoOptions = [
            { label: 'Efectivo', value: 1, icon: 'pi pi-money-bill' },
            { label: 'Yape / Plin', value: 2, icon: 'pi pi-mobile' },
            { label: 'Tarjeta', value: 3, icon: 'pi pi-credit-card' },
        ];
        this.SIZE_PAGE = 10;
        // ─── Sesión ────────────────────────────────────────────────────────────────
        this.idUsuarioActual = core_1.signal('0');
        this.nombreUsuarioActual = core_1.signal('');
        // ─── Sedes ─────────────────────────────────────────────────────────────────
        this.sedes = core_1.signal([]);
        this.sedesLoading = core_1.signal(false);
        this.sedeSeleccionada = core_1.signal(null);
        // ─── Wizard ────────────────────────────────────────────────────────────────
        this.activeStep = core_1.signal(0);
        // ─── Comprobante ───────────────────────────────────────────────────────────
        this.tipoComprobante = core_1.signal(2);
        // ─── Cliente ───────────────────────────────────────────────────────────────
        this.clienteDocumento = core_1.signal('');
        this.clienteEncontrado = core_1.signal(null);
        this.clienteLoading = core_1.signal(false);
        this.busquedaRealizada = core_1.signal(false);
        this.tiposDocumento = core_1.signal([]);
        this.creandoCliente = core_1.signal(false);
        this.editandoCliente = core_1.signal(false);
        this.guardandoCliente = core_1.signal(false);
        this.nuevoClienteForm = { documentTypeId: null, documentValue: '', name: '', address: '', email: '', phone: '' };
        this.editarClienteForm = { name: '', address: '', email: '', phone: '' };
        // ─── Productos ─────────────────────────────────────────────────────────────
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
        // ─── Carrito (usa ItemVentaUIAdmin para UI + igvUnitario) ──────────────────
        this.productosSeleccionados = core_1.signal([]);
        // ─── Pago ──────────────────────────────────────────────────────────────────
        this.metodoPagoSeleccionado = core_1.signal(1);
        this.montoRecibido = core_1.signal(0);
        this.numeroOperacion = core_1.signal('');
        // ─── Resultado ─────────────────────────────────────────────────────────────
        this.comprobanteGenerado = core_1.signal(null);
        this.loading = core_1.signal(false);
        // ─── Snapshots para pantalla de éxito ─────────────────────────────────────
        this.snapshotCliente = core_1.signal(null);
        this.snapshotSede = core_1.signal('');
        this.snapshotMetodoPago = core_1.signal('');
        this.snapshotTipoComprobante = core_1.signal(2);
        // ─── Computed ──────────────────────────────────────────────────────────────
        this.longitudDocumento = core_1.computed(function () { return (_this.tipoComprobante() === 2 ? 8 : 11); });
        this.botonClienteHabilitado = core_1.computed(function () { var _a, _b; return ((_b = (_a = _this.clienteDocumento()) === null || _a === void 0 ? void 0 : _a.trim().length) !== null && _b !== void 0 ? _b : 0) === _this.longitudDocumento(); });
        this.subtotal = core_1.computed(function () {
            var t = _this.productosSeleccionados().reduce(function (s, i) { return s + i.total; }, 0);
            return t / (1 + ventas_interface_1.IGV_RATE_ADMIN);
        });
        this.igv = core_1.computed(function () { return _this.subtotal() * ventas_interface_1.IGV_RATE_ADMIN; });
        this.total = core_1.computed(function () { return _this.productosSeleccionados().reduce(function (s, i) { return s + i.total; }, 0); });
        this.vuelto = core_1.computed(function () {
            var v = _this.montoRecibido() - _this.total();
            return v >= 0 ? v : 0;
        });
        this.precioSegunTipo = core_1.computed(function () {
            var p = _this.productoTemp();
            if (!p)
                return 0;
            switch (_this.tipoPrecioTemp()) {
                case 'caja':
                    return p.precioCaja;
                case 'mayorista':
                    return p.precioMayorista;
                default:
                    return p.precioUnidad;
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
    }
    // ══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ══════════════════════════════════════════════════════════════════════════
    GenerarVentasAdministracion.prototype.ngOnInit = function () {
        this.cargarSesion();
        this.cargarTiposDocumento();
        this.cargarSedes();
    };
    GenerarVentasAdministracion.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () { return _this.cargarFamilias(); }, 0);
    };
    // ══════════════════════════════════════════════════════════════════════════
    // SESIÓN
    // ══════════════════════════════════════════════════════════════════════════
    GenerarVentasAdministracion.prototype.cargarSesion = function () {
        var _a, _b;
        var user = this.authService.getCurrentUser();
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }
        this.idUsuarioActual.set((_b = (_a = user.userId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '0');
        this.nombreUsuarioActual.set((user.nombres + " " + user.apellidos).trim());
    };
    // ══════════════════════════════════════════════════════════════════════════
    // SEDES
    // ══════════════════════════════════════════════════════════════════════════
    GenerarVentasAdministracion.prototype.cargarSedes = function () {
        var _this = this;
        this.sedesLoading.set(true);
        this.ventasService.obtenerSedes().subscribe({
            next: function (data) {
                _this.sedes.set(data.filter(function (s) { return s.activo; }));
                _this.sedesLoading.set(false);
            },
            error: function () {
                _this.sedesLoading.set(false);
                _this.messageService.add({
                    severity: 'warn',
                    summary: 'Sedes',
                    detail: 'No se pudieron cargar las sedes'
                });
            }
        });
    };
    GenerarVentasAdministracion.prototype.onSedeChange = function (sedeId) {
        this.sedeSeleccionada.set(sedeId);
        this.familiaSeleccionada.set(null);
        this.productoTemp.set(null);
        this.cargarProductos(true);
        this.cargarFamilias();
    };
    // ══════════════════════════════════════════════════════════════════════════
    // PRODUCTOS
    // ══════════════════════════════════════════════════════════════════════════
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
    GenerarVentasAdministracion.prototype.cargarMasProductos = function () {
        if (!this.hayMasPaginas() || this.cargandoMas())
            return;
        this.paginaActual.update(function (p) { return p + 1; });
        this.cargarProductos(false);
    };
    GenerarVentasAdministracion.prototype.cargarFamilias = function () {
        var _this = this;
        var _a;
        this.familiasLoading.set(true);
        this.ventasService.obtenerCategoriasConStock((_a = this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : undefined).subscribe({
            next: function (cats) {
                _this.familiasDisponibles.set(cats.map(function (c) { return ({ label: c.nombre, value: c.id_categoria }); }));
                _this.familiasLoading.set(false);
            },
            error: function () { return _this.familiasLoading.set(false); }
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
            this.messageService.add({
                severity: 'error',
                summary: 'Stock Insuficiente',
                detail: "Solo hay " + producto.stock + " unidades disponibles en " + producto.sede
            });
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
                this.messageService.add({
                    severity: 'error',
                    summary: 'Stock Insuficiente',
                    detail: "Solo hay " + producto.stock + " unidades disponibles"
                });
                return;
            }
            lista[idx] = actualizado;
        }
        else {
            lista.push(item);
        }
        this.productosSeleccionados.set(lista);
        this.messageService.add({
            severity: 'success',
            summary: 'Producto Agregado',
            detail: cantidad + " \u00D7 " + producto.nombre
        });
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
                _this.messageService.add({
                    severity: 'info',
                    summary: 'Producto Eliminado',
                    detail: 'El producto fue removido del carrito'
                });
            }
        });
    };
    // ══════════════════════════════════════════════════════════════════════════
    // CLIENTE
    // ══════════════════════════════════════════════════════════════════════════
    GenerarVentasAdministracion.prototype.cargarTiposDocumento = function () {
        var _this = this;
        this.ventasService.obtenerTiposDocumento().subscribe({
            next: function (tipos) { return _this.tiposDocumento.set(tipos); },
            error: function () { return console.warn('No se pudieron cargar tipos de documento'); }
        });
    };
    GenerarVentasAdministracion.prototype.validarSoloNumeros = function (event) {
        var input = event.target;
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, this.longitudDocumento());
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
        var doc = this.clienteDocumento().trim();
        var tipos = this.tiposDocumento();
        this.nuevoClienteForm.documentValue = doc;
        if (doc.length === 8) {
            var dni = tipos.find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('DNI'); });
            if (dni)
                this.nuevoClienteForm.documentTypeId = dni.documentTypeId;
        }
        else if (doc.length === 11) {
            var ruc = tipos.find(function (t) { var _a; return (_a = t.description) === null || _a === void 0 ? void 0 : _a.toUpperCase().includes('RUC'); });
            if (ruc)
                this.nuevoClienteForm.documentTypeId = ruc.documentTypeId;
        }
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
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Cliente Creado',
                    detail: nuevo.name + " fue registrado y seleccionado"
                });
            },
            error: function (err) {
                var _a, _b;
                _this.creandoCliente.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error al crear cliente',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al registrar el cliente'
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
                    detail: 'Los datos del cliente se actualizaron correctamente'
                });
            },
            error: function (err) {
                var _a, _b;
                _this.guardandoCliente.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar cliente',
                    detail: (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al actualizar el cliente'
                });
            }
        });
    };
    // ══════════════════════════════════════════════════════════════════════════
    // WIZARD
    // ══════════════════════════════════════════════════════════════════════════
    GenerarVentasAdministracion.prototype.nextStep = function () {
        if (!this.validarPasoActual())
            return;
        var curr = this.activeStep();
        if (curr < this.steps.length - 1)
            this.activeStep.set(curr + 1);
    };
    GenerarVentasAdministracion.prototype.prevStep = function () {
        var curr = this.activeStep();
        if (curr > 0)
            this.activeStep.set(curr - 1);
    };
    GenerarVentasAdministracion.prototype.validarPasoActual = function () {
        switch (this.activeStep()) {
            case 0:
                if (!this.clienteEncontrado()) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Cliente Requerido',
                        detail: 'Debe buscar y seleccionar un cliente'
                    });
                    return false;
                }
                return true;
            case 1:
                if (!this.sedeSeleccionada()) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Sede Requerida',
                        detail: 'Debe seleccionar una sede para continuar'
                    });
                    return false;
                }
                if (this.productosSeleccionados().length === 0) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Carrito Vacío',
                        detail: 'Debe agregar al menos un producto'
                    });
                    return false;
                }
                return true;
            case 2:
                if (this.metodoPagoSeleccionado() === 1 && this.montoRecibido() < this.total()) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Monto Insuficiente',
                        detail: 'El monto recibido debe ser mayor o igual al total'
                    });
                    return false;
                }
                if (this.metodoPagoSeleccionado() !== 1 && !this.numeroOperacion().trim()) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Número de Operación Requerido',
                        detail: 'Debe ingresar el número de operación'
                    });
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
        var _a;
        this.loading.set(true);
        this.snapshotCliente.set(this.clienteEncontrado());
        this.snapshotSede.set(this.nombreSedeSeleccionada());
        this.snapshotMetodoPago.set(this.getLabelMetodoPago(this.metodoPagoSeleccionado()));
        this.snapshotTipoComprobante.set(this.tipoComprobante());
        var subtotal = Number(this.subtotal().toFixed(2));
        var igv = Number(this.igv().toFixed(2));
        var total = Number(this.total().toFixed(2));
        var serie = this.tipoComprobante() === 1 ? 'F001' : 'B001';
        var fechaVencimiento = new Date();
        if (this.metodoPagoSeleccionado() !== 1) {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        }
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
            currencyCode: ventas_interface_1.CURRENCY_PEN_ADMIN,
            responsibleId: this.idUsuarioActual().toString(),
            branchId: (_a = this.sedeSeleccionada()) !== null && _a !== void 0 ? _a : 0,
            paymentMethodId: this.metodoPagoSeleccionado(),
            operationNumber: this.metodoPagoSeleccionado() === 1 ? null : this.numeroOperacion(),
            items: this.productosSeleccionados().map(function (item) {
                var producto = _this.productosCargados().find(function (p) { return p.id === item.productId; });
                return {
                    productId: producto ? producto.id.toString() : item.productId.toString(),
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice.toFixed(2)),
                    description: item.description,
                    total: Number(item.total.toFixed(2))
                };
            })
        };
        console.log('📦 Body enviado (admin):', JSON.stringify(request, null, 2));
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
            },
            error: function (err) {
                var _a, _b;
                _this.loading.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error al Generar Venta',
                    detail: (_b = (_a = err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Ocurrió un error al procesar la venta'
                });
            }
        });
    };
    // ══════════════════════════════════════════════════════════════════════════
    // UTILIDADES
    // ══════════════════════════════════════════════════════════════════════════
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
        this.tipoComprobante.set(2);
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
        this.metodoPagoSeleccionado.set(1);
        this.montoRecibido.set(0);
        this.numeroOperacion.set('');
        this.comprobanteGenerado.set(null);
        this.snapshotCliente.set(null);
        this.snapshotSede.set('');
        this.snapshotMetodoPago.set('');
        this.snapshotTipoComprobante.set(2);
        this.activeStep.set(0);
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
        return (_b = (_a = ventas_interface_1.METODOS_PAGO_ADMIN.find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.description) !== null && _b !== void 0 ? _b : 'N/A';
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
        return this.obtenerSiglasDocumento(c.documentTypeDescription) + ": " + c.documentValue;
    };
    GenerarVentasAdministracion.prototype.formatearDocumentoSnapshot = function () {
        var c = this.snapshotCliente();
        if (!(c === null || c === void 0 ? void 0 : c.documentTypeDescription))
            return '';
        return this.obtenerSiglasDocumento(c.documentTypeDescription) + ": " + c.documentValue;
    };
    GenerarVentasAdministracion.prototype.onTipoComprobanteChange = function () {
        this.clienteDocumento.set('');
        this.clienteEncontrado.set(null);
        this.busquedaRealizada.set(false);
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
