
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WorkoutFormData, GeneratedWorkoutPlan, GeminiApiResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Please ensure it is configured.");
  // To prevent the app from completely crashing if API_KEY is missing during development,
  // we can throw an error here that will be caught by the UI.
  // In a production scenario, this might be handled differently (e.g. server-side check).
}


const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

function buildPrompt(formData: WorkoutFormData): string {
  const equipmentList = formData.equipment.length > 0 ? formData.equipment.join(', ') : 'Bodyweight only';
  const muscleGroupsList = formData.muscleGroups.length > 0 ? formData.muscleGroups.join(', ') : 'General full body or as appropriate for the goal';
  const injuriesInfo = formData.injuries ? formData.injuries : 'None specified';

  return `
You are an expert fitness planner AI called FitForge. Your goal is to generate a personalized workout plan in JSON format based on the user's preferences.

User Preferences:
- Fitness Goal: ${formData.goal}
- Experience Level: ${formData.experience}
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
        "day": "Day 1", // e.g., "Day 1", "Monday"
        "focus": "e.g., Chest & Triceps", // Main muscle groups for the day
        "warmUp": [
          {"name": "Jumping Jacks", "duration": "2-3 minutes"},
          {"name": "Dynamic Chest Stretches", "duration": "1-2 minutes"}
        ],
        "exercises": [
          {"name": "Push-ups", "sets": 3, "reps": "8-12", "rest": "60-90s"},
          {"name": "Dumbbell Bench Press", "sets": 3, "reps": "8-12", "rest": "60-90s"}
          // Add more exercises appropriate for the focus, duration, and equipment
        ],
        "coolDown": [
          {"name": "Static Chest Stretch", "duration": "30-60s per side"},
          {"name": "Triceps Stretch", "duration": "30-60s per side"}
        ]
      }
      // Add more day objects up to 'Days Per Week' specified by the user.
      // Each day should have a clear focus and a balanced set of exercises.
    ],
    "notes": "Optional: Add any general advice, tips for progression, or important considerations here. For example, 'Remember to maintain proper form and listen to your body. Gradually increase weight/reps as you get stronger.'"
  }
}

Important Instructions for the AI:
1.  The root of the JSON response must be an object with a single key "workoutPlan".
2.  "workoutPlan.plan" must be an array of daily workout objects.
3.  Each daily workout object must include "day", "focus", "warmUp" (array), "exercises" (array), and "coolDown" (array).
4.  For "exercises": "sets" must be a number. "reps" and "rest" must be strings (e.g., "8-12", "15", "60s", "90-120s").
5.  For "warmUp" and "coolDown" activities: "name" and "duration" must be strings.
6.  Tailor the number of exercises and their intensity to the user's experience level and preferred workout duration. Beginners should have simpler exercises and possibly fewer sets/exercises.
7.  If specific muscle groups are requested, prioritize them in the plan. Otherwise, create a balanced plan according to the fitness goal.
8.  Ensure the plan is actionable and uses the available equipment. If only bodyweight is available, provide effective bodyweight exercises.
9.  The "notes" field in "workoutPlan" is for general advice and should be a string.
10. Ensure the total number of workout days in the "plan" array matches the user's "Days Per Week" input.
11. If no specific muscle groups are selected, and the goal is e.g. "Build Muscle", provide a sensible split (e.g. Push/Pull/Legs, Upper/Lower, or Full Body depending on daysPerWeek).
12. Be creative and provide varied exercises.
`;
}

export const generateWorkoutPlan = async (formData: WorkoutFormData): Promise<GeneratedWorkoutPlan> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Please check your API_KEY configuration.");
  }

  const prompt = buildPrompt(formData);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Ensure this is an available and suitable model
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // temperature: 0.7, // Adjust for creativity vs. predictability if needed
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
      const parsedData: GeminiApiResponse = JSON.parse(jsonStr);
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
        throw new Error("Invalid API Key. Please ensure your API_KEY environment variable is set correctly.");
    }
    throw new Error(`Failed to generate workout plan. ${error instanceof Error ? error.message : String(error)}`);
  }
};
    