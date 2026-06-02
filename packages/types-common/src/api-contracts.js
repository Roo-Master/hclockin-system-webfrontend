"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftStatus = exports.ClockAction = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["HOSPITAL_ADMIN"] = "HOSPITAL_ADMIN";
    UserRole["DEPT_HEAD"] = "DEPT_HEAD";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole || (exports.UserRole = UserRole = {}));
var ClockAction;
(function (ClockAction) {
    ClockAction["IN"] = "IN";
    ClockAction["OUT"] = "OUT";
    ClockAction["UNKNOWN"] = "UNKNOWN";
})(ClockAction || (exports.ClockAction = ClockAction = {}));
var ShiftStatus;
(function (ShiftStatus) {
    ShiftStatus["PRESENT"] = "PRESENT";
    ShiftStatus["ABSENT"] = "ABSENT";
    ShiftStatus["LATE"] = "LATE";
    ShiftStatus["LEAVE"] = "LEAVE";
    ShiftStatus["GHOST_SESSION"] = "GHOST_SESSION";
})(ShiftStatus || (exports.ShiftStatus = ShiftStatus = {}));
//# sourceMappingURL=api-contracts.js.map