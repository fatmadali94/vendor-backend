"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = void 0;
const partProviders_1 = require("../db/parts/partProviders");
const materialProviders_1 = require("../db/materials/materialProviders");
const materialGroups_1 = require("../db/materials/materialGroups");
const materialGrades_1 = require("../db/materials/materialGrades");
const materialNames_1 = require("../db/materials/materialNames");
const partGroups_1 = require("../db/parts/partGroups");
const partGeneralIds_1 = require("../db/parts/partGeneralIds");
const partNames_1 = require("../db/parts/partNames");
const products_1 = require("../db/products");
const providers_1 = require("../db/providers");
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const materialGroups = yield (0, materialGroups_1.getMaterialGroups)();
        const materialNames = yield (0, materialNames_1.getMaterialNames)();
        const materialGrades = yield (0, materialGrades_1.getMaterialGrades)();
        const partGroups = yield (0, partGroups_1.getPartGroups)();
        const partNames = yield (0, partNames_1.getPartNames)();
        const partGeneralIds = yield (0, partGeneralIds_1.getPartGeneralIds)();
        const materialProviders = yield (0, materialProviders_1.getMaterialProviders)();
        const partProviders = yield (0, partProviders_1.getPartProviders)();
        const products = yield (0, products_1.getProducts)();
        const verifiedMaterialProviders = yield (0, providers_1.getVerifiedMaterialProviders)();
        const verifiedPartProviders = yield (0, providers_1.getVerifiedPartProviders)();
        const allArray = {
            materialProviders,
            partProviders,
            materialGrades,
            materialGroups,
            materialNames,
            partGroups,
            partNames,
            partGeneralIds,
            products,
            verifiedMaterialProviders,
            verifiedPartProviders,
        };
        return res.status(200).json(allArray);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
});
exports.getAll = getAll;
