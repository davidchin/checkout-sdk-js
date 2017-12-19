"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("../../data-store");
/**
 * @param {ConfigState} state
 * @return {ConfigState}
 */
function configReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = configReducer;
/**
 * @private
 * @param {Config} data
 * @return {Customer}
 */
function dataReducer(data) {
    if (data === void 0) { data = {}; }
    return data;
}
//# sourceMappingURL=config-reducer.js.map