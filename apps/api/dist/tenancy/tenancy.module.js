"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenancyModule = void 0;
const common_1 = require("@nestjs/common");
const tenancy_service_1 = require("./tenancy.service");
const prisma_module_1 = require("../prisma/prisma.module");
const nestjs_cls_1 = require("nestjs-cls");
const tenant_context_middleware_1 = require("./tenant-context.middleware");
let TenancyModule = class TenancyModule {
    configure(consumer) {
        consumer
            .apply(tenant_context_middleware_1.TenantContextMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.TenancyModule = TenancyModule;
exports.TenancyModule = TenancyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, nestjs_cls_1.ClsModule],
        providers: [tenancy_service_1.TenancyService],
        exports: [tenancy_service_1.TenancyService],
    })
], TenancyModule);
//# sourceMappingURL=tenancy.module.js.map