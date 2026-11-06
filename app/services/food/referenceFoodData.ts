// A small curated food base, values per 100 g, approximate (USDA FoodData Central,
// cooked where the name says so). Pages are written from it by createReferenceFoods.

export interface ReferenceFood {
  category: string;
  name: { en: string; ru: string };
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export const REFERENCE_FOODS: readonly ReferenceFood[] = [
  { category: "meat", name: { en: "Chicken breast, cooked", ru: "Куриная грудка, варёная" }, kcal: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
  { category: "meat", name: { en: "Chicken thigh, cooked, skinless", ru: "Куриное бедро без кожи, варёное" }, kcal: 209, protein: 26, fat: 10.9, carbs: 0, fiber: 0 },
  { category: "meat", name: { en: "Turkey breast, cooked", ru: "Грудка индейки, варёная" }, kcal: 135, protein: 30, fat: 0.7, carbs: 0, fiber: 0 },
  { category: "meat", name: { en: "Beef, lean, cooked", ru: "Говядина постная, варёная" }, kcal: 217, protein: 26, fat: 12, carbs: 0, fiber: 0 },
  { category: "meat", name: { en: "Pork loin, cooked", ru: "Свиная вырезка, варёная" }, kcal: 242, protein: 27, fat: 14, carbs: 0, fiber: 0 },
  { category: "fish", name: { en: "Salmon, cooked", ru: "Лосось, запечённый" }, kcal: 206, protein: 22, fat: 12, carbs: 0, fiber: 0 },
  { category: "fish", name: { en: "Cod, cooked", ru: "Треска, варёная" }, kcal: 105, protein: 23, fat: 0.9, carbs: 0, fiber: 0 },
  { category: "fish", name: { en: "Tuna, canned in water", ru: "Тунец консервированный в воде" }, kcal: 116, protein: 26, fat: 0.8, carbs: 0, fiber: 0 },
  { category: "fish", name: { en: "Shrimp, cooked", ru: "Креветки варёные" }, kcal: 99, protein: 24, fat: 0.3, carbs: 0.2, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Egg, whole, raw", ru: "Яйцо куриное, целое" }, kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Egg white", ru: "Яичный белок" }, kcal: 52, protein: 10.9, fat: 0.2, carbs: 0.7, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Cottage cheese 4%", ru: "Творог 4%" }, kcal: 98, protein: 11.1, fat: 4.3, carbs: 3.4, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Greek yogurt, nonfat", ru: "Греческий йогурт обезжиренный" }, kcal: 59, protein: 10.2, fat: 0.4, carbs: 3.6, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Milk 2%", ru: "Молоко 2%" }, kcal: 50, protein: 3.3, fat: 2, carbs: 4.8, fiber: 0 },
  { category: "dairy-eggs", name: { en: "Cheddar cheese", ru: "Сыр чеддер" }, kcal: 403, protein: 25, fat: 33, carbs: 1.3, fiber: 0 },
  { category: "grains", name: { en: "Oats, dry", ru: "Овсяные хлопья, сухие" }, kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6 },
  { category: "grains", name: { en: "Buckwheat, cooked", ru: "Гречка варёная" }, kcal: 92, protein: 3.4, fat: 0.6, carbs: 19.9, fiber: 2.7 },
  { category: "grains", name: { en: "White rice, cooked", ru: "Рис белый варёный" }, kcal: 130, protein: 2.7, fat: 0.3, carbs: 28.2, fiber: 0.4 },
  { category: "grains", name: { en: "Brown rice, cooked", ru: "Рис бурый варёный" }, kcal: 123, protein: 2.7, fat: 1, carbs: 25.6, fiber: 1.6 },
  { category: "grains", name: { en: "Pasta, cooked", ru: "Паста варёная" }, kcal: 158, protein: 5.8, fat: 0.9, carbs: 30.9, fiber: 1.8 },
  { category: "grains", name: { en: "Whole wheat bread", ru: "Хлеб цельнозерновой" }, kcal: 247, protein: 13, fat: 3.4, carbs: 41, fiber: 7 },
  { category: "vegetables", name: { en: "Potato, boiled", ru: "Картофель варёный" }, kcal: 87, protein: 1.9, fat: 0.1, carbs: 20.1, fiber: 1.8 },
  { category: "vegetables", name: { en: "Sweet potato, baked", ru: "Батат запечённый" }, kcal: 90, protein: 2, fat: 0.2, carbs: 20.7, fiber: 3.3 },
  { category: "vegetables", name: { en: "Broccoli, raw", ru: "Брокколи сырая" }, kcal: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6 },
  { category: "vegetables", name: { en: "Spinach, raw", ru: "Шпинат сырой" }, kcal: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2 },
  { category: "vegetables", name: { en: "Tomato", ru: "Помидор" }, kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
  { category: "vegetables", name: { en: "Cucumber", ru: "Огурец" }, kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5 },
  { category: "vegetables", name: { en: "Carrot, raw", ru: "Морковь сырая" }, kcal: 41, protein: 0.9, fat: 0.2, carbs: 9.6, fiber: 2.8 },
  { category: "vegetables", name: { en: "Cabbage, raw", ru: "Капуста белокочанная" }, kcal: 25, protein: 1.3, fat: 0.1, carbs: 5.8, fiber: 2.5 },
  { category: "legumes", name: { en: "Lentils, cooked", ru: "Чечевица варёная" }, kcal: 116, protein: 9, fat: 0.4, carbs: 20.1, fiber: 7.9 },
  { category: "legumes", name: { en: "Chickpeas, cooked", ru: "Нут варёный" }, kcal: 164, protein: 8.9, fat: 2.6, carbs: 27.4, fiber: 7.6 },
  { category: "legumes", name: { en: "Black beans, cooked", ru: "Чёрная фасоль варёная" }, kcal: 132, protein: 8.9, fat: 0.5, carbs: 23.7, fiber: 8.7 },
  { category: "legumes", name: { en: "Tofu, firm", ru: "Тофу плотный" }, kcal: 144, protein: 17.3, fat: 8.7, carbs: 2.8, fiber: 2.3 },
  { category: "fruit", name: { en: "Banana", ru: "Банан" }, kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8, fiber: 2.6 },
  { category: "fruit", name: { en: "Apple", ru: "Яблоко" }, kcal: 52, protein: 0.3, fat: 0.2, carbs: 13.8, fiber: 2.4 },
  { category: "fruit", name: { en: "Orange", ru: "Апельсин" }, kcal: 47, protein: 0.9, fat: 0.1, carbs: 11.8, fiber: 2.4 },
  { category: "fruit", name: { en: "Blueberries", ru: "Голубика" }, kcal: 57, protein: 0.7, fat: 0.3, carbs: 14.5, fiber: 2.4 },
  { category: "fruit", name: { en: "Avocado", ru: "Авокадо" }, kcal: 160, protein: 2, fat: 14.7, carbs: 8.5, fiber: 6.7 },
  { category: "nuts-fats", name: { en: "Almonds", ru: "Миндаль" }, kcal: 579, protein: 21.2, fat: 49.9, carbs: 21.6, fiber: 12.5 },
  { category: "nuts-fats", name: { en: "Walnuts", ru: "Грецкие орехи" }, kcal: 654, protein: 15.2, fat: 65.2, carbs: 13.7, fiber: 6.7 },
  { category: "nuts-fats", name: { en: "Peanut butter", ru: "Арахисовая паста" }, kcal: 588, protein: 25, fat: 50, carbs: 20, fiber: 6 },
  { category: "nuts-fats", name: { en: "Olive oil", ru: "Оливковое масло" }, kcal: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
  { category: "other", name: { en: "Whey protein powder (typical)", ru: "Сывороточный протеин (типичный)" }, kcal: 400, protein: 80, fat: 6, carbs: 8, fiber: 0 },
  { category: "other", name: { en: "Honey", ru: "Мёд" }, kcal: 304, protein: 0.3, fat: 0, carbs: 82.4, fiber: 0.2 },
  { category: "other", name: { en: "Dark chocolate 70%", ru: "Тёмный шоколад 70%" }, kcal: 598, protein: 7.8, fat: 42.6, carbs: 45.9, fiber: 10.9 },
];
