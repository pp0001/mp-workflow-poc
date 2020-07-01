sap.ui.define([], function() {
    "use strict";

    function curry(fn /*, ... */) {
        var curryArgs = Array.prototype.slice.call(arguments, 1);
        return function(/* ... */) {
            var newArgs = Array.prototype.slice.call(arguments, 0),
                mergedArgs = curryArgs.concat(newArgs);

            return fn.apply(this, mergedArgs);
        };
    }

    return curry;
});