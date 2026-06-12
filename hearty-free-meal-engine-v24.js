/*!
 * Hearty free meal engine compatibility shim
 * Actual engine: hearty-meal-engine-final.js v3.3.5-clean-engine
 */
(function(root){
  "use strict";
  root.HeartyMealsEngineV6 = {
    VERSION: "disabled-compat-shim-to-3.3.5-clean-engine",
    generateWeekPlan: function(){
      throw new Error("Old generateWeekPlan() is disabled. This page must use HeartyMealEngine.generatePlan().");
    }
  };
})(typeof self !== "undefined" ? self : this);
