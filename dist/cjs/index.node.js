"use strict";
/**
 * Node.js-specific exports for security middleware.
 *
 * This module provides Node.js-only functionality that requires access to Node.js APIs
 * such as child_process for running npm audit.
 *
 * @module security-middleware/node
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNpmAudit = void 0;
var npmAudit_js_1 = require("./checks/npmAudit.js");
Object.defineProperty(exports, "runNpmAudit", { enumerable: true, get: function () { return npmAudit_js_1.runNpmAudit; } });
//# sourceMappingURL=index.node.js.map