"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.VentasAdminService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var enviroment_1 = require("../../../enviroments/enviroment");
var ventas_interface_1 = require("../interfaces/ventas.interface");
/** codSunat de Nota de Venta — sin IGV */
var NOTA_VENTA_COD_SUNAT = 'NV';
var VentasAdminService = /** @class */ (function () {
    function VentasAdminService() {
        this.http = core_1.inject(http_1.HttpClient);
        this.url = enviroment_1.environment.apiUrl;
        this.salesUrl = enviroment_1.environment.apiUrl + "/sales";
        this.adminUrl = enviroment_1.environment.apiUrl + "/admin";
        this.logisticsUrl = enviroment_1.environment.apiUrl + "/logistics";
    }
    Object.defineProperty(VentasAdminService.prototype, "headers", {
        get: function () {
            return new http_1.HttpHeaders({ 'x-role': 'Administrador' });
        },
        enumerable: false,
        configurable: true
    });
    // ── Historial / Comprobantes ───────────────────────────────────────
    VentasAdminService.prototype.listarHistorialVentas = function (query) {
        var _a, _b;
        if (query === void 0) { query = {}; }
        var params = new http_1.HttpParams()
            .set('page', String((_a = query.page) !== null && _a !== void 0 ? _a : 1))
            .set('limit', String((_b = query.limit) !== null && _b !== void 0 ? _b : 10));
        if (query.status)
            params = params.set('status', query.status);
        if (query.customerId)
            params = params.set('customerId', query.customerId);
        if (query.receiptTypeId != null)
            params = params.set('receiptTypeId', String(query.receiptTypeId));
        if (query.paymentMethodId != null)
            params = params.set('paymentMethodId', String(query.paymentMethodId));
        if (query.dateFrom)
            params = params.set('dateFrom', query.dateFrom);
        if (query.dateTo)
            params = params.set('dateTo', query.dateTo);
        if (query.search)
            params = params.set('search', query.search);
        if (query.sedeId != null)
            params = params.set('sedeId', String(query.sedeId));
        return this.http.get(this.salesUrl + "/receipts/historial", { headers: this.headers, params: params });
    };
    VentasAdminService.prototype.registrarVenta = function (request) {
        return this.http
            .post(this.salesUrl + "/receipts", request, {
            headers: this.headers
        })
            .pipe(operators_1.map(function (res) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
            return ({
                idComprobante: (_b = (_a = res.idComprobante) !== null && _a !== void 0 ? _a : res.id_comprobante) !== null && _b !== void 0 ? _b : 0,
                idCliente: (_d = (_c = res.idCliente) !== null && _c !== void 0 ? _c : res.id_cliente) !== null && _d !== void 0 ? _d : '',
                numeroCompleto: (_f = (_e = res.numeroCompleto) !== null && _e !== void 0 ? _e : res.numero_completo) !== null && _f !== void 0 ? _f : res.serie + "-" + String((_g = res.numero) !== null && _g !== void 0 ? _g : 0).padStart(8, '0'),
                serie: (_h = res.serie) !== null && _h !== void 0 ? _h : '',
                numero: (_j = res.numero) !== null && _j !== void 0 ? _j : 0,
                fecEmision: (_l = (_k = res.fecEmision) !== null && _k !== void 0 ? _k : res.fec_emision) !== null && _l !== void 0 ? _l : new Date().toISOString(),
                fecVenc: (_o = (_m = res.fecVenc) !== null && _m !== void 0 ? _m : res.fec_venc) !== null && _o !== void 0 ? _o : undefined,
                tipoOperacion: (_q = (_p = res.tipoOperacion) !== null && _p !== void 0 ? _p : res.tipo_operacion) !== null && _q !== void 0 ? _q : '',
                subtotal: (_r = res.subtotal) !== null && _r !== void 0 ? _r : 0,
                igv: (_s = res.igv) !== null && _s !== void 0 ? _s : 0,
                isc: (_t = res.isc) !== null && _t !== void 0 ? _t : 0,
                total: (_u = res.total) !== null && _u !== void 0 ? _u : 0,
                estado: (_v = res.estado) !== null && _v !== void 0 ? _v : 'EMITIDO',
                codMoneda: (_x = (_w = res.codMoneda) !== null && _w !== void 0 ? _w : res.cod_moneda) !== null && _x !== void 0 ? _x : 'PEN',
                idTipoComprobante: (_z = (_y = res.idTipoComprobante) !== null && _y !== void 0 ? _y : res.id_tipo_comprobante) !== null && _z !== void 0 ? _z : 0,
                idTipoVenta: (_1 = (_0 = res.idTipoVenta) !== null && _0 !== void 0 ? _0 : res.id_tipo_venta) !== null && _1 !== void 0 ? _1 : 0,
                idSedeRef: (_3 = (_2 = res.idSedeRef) !== null && _2 !== void 0 ? _2 : res.id_sede_ref) !== null && _3 !== void 0 ? _3 : 0,
                idResponsableRef: (_5 = (_4 = res.idResponsableRef) !== null && _4 !== void 0 ? _4 : res.id_responsable_ref) !== null && _5 !== void 0 ? _5 : '',
                items: (_6 = res.items) !== null && _6 !== void 0 ? _6 : []
            });
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.anularVenta = function (id, reason) {
        return this.http.put(this.salesUrl + "/receipts/" + id + "/annul", { reason: reason }, { headers: this.headers });
    };
    VentasAdminService.prototype.emitirComprobante = function (id, paymentTypeId) {
        return this.http.put(this.salesUrl + "/receipts/" + id + "/emit", { paymentTypeId: paymentTypeId }, { headers: this.headers });
    };
    VentasAdminService.prototype.obtenerVentaConHistorial = function (id, historialPage) {
        if (historialPage === void 0) { historialPage = 1; }
        var params = new http_1.HttpParams().set('historialPage', String(historialPage));
        return this.http.get(this.salesUrl + "/receipts/" + id + "/detalle", { headers: this.headers, params: params });
    };
    VentasAdminService.prototype.getDetalleComprobante = function (receiptId) {
        return this.http.get(this.salesUrl + "/receipts/" + receiptId + "/detalle", {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.getKpiPorFiltros = function (filters) {
        var params = new http_1.HttpParams();
        if (filters.sedeId != null)
            params = params.set('sedeId', String(filters.sedeId));
        if (filters.dateFrom)
            params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo)
            params = params.set('dateTo', filters.dateTo);
        if (filters.status)
            params = params.set('status', filters.status);
        if (filters.paymentMethodId != null)
            params = params.set('paymentMethodId', String(filters.paymentMethodId));
        if (filters.receiptTypeId != null)
            params = params.set('receiptTypeId', String(filters.receiptTypeId));
        if (filters.search)
            params = params.set('search', filters.search);
        return this.http.get(this.salesUrl + "/receipts/kpi/semanal", {
            headers: this.headers,
            params: params
        });
    };
    VentasAdminService.prototype.getDetalleCompleto = function (id, historialPage) {
        if (historialPage === void 0) { historialPage = 1; }
        var params = new http_1.HttpParams().set('historialPage', String(historialPage));
        return this.http.get(this.salesUrl + "/receipts/" + id + "/detalle", { headers: this.headers, params: params });
    };
    // ── Tipos catálogo ─────────────────────────────────────────────────
    VentasAdminService.prototype.obtenerTiposVenta = function () {
        return this.http
            .get(this.salesUrl + "/receipts/sale-types", { headers: this.headers })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.obtenerTiposComprobante = function () {
        return this.http
            .get(this.salesUrl + "/receipts/receipt-types", {
            headers: this.headers
        })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.obtenerMetodosPago = function () {
        return this.http
            .get(this.salesUrl + "/receipts/payment-types", { headers: this.headers })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.obtenerBancos = function () {
        return this.http
            .get(this.salesUrl + "/banks", { headers: this.headers })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.obtenerTiposServicio = function (bancoId) {
        var params = new http_1.HttpParams();
        if (bancoId != null)
            params = params.set('bancoId', String(bancoId));
        return this.http
            .get(this.salesUrl + "/banks/service-types", {
            headers: this.headers,
            params: params
        })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.calcularTotalesCarrito = function (items, tipoComprobante) {
        var total = items.reduce(function (s, i) { return s + Number(i.precioVenta) * Number(i.cantidad); }, 0);
        if (!this.aplicaIgv(tipoComprobante)) {
            // Nota de Venta: el precio ya es el precio final sin IGV
            return {
                subtotal: Number(total.toFixed(2)),
                igv: 0,
                total: Number(total.toFixed(2))
            };
        }
        // Boleta / Factura: el total incluye IGV → descomponerlo
        var subtotal = Number((total / (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2));
        var igv = Number((total - subtotal).toFixed(2));
        return { subtotal: subtotal, igv: igv, total: Number(total.toFixed(2)) };
    };
    VentasAdminService.prototype.aplicaIgv = function (tipoComprobante) {
        if (!tipoComprobante)
            return true;
        return tipoComprobante.codSunat !== 'NV';
    };
    VentasAdminService.prototype.calcularIgvUnitario = function (precioVentaUnitario, tipoComprobante) {
        if (!this.aplicaIgv(tipoComprobante))
            return 0;
        return Number((precioVentaUnitario - precioVentaUnitario / (1 + ventas_interface_1.IGV_RATE_ADMIN)).toFixed(2));
    };
    // ── PDF / Comprobante ──────────────────────────────────────────────
    VentasAdminService.prototype.descargarComprobantePdf = function (id, nombreArchivo) {
        return this.http
            .get(this.salesUrl + "/receipts/" + id + "/pdf", {
            headers: this.headers,
            responseType: 'blob'
        })
            .pipe(operators_1.map(function (blob) {
            var url = URL.createObjectURL(blob);
            var anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = nombreArchivo !== null && nombreArchivo !== void 0 ? nombreArchivo : "comprobante-" + id + ".pdf";
            anchor.click();
            URL.revokeObjectURL(url);
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.verComprobantePdfEnPestana = function (id) {
        return this.http
            .get(this.salesUrl + "/receipts/" + id + "/pdf", {
            headers: this.headers,
            responseType: 'blob'
        })
            .pipe(operators_1.map(function (blob) {
            var pdfBlob = new Blob([blob], { type: 'application/pdf' });
            var url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            setTimeout(function () { return URL.revokeObjectURL(url); }, 10000);
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.generarVoucher = function (id, esCopia) {
        if (esCopia === void 0) { esCopia = false; }
        var params = esCopia ? '?copia=true' : '';
        return this.http
            .get(this.salesUrl + "/receipts/" + id + "/thermal" + params, {
            headers: this.headers,
            responseType: 'blob'
        })
            .pipe(operators_1.map(function (blob) {
            var url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url, '_blank');
            setTimeout(function () { return URL.revokeObjectURL(url); }, 10000);
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.verNotaVentaPdfEnPestana = function (idComprobante) {
        var url = this.salesUrl + "/receipts/" + idComprobante + "/nota-venta";
        var win = window.open('', '_blank');
        if (!win)
            return rxjs_1.throwError(function () { return new Error('No se pudo abrir ventana'); });
        win.location.href = url;
        return rxjs_1.of(void 0);
    };
    VentasAdminService.prototype.descargarNotaVentaPdf = function (idComprobante, nombre) {
        return this.http
            .get(this.salesUrl + "/receipts/" + idComprobante + "/nota-venta", {
            responseType: 'blob',
            headers: this.headers
        })
            .pipe(operators_1.map(function (blob) {
            var objectUrl = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = objectUrl;
            link.download = nombre;
            link.click();
            URL.revokeObjectURL(objectUrl);
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    // ── Notificaciones ─────────────────────────────────────────────────
    VentasAdminService.prototype.enviarComprobantePorEmail = function (id) {
        return this.http
            .post(this.salesUrl + "/receipts/" + id + "/send-email", {}, { headers: this.headers })
            .pipe(operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.obtenerEstadoWhatsApp = function () {
        return this.http
            .get(this.salesUrl + "/receipts/whatsapp/status", {
            headers: this.headers
        })
            .pipe(operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.enviarComprobantePorWhatsApp = function (id) {
        return this.http
            .post(this.salesUrl + "/receipts/" + id + "/send-whatsapp", {}, { headers: this.headers })
            .pipe(operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    // ── Promociones ────────────────────────────────────────────────────
    VentasAdminService.prototype.obtenerPromocionesActivas = function () {
        return this.http
            .get(this.salesUrl + "/promotions/active", { headers: this.headers })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.esPorcentaje = function (tipo) {
        return (tipo === null || tipo === void 0 ? void 0 : tipo.toUpperCase().includes('PORCENTAJE')) || (tipo === null || tipo === void 0 ? void 0 : tipo.toUpperCase().includes('PERCENT'));
    };
    VentasAdminService.prototype.normalizarActivo = function (activo) {
        var _a;
        if (typeof activo === 'boolean')
            return activo;
        if (activo && typeof activo === 'object' && 'data' in activo) {
            return ((_a = activo.data) === null || _a === void 0 ? void 0 : _a[0]) === 1;
        }
        return false;
    };
    // ── Sedes ──────────────────────────────────────────────────────────
    VentasAdminService.prototype.obtenerSedes = function () {
        return this.http
            .get(this.adminUrl + "/headquarters", { headers: this.headers })
            .pipe(operators_1.map(function (res) { var _a, _b, _c; return (_c = (_b = (_a = res.data) !== null && _a !== void 0 ? _a : res.headquarters) !== null && _b !== void 0 ? _b : res) !== null && _c !== void 0 ? _c : []; }));
    };
    // ── Productos ──────────────────────────────────────────────────────
    VentasAdminService.prototype.obtenerProductosConStock = function (idSede, idCategoria, page, size) {
        if (page === void 0) { page = 1; }
        if (size === void 0) { size = 10; }
        var params = new http_1.HttpParams().set('page', String(page)).set('size', String(size));
        if (idSede != null)
            params = params.set('id_sede', String(idSede));
        if (idCategoria != null)
            params = params.set('id_categoria', String(idCategoria));
        return this.http.get(this.logisticsUrl + "/products/ventas/stock", {
            headers: this.headers,
            params: params
        });
    };
    VentasAdminService.prototype.buscarProductosVentas = function (query, idSede, idCategoria) {
        var params = new http_1.HttpParams().set('search', query);
        if (idSede != null)
            params = params.set('id_sede', String(idSede));
        if (idCategoria != null)
            params = params.set('id_categoria', String(idCategoria));
        return this.http.get(this.logisticsUrl + "/products/ventas/autocomplete", { headers: this.headers, params: params });
    };
    VentasAdminService.prototype.obtenerCategoriasConStock = function (idSede) {
        var params = new http_1.HttpParams();
        if (idSede != null)
            params = params.set('id_sede', String(idSede));
        return this.http.get(this.logisticsUrl + "/products/categorias-con-stock", { headers: this.headers, params: params });
    };
    // ── Mapeos de productos ────────────────────────────────────────────
    VentasAdminService.prototype.mapearProductoConStock = function (p) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var stockTotal = Number((_a = p.stock) !== null && _a !== void 0 ? _a : 0);
        return {
            id: Number(p.id_producto),
            codigo: (_b = p.codigo) !== null && _b !== void 0 ? _b : '',
            nombre: (_c = p.nombre) !== null && _c !== void 0 ? _c : '',
            familia: (_d = p.familia) !== null && _d !== void 0 ? _d : '',
            categoriaId: Number((_e = p.id_categoria) !== null && _e !== void 0 ? _e : 0) || undefined,
            precioUnidad: Number((_f = p.precio_unitario) !== null && _f !== void 0 ? _f : 0),
            precioCaja: Number((_g = p.precio_caja) !== null && _g !== void 0 ? _g : 0),
            precioMayorista: Number((_h = p.precio_mayor) !== null && _h !== void 0 ? _h : 0),
            unidadesPorCaja: Number((_j = p.cantidad_unidades) !== null && _j !== void 0 ? _j : 0),
            stock: stockTotal,
            sede: (_k = p.sede) !== null && _k !== void 0 ? _k : '',
            almacenes: [{ id_almacen: null, nombre: 'Almacén principal', stock: stockTotal }]
        };
    };
    /**
     * ✅ Usa stockPorAlmacen[] para mostrar tags individuales por almacén.
     * ✅ Mapea unidades_por_caja para mostrar "Caja x12" en el selector de precio.
     */
    VentasAdminService.prototype.mapearAutocompleteVentas = function (p) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var almacenes = Array.isArray(p.stockPorAlmacen) && p.stockPorAlmacen.length > 0
            ? p.stockPorAlmacen.map(function (a) {
                var _a, _b, _c;
                return ({
                    id_almacen: (_a = a.id_almacen) !== null && _a !== void 0 ? _a : null,
                    nombre: (_b = a.nombre_almacen) !== null && _b !== void 0 ? _b : 'Almacén',
                    stock: Number((_c = a.stock) !== null && _c !== void 0 ? _c : 0)
                });
            })
            : [{ id_almacen: null, nombre: 'Almacén principal', stock: Number((_a = p.stock) !== null && _a !== void 0 ? _a : 0) }];
        return {
            id: Number(p.id_producto),
            codigo: (_b = p.codigo) !== null && _b !== void 0 ? _b : '',
            nombre: (_c = p.nombre) !== null && _c !== void 0 ? _c : '',
            familia: (_d = p.familia) !== null && _d !== void 0 ? _d : '',
            categoriaId: Number((_e = p.id_categoria) !== null && _e !== void 0 ? _e : 0) || undefined,
            precioUnidad: Number((_f = p.precio_unitario) !== null && _f !== void 0 ? _f : 0),
            precioCaja: Number((_g = p.precio_caja) !== null && _g !== void 0 ? _g : 0),
            precioMayorista: Number((_h = p.precio_mayor) !== null && _h !== void 0 ? _h : 0),
            unidadesPorCaja: Number((_j = p.cantidad_unidades) !== null && _j !== void 0 ? _j : 0),
            stock: Number((_k = p.stock) !== null && _k !== void 0 ? _k : 0),
            sede: (_l = p.sede) !== null && _l !== void 0 ? _l : '',
            almacenes: almacenes
        };
    };
    /**
     * ✅ Stock de un almacén específico dentro de un ProductoUIAdmin.
     */
    VentasAdminService.prototype.getStockPorAlmacen = function (producto, almacenId) {
        var _a, _b;
        if (almacenId === null)
            return producto.stock;
        return (_b = (_a = producto.almacenes.find(function (a) { return a.id_almacen === almacenId; })) === null || _a === void 0 ? void 0 : _a.stock) !== null && _b !== void 0 ? _b : 0;
    };
    /**
     * ✅ Label del precio caja incluyendo las unidades.
     * Ejemplo: "Precio Caja (x12)" o "Precio Caja" si no hay dato.
     */
    VentasAdminService.prototype.labelPrecioCaja = function (producto) {
        if (producto.unidadesPorCaja > 0) {
            return "Precio Caja (x" + producto.unidadesPorCaja + " und)";
        }
        return 'Precio Caja';
    };
    // ── Remates ────────────────────────────────────────────────────────
    VentasAdminService.prototype.buscarRematesAutocomplete = function (search, idSede) {
        var params = new http_1.HttpParams().set('search', search);
        if (idSede != null)
            params = params.set('id_sede', String(idSede));
        return this.http
            .get(this.logisticsUrl + "/auctions/autocomplete", {
            headers: this.headers,
            params: params
        })
            .pipe(operators_1.map(function (res) {
            if (Array.isArray(res))
                return res;
            if ((res === null || res === void 0 ? void 0 : res.data) && Array.isArray(res.data))
                return res.data;
            return [];
        }), operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService.prototype.mapearAuctionItem = function (item) {
        return {
            idDetalleRemate: item.id_detalle_remate,
            idRemate: item.id_remate,
            codRemate: item.cod_remate,
            idProducto: item.id_producto,
            preOriginal: Number(item.pre_original),
            preRemate: Number(item.pre_remate),
            stockRemate: Number(item.stock_remate),
            descripcionRemate: item.descripcion_remate
        };
    };
    // ── Clientes ───────────────────────────────────────────────────────
    VentasAdminService.prototype.buscarCliente = function (documentValue) {
        return this.http
            .get(this.salesUrl + "/customers/document/" + documentValue, {
            headers: this.headers
        })
            .pipe(operators_1.map(function (cliente) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            if (!cliente)
                throw { error: { message: 'Cliente no encontrado' } };
            return {
                customerId: (_a = cliente.customerId) !== null && _a !== void 0 ? _a : cliente.id_cliente,
                name: (_d = (_c = (_b = cliente.name) !== null && _b !== void 0 ? _b : cliente.nombres) !== null && _c !== void 0 ? _c : cliente.displayName) !== null && _d !== void 0 ? _d : '',
                documentValue: (_e = cliente.documentValue) !== null && _e !== void 0 ? _e : cliente.valor_doc,
                documentTypeDescription: (_f = cliente.documentTypeDescription) !== null && _f !== void 0 ? _f : '',
                documentTypeSunatCode: (_g = cliente.documentTypeSunatCode) !== null && _g !== void 0 ? _g : '',
                invoiceType: (_j = (_h = cliente.invoiceType) !== null && _h !== void 0 ? _h : cliente.invoice_type) !== null && _j !== void 0 ? _j : '',
                status: (_k = cliente.status) !== null && _k !== void 0 ? _k : cliente.estado,
                address: (_m = (_l = cliente.address) !== null && _l !== void 0 ? _l : cliente.direccion) !== null && _m !== void 0 ? _m : null,
                email: (_o = cliente.email) !== null && _o !== void 0 ? _o : null,
                phone: (_q = (_p = cliente.phone) !== null && _p !== void 0 ? _p : cliente.telefono) !== null && _q !== void 0 ? _q : null,
                displayName: (_s = (_r = cliente.displayName) !== null && _r !== void 0 ? _r : cliente.name) !== null && _s !== void 0 ? _s : ''
            };
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.crearCliente = function (request) {
        return this.http.post(this.salesUrl + "/customers", request, {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.actualizarCliente = function (id, payload) {
        return this.http.put(this.salesUrl + "/customers/" + id, payload, {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.obtenerTiposDocumento = function () {
        return this.http.get(this.url + "/sales/customers/document-types", {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.consultarDocumentoIdentidad = function (numero) {
        return this.http
            .get(this.salesUrl + "/reniec/consultar/" + numero, { headers: this.headers })
            .pipe(operators_1.catchError(function () {
            return rxjs_1.of({
                nombres: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                nombreCompleto: '',
                tipoDocumento: ''
            });
        }));
    };
    VentasAdminService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], VentasAdminService);
    return VentasAdminService;
}());
exports.VentasAdminService = VentasAdminService;
