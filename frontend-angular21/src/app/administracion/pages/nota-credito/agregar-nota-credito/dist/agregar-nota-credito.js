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
exports.__esModule = true;
exports.AgregarNotaCreditoComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var card_1 = require("primeng/card");
var button_1 = require("primeng/button");
var select_1 = require("primeng/select");
var table_1 = require("primeng/table");
var tag_1 = require("primeng/tag");
var toast_1 = require("primeng/toast");
var inputtext_1 = require("primeng/inputtext");
var confirmdialog_1 = require("primeng/confirmdialog");
var inputnumber_1 = require("primeng/inputnumber");
var checkbox_1 = require("primeng/checkbox");
var api_1 = require("primeng/api");
var ventas_api_service_1 = require("../../../../ventas/services/ventas-api.service");
var nota_credito_service_1 = require("../../../services/nota-credito.service");
var stock_socket_service_1 = require("../../../../ventas/services/stock-socket.service");
var AgregarNotaCreditoComponent = /** @class */ (function () {
    function AgregarNotaCreditoComponent() {
        var _this = this;
        this.router = core_1.inject(router_1.Router);
        this.creditNoteService = core_1.inject(nota_credito_service_1.CreditNoteService);
        this.ventasService = core_1.inject(ventas_api_service_1.VentasApiService);
        this.messageService = core_1.inject(api_1.MessageService);
        this.confirmationService = core_1.inject(api_1.ConfirmationService);
        this.stockSocket = core_1.inject(stock_socket_service_1.StockSocketService);
        this.subscriptions = new rxjs_1.Subscription();
        this.tiposComprobante = [
            { label: 'Factura', value: '01' },
            { label: 'Boleta', value: '03' },
        ];
        // ── Signals ──────────────────────────────────────────────────
        this.tipoComprobanteRef = core_1.signal(null);
        this.serieCorrelativoRef = core_1.signal('');
        this.buscandoComprobante = core_1.signal(false);
        this.ventaReferenciaCabecera = core_1.signal(null);
        this.itemsVenta = core_1.signal([]);
        this.motivoSunatSeleccionado = core_1.signal(null);
        this.sustentoDescripcion = core_1.signal('');
        this.guardandoNota = core_1.signal(false);
        this.motivosSunat = [
            { label: 'Anulación de la operación', value: '01' },
            { label: 'Anulación por error en el RUC', value: '02' },
            { label: 'Corrección por error en la descripción', value: '03' },
            { label: 'Descuento global', value: '04' },
            { label: 'Descuento por ítem', value: '05' },
            { label: 'Devolución total', value: '06' },
            { label: 'Devolución por ítem', value: '07' },
            { label: 'Bonificación', value: '08' },
            { label: 'Disminución en el valor', value: '09' },
        ];
        // ── Computed ──────────────────────────────────────────────────
        this.esFormularioValido = core_1.computed(function () {
            var hayItemsSeleccionados = _this.itemsVenta().some(function (i) { return i.seleccionado && i.cantidadADevolver > 0; });
            return !!(_this.ventaReferenciaCabecera() &&
                _this.motivoSunatSeleccionado() &&
                _this.sustentoDescripcion().trim().length >= 5 &&
                hayItemsSeleccionados);
        });
        this.stockListener = function (data) {
            _this.messageService.add({
                severity: 'info',
                summary: 'Inventario Actualizado',
                detail: "Se devolvieron " + data.quantity + " unidades del producto ID: " + data.productId + " al almac\u00E9n.",
                life: 6000
            });
        };
    }
    AgregarNotaCreditoComponent.prototype.ngOnInit = function () {
        this.stockSocket.onStockActualizado(this.stockListener);
    };
    AgregarNotaCreditoComponent.prototype.ngOnDestroy = function () {
        this.subscriptions.unsubscribe();
        this.stockSocket.offStockActualizado(this.stockListener);
    };
    AgregarNotaCreditoComponent.prototype.buscarComprobante = function () {
        var _this = this;
        if (!this.tipoComprobanteRef()) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione el tipo de comprobante.' });
            return;
        }
        if (!this.serieCorrelativoRef() || !this.serieCorrelativoRef().includes('-')) {
            this.messageService.add({ severity: 'error', summary: 'Formato inválido', detail: 'Use el formato Serie-Número (Ej: F001-123).' });
            return;
        }
        this.buscandoComprobante.set(true);
        this.limpiarBuscadorBase();
        var correlativoLimpio = this.serieCorrelativoRef().trim().toUpperCase();
        var sub = this.ventasService.getSaleReceiptByCorrelative(correlativoLimpio).subscribe({
            next: function (res) {
                var _a, _b;
                try {
                    if (!res)
                        throw new Error('Respuesta vacía del servidor');
                    // Como el backend ya devuelve detailResponse.data directo, 'res' es la cabecera
                    var cabecera = res.data ? res.data : res;
                    // Asignamos la data EXACTA que arroja getDetalleCompleto()
                    _this.ventaReferenciaCabecera.set({
                        id: cabecera.id_comprobante,
                        clienteNombre: ((_a = cabecera.cliente) === null || _a === void 0 ? void 0 : _a.nombre) || 'Cliente sin nombre',
                        clienteDocumento: ((_b = cabecera.cliente) === null || _b === void 0 ? void 0 : _b.documento) || 'S/D',
                        fechaEmision: cabecera.fec_emision,
                        total: Number(cabecera.total || 0),
                        subtotal: Number(cabecera.subtotal || 0),
                        igv: Number(cabecera.igv || 0)
                    });
                    // Mapeamos los productos según la estructura de getDetalleCompleto()
                    var listaProductos = cabecera.productos || [];
                    var itemsMapeados = listaProductos.map(function (p) {
                        return {
                            id_detalle: p.id_producto || p.productId || p.id_prod_ref || p.id,
                            descripcion: p.descripcion || 'Producto Desconocido',
                            cantidadOriginal: Number(p.cantidad || 0),
                            precioUnitario: Number(p.precio_unit || 0),
                            cantidadADevolver: 0,
                            seleccionado: false
                        };
                    });
                    _this.itemsVenta.set(itemsMapeados);
                    _this.buscandoComprobante.set(false);
                    if (_this.itemsVenta().length > 0) {
                        _this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comprobante cargado correctamente.' });
                    }
                    else {
                        _this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El comprobante no tiene productos para devolver.' });
                    }
                }
                catch (e) {
                    console.error("Error mapeando la data:", e);
                    _this.buscandoComprobante.set(false);
                    _this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Estructura de comprobante irreconocible.' });
                }
            },
            error: function (err) {
                console.error(err);
                _this.buscandoComprobante.set(false);
                _this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'No se pudo localizar el comprobante.' });
            }
        });
        this.subscriptions.add(sub);
    };
    AgregarNotaCreditoComponent.prototype.limpiarBuscadorBase = function () {
        this.ventaReferenciaCabecera.set(null);
        this.itemsVenta.set([]);
        this.motivoSunatSeleccionado.set(null);
        this.sustentoDescripcion.set('');
    };
    AgregarNotaCreditoComponent.prototype.onMotivoChange = function () {
        var motivo = this.motivoSunatSeleccionado();
        var nuevosItems = this.itemsVenta().map(function (item) {
            if (motivo === '01' || motivo === '06') {
                return __assign(__assign({}, item), { seleccionado: true, cantidadADevolver: item.cantidadOriginal });
            }
            else {
                return __assign(__assign({}, item), { seleccionado: false, cantidadADevolver: 0 });
            }
        });
        this.itemsVenta.set(nuevosItems);
    };
    AgregarNotaCreditoComponent.prototype.onCantidadChange = function (item) {
        var cant = item.cantidadADevolver;
        if (cant > item.cantidadOriginal)
            cant = item.cantidadOriginal;
        if (cant < 0)
            cant = 0;
        var nuevosItems = this.itemsVenta().map(function (i) {
            if (i.id_detalle === item.id_detalle) {
                return __assign(__assign({}, i), { cantidadADevolver: cant, seleccionado: cant > 0 });
            }
            return i;
        });
        this.itemsVenta.set(nuevosItems);
    };
    AgregarNotaCreditoComponent.prototype.onCheckboxChange = function (item) {
        var nuevosItems = this.itemsVenta().map(function (i) {
            if (i.id_detalle === item.id_detalle) {
                var cant = i.seleccionado && i.cantidadADevolver === 0 ? 1 : (!i.seleccionado ? 0 : i.cantidadADevolver);
                return __assign(__assign({}, i), { cantidadADevolver: cant });
            }
            return i;
        });
        this.itemsVenta.set(nuevosItems);
    };
    AgregarNotaCreditoComponent.prototype.confirmarEmision = function () {
        var _this = this;
        if (!this.esFormularioValido()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Incompleto',
                detail: 'Verifique motivo, sustento (mín. 5 chars) y que haya productos seleccionados.'
            });
            return;
        }
        this.confirmationService.confirm({
            header: 'Confirmar Emisión a SUNAT',
            message: "\u00BFEst\u00E1 seguro que desea emitir la Nota de Cr\u00E9dito? Esta acci\u00F3n no se puede deshacer y el documento ser\u00E1 enviado a SUNAT de inmediato.",
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, Emitir NC',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-text p-button-secondary',
            accept: function () {
                _this.emitirNotaCredito();
            }
        });
    };
    AgregarNotaCreditoComponent.prototype.emitirNotaCredito = function () {
        var _this = this;
        this.guardandoNota.set(true);
        var itemsParaDevolver = this.itemsVenta().filter(function (i) { return i.seleccionado && i.cantidadADevolver > 0; });
        var payload = {
            salesReceiptId: this.ventaReferenciaCabecera().id,
            reasonCode: this.motivoSunatSeleccionado(),
            reasonDescription: this.sustentoDescripcion().trim(),
            clientName: this.ventaReferenciaCabecera().clienteNombre,
            clientDocument: this.ventaReferenciaCabecera().clienteDocumento,
            clientId: this.ventaReferenciaCabecera().clienteId || 1,
            items: itemsParaDevolver.map(function (item) { return ({
                itemId: Number(item.id_detalle),
                quantity: item.cantidadADevolver
            }); })
        };
        console.log("Payload a enviar:", payload);
        var sub = this.creditNoteService.registrar(payload).subscribe({
            next: function (res) {
                _this.guardandoNota.set(false);
                _this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Nota de Crédito emitida correctamente',
                    life: 4000
                });
                setTimeout(function () { return _this.volverListado(); }, 2000);
            },
            error: function (err) {
                var _a;
                _this.guardandoNota.set(false);
                _this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || 'No se pudo emitir la nota de crédito',
                    life: 5000
                });
            }
        });
        this.subscriptions.add(sub);
    };
    AgregarNotaCreditoComponent.prototype.volverListado = function () {
        this.router.navigate(['/admin/nota-credito']);
    };
    AgregarNotaCreditoComponent = __decorate([
        core_1.Component({
            selector: 'app-agregar-nota-credito',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                card_1.CardModule,
                button_1.ButtonModule,
                select_1.SelectModule,
                table_1.TableModule,
                tag_1.TagModule,
                toast_1.ToastModule,
                inputtext_1.InputTextModule,
                confirmdialog_1.ConfirmDialogModule,
                inputnumber_1.InputNumberModule,
                checkbox_1.CheckboxModule,
            ],
            providers: [api_1.MessageService, api_1.ConfirmationService],
            templateUrl: './agregar-nota-credito.html',
            styleUrl: './agregar-nota-credito.css'
        })
    ], AgregarNotaCreditoComponent);
    return AgregarNotaCreditoComponent;
}());
exports.AgregarNotaCreditoComponent = AgregarNotaCreditoComponent;
