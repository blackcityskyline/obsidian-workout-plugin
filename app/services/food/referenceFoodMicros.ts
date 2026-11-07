// Vitamins and minerals per 100 g for the reference foods, from USDA SR28 (National Nutrient Database for
// Standard Reference, Release 28, ABBREV file; vitamin A as RAE, folate as total). The entry is the SR28
// food whose macros match the reference food (NDB number in the comment). A key is left out when SR28 has
// no value, never written as 0. Units: see the default nutrients (NutrientCatalog.ts).

export const REFERENCE_MICROS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  // NDB 05064: CHICKEN,BROILERS OR FRYERS,BREAST,MEAT ONLY,CKD,RSTD
  "Chicken breast, cooked": { vitamin_a: 6, vitamin_c: 0, vitamin_d: 0.1, vitamin_e: 0.27, vitamin_k: 0.3, vitamin_b1: 0.07, vitamin_b2: 0.114, vitamin_b3: 13.712, vitamin_b6: 0.6, vitamin_b9: 4, vitamin_b12: 0.34, calcium: 15, iron: 1.04, magnesium: 29, potassium: 256, zinc: 1, sodium: 74 },
  // NDB 05098: CHICKEN,BROILERS OR FRYERS,THIGH,MEAT ONLY,CKD,RSTD
  "Chicken thigh, cooked, skinless": { vitamin_a: 8, vitamin_c: 0, vitamin_d: 0.2, vitamin_e: 0.18, vitamin_k: 3.9, vitamin_b1: 0.096, vitamin_b2: 0.218, vitamin_b3: 6.208, vitamin_b6: 0.462, vitamin_b9: 5, vitamin_b12: 0.42, calcium: 9, iron: 1.13, magnesium: 24, potassium: 269, zinc: 1.92, sodium: 106 },
  // NDB 05711: TURKEY,RTL PARTS,BREAST,MEAT ONLY,CKD,RSTD
  "Turkey breast, cooked": { vitamin_a: 3, vitamin_c: 0, vitamin_d: 0.2, vitamin_e: 0.06, vitamin_k: 0, vitamin_b1: 0.043, vitamin_b2: 0.19, vitamin_b3: 11.75, vitamin_b6: 0.83, vitamin_b9: 9, vitamin_b12: 1.76, calcium: 14, iron: 0.97, magnesium: 28, potassium: 297, zinc: 1.52, sodium: 114 },
  // NDB 23540: BEEF,PLATE,SKIRT STEAK,LN & FAT,0" FAT,ALL GRDS,CKD,BRLD
  "Beef, lean, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_e: 0.1, vitamin_b1: 0.09, vitamin_b2: 0.191, vitamin_b3: 3.745, vitamin_b6: 0.321, vitamin_b9: 7, vitamin_b12: 3.72, calcium: 11, iron: 2.77, magnesium: 24, potassium: 289, zinc: 7.23, sodium: 75 },
  // NDB 10022: PORK,FRSH,LOIN,WHL,LN&FAT,CKD,BRLD
  "Pork loin, cooked": { vitamin_a: 2, vitamin_c: 0.6, vitamin_d: 1.3, vitamin_e: 0.29, vitamin_k: 0, vitamin_b1: 0.877, vitamin_b2: 0.321, vitamin_b3: 5.037, vitamin_b6: 0.464, vitamin_b9: 5, vitamin_b12: 0.7, calcium: 19, iron: 0.87, magnesium: 28, potassium: 423, zinc: 2.39, sodium: 62 },
  // NDB 15237: SALMON,ATLANTIC,FARMED,CKD,DRY HEAT
  "Salmon, cooked": { vitamin_a: 69, vitamin_c: 3.7, vitamin_d: 13.1, vitamin_e: 1.14, vitamin_k: 0.1, vitamin_b1: 0.34, vitamin_b2: 0.135, vitamin_b3: 8.045, vitamin_b6: 0.647, vitamin_b9: 34, vitamin_b12: 2.8, calcium: 15, iron: 0.34, magnesium: 30, potassium: 384, zinc: 0.43, sodium: 61 },
  // NDB 15016: COD,ATLANTIC,CKD,DRY HEAT
  "Cod, cooked": { vitamin_a: 14, vitamin_c: 1, vitamin_d: 1.2, vitamin_e: 0.81, vitamin_k: 0.1, vitamin_b1: 0.088, vitamin_b2: 0.079, vitamin_b3: 2.513, vitamin_b6: 0.283, vitamin_b9: 8, vitamin_b12: 1.05, calcium: 14, iron: 0.49, magnesium: 42, potassium: 244, zinc: 0.58, sodium: 78 },
  // NDB 15271: CRUSTACEANS,SHRIMP,CKD (NOT PREVIOUSLY FROZEN)
  "Shrimp, cooked": { calcium: 70, iron: 0.51, magnesium: 39, potassium: 259, zinc: 1.64, sodium: 111 },
  // NDB 01123: EGG,WHL,RAW,FRSH
  "Egg, whole, raw": { vitamin_a: 160, vitamin_c: 0, vitamin_d: 2, vitamin_e: 1.05, vitamin_k: 0.3, vitamin_b1: 0.04, vitamin_b2: 0.457, vitamin_b3: 0.075, vitamin_b6: 0.17, vitamin_b9: 47, vitamin_b12: 0.89, calcium: 56, iron: 1.75, magnesium: 12, potassium: 138, zinc: 1.29, sodium: 142 },
  // NDB 01124: EGG,WHITE,RAW,FRESH
  "Egg white": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0, vitamin_k: 0, vitamin_b1: 0.004, vitamin_b2: 0.439, vitamin_b3: 0.105, vitamin_b6: 0.005, vitamin_b9: 4, vitamin_b12: 0.09, calcium: 7, iron: 0.08, magnesium: 11, potassium: 163, zinc: 0.03, sodium: 166 },
  // NDB 01012: CHEESE,COTTAGE,CRMD,LRG OR SML CURD
  "Cottage cheese 4%": { vitamin_a: 37, vitamin_c: 0, vitamin_d: 0.1, vitamin_e: 0.08, vitamin_k: 0, vitamin_b1: 0.027, vitamin_b2: 0.163, vitamin_b3: 0.099, vitamin_b6: 0.046, vitamin_b9: 12, vitamin_b12: 0.43, calcium: 83, iron: 0.07, magnesium: 8, potassium: 104, zinc: 0.4, sodium: 364 },
  // NDB 01256: YOGURT,GREEK,PLN,NONFAT
  "Greek yogurt, nonfat": { vitamin_a: 1, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.01, vitamin_k: 0, vitamin_b1: 0.023, vitamin_b2: 0.278, vitamin_b3: 0.208, vitamin_b6: 0.063, vitamin_b9: 7, vitamin_b12: 0.75, calcium: 110, iron: 0.07, magnesium: 11, potassium: 141, zinc: 0.52, sodium: 36 },
  // NDB 01079: MILK,RED FAT,FLUID,2% MILKFAT,W/ ADDED VIT A & VITAMIN D
  "Milk 2%": { vitamin_a: 55, vitamin_c: 0.2, vitamin_d: 1.2, vitamin_e: 0.03, vitamin_k: 0.2, vitamin_b1: 0.039, vitamin_b2: 0.185, vitamin_b3: 0.092, vitamin_b6: 0.038, vitamin_b9: 5, vitamin_b12: 0.53, calcium: 120, iron: 0.02, magnesium: 11, potassium: 140, zinc: 0.48, sodium: 47 },
  // NDB 01009: CHEESE,CHEDDAR
  "Cheddar cheese": { vitamin_a: 330, vitamin_c: 0, vitamin_d: 0.6, vitamin_e: 0.71, vitamin_k: 2.4, vitamin_b1: 0.029, vitamin_b2: 0.428, vitamin_b3: 0.059, vitamin_b6: 0.066, vitamin_b9: 27, vitamin_b12: 1.1, calcium: 710, iron: 0.14, magnesium: 27, potassium: 76, zinc: 3.64, sodium: 653 },
  // NDB 20038: OATS
  "Oats, dry": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_b1: 0.763, vitamin_b2: 0.139, vitamin_b3: 0.961, vitamin_b6: 0.119, vitamin_b9: 56, vitamin_b12: 0, calcium: 54, iron: 4.72, magnesium: 177, potassium: 429, zinc: 3.97, sodium: 2 },
  // NDB 20010: BUCKWHEAT GROATS,RSTD,CKD
  "Buckwheat, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.09, vitamin_k: 1.9, vitamin_b1: 0.04, vitamin_b2: 0.039, vitamin_b3: 0.94, vitamin_b6: 0.077, vitamin_b9: 14, vitamin_b12: 0, calcium: 7, iron: 0.8, magnesium: 51, potassium: 88, zinc: 0.61, sodium: 4 },
  // NDB 20045: RICE,WHITE,LONG-GRAIN,REG,ENR,CKD
  "White rice, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.04, vitamin_k: 0, vitamin_b1: 0.163, vitamin_b2: 0.013, vitamin_b3: 1.476, vitamin_b6: 0.093, vitamin_b9: 58, vitamin_b12: 0, calcium: 10, iron: 1.2, magnesium: 12, potassium: 35, zinc: 0.49, sodium: 1 },
  // NDB 20037: RICE,BROWN,LONG-GRAIN,CKD
  "Brown rice, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.17, vitamin_k: 0.2, vitamin_b1: 0.178, vitamin_b2: 0.069, vitamin_b3: 2.561, vitamin_b6: 0.123, vitamin_b9: 9, vitamin_b12: 0, calcium: 3, iron: 0.56, magnesium: 39, potassium: 86, zinc: 0.71, sodium: 4 },
  // NDB 20121: PASTA,CKD,ENR,WO/ ADDED SALT
  "Pasta, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.06, vitamin_k: 0, vitamin_b1: 0.274, vitamin_b2: 0.136, vitamin_b3: 1.689, vitamin_b6: 0.049, vitamin_b9: 73, vitamin_b12: 0, calcium: 7, iron: 1.28, magnesium: 18, potassium: 44, zinc: 0.51, sodium: 1 },
  // NDB 18075: BREAD,WHOLE-WHEAT,COMM. PREPARED
  "Whole wheat bread": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 2.66, vitamin_k: 7.8, vitamin_b1: 0.394, vitamin_b2: 0.167, vitamin_b3: 4.438, vitamin_b6: 0.215, vitamin_b9: 42, vitamin_b12: 0, calcium: 161, iron: 2.47, magnesium: 75, potassium: 254, zinc: 1.77, sodium: 455 },
  // NDB 11508: SWEET POTATO,CKD,BKD IN SKN,FLESH,WO/ SALT
  "Sweet potato, baked": { vitamin_a: 961, vitamin_c: 19.6, vitamin_d: 0, vitamin_e: 0.71, vitamin_k: 2.3, vitamin_b1: 0.107, vitamin_b2: 0.106, vitamin_b3: 1.487, vitamin_b6: 0.286, vitamin_b9: 6, vitamin_b12: 0, calcium: 38, iron: 0.69, magnesium: 27, potassium: 475, zinc: 0.32, sodium: 36 },
  // NDB 11090: BROCCOLI,RAW
  "Broccoli, raw": { vitamin_a: 31, vitamin_c: 89.2, vitamin_d: 0, vitamin_e: 0.78, vitamin_k: 101.6, vitamin_b1: 0.071, vitamin_b2: 0.117, vitamin_b3: 0.639, vitamin_b6: 0.175, vitamin_b9: 63, vitamin_b12: 0, calcium: 47, iron: 0.73, magnesium: 21, potassium: 316, zinc: 0.41, sodium: 33 },
  // NDB 11457: SPINACH,RAW
  "Spinach, raw": { vitamin_a: 469, vitamin_c: 28.1, vitamin_d: 0, vitamin_e: 2.03, vitamin_k: 482.9, vitamin_b1: 0.078, vitamin_b2: 0.189, vitamin_b3: 0.724, vitamin_b6: 0.195, vitamin_b9: 194, vitamin_b12: 0, calcium: 99, iron: 2.71, magnesium: 79, potassium: 558, zinc: 0.53, sodium: 79 },
  // NDB 11529: TOMATOES,RED,RIPE,RAW,YEAR RND AVERAGE
  "Tomato": { vitamin_a: 42, vitamin_c: 13.7, vitamin_d: 0, vitamin_e: 0.54, vitamin_k: 7.9, vitamin_b1: 0.037, vitamin_b2: 0.019, vitamin_b3: 0.594, vitamin_b6: 0.08, vitamin_b9: 15, vitamin_b12: 0, calcium: 10, iron: 0.27, magnesium: 11, potassium: 237, zinc: 0.17, sodium: 5 },
  // NDB 11205: CUCUMBER,WITH PEEL,RAW
  "Cucumber": { vitamin_a: 5, vitamin_c: 2.8, vitamin_d: 0, vitamin_e: 0.03, vitamin_k: 16.4, vitamin_b1: 0.027, vitamin_b2: 0.033, vitamin_b3: 0.098, vitamin_b6: 0.04, vitamin_b9: 7, vitamin_b12: 0, calcium: 16, iron: 0.28, magnesium: 13, potassium: 147, zinc: 0.2, sodium: 2 },
  // NDB 11124: CARROTS,RAW
  "Carrot, raw": { vitamin_a: 835, vitamin_c: 5.9, vitamin_d: 0, vitamin_e: 0.66, vitamin_k: 13.2, vitamin_b1: 0.066, vitamin_b2: 0.058, vitamin_b3: 0.983, vitamin_b6: 0.138, vitamin_b9: 19, vitamin_b12: 0, calcium: 33, iron: 0.3, magnesium: 12, potassium: 320, zinc: 0.24, sodium: 69 },
  // NDB 11109: CABBAGE,RAW
  "Cabbage, raw": { vitamin_a: 5, vitamin_c: 36.6, vitamin_d: 0, vitamin_e: 0.15, vitamin_k: 76, vitamin_b1: 0.061, vitamin_b2: 0.04, vitamin_b3: 0.234, vitamin_b6: 0.124, vitamin_b9: 43, vitamin_b12: 0, calcium: 40, iron: 0.47, magnesium: 12, potassium: 170, zinc: 0.18, sodium: 18 },
  // NDB 16070: LENTILS,MATURE SEEDS,CKD,BLD,WO/SALT
  "Lentils, cooked": { vitamin_a: 0, vitamin_c: 1.5, vitamin_d: 0, vitamin_e: 0.11, vitamin_k: 1.7, vitamin_b1: 0.169, vitamin_b2: 0.073, vitamin_b3: 1.06, vitamin_b6: 0.178, vitamin_b9: 181, vitamin_b12: 0, calcium: 19, iron: 3.33, magnesium: 36, potassium: 369, zinc: 1.27, sodium: 2 },
  // NDB 16057: CHICKPEAS ,MATURE SEEDS,CKD,BLD,WO/SALT
  "Chickpeas, cooked": { vitamin_a: 1, vitamin_c: 1.3, vitamin_d: 0, vitamin_e: 0.35, vitamin_k: 4, vitamin_b1: 0.116, vitamin_b2: 0.063, vitamin_b3: 0.526, vitamin_b6: 0.139, vitamin_b9: 172, vitamin_b12: 0, calcium: 49, iron: 2.89, magnesium: 48, potassium: 291, zinc: 1.53, sodium: 7 },
  // NDB 16015: BEANS,BLACK,MATURE SEEDS,CKD,BLD,WO/SALT
  "Black beans, cooked": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0.87, vitamin_k: 3.3, vitamin_b1: 0.244, vitamin_b2: 0.059, vitamin_b3: 0.505, vitamin_b6: 0.069, vitamin_b9: 149, vitamin_b12: 0, calcium: 27, iron: 2.1, magnesium: 70, potassium: 355, zinc: 1.12, sodium: 1 },
  // NDB 16426: TOFU,RAW,FIRM,PREP W/CA SULFATE
  "Tofu, firm": { vitamin_c: 0.2, vitamin_d: 0, vitamin_b1: 0.158, vitamin_b2: 0.102, vitamin_b3: 0.381, vitamin_b6: 0.092, vitamin_b9: 29, vitamin_b12: 0, calcium: 683, iron: 2.66, magnesium: 58, potassium: 237, zinc: 1.57, sodium: 14 },
  // NDB 09040: BANANAS,RAW
  "Banana": { vitamin_a: 3, vitamin_c: 8.7, vitamin_d: 0, vitamin_e: 0.1, vitamin_k: 0.5, vitamin_b1: 0.031, vitamin_b2: 0.073, vitamin_b3: 0.665, vitamin_b6: 0.367, vitamin_b9: 20, vitamin_b12: 0, calcium: 5, iron: 0.26, magnesium: 27, potassium: 358, zinc: 0.15, sodium: 1 },
  // NDB 09003: APPLES,RAW,WITH SKIN
  "Apple": { vitamin_a: 3, vitamin_c: 4.6, vitamin_d: 0, vitamin_e: 0.18, vitamin_k: 2.2, vitamin_b1: 0.017, vitamin_b2: 0.026, vitamin_b3: 0.091, vitamin_b6: 0.041, vitamin_b9: 3, vitamin_b12: 0, calcium: 6, iron: 0.12, magnesium: 5, potassium: 107, zinc: 0.04, sodium: 1 },
  // NDB 09200: ORANGES,RAW,ALL COMM VAR
  "Orange": { vitamin_a: 11, vitamin_c: 53.2, vitamin_d: 0, vitamin_e: 0.18, vitamin_k: 0, vitamin_b1: 0.087, vitamin_b2: 0.04, vitamin_b3: 0.282, vitamin_b6: 0.06, vitamin_b9: 30, vitamin_b12: 0, calcium: 40, iron: 0.1, magnesium: 10, potassium: 181, zinc: 0.07, sodium: 0 },
  // NDB 09050: BLUEBERRIES,RAW
  "Blueberries": { vitamin_a: 3, vitamin_c: 9.7, vitamin_d: 0, vitamin_e: 0.57, vitamin_k: 19.3, vitamin_b1: 0.037, vitamin_b2: 0.041, vitamin_b3: 0.418, vitamin_b6: 0.052, vitamin_b9: 6, vitamin_b12: 0, calcium: 6, iron: 0.28, magnesium: 6, potassium: 77, zinc: 0.16, sodium: 1 },
  // NDB 09037: AVOCADOS,RAW,ALL COMM VAR
  "Avocado": { vitamin_a: 7, vitamin_c: 10, vitamin_d: 0, vitamin_e: 2.07, vitamin_k: 21, vitamin_b1: 0.067, vitamin_b2: 0.13, vitamin_b3: 1.738, vitamin_b6: 0.257, vitamin_b9: 81, vitamin_b12: 0, calcium: 12, iron: 0.55, magnesium: 29, potassium: 485, zinc: 0.64, sodium: 7 },
  // NDB 12061: ALMONDS
  "Almonds": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 25.63, vitamin_k: 0, vitamin_b1: 0.205, vitamin_b2: 1.138, vitamin_b3: 3.618, vitamin_b6: 0.137, vitamin_b9: 44, vitamin_b12: 0, calcium: 269, iron: 3.71, magnesium: 270, potassium: 733, zinc: 3.12, sodium: 1 },
  // NDB 12155: WALNUTS,ENGLISH
  "Walnuts": { vitamin_a: 1, vitamin_c: 1.3, vitamin_d: 0, vitamin_e: 0.7, vitamin_k: 2.7, vitamin_b1: 0.341, vitamin_b2: 0.15, vitamin_b3: 1.125, vitamin_b6: 0.537, vitamin_b9: 98, vitamin_b12: 0, calcium: 98, iron: 2.91, magnesium: 158, potassium: 441, zinc: 3.09, sodium: 2 },
  // NDB 16098: PEANUT BUTTER,SMOOTH STYLE,W/ SALT
  "Peanut butter": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 9.1, vitamin_k: 0.3, vitamin_b1: 0.15, vitamin_b2: 0.192, vitamin_b3: 13.112, vitamin_b6: 0.441, vitamin_b9: 87, vitamin_b12: 0, calcium: 49, iron: 1.74, magnesium: 168, potassium: 558, zinc: 2.51, sodium: 426 },
  // NDB 04053: OIL,OLIVE,SALAD OR COOKING
  "Olive oil": { vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 14.35, vitamin_k: 60.2, vitamin_b1: 0, vitamin_b2: 0, vitamin_b3: 0, vitamin_b6: 0, vitamin_b9: 0, vitamin_b12: 0, calcium: 1, iron: 0.56, magnesium: 0, potassium: 1, zinc: 0, sodium: 2 },
  // NDB 19296: HONEY
  "Honey": { vitamin_a: 0, vitamin_c: 0.5, vitamin_d: 0, vitamin_e: 0, vitamin_k: 0, vitamin_b1: 0, vitamin_b2: 0.038, vitamin_b3: 0.121, vitamin_b6: 0.024, vitamin_b9: 2, vitamin_b12: 0, calcium: 6, iron: 0.42, magnesium: 2, potassium: 52, zinc: 0.22, sodium: 4 },
  // NDB 19904: CHOCOLATE,DK,70-85% CACAO SOL
  "Dark chocolate 70%": { vitamin_a: 2, vitamin_e: 0.59, vitamin_k: 7.3, vitamin_b1: 0.034, vitamin_b2: 0.078, vitamin_b3: 1.054, vitamin_b6: 0.038, vitamin_b12: 0.28, calcium: 73, iron: 11.9, magnesium: 228, potassium: 715, zinc: 3.31, sodium: 20 },
  // NDB 15184: TUNA,LT,CND IN H2O,WO/SALT,DRND SOL
  "Tuna, canned in water": { vitamin_c: 0, vitamin_b1: 0.032, vitamin_b2: 0.074, vitamin_b3: 13.28, vitamin_b6: 0.35, vitamin_b9: 4, vitamin_b12: 2.99, calcium: 11, iron: 1.53, magnesium: 27, potassium: 237, zinc: 0.77, sodium: 50 },
  // NDB 11365: POTATOES,BLD,CKD IN SKN,FLESH,WO/SALT
  "Potato, boiled": { vitamin_a: 0, vitamin_c: 13, vitamin_d: 0, vitamin_e: 0.01, vitamin_k: 2.2, vitamin_b1: 0.106, vitamin_b2: 0.02, vitamin_b3: 1.439, vitamin_b6: 0.299, vitamin_b9: 10, vitamin_b12: 0, calcium: 5, iron: 0.31, magnesium: 22, potassium: 379, zinc: 0.3, sodium: 4 },
};
