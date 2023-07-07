/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var https_www_gstatic_com_firebasejs_9_23_0_firebase_app_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js */ \"https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js\");\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module './src/table.js'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\n/* harmony import */ var https_www_gstatic_com_firebasejs_9_23_0_firebase_database_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js */ \"https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([https_www_gstatic_com_firebasejs_9_23_0_firebase_app_js__WEBPACK_IMPORTED_MODULE_0__, https_www_gstatic_com_firebasejs_9_23_0_firebase_database_js__WEBPACK_IMPORTED_MODULE_2__]);\n([https_www_gstatic_com_firebasejs_9_23_0_firebase_app_js__WEBPACK_IMPORTED_MODULE_0__, https_www_gstatic_com_firebasejs_9_23_0_firebase_database_js__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\r\n\r\n// TODO: Add SDKs for Firebase products that you want to use\r\n// https://firebase.google.com/docs/web/setup#available-libraries\r\n\r\n// Your web app's Firebase configuration\r\nconst firebaseConfig = {\r\n  apiKey: \"AIzaSyAckrIfuhLhmrtrtmHHwQQoBkF6lfFtLIY\",\r\n  authDomain: \"sanguosha-a3368.firebaseapp.com\",\r\n  databaseURL: \"https://sanguosha-a3368-default-rtdb.firebaseio.com\",\r\n  projectId: \"sanguosha-a3368\",\r\n  storageBucket: \"sanguosha-a3368.appspot.com\",\r\n  messagingSenderId: \"619109039096\",\r\n  appId: \"1:619109039096:web:4a4ed7755e270a1d4a740d\",\r\n};\r\n\r\n// Initialize Firebase\r\nconst app = (0,https_www_gstatic_com_firebasejs_9_23_0_firebase_app_js__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\r\n\r\n\r\nconst db = (0,https_www_gstatic_com_firebasejs_9_23_0_firebase_database_js__WEBPACK_IMPORTED_MODULE_2__.getDatabase)();\r\nwindow.db = db;\r\nwindow.appData = {};\r\n\r\nlet sgTable = document.querySelector(\"sg-table\");\r\nsgTable.init(db);\r\n// set(ref(db, \"people/1\"), { name: \"j\" });\r\n// let players = document.querySelectorAll(\"my-player\");\r\n// players.forEach((p) => {\r\n//   console.log(\"hello\");\r\n//   p.init(db, window.appData);\r\n// });\r\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMEY7QUFDbEU7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzR0FBYTtBQVMrQztBQUN4RTtBQUNBLFdBQVcseUdBQVc7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixXQUFXO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSIsInNvdXJjZXMiOlsid2VicGFjazovL3NhbmdvLy4vc3JjL2FwcC5qcz8xMTEyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluaXRpYWxpemVBcHAgfSBmcm9tIFwiaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vZmlyZWJhc2Vqcy85LjIzLjAvZmlyZWJhc2UtYXBwLmpzXCI7XHJcbmltcG9ydCBcIi4vc3JjL3RhYmxlLmpzXCI7XHJcbi8vIFRPRE86IEFkZCBTREtzIGZvciBGaXJlYmFzZSBwcm9kdWN0cyB0aGF0IHlvdSB3YW50IHRvIHVzZVxyXG4vLyBodHRwczovL2ZpcmViYXNlLmdvb2dsZS5jb20vZG9jcy93ZWIvc2V0dXAjYXZhaWxhYmxlLWxpYnJhcmllc1xyXG5cclxuLy8gWW91ciB3ZWIgYXBwJ3MgRmlyZWJhc2UgY29uZmlndXJhdGlvblxyXG5jb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcclxuICBhcGlLZXk6IFwiQUl6YVN5QWNrcklmdWhMaG1ydHJ0bUhId1FRb0JrRjZsZkZ0TElZXCIsXHJcbiAgYXV0aERvbWFpbjogXCJzYW5ndW9zaGEtYTMzNjguZmlyZWJhc2VhcHAuY29tXCIsXHJcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9zYW5ndW9zaGEtYTMzNjgtZGVmYXVsdC1ydGRiLmZpcmViYXNlaW8uY29tXCIsXHJcbiAgcHJvamVjdElkOiBcInNhbmd1b3NoYS1hMzM2OFwiLFxyXG4gIHN0b3JhZ2VCdWNrZXQ6IFwic2FuZ3Vvc2hhLWEzMzY4LmFwcHNwb3QuY29tXCIsXHJcbiAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiNjE5MTA5MDM5MDk2XCIsXHJcbiAgYXBwSWQ6IFwiMTo2MTkxMDkwMzkwOTY6d2ViOjRhNGVkNzc1NWUyNzBhMWQ0YTc0MGRcIixcclxufTtcclxuXHJcbi8vIEluaXRpYWxpemUgRmlyZWJhc2VcclxuY29uc3QgYXBwID0gaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XHJcbmltcG9ydCB7XHJcbiAgZ2V0RGF0YWJhc2UsXHJcbiAgc2V0LFxyXG4gIGdldCxcclxuICB1cGRhdGUsXHJcbiAgcmVtb3ZlLFxyXG4gIHJlZixcclxuICBjaGlsZCxcclxufSBmcm9tIFwiaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vZmlyZWJhc2Vqcy85LjIzLjAvZmlyZWJhc2UtZGF0YWJhc2UuanNcIjtcclxuXHJcbmNvbnN0IGRiID0gZ2V0RGF0YWJhc2UoKTtcclxud2luZG93LmRiID0gZGI7XHJcbndpbmRvdy5hcHBEYXRhID0ge307XHJcblxyXG5sZXQgc2dUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzZy10YWJsZVwiKTtcclxuc2dUYWJsZS5pbml0KGRiKTtcclxuLy8gc2V0KHJlZihkYiwgXCJwZW9wbGUvMVwiKSwgeyBuYW1lOiBcImpcIiB9KTtcclxuLy8gbGV0IHBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibXktcGxheWVyXCIpO1xyXG4vLyBwbGF5ZXJzLmZvckVhY2goKHApID0+IHtcclxuLy8gICBjb25zb2xlLmxvZyhcImhlbGxvXCIpO1xyXG4vLyAgIHAuaW5pdChkYiwgd2luZG93LmFwcERhdGEpO1xyXG4vLyB9KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/app.js\n");

/***/ }),

/***/ "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js":
false,

/***/ "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js":
false

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.js");
/******/ 	
/******/ })()
;