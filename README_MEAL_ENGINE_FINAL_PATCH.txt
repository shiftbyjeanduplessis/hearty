Hearty final meal-engine patch

Changed files:
- free-meal-plan.html now loads hearty-meal-engine-final.js?v=3-final-gated and uses HeartyMealEngine.generatePlan() only.
- hearty-meal-engine-final.js added.
- hearty-free-meal-engine-v24.js replaced with a final-engine compatibility shim so old templates cannot generate if stale HTML loads it.
- service-worker.js cache name bumped.

Old removed templates now bypassed:
- apple-style pork plate
- baked oats with yoghurt on the side
- turkey burger / turkey shawarma
- Friday night meal labels
- Sunday roast-style labels
- daily 5 high-protein snack ideas block
