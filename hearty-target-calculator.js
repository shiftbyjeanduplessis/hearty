(function(){
  "use strict";

  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9
  };

  // Lead magnet v5: separate normal daily movement/work from intentional exercise.
  // This reduces the common over-estimation problem where a few workouts are treated
  // as an active daily lifestyle.
  const DAILY_ACTIVITY_BASE = {
    mostly_sitting: 1.2,
    light_daily: 1.3,
    on_feet: 1.45,
    physical_job: 1.6
  };

  const EXERCISE_ACTIVITY_ADD = {
    none: 0,
    light_1_2: 0.05,
    regular_3_4: 0.10,
    hard_5plus: 0.18,
    very_hard: 0.25
  };

  const GOAL_LABELS = {
    maintain: "Keep me steady",
    lose: "Steady fat loss",
    faster: "Faster fat loss",
    recomp: "Keep/build muscle while losing"
  };

  const ACTIVITY_LABELS = {
    sedentary: "Mostly sitting",
    light: "Lightly active",
    moderate: "Moderately active",
    very: "Very active",
    extra: "Extra active"
  };

  const DAILY_ACTIVITY_LABELS = {
    mostly_sitting: "Mostly sitting",
    light_daily: "Light daily movement",
    on_feet: "On my feet a lot",
    physical_job: "Physical job or very active daily routine"
  };

  const EXERCISE_ACTIVITY_LABELS = {
    none: "No structured exercise right now",
    light_1_2: "Light exercise 1–2 times/week",
    regular_3_4: "Exercise 3–4 times/week",
    hard_5plus: "Hard training 5+ times/week",
    very_hard: "Very hard training or sport most days"
  };

  const TIER_META = {
    1: {
      label: "Light structure for a smaller appetite",
      shortLabel: "Light plan",
      note: "A gentler structure for lower-appetite GLP-1 days. Start with what you can manage and use the lower end of portion suggestions."
    },
    2: {
      label: "Standard GLP-1 meal structure",
      shortLabel: "Standard plan",
      note: "A balanced starter structure with three practical meals and optional snack support."
    },
    3: {
      label: "Built with optional protein support",
      shortLabel: "Higher protein plan",
      note: "Includes optional protein anchor ideas for days when appetite allows."
    },
    4: {
      label: "Built with extra meal support",
      shortLabel: "Higher intake plan",
      note: "Adds extra snack/starch/fat support for taller, larger, very active or higher-needs users."
    }
  };

  function number(value){
    const n = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function round5(value){
    return Math.round(Number(value || 0) / 5) * 5;
  }

  function round10(value){
    return Math.round(Number(value || 0) / 10) * 10;
  }

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }



  function resolveActivity(input){
    const daily = DAILY_ACTIVITY_BASE[input.dailyActivity] ? input.dailyActivity : "";
    const exercise = EXERCISE_ACTIVITY_ADD.hasOwnProperty(input.exerciseActivity) ? input.exerciseActivity : "";

    if(daily || exercise){
      if(!daily || !exercise){
        return { ok:false, error:"Choose both your normal daily movement and your exercise/training level." };
      }
      const multiplier = clamp(DAILY_ACTIVITY_BASE[daily] + EXERCISE_ACTIVITY_ADD[exercise], 1.2, 1.9);
      return {
        ok:true,
        dailyActivity: daily,
        exerciseActivity: exercise,
        activity: `${daily}+${exercise}`,
        multiplier,
        label: `${DAILY_ACTIVITY_LABELS[daily]} + ${EXERCISE_ACTIVITY_LABELS[exercise]}`,
        dailyLabel: DAILY_ACTIVITY_LABELS[daily],
        exerciseLabel: EXERCISE_ACTIVITY_LABELS[exercise]
      };
    }

    // Backwards compatibility for old saved/test states that still pass one activity field.
    const legacy = ACTIVITY_MULTIPLIERS[input.activity] ? input.activity : "";
    if(legacy){
      return {
        ok:true,
        dailyActivity: "",
        exerciseActivity: "",
        activity: legacy,
        multiplier: ACTIVITY_MULTIPLIERS[legacy],
        label: ACTIVITY_LABELS[legacy],
        dailyLabel: "",
        exerciseLabel: ""
      };
    }

    return { ok:false, error:"Choose your normal daily movement and your exercise/training level." };
  }

  function toMetric(input){
    const units = input.units === "imperial" ? "imperial" : "metric";
    let kg = 0;
    let cm = 0;

    if(units === "imperial"){
      kg = number(input.weightLb) / 2.20462;
      const totalInches = number(input.heightFt) * 12 + number(input.heightIn);
      cm = totalInches * 2.54;
    } else {
      kg = number(input.weightKg);
      cm = number(input.heightCm);
    }

    return { units, kg, cm };
  }

  function validate(input){
    const errors = [];
    const sex = input.sex === "male" || input.sex === "female" ? input.sex : "";
    const age = Math.round(number(input.age));
    const activityResolved = resolveActivity(input);
    const goal = GOAL_LABELS[input.goal] ? input.goal : "";
    const metric = toMetric(input);

    if(!sex) errors.push("Choose the formula option that fits you best.");
    if(!age) errors.push("Please add your age so Hearty can estimate your plan size.");
    else if(age < 18) errors.push("Hearty’s calculator is designed for adults. Please use the general plan unless you are working with a qualified clinician.");
    else if(age > 95) errors.push("Please check your age — that number looks too high.");

    if(!metric.cm) errors.push("Please add your height so Hearty can estimate your plan size.");
    else if(metric.cm < 120 || metric.cm > 230) errors.push("Please check your height — that number looks unusual.");

    if(!metric.kg) errors.push("Please add your weight so Hearty can estimate your plan size.");
    else if(metric.kg < 35 || metric.kg > 260) errors.push("Please check your weight — that number looks unusual.");

    if(!activityResolved.ok) errors.push(activityResolved.error || "Choose your activity details.");
    if(!goal) errors.push("Choose a goal for this plan.");

    return { ok: errors.length === 0, errors, sex, age, activity: activityResolved.activity, activityLabel: activityResolved.label, activityMultiplier: activityResolved.multiplier, dailyActivity: activityResolved.dailyActivity, exerciseActivity: activityResolved.exerciseActivity, dailyActivityLabel: activityResolved.dailyLabel, exerciseActivityLabel: activityResolved.exerciseLabel, goal, kg: metric.kg, cm: metric.cm, units: metric.units };
  }

  function calculate(input){
    const clean = validate(input || {});
    if(!clean.ok) return { ok:false, errors: clean.errors };

    const bmr = clean.sex === "male"
      ? (10 * clean.kg) + (6.25 * clean.cm) - (5 * clean.age) + 5
      : (10 * clean.kg) + (6.25 * clean.cm) - (5 * clean.age) - 161;

    const tdee = bmr * clean.activityMultiplier;
    let calorieMin = 0;
    let calorieMax = 0;

    const lowAppetiteMode = ["low_appetite", "nausea_food_aversion"].includes(String(input.struggleMode || ""));
    let appetiteGuardApplied = false;

    if(clean.goal === "maintain"){
      calorieMin = tdee * 0.95;
      calorieMax = tdee * 1.05;
    } else if(clean.goal === "recomp"){
      calorieMin = tdee * 0.88;
      calorieMax = tdee * 0.92;
    } else if(clean.goal === "faster"){
      if(lowAppetiteMode){
        calorieMin = tdee * 0.80;
        calorieMax = tdee * 0.85;
        appetiteGuardApplied = true;
      } else {
        calorieMin = tdee * 0.75;
        calorieMax = tdee * 0.80;
      }
    } else {
      calorieMin = tdee * 0.80;
      calorieMax = tdee * 0.85;
    }

    const floor = clean.sex === "male" ? 1500 : 1200;
    let floorApplied = false;
    if(calorieMin < floor){
      calorieMin = floor;
      calorieMax = Math.max(calorieMax, floor + 100);
      floorApplied = true;
    }

    calorieMin = round10(calorieMin);
    calorieMax = round10(Math.max(calorieMax, calorieMin + 100));

    let proteinMinFactor = 1.4;
    let proteinMaxFactor = 1.6;
    if(clean.goal === "maintain"){
      proteinMinFactor = 1.2;
      proteinMaxFactor = 1.4;
    } else if(clean.goal === "faster"){
      proteinMinFactor = 1.5;
      proteinMaxFactor = 1.7;
    } else if(clean.goal === "recomp"){
      proteinMinFactor = 1.6;
      proteinMaxFactor = 1.8;
    }

    let proteinMin = round5(clean.kg * proteinMinFactor);
    let proteinMax = round5(clean.kg * proteinMaxFactor);
    let proteinCapped = false;

    // v19 lead-magnet realism: this is a free GLP-1 starter plan, not an
    // athlete/bodybuilding prescription. Most users with appetite suppression
    // tolerate the plan better when the public guide tops out around 120g.
    // Larger users can still use optional boosts, but we do not display
    // 150–170g as the default daily target in the free funnel.
    if(proteinMax > 120){
      proteinMax = 120;
      proteinMin = Math.min(proteinMin, 105);
      proteinCapped = true;
    }
    proteinMin = Math.max(50, proteinMin);
    proteinMax = Math.max(proteinMin + 10, proteinMax);
    if(proteinMax > 120){
      proteinMax = 120;
      if(proteinMin > 110) proteinMin = 110;
    }

    const fatFromCalories = (calorieMin * 0.20) / 9;
    const fatFromBodyweight = clean.kg * 0.6;
    const fatMin = round5(Math.max(fatFromCalories, fatFromBodyweight));

    const fibreMin = round5((calorieMin / 1000) * 14);
    let fibreMax = round5((calorieMax / 1000) * 14);
    if(fibreMax <= fibreMin) fibreMax = fibreMin + 5;

    const avgProtein = (proteinMin + proteinMax) / 2;
    const avgCalories = (calorieMin + calorieMax) / 2;
    let tier = 2;
    if(avgProtein < 85 && avgCalories < 1500) tier = 1;
    else if(avgProtein < 105 && avgCalories < 1750) tier = 2;
    else if(avgProtein < 125 || avgCalories < 2100) tier = 3;
    else tier = 4;

    return {
      ok: true,
      skipped: false,
      units: clean.units,
      sex: clean.sex,
      age: clean.age,
      heightCm: Math.round(clean.cm),
      weightKg: Math.round(clean.kg * 10) / 10,
      activity: clean.activity,
      activityLabel: clean.activityLabel,
      activityMultiplier: Math.round(clean.activityMultiplier * 100) / 100,
      dailyActivity: clean.dailyActivity,
      dailyActivityLabel: clean.dailyActivityLabel,
      exerciseActivity: clean.exerciseActivity,
      exerciseActivityLabel: clean.exerciseActivityLabel,
      goal: clean.goal,
      goalLabel: GOAL_LABELS[clean.goal],
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieMin,
      calorieMax,
      proteinMin,
      proteinMax,
      fatMin,
      fibreMin,
      fibreMax: Math.max(fibreMin + 5, fibreMax),
      tier,
      tierLabel: TIER_META[tier].label,
      tierShortLabel: TIER_META[tier].shortLabel,
      tierNote: TIER_META[tier].note,
      floorApplied,
      proteinCapped,
      appetiteGuardApplied
    };
  }

  function defaultTargets(){
    return {
      ok: true,
      skipped: true,
      units: "metric",
      sex: "",
      age: "",
      heightCm: "",
      weightKg: "",
      activity: "",
      activityLabel: "General estimate",
      activityMultiplier: "",
      dailyActivity: "",
      dailyActivityLabel: "General estimate",
      exerciseActivity: "",
      exerciseActivityLabel: "General estimate",
      goal: "lose",
      goalLabel: "General GLP-1 structure",
      bmr: "",
      tdee: "",
      calorieMin: 1400,
      calorieMax: 1650,
      proteinMin: 85,
      proteinMax: 105,
      fatMin: 40,
      fibreMin: 20,
      fibreMax: 25,
      tier: 2,
      tierLabel: TIER_META[2].label,
      tierShortLabel: TIER_META[2].shortLabel,
      tierNote: "A general mid-range structure. You can still personalise foods in the next steps.",
      floorApplied: false,
      proteinCapped: false,
      appetiteGuardApplied: false
    };
  }

  function formatRange(min, max, suffix){
    return `~${min}–${max}${suffix || ""}`;
  }

  function toQueryParams(targets){
    if(!targets) return {};
    return {
      units: targets.units || "",
      sex: targets.sex || "",
      age: targets.age || "",
      height_cm: targets.heightCm || "",
      weight_kg: targets.weightKg || "",
      activity_level: targets.activity || "",
      daily_activity: targets.dailyActivity || "",
      exercise_activity: targets.exerciseActivity || "",
      activity_multiplier: targets.activityMultiplier || "",
      goal: targets.goal || "",
      bmr: targets.bmr || "",
      tdee: targets.tdee || "",
      calorie_min: targets.calorieMin || "",
      calorie_max: targets.calorieMax || "",
      protein_min: targets.proteinMin || "",
      protein_max: targets.proteinMax || "",
      fat_min: targets.fatMin || "",
      fibre_min: targets.fibreMin || "",
      fibre_max: targets.fibreMax || "",
      meal_plan_tier: targets.tier || "",
      skipped_calculator: targets.skipped ? "true" : "false",
      appetite_guard_applied: targets.appetiteGuardApplied ? "true" : "false"
    };
  }

  window.HeartyTargetCalculator = {
    ACTIVITY_MULTIPLIERS,
    DAILY_ACTIVITY_BASE,
    EXERCISE_ACTIVITY_ADD,
    ACTIVITY_LABELS,
    DAILY_ACTIVITY_LABELS,
    EXERCISE_ACTIVITY_LABELS,
    GOAL_LABELS,
    TIER_META,
    calculate,
    validate,
    defaultTargets,
    formatRange,
    toQueryParams,
    round5,
    round10
  };
})();
