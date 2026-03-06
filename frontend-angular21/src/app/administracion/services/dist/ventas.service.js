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
    // ─────────────────────────────────────────────────────────────────────────
    // HISTORIAL DE VENTAS
    // ─────────────────────────────────────────────────────────────────────────
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
    VentasAdminService.prototype.emitirComprobante = function (id) {
        return this.http.put(this.salesUrl + "/receipts/" + id + "/emit", {}, { headers: this.headers });
    };
    VentasAdminService.prototype.obtenerVentaConHistorial = function (id, historialPage) {
        if (historialPage === void 0) { historialPage = 1; }
        var params = new http_1.HttpParams().set('historialPage', String(historialPage));
        return this.http.get(this.salesUrl + "/receipts/" + id + "/detalle", { headers: this.headers, params: params });
    };
    // ─────────────────────────────────────────────────────────────────────────
    // KPI
    // ─────────────────────────────────────────────────────────────────────────
    VentasAdminService.prototype.getKpiSemanal = function (sedeId) {
        var params = new http_1.HttpParams();
        if (sedeId != null)
            params = params.set('sedeId', String(sedeId));
        return this.http.get(this.salesUrl + "/receipts/kpi/semanal", {
            headers: this.headers,
            params: params
        });
    };
    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRO / ANULACIÓN DE VENTA
    // ─────────────────────────────────────────────────────────────────────────
    VentasAdminService.prototype.registrarVenta = function (request) {
        return this.http.post(this.salesUrl + "/receipts", request, {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.anularVenta = function (id, reason) {
        return this.http.put(this.salesUrl + "/receipts/" + id + "/annul", { reason: reason }, { headers: this.headers });
    };
    // ─────────────────────────────────────────────────────────────────────────
    // SEDES
    // ─────────────────────────────────────────────────────────────────────────
    VentasAdminService.prototype.obtenerSedes = function () {
        return this.http
            .get(this.adminUrl + "/headquarters", { headers: this.headers })
            .pipe(operators_1.map(function (res) { var _a, _b, _c; return (_c = (_b = (_a = res.data) !== null && _a !== void 0 ? _a : res.headquarters) !== null && _b !== void 0 ? _b : res) !== null && _c !== void 0 ? _c : []; }));
    };
    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCTOS
    // ─────────────────────────────────────────────────────────────────────────
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
    VentasAdminService.prototype.buscarCliente = function (documentValue, receiptTypeId) {
        return this.http
            .get(this.salesUrl + "/customers/document/" + documentValue, { headers: this.headers })
            .pipe(operators_1.map(function (cliente) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            if (!cliente)
                throw { error: { message: 'Cliente no encontrado' } };
            return {
                customerId: (_a = cliente.customerId) !== null && _a !== void 0 ? _a : cliente.id_cliente,
                name: (_d = (_c = (_b = cliente.name) !== null && _b !== void 0 ? _b : cliente.nombres) !== null && _c !== void 0 ? _c : cliente.displayName) !== null && _d !== void 0 ? _d : '',
                documentValue: (_e = cliente.documentValue) !== null && _e !== void 0 ? _e : cliente.valor_doc,
                documentTypeDescription: (_f = cliente.documentTypeDescription) !== null && _f !== void 0 ? _f : '',
                documentTypeSunatCode: (_g = cliente.documentTypeSunatCode) !== null && _g !== void 0 ? _g : '',
                invoiceType: (receiptTypeId === 1 ? 'FACTURA' : 'BOLETA'),
                status: (_h = cliente.status) !== null && _h !== void 0 ? _h : cliente.estado,
                address: (_k = (_j = cliente.address) !== null && _j !== void 0 ? _j : cliente.direccion) !== null && _k !== void 0 ? _k : null,
                email: (_l = cliente.email) !== null && _l !== void 0 ? _l : null,
                phone: (_o = (_m = cliente.phone) !== null && _m !== void 0 ? _m : cliente.telefono) !== null && _o !== void 0 ? _o : null,
                displayName: (_q = (_p = cliente.displayName) !== null && _p !== void 0 ? _p : cliente.name) !== null && _q !== void 0 ? _q : ''
            };
        }), operators_1.catchError(function (err) { return rxjs_1.throwError(function () { return err; }); }));
    };
    VentasAdminService.prototype.obtenerTiposDocumento = function () {
        return this.http.get(this.url + "/sales/customers/document-types", {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.crearCliente = function (request) {
        return this.http.post(this.salesUrl + "/customers", request, {
            headers: this.headers
        });
    };
    VentasAdminService.prototype.obtenerKpiSemanal = function (sedeId) {
        var params = new http_1.HttpParams();
        if (sedeId)
            params = params.set('sedeId', String(sedeId));
        return this.http.get(this.salesUrl + "/receipts/kpi/semanal", { params: params });
    };
    VentasAdminService.prototype.actualizarCliente = function (id, payload) {
        return this.http.put(this.salesUrl + "/customers/" + id, payload, {
            headers: this.headers
        });
    };
    // ─────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────
    VentasAdminService.prototype.mapearProductoConStock = function (prod) {
        return {
            id: prod.id_producto,
            codigo: prod.codigo,
            nombre: prod.nombre,
            familia: prod.familia,
            id_categoria: prod.id_categoria,
            stock: prod.stock,
            precioUnidad: prod.precio_unitario,
            precioCaja: prod.precio_caja,
            precioMayorista: prod.precio_mayor,
            sede: prod.sede,
            id_sede: prod.id_sede
        };
    };
    VentasAdminService.prototype.mapearAutocompleteVentas = function (prod) {
        return {
            id: prod.id_producto,
            codigo: prod.codigo,
            nombre: prod.nombre,
            familia: prod.familia,
            id_categoria: prod.id_categoria,
            stock: prod.stock,
            precioUnidad: prod.precio_unitario,
            precioCaja: prod.precio_caja,
            precioMayorista: prod.precio_mayor,
            sede: prod.sede,
            id_sede: prod.id_sede
        };
    };
    // ventas.service.ts
    VentasAdminService.prototype.obtenerPromocionesActivas = function () {
        return this.http
            .get(this.salesUrl + "/promotions/active", {
            headers: this.headers
        })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    // En ventas.service.ts — reemplaza consultarDniReniec por esto:
    VentasAdminService.prototype.consultarDocumentoIdentidad = function (numero) {
        return this.http
            .get(this.salesUrl + "/reniec/consultar/" + numero, {
            headers: this.headers
        })
            .pipe(operators_1.catchError(function () {
            return rxjs_1.of({
                nombres: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                nombreCompleto: '',
                tipoDocumento: 'DNI'
            });
        }));
    };
    VentasAdminService.prototype.obtenerMetodosPago = function () {
        return this.http
            .get(this.salesUrl + "/receipts/payment-types", {
            headers: this.headers
        })
            .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }));
    };
    VentasAdminService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], VentasAdminService);
    return VentasAdminService;
}());
exports.VentasAdminService = VentasAdminService;
