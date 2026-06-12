/*!
 * Hearty free meal engine compatibility shim
 * Keeps old cached HTML from loading old templates.
 * Actual engine: hearty-meal-engine-final.js v3.3.6-button-helper-fix
 */
(function(root){
  "use strict";
  root.HeartyMealsEngineV6 = {
    VERSION: "compat-shim-to-3.3.6-button-helper-fix",
    generateWeekPlan: function(){
      throw new Error("Old generateWeekPlan() is disabled. free-meal-plan.html must use HeartyMealEngine.generatePlan().");
    }
  };
})(typeof self !== "undefined" ? self : this);
