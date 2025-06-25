import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Apple, X } from "lucide-react";

interface NutritionTrackerProps {
  onNutritionUpdate: (nutrition: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
}

// Mock food database - in real app this would come from an API
const FOOD_DATABASE: FoodItem[] = [
  { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "100g" },
  { name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fats: 1.8, serving: "1 cup cooked" },
  { name: "Broccoli (1 cup)", calories: 25, protein: 3, carbs: 5, fats: 0.3, serving: "1 cup chopped" },
  { name: "Salmon (100g)", calories: 208, protein: 22, carbs: 0, fats: 13, serving: "100g" },
  { name: "Sweet Potato (medium)", calories: 112, protein: 2, carbs: 26, fats: 0.1, serving: "1 medium" },
  { name: "Greek Yogurt (1 cup)", calories: 130, protein: 23, carbs: 9, fats: 0, serving: "1 cup plain" },
  { name: "Almonds (1 oz)", calories: 164, protein: 6, carbs: 6, fats: 14, serving: "1 oz (23 nuts)" },
  { name: "Banana (medium)", calories: 105, protein: 1, carbs: 27, fats: 0.3, serving: "1 medium" },
  { name: "Oatmeal (1 cup)", calories: 147, protein: 5, carbs: 25, fats: 3, serving: "1 cup cooked" },
  { name: "Eggs (large)", calories: 70, protein: 6, carbs: 0.6, fats: 5, serving: "1 large egg" },
];

export default function NutritionTracker({ onNutritionUpdate }: NutritionTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<(FoodItem & { quantity: number; id: string })[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFood = (food: FoodItem, quantity = 1) => {
    const newFood = {
      ...food,
      quantity,
      id: Date.now().toString() + Math.random().toString(36),
    };
    
    setSelectedFoods(prev => [...prev, newFood]);
    updateNutrition([...selectedFoods, newFood]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeFood = (id: string) => {
    const updatedFoods = selectedFoods.filter(food => food.id !== id);
    setSelectedFoods(updatedFoods);
    updateNutrition(updatedFoods);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFood(id);
      return;
    }
    
    const updatedFoods = selectedFoods.map(food =>
      food.id === id ? { ...food, quantity } : food
    );
    setSelectedFoods(updatedFoods);
    updateNutrition(updatedFoods);
  };

  const updateNutrition = (foods: (FoodItem & { quantity: number })[] = selectedFoods) => {
    const totals = foods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories * food.quantity),
        protein: acc.protein + (food.protein * food.quantity),
        carbs: acc.carbs + (food.carbs * food.quantity),
        fats: acc.fats + (food.fats * food.quantity),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    onNutritionUpdate({
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10,
    });
  };

  const addCustomFood = () => {
    if (!customFood.name || !customFood.calories) return;

    const food: FoodItem = {
      name: customFood.name,
      calories: parseFloat(customFood.calories) || 0,
      protein: parseFloat(customFood.protein) || 0,
      carbs: parseFloat(customFood.carbs) || 0,
      fats: parseFloat(customFood.fats) || 0,
      serving: "custom serving",
    };

    addFood(food);
    setCustomFood({ name: "", calories: "", protein: "", carbs: "", fats: "" });
  };

  const totalNutrition = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories * food.quantity),
      protein: acc.protein + (food.protein * food.quantity),
      carbs: acc.carbs + (food.carbs * food.quantity),
      fats: acc.fats + (food.fats * food.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center justify-between">
          <span className="flex items-center">
            <Apple className="mr-2 h-5 w-5 text-green-500" />
            Quick Add Food
          </span>
          <Button 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
            className="bg-primary hover:bg-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Search Interface */}
        {showSearch && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600"
              />
            </div>
            
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredFoods.map((food, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer"
                    onClick={() => addFood(food)}
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-100">{food.name}</div>
                      <div className="text-xs text-slate-400">
                        {food.calories} cal, {food.protein}g protein
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    <p>No foods found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Custom Food Entry */}
        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Add Custom Food</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Food name"
              value={customFood.name}
              onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-sm"
            />
            <Input
              type="number"
              placeholder="Calories"
              value={customFood.calories}
              onChange={(e) => setCustomFood(prev => ({ ...prev, calories: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Input
              type="number"
              placeholder="Protein (g)"
              value={customFood.protein}
              onChange={(e) => setCustomFood(prev => ({ ...prev, protein: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-sm"
            />
            <Input
              type="number"
              placeholder="Carbs (g)"
              value={customFood.carbs}
              onChange={(e) => setCustomFood(prev => ({ ...prev, carbs: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-sm"
            />
            <Input
              type="number"
              placeholder="Fats (g)"
              value={customFood.fats}
              onChange={(e) => setCustomFood(prev => ({ ...prev, fats: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-sm"
            />
          </div>
          <Button 
            onClick={addCustomFood}
            disabled={!customFood.name || !customFood.calories}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </Button>
        </div>

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Today's Foods</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-100">{food.name}</div>
                    <div className="text-xs text-slate-400">
                      {Math.round(food.calories * food.quantity)} cal, 
                      {Math.round(food.protein * food.quantity * 10) / 10}g protein
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={food.quantity}
                      onChange={(e) => updateQuantity(food.id, parseFloat(e.target.value) || 0)}
                      className="w-16 h-6 text-xs bg-slate-600 border-slate-500 text-center"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFood(food.id)}
                      className="h-6 w-6 p-0 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="mt-3 p-3 bg-slate-900 rounded">
              <div className="text-sm font-medium text-slate-100 mb-2">Daily Totals</div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-orange-400">{Math.round(totalNutrition.calories)}</div>
                  <div className="text-slate-400">calories</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-400">{Math.round(totalNutrition.protein * 10) / 10}g</div>
                  <div className="text-slate-400">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-400">{Math.round(totalNutrition.carbs * 10) / 10}g</div>
                  <div className="text-slate-400">carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-400">{Math.round(totalNutrition.fats * 10) / 10}g</div>
                  <div className="text-slate-400">fats</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedFoods.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <Apple className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No foods added yet</p>
            <p className="text-xs">Search or add custom foods above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
