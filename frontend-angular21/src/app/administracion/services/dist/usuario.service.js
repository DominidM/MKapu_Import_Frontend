"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UsuarioService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var enviroment_1 = require("../../../enviroments/enviroment");
var UsuarioService = /** @class */ (function () {
    function UsuarioService(http) {
        this.http = http;
        this.api = enviroment_1.environment.apiUrl;
    }
    UsuarioService.prototype.getUsuarios = function (page, pageSize) {
        if (page === void 0) { page = 1; }
        if (pageSize === void 0) { pageSize = 1000; }
        var params = new http_1.HttpParams().set('page', page).set('pageSize', pageSize);
        return this.http.get(this.api + "/admin/users", { params: params });
    };
    UsuarioService.prototype.getAllUsuarios = function () {
        return this.http.get(this.api + "/admin/users/all");
    };
    UsuarioService.prototype.getUsuariosPorEstado = function (activo) {
        var params = new http_1.HttpParams().set('activo', String(activo)).set('pageSize', '1000');
        return this.http.get(this.api + "/admin/users", { params: params });
    };
    UsuarioService.prototype.getUsuarioById = function (id) {
        return this.http.get(this.api + "/admin/users/" + id);
    };
    UsuarioService.prototype.postUsuarios = function (body) {
        var headers = new http_1.HttpHeaders({ 'x-role': 'Administrador' });
        return this.http.post(this.api + "/admin/users", body, { headers: headers });
    };
    UsuarioService.prototype.postCuentaUsuario = function (body) {
        return this.http.post(this.api + "/auth/create-account", body);
    };
    UsuarioService.prototype.updateUsuarioStatus = function (id, body) {
        return this.http.put(this.api + "/admin/users/" + id + "/status", body);
    };
    UsuarioService.prototype.updateUsuario = function (id, body) {
        return this.http.put(this.api + "/admin/users/" + id, body);
    };
    UsuarioService.prototype.getAccountByUserId = function (id) {
        return this.http.get(this.api + "/admin/users/" + id + "/account");
    };
    UsuarioService.prototype.changeCredentials = function (id, body) {
        return this.http.patch(this.api + "/admin/users/" + id + "/account/credentials", body);
    };
    UsuarioService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], UsuarioService);
    return UsuarioService;
}());
exports.UsuarioService = UsuarioService;
