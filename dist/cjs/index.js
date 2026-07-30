"use strict";
/**
 * @bluedot/security-middleware
 *
 * Drop-in security linting middleware for Node.js and Next.js development and staging environments.
 * Provides runtime security checks for HTTP headers, CORS policies, and dependency vulnerabilities.
 *
 * @module security-middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssueStore = exports.clearIssues = exports.addIssues = exports.getIssues = exports.analyzeCors = exports.analyzeHeaders = exports.withSecurity = exports.securityMiddleware = void 0;
var express_js_1 = require("./middleware/express.js");
Object.defineProperty(exports, "securityMiddleware", { enumerable: true, get: function () { return express_js_1.securityMiddleware; } });
var withSecurity_js_1 = require("./middleware/withSecurity.js");
Object.defineProperty(exports, "withSecurity", { enumerable: true, get: function () { return withSecurity_js_1.withSecurity; } });
var headers_js_1 = require("./checks/headers.js");
Object.defineProperty(exports, "analyzeHeaders", { enumerable: true, get: function () { return headers_js_1.analyzeHeaders; } });
var cors_js_1 = require("./checks/cors.js");
Object.defineProperty(exports, "analyzeCors", { enumerable: true, get: function () { return cors_js_1.analyzeCors; } });
var state_js_1 = require("./state.js");
Object.defineProperty(exports, "getIssues", { enumerable: true, get: function () { return state_js_1.getIssues; } });
Object.defineProperty(exports, "addIssues", { enumerable: true, get: function () { return state_js_1.addIssues; } });
Object.defineProperty(exports, "clearIssues", { enumerable: true, get: function () { return state_js_1.clearIssues; } });
Object.defineProperty(exports, "createIssueStore", { enumerable: true, get: function () { return state_js_1.createIssueStore; } });
//# sourceMappingURL=index.js.map