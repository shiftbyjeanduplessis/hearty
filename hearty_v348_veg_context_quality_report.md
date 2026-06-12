# Hearty v3.4.8 — Vegetable Context Polish Quality Audit

Engine version: `3.4.8-veg-context-polish`
Engine source: `rebuilt-funnel-engine-v331-us-first-plus-v348-vegetable-context-polish`

Valid full-generation plans: **100**
Generated days: **700**
Hard failures: **0**
Weirdness rows: **5**
Warning rows: **20**
Clean rows: **80**
Protein target days: **97.1%**
Invalid snack cases blocked: **True**
Gate pass: **True**

## Invalid snack gate checks

- **1. v348 invalid snack gate 1** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based.
- **2. v348 invalid snack gate 2** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **3. v348 invalid snack gate 3** — `BLOCKED` — snack_protein_minimum|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **4. v348 invalid snack gate 4** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **5. v348 invalid snack gate 5** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **6. v348 invalid snack gate 6** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **7. v348 invalid snack gate 7** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based.
- **8. v348 invalid snack gate 8** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **9. v348 invalid snack gate 9** — `BLOCKED` — snack_protein_minimum|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **10. v348 invalid snack gate 10** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.

## Hard failures

None.

## Weirdness patterns

`{"low lunch template variety #": 5}`

## Weirdness rows

- **7. v348 valid veg-quality scenario 7 UK mode 6** — low lunch template variety 3
- **27. v348 valid veg-quality scenario 27 UK mode 6** — low lunch template variety 3
- **47. v348 valid veg-quality scenario 47 UK mode 6** — low lunch template variety 3
- **67. v348 valid veg-quality scenario 67 UK mode 6** — low lunch template variety 3
- **87. v348 valid veg-quality scenario 87 UK mode 6** — low lunch template variety 3

## Warning rows

- **5. v348 valid veg-quality scenario 5 CA mode 4** — Day 6: protein high 119
- **7. v348 valid veg-quality scenario 7 UK mode 6** — Day 3: eggs snack repeats lunch/dinner protein. | Day 5: eggs snack repeats lunch/dinner protein. | Day 6: dairy snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **8. v348 valid veg-quality scenario 8 SA mode 7** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **15. v348 valid veg-quality scenario 15 CA mode 14** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **25. v348 valid veg-quality scenario 25 CA mode 4** — Day 6: protein high 119
- **27. v348 valid veg-quality scenario 27 UK mode 6** — Day 3: eggs snack repeats lunch/dinner protein. | Day 5: eggs snack repeats lunch/dinner protein. | Day 6: dairy snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **28. v348 valid veg-quality scenario 28 SA mode 7** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **35. v348 valid veg-quality scenario 35 CA mode 14** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **45. v348 valid veg-quality scenario 45 CA mode 4** — Day 6: protein high 119
- **47. v348 valid veg-quality scenario 47 UK mode 6** — Day 3: eggs snack repeats lunch/dinner protein. | Day 5: eggs snack repeats lunch/dinner protein. | Day 6: dairy snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **48. v348 valid veg-quality scenario 48 SA mode 7** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **55. v348 valid veg-quality scenario 55 CA mode 14** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **65. v348 valid veg-quality scenario 65 CA mode 4** — Day 6: protein high 119
- **67. v348 valid veg-quality scenario 67 UK mode 6** — Day 3: eggs snack repeats lunch/dinner protein. | Day 5: eggs snack repeats lunch/dinner protein. | Day 6: dairy snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **68. v348 valid veg-quality scenario 68 SA mode 7** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **75. v348 valid veg-quality scenario 75 CA mode 14** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **85. v348 valid veg-quality scenario 85 CA mode 4** — Day 6: protein high 119
- **87. v348 valid veg-quality scenario 87 UK mode 6** — Day 3: eggs snack repeats lunch/dinner protein. | Day 5: eggs snack repeats lunch/dinner protein. | Day 6: dairy snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **88. v348 valid veg-quality scenario 88 SA mode 7** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.
- **95. v348 valid veg-quality scenario 95 CA mode 14** — Day 4: eggs snack repeats lunch/dinner protein. | Day 5: fish snack repeats lunch/dinner protein. | Day 6: eggs snack repeats lunch/dinner protein. | Day 7: dairy snack repeats lunch/dinner protein.