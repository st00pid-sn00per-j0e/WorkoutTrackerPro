import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set. Please ensure it is configured.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

interface WorkoutFormData {
  fitnessGoal: string;
  experienceLevel: string;
  daysPerWeek: number;
  duration: string;
  equipment: string[];
  muscleGroups?: string[];
  injuries?: string;
}

interface NutritionFormData {
  fitnessGoal: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  dietaryRestrictions?: string[];
  mealsPerDay?: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface Activity {
  name: string;
  duration: string;
}

interface DailyWorkout {
  day: string;
  focus: string;
  warmUp: Activity[];
  exercises: Exercise[];
  coolDown: Activity[];
}

interface GeneratedWorkoutPlan {
  plan: DailyWorkout[];
  notes?: string;
}

interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  instructions?: string;
}

interface DailyMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks?: Meal[];
}

interface GeneratedNutritionPlan {
  meals: DailyMeals;
  weeklyVariations?: DailyMeals[];
}

function buildWorkoutPrompt(formData: WorkoutFormData): string {
  const equipmentList = formData.equipment.length > 0 ? formData.equipment.join(', ') : 'Bodyweight only';
  const muscleGroupsList = formData.muscleGroups && formData.muscleGroups.length > 0 ? formData.muscleGroups.join(', ') : 'General full body or as appropriate for the goal';
  const injuriesInfo = formData.injuries ? formData.injuries : 'None specified';

  return `
You are an expert fitness planner AI called FitForge. Your goal is to generate a personalized workout plan in JSON format based on the user's preferences.

User Preferences:
- Fitness Goal: ${formData.fitnessGoal}
- Experience Level: ${formData.experienceLevel}
- Days Per Week: ${formData.daysPerWeek}
- Workout Duration Preference: ${formData.duration} (adjust exercise volume accordingly)
- Available Equipment: ${equipmentList}
- Specific Muscle Groups to Focus On (Optional): ${muscleGroupsList}
- Injuries or Limitations (Optional): ${injuriesInfo}

JSON Output Structure:
The JSON response MUST strictly follow this structure:
{
  "workoutPlan": {
    "plan": [
      {
        "day": "Day 1",
        "focus": "e.g., Chest & Triceps",
        "warmUp": [
          {"name": "Jumping Jacks", "duration": "2-3 minutes"},
          {"name": "Dynamic Chest Stretches", "duration": "1-2 minutes"}
        ],
        "exercises": [
          {"name": "Push-ups", "sets": 3, "reps": "8-12", "rest": "60-90s"},
          {"name": "Dumbbell Bench Press", "sets": 3, "reps": "8-12", "rest": "60-90s"}
        ],
        "coolDown": [
          {"name": "Static Chest Stretch", "duration": "30-60s per side"},
          {"name": "Triceps Stretch", "duration": "30-60s per side"}
        ]
      }
    ],
    "notes": "Optional: Add any general advice, tips for progression, or important considerations here."
  }
}

Important Instructions:
1. The root of the JSON response must be an object with a single key "workoutPlan".
2. "workoutPlan.plan" must be an array of daily workout objects.
3. Each daily workout object must include "day", "focus", "warmUp" (array), "exercises" (array), and "coolDown" (array).
4. For "exercises": "sets" must be a number. "reps" and "rest" must be strings.
5. For "warmUp" and "coolDown" activities: "name" and "duration" must be strings.
6. Tailor the number of exercises and their intensity to the user's experience level and preferred workout duration.
7. If specific muscle groups are requested, prioritize them in the plan.
8. Ensure the plan uses the available equipment effectively.
9. The total number of workout days in the "plan" array must match the user's "Days Per Week" input.
10. Consider any injuries or limitations when selecting exercises.
`;
}

function buildNutritionPrompt(formData: NutritionFormData): string {
  const restrictionsList = formData.dietaryRestrictions && formData.dietaryRestrictions.length > 0 
    ? formData.dietaryRestrictions.join(', ') 
    : 'None specified';

  return `
You are an expert nutrition planner AI called FitForge. Your goal is to generate a personalized daily nutrition plan in JSON format based on the user's requirements.

User Requirements:
- Fitness Goal: ${formData.fitnessGoal}
- Daily Calories: ${formData.dailyCalories}
- Daily Protein: ${formData.dailyProtein}g
- Daily Carbs: ${formData.dailyCarbs}g
- Daily Fats: ${formData.dailyFats}g
- Dietary Restrictions: ${restrictionsList}
- Meals Per Day: ${formData.mealsPerDay || 3}

JSON Output Structure:
The JSON response MUST strictly follow this structure:
{
  "nutritionPlan": {
    "meals": {
      "breakfast": [
        {
          "name": "Greek Yogurt with Berries",
          "ingredients": ["1 cup plain Greek yogurt", "1/2 cup mixed berries", "1 tbsp honey"],
          "calories": 250,
          "protein": 20,
          "carbs": 30,
          "fats": 8,
          "instructions": "Mix yogurt with berries and drizzle honey on top."
        }
      ],
      "lunch": [
        {
          "name": "Grilled Chicken Salad",
          "ingredients": ["6oz grilled chicken breast", "mixed greens", "cherry tomatoes", "cucumber", "olive oil dressing"],
          "calories": 400,
          "protein": 45,
          "carbs": 12,
          "fats": 18
        }
      ],
      "dinner": [
        {
          "name": "Baked Salmon with Quinoa",
          "ingredients": ["6oz salmon fillet", "1 cup cooked quinoa", "roasted vegetables"],
          "calories": 550,
          "protein": 42,
          "carbs": 38,
          "fats": 22
        }
      ],
      "snacks": [
        {
          "name": "Protein Smoothie",
          "ingredients": ["1 scoop whey protein", "1 banana", "1 cup almond milk"],
          "calories": 200,
          "protein": 25,
          "carbs": 20,
          "fats": 3
        }
      ]
    }
  }
}

Important Instructions:
1. Create meals that collectively meet the daily macro and calorie targets.
2. Include variety in protein sources, vegetables, and preparation methods.
3. Consider dietary restrictions when selecting ingredients.
4. Provide realistic portion sizes and ingredient lists.
5. Ensure each meal has balanced macronutrients appropriate for the fitness goal.
6. Include cooking instructions where helpful.
7. All numeric values (calories, protein, carbs, fats) must be numbers, not strings.
`;
}

export const generateWorkoutPlan = async (formData: WorkoutFormData): Promise<GeneratedWorkoutPlan> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Please check your GEMINI_API_KEY configuration.");
  }

  const prompt = buildWorkoutPrompt(formData);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text.trim();
    
    // Remove Markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (parsedData && parsedData.workoutPlan && Array.isArray(parsedData.workoutPlan.plan)) {
        return parsedData.workoutPlan;
      } else {
        console.error("Parsed JSON does not match expected structure:", parsedData);
        throw new Error("Received an unexpected data structure from the AI. The plan might be incomplete.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", e, "Raw response:", jsonStr);
      throw new Error("The AI returned an invalid plan format. Please try again, or adjust your inputs.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("Invalid API Key. Please ensure your GEMINI_API_KEY environment variable is set correctly.");
    }
    throw new Error(`Failed to generate workout plan. ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateNutritionPlan = async (formData: NutritionFormData): Promise<GeneratedNutritionPlan> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Please check your GEMINI_API_KEY configuration.");
  }

  const prompt = buildNutritionPrompt(formData);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text.trim();
    
    // Remove Markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (parsedData && parsedData.nutritionPlan && parsedData.nutritionPlan.meals) {
        return parsedData.nutritionPlan;
      } else {
        console.error("Parsed JSON does not match expected structure:", parsedData);
        throw new Error("Received an unexpected data structure from the AI. The nutrition plan might be incomplete.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", e, "Raw response:", jsonStr);
      throw new Error("The AI returned an invalid nutrition plan format. Please try again, or adjust your inputs.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("Invalid API Key. Please ensure your GEMINI_API_KEY environment variable is set correctly.");
    }
    throw new Error(`Failed to generate nutrition plan. ${error instanceof Error ? error.message : String(error)}`);
  }
};
