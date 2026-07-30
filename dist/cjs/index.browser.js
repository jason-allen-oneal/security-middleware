"use strict";
/**
 * Browser-safe exports for security middleware.
 *
 * This module provides browser-compatible functionality that doesn't depend on Node.js APIs.
 * Safe to use in edge runtime environments like Vercel Edge Functions or Cloudflare Workers.
 *
 * @module security-middleware/browser
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssueStore = exports.clearIssues = exports.addIssues = exports.getIssues = exports.analyzeCors = exports.analyzeHeaders = void 0;
var headers_js_1 = require("./checks/headers.js");
Object.defineProperty(exports, "analyzeHeaders", { enumerable: true, get: function () { return headers_js_1.analyzeHeaders; } });
var cors_js_1 = require("./checks/cors.js");
Object.defineProperty(exports, "analyzeCors", { enumerable: true, get: function () { return cors_js_1.analyzeCors; } });
var state_js_1 = require("./state.js");
Object.defineProperty(exports, "getIssues", { enumerable: true, get: function () { return state_js_1.getIssues; } });
Object.defineProperty(exports, "addIssues", { enumerable: true, get: function () { return state_js_1.addIssues; } });
Object.defineProperty(exports, "clearIssues", { enumerable: true, get: function () { return state_js_1.clearIssues; } });
Object.defineProperty(exports, "createIssueStore", { enumerable: true, get: function () { return state_js_1.createIssueStore; } });
//# sourceMappingURL=index.browser.js.map