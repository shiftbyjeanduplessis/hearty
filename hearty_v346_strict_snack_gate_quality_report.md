# Hearty v3.4.6 — Strict Snack Gate Quality Audit

Engine version: `3.4.6-strict-snack-gate-quality-fix`
Engine source: `rebuilt-funnel-engine-v331-us-first-plus-v346-strict-snack-gate-quality-fixed`

Valid full-generation plans: **100**
Generated days: **700**
Hard failures: **0**
Weirdness rows: **15**
Warning rows: **15**
Clean rows: **85**
Protein target days: **97.9%**
Invalid snack cases blocked: **True**
Gate pass: **True**

## Invalid snack gate checks

- **1. v345 invalid snack gate 1** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based.
- **2. v345 invalid snack gate 2** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **3. v345 invalid snack gate 3** — `BLOCKED` — snack_protein_minimum|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **4. v345 invalid snack gate 4** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **5. v345 invalid snack gate 5** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **6. v345 invalid snack gate 6** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **7. v345 invalid snack gate 7** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based.
- **8. v345 invalid snack gate 8** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **9. v345 invalid snack gate 9** — `BLOCKED` — snack_protein_minimum|snack_variety_for_dairy_breakfast|snack_variety_for_protein_powder_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based. | Because you selected a protein shake breakfast, please choose at least 2 snack options that are not protein shake-based.
- **10. v345 invalid snack gate 10** — `BLOCKED` — snack_protein_minimum|snack_variety_for_eggs_breakfast|snack_variety_for_dairy_breakfast — Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often. | Because you selected a egg breakfast, please choose at least 2 snack options that are not egg-based. | Because you selected a yoghurt/dairy breakfast, please choose at least 2 snack options that are not yoghurt/dairy-based.

## Hard failures

None.

## Weirdness patterns

`{"low lunch template variety #": 15, "cottage cheese lunch appears # times": 15}`

## Weirdness rows

- **7. v345 valid quality scenario 7 UK mode 6** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **8. v345 valid quality scenario 8 SA mode 7** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **15. v345 valid quality scenario 15 CA mode 14** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **27. v345 valid quality scenario 27 UK mode 6** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **28. v345 valid quality scenario 28 SA mode 7** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **35. v345 valid quality scenario 35 CA mode 14** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **47. v345 valid quality scenario 47 UK mode 6** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **48. v345 valid quality scenario 48 SA mode 7** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **55. v345 valid quality scenario 55 CA mode 14** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **67. v345 valid quality scenario 67 UK mode 6** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **68. v345 valid quality scenario 68 SA mode 7** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **75. v345 valid quality scenario 75 CA mode 14** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **87. v345 valid quality scenario 87 UK mode 6** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **88. v345 valid quality scenario 88 SA mode 7** — low lunch template variety 3 | cottage cheese lunch appears 4 times
- **95. v345 valid quality scenario 95 CA mode 14** — low lunch template variety 3 | cottage cheese lunch appears 4 times

## Warning rows

- **7. v345 valid quality scenario 7 UK mode 6** — Day 6: eggs snack repeats lunch/dinner protein.
- **8. v345 valid quality scenario 8 SA mode 7** — Day 6: eggs snack repeats lunch/dinner protein.
- **15. v345 valid quality scenario 15 CA mode 14** — Day 6: eggs snack repeats lunch/dinner protein.
- **27. v345 valid quality scenario 27 UK mode 6** — Day 6: eggs snack repeats lunch/dinner protein.
- **28. v345 valid quality scenario 28 SA mode 7** — Day 6: eggs snack repeats lunch/dinner protein.
- **35. v345 valid quality scenario 35 CA mode 14** — Day 6: eggs snack repeats lunch/dinner protein.
- **47. v345 valid quality scenario 47 UK mode 6** — Day 6: eggs snack repeats lunch/dinner protein.
- **48. v345 valid quality scenario 48 SA mode 7** — Day 6: eggs snack repeats lunch/dinner protein.
- **55. v345 valid quality scenario 55 CA mode 14** — Day 6: eggs snack repeats lunch/dinner protein.
- **67. v345 valid quality scenario 67 UK mode 6** — Day 6: eggs snack repeats lunch/dinner protein.
- **68. v345 valid quality scenario 68 SA mode 7** — Day 6: eggs snack repeats lunch/dinner protein.
- **75. v345 valid quality scenario 75 CA mode 14** — Day 6: eggs snack repeats lunch/dinner protein.
- **87. v345 valid quality scenario 87 UK mode 6** — Day 6: eggs snack repeats lunch/dinner protein.
- **88. v345 valid quality scenario 88 SA mode 7** — Day 6: eggs snack repeats lunch/dinner protein.
- **95. v345 valid quality scenario 95 CA mode 14** — Day 6: eggs snack repeats lunch/dinner protein.