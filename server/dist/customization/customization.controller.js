"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizationController = void 0;
const common_1 = require("@nestjs/common");
const customization_service_1 = require("./customization.service");
let CustomizationController = class CustomizationController {
    constructor(customizationService) {
        this.customizationService = customizationService;
    }
    getOptions() {
        return this.customizationService.getCustomizationOptions();
    }
};
exports.CustomizationController = CustomizationController;
__decorate([
    (0, common_1.Get)('options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomizationController.prototype, "getOptions", null);
exports.CustomizationController = CustomizationController = __decorate([
    (0, common_1.Controller)('customization'),
    __param(0, (0, common_1.Inject)(customization_service_1.CustomizationService)),
    __metadata("design:paramtypes", [customization_service_1.CustomizationService])
], CustomizationController);
//# sourceMappingURL=customization.controller.js.map