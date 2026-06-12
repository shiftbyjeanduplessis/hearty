/*!
 * Hearty free meal engine compatibility shim
 * Actual engine: hearty-meal-engine-final.js v3.5.0-rebuilt-funnel-reset
 * Old generateWeekPlan() is intentionally disabled.
 */
(function(root){
  "use strict";
  root.HeartyMealsEngineV6 = {
    VERSION: "compat-shim-disabled-v3.5.0",
    generateWeekPlan: function(){
      throw new Error("Old generateWeekPlan() is disabled. Use HeartyMealEngine.generatePlan().");
    }
  };
})(typeof self !== "undefined" ? self : this);
