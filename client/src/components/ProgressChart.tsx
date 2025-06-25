import { Card } from "@/components/ui/card";
import { UserProgress } from "@/types";
import { TrendingUp } from "lucide-react";

interface ProgressChartProps {
  data?: UserProgress[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No progress data yet</p>
          <p className="text-xs mt-1">Start working out to see your progress!</p>
        </div>
      </div>
    );
  }

  // For now, show a simple progress visualization
  // In a full implementation, you would use Chart.js or Recharts
  const latest = data[0];
  const previous = data[1];
  
  const workoutChange = previous 
    ? ((latest.weeklyWorkouts - previous.weeklyWorkouts) / Math.max(previous.weeklyWorkouts, 1)) * 100
    : 0;

  const calorieChange = previous
    ? ((latest.totalCaloriesBurned - previous.totalCaloriesBurned) / Math.max(previous.totalCaloriesBurned, 1)) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-slate-700 rounded-lg">
          <div className="text-lg font-bold text-slate-100">{latest.weeklyWorkouts}</div>
          <div className="text-xs text-slate-400">Workouts/Week</div>
          {workoutChange !== 0 && (
            <div className={`text-xs mt-1 ${workoutChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {workoutChange > 0 ? '↗' : '↘'} {Math.abs(workoutChange).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-center p-3 bg-slate-700 rounded-lg">
          <div className="text-lg font-bold text-slate-100">{latest.currentStreak}</div>
          <div className="text-xs text-slate-400">Day Streak</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-slate-400">Weekly Activity</div>
        <div className="flex space-x-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded ${
                i < latest.weeklyWorkouts 
                  ? 'bg-primary' 
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center pt-2">
        <div className="text-sm text-slate-300">
          {latest.totalCaloriesBurned} calories burned this week
        </div>
        {calorieChange !== 0 && (
          <div className={`text-xs mt-1 ${calorieChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {calorieChange > 0 ? '↗' : '↘'} {Math.abs(calorieChange).toFixed(1)}% from last week
          </div>
        )}
      </div>
    </div>
  );
}
