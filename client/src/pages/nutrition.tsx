import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import NutritionTracker from "@/components/NutritionTracker";
import { 
  Apple, 
  Flame, 
  Droplets, 
  Target, 
  Plus, 
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { NutritionPlan, NutritionLog, FitnessGoal } from "@/types";

interface NutritionFormData {
  fitnessGoal: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  dietaryRestrictions: string[];
  mealsPerDay: number;
}

export default function Nutrition() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(0);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<NutritionFormData>({
    fitnessGoal: FitnessGoal.GENERAL_FITNESS,
    dailyCalories: 2200,
    dailyProtein: 150,
    dailyCarbs: 220,
    dailyFats: 85,
    dietaryRestrictions: [],
    mealsPerDay: 3,
  });

  // Get active nutrition plan
  const { data: activePlan } = useQuery({
    queryKey: ['/api/nutrition-plans/active'],
    retry: false,
  });

  // Get today's nutrition log
  const { data: todaysLog, refetch: refetchLog } = useQuery({
    queryKey: [`/api/nutrition-logs/${today}`],
    retry: false,
  });

  // Create nutrition plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: NutritionFormData) => {
      const response = await apiRequest('POST', '/api/nutrition-plans', {
        ...data,
        isActive: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition-plans/active'] });
      setShowPlanForm(false);
      toast({
        title: "Success!",
        description: "Your nutrition plan has been generated and activated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create nutrition plan",
        variant: "destructive",
      });
    },
  });

  // Update nutrition log mutation
  const updateLogMutation = useMutation({
    mutationFn: async (logData: Partial<NutritionLog>) => {
      const response = await apiRequest('POST', '/api/nutrition-logs', {
        date: new Date(today),
        ...logData
      });
      return response.json();
    },
    onSuccess: () => {
      refetchLog();
      toast({
        title: "Updated!",
        description: "Your nutrition log has been updated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update nutrition log",
        variant: "destructive",
      });
    },
  });

  // Initialize water glasses from today's log
  useEffect(() => {
    if (todaysLog?.waterGlasses) {
      setWaterGlasses(todaysLog.waterGlasses);
    }
  }, [todaysLog]);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate(formData);
  };

  const handleAddWater = () => {
    const newCount = Math.min(waterGlasses + 1, 8);
    setWaterGlasses(newCount);
    updateLogMutation.mutate({
      waterGlasses: newCount,
      calories: todaysLog?.calories || 0,
      protein: todaysLog?.protein || 0,
      carbs: todaysLog?.carbs || 0,
      fats: todaysLog?.fats || 0,
    });
  };

  const handleNutritionUpdate = (nutrition: { calories: number; protein: number; carbs: number; fats: number }) => {
    updateLogMutation.mutate({
      ...nutrition,
      waterGlasses: todaysLog?.waterGlasses || waterGlasses,
    });
  };

  // Calculate percentages for current plan
  const currentCalories = todaysLog?.calories || 0;
  const currentProtein = todaysLog?.protein || 0;
  const currentCarbs = todaysLog?.carbs || 0;
  const currentFats = todaysLog?.fats || 0;

  const targetCalories = activePlan?.dailyCalories || 2200;
  const targetProtein = activePlan?.dailyProtein || 150;
  const targetCarbs = activePlan?.dailyCarbs || 220;
  const targetFats = activePlan?.dailyFats || 85;

  const caloriesPercent = (currentCalories / targetCalories) * 100;
  const proteinPercent = (currentProtein / targetProtein) * 100;
  const carbsPercent = (currentCarbs / targetCarbs) * 100;
  const fatsPercent = (currentFats / targetFats) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Nutrition Planner</h1>
        <p className="text-slate-400">AI-powered meal planning tailored to your fitness goals</p>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 flex items-center">
                <Flame className="h-4 w-4 mr-2 text-orange-500" />
                Calories
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {currentCalories}
              <span className="text-lg text-slate-400">/{targetCalories}</span>
            </div>
            <Progress value={Math.min(caloriesPercent, 100)} className="h-2" />
            <p className="text-xs text-slate-400 mt-1">{Math.round(caloriesPercent)}% of goal</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Protein</span>
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {currentProtein}g
              <span className="text-lg text-slate-400">/{targetProtein}g</span>
            </div>
            <Progress value={Math.min(proteinPercent, 100)} className="h-2" />
            <p className="text-xs text-slate-400 mt-1">{Math.round(proteinPercent)}% of goal</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Carbs</span>
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {currentCarbs}g
              <span className="text-lg text-slate-400">/{targetCarbs}g</span>
            </div>
            <Progress value={Math.min(carbsPercent, 100)} className="h-2" />
            <p className="text-xs text-slate-400 mt-1">{Math.round(carbsPercent)}% of goal</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Fats</span>
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {currentFats}g
              <span className="text-lg text-slate-400">/{targetFats}g</span>
            </div>
            <Progress value={Math.min(fatsPercent, 100)} className="h-2" />
            <p className="text-xs text-slate-400 mt-1">{Math.round(fatsPercent)}% of goal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          
          {/* Active Plan Display */}
          {activePlan ? (
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100">{activePlan.title}</CardTitle>
                  <p className="text-slate-400">Active nutrition plan</p>
                </div>
                <Button 
                  onClick={() => setShowPlanForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate New Plan
                </Button>
              </CardHeader>
              <CardContent>
                {activePlan.meals && (
                  <div className="space-y-6">
                    {/* Breakfast */}
                    {activePlan.meals.breakfast && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-orange-500" />
                          Breakfast
                        </h3>
                        <div className="space-y-3">
                          {activePlan.meals.breakfast.map((meal: any, index: number) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg">
                              <div className="w-16 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                                <Apple className="h-6 w-6 text-slate-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-100">{meal.name}</h4>
                                <p className="text-sm text-slate-400 mb-2">
                                  {meal.ingredients?.join(', ')}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span>{meal.calories} cal</span>
                                  <span>{meal.protein}g protein</span>
                                  <span>{meal.carbs}g carbs</span>
                                  <span>{meal.fats}g fat</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lunch */}
                    {activePlan.meals.lunch && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                          Lunch
                        </h3>
                        <div className="space-y-3">
                          {activePlan.meals.lunch.map((meal: any, index: number) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg">
                              <div className="w-16 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                                <Apple className="h-6 w-6 text-slate-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-100">{meal.name}</h4>
                                <p className="text-sm text-slate-400 mb-2">
                                  {meal.ingredients?.join(', ')}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span>{meal.calories} cal</span>
                                  <span>{meal.protein}g protein</span>
                                  <span>{meal.carbs}g carbs</span>
                                  <span>{meal.fats}g fat</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dinner */}
                    {activePlan.meals.dinner && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-blue-500" />
                          Dinner
                        </h3>
                        <div className="space-y-3">
                          {activePlan.meals.dinner.map((meal: any, index: number) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg">
                              <div className="w-16 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                                <Apple className="h-6 w-6 text-slate-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-100">{meal.name}</h4>
                                <p className="text-sm text-slate-400 mb-2">
                                  {meal.ingredients?.join(', ')}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span>{meal.calories} cal</span>
                                  <span>{meal.protein}g protein</span>
                                  <span>{meal.carbs}g carbs</span>
                                  <span>{meal.fats}g fat</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardContent className="p-12 text-center">
                <Apple className="mx-auto h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-100 mb-2">No Active Nutrition Plan</h3>
                <p className="text-slate-400 mb-6">Create an AI-generated nutrition plan tailored to your fitness goals.</p>
                <Button 
                  onClick={() => setShowPlanForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Nutrition Plan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Plan Creation Form */}
          {showPlanForm && (
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center">
                  <Sparkles className="mr-2 h-6 w-6 text-primary" />
                  AI Nutrition Plan Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fitnessGoal" className="text-slate-300">Fitness Goal</Label>
                      <Select
                        value={formData.fitnessGoal}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fitnessGoal: value }))}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(FitnessGoal).map(goal => (
                            <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dailyCalories" className="text-slate-300">Daily Calories</Label>
                      <Input
                        type="number"
                        value={formData.dailyCalories}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyCalories: parseInt(e.target.value) }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailyProtein" className="text-slate-300">Daily Protein (g)</Label>
                      <Input
                        type="number"
                        value={formData.dailyProtein}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyProtein: parseInt(e.target.value) }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailyCarbs" className="text-slate-300">Daily Carbs (g)</Label>
                      <Input
                        type="number"
                        value={formData.dailyCarbs}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyCarbs: parseInt(e.target.value) }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailyFats" className="text-slate-300">Daily Fats (g)</Label>
                      <Input
                        type="number"
                        value={formData.dailyFats}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyFats: parseInt(e.target.value) }))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mealsPerDay" className="text-slate-300">Meals Per Day</Label>
                      <Select
                        value={formData.mealsPerDay.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mealsPerDay: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meals</SelectItem>
                          <SelectItem value="4">4 meals</SelectItem>
                          <SelectItem value="5">5 meals</SelectItem>
                          <SelectItem value="6">6 meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={createPlanMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createPlanMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Plan
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPlanForm(false)}
                      className="border-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Nutrition Tracker */}
          <NutritionTracker onNutritionUpdate={handleNutritionUpdate} />

          {/* Water Intake */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Droplets className="mr-2 h-5 w-5 text-blue-500" />
                Water Intake
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-500">{waterGlasses}</div>
                <div className="text-slate-400">of 8 glasses</div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center ${
                      index < waterGlasses 
                        ? 'bg-blue-500/30 border-2 border-blue-500' 
                        : 'bg-slate-700 border-2 border-slate-600'
                    }`}
                  >
                    <Droplets className={`h-4 w-4 ${
                      index < waterGlasses ? 'text-blue-400' : 'text-slate-600'
                    }`} />
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleAddWater}
                disabled={waterGlasses >= 8 || updateLogMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Glass
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-500" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-xl font-bold text-green-500">
                  {activePlan?.fitnessGoal || "Set Your Goal"}
                </div>
                <div className="text-slate-400 text-sm">Nutrition Focus</div>
              </div>
              {activePlan && (
                <>
                  <div className="bg-slate-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-400 text-center">
                    {Math.round(caloriesPercent)}% of daily calories
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
