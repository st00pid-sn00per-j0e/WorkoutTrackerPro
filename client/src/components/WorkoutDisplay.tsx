import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratedWorkoutPlan, DailyWorkout, Exercise, Activity } from "@/types";
import { Clock, Flame, Users, Share, Play, Heart } from "lucide-react";

interface WorkoutDisplayProps {
  plan: GeneratedWorkoutPlan;
  onSave?: () => void;
  onShare?: () => void;
  onStartWorkout?: (workout: DailyWorkout) => void;
}

export default function WorkoutDisplay({ 
  plan, 
  onSave, 
  onShare, 
  onStartWorkout 
}: WorkoutDisplayProps) {
  const ActivityItem = ({ activity }: { activity: Activity }) => (
    <li className="text-sm text-slate-300 flex items-center justify-between">
      <span className="font-medium">{activity.name}</span>
      <span className="text-slate-400">{activity.duration}</span>
    </li>
  );

  const ExerciseItem = ({ exercise }: { exercise: Exercise }) => (
    <li className="text-sm text-slate-300 py-2 border-b border-slate-700 last:border-0">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-100">{exercise.name}</span>
        <Badge variant="outline" className="text-xs">
          {exercise.sets} × {exercise.reps}
        </Badge>
      </div>
      <div className="text-xs text-slate-400 mt-1">
        Rest: {exercise.rest}
      </div>
    </li>
  );

  const DailyWorkoutCard = ({ dailyWorkout }: { dailyWorkout: DailyWorkout }) => (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-100">{dailyWorkout.day}</CardTitle>
            <p className="text-sm text-purple-400 font-medium">{dailyWorkout.focus}</p>
          </div>
          {onStartWorkout && (
            <Button 
              size="sm" 
              onClick={() => onStartWorkout(dailyWorkout)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {dailyWorkout.warmUp && dailyWorkout.warmUp.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
              <Flame className="h-4 w-4 mr-2" />
              Warm-up
            </h4>
            <ul className="space-y-1 bg-slate-800 rounded-lg p-3">
              {dailyWorkout.warmUp.map((activity, index) => (
                <ActivityItem key={`warmup-${index}`} activity={activity} />
              ))}
            </ul>
          </div>
        )}

        {dailyWorkout.exercises && dailyWorkout.exercises.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Workout ({dailyWorkout.exercises.length} exercises)
            </h4>
            <ul className="bg-slate-800 rounded-lg p-3">
              {dailyWorkout.exercises.map((exercise, index) => (
                <ExerciseItem key={`exercise-${index}`} exercise={exercise} />
              ))}
            </ul>
          </div>
        )}

        {dailyWorkout.coolDown && dailyWorkout.coolDown.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Cool-down
            </h4>
            <ul className="space-y-1 bg-slate-800 rounded-lg p-3">
              {dailyWorkout.coolDown.map((activity, index) => (
                <ActivityItem key={`cooldown-${index}`} activity={activity} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Your Forged Workout Plan</h2>
        <p className="text-slate-400">AI-generated plan tailored to your goals</p>
      </div>
      
      {plan.notes && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-blue-400">Trainer's Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{plan.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.plan.map((dailyWorkout, index) => (
          <DailyWorkoutCard key={index} dailyWorkout={dailyWorkout} />
        ))}
      </div>

      {(onSave || onShare) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {onSave && (
            <Button onClick={onSave} className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Save Plan</span>
            </Button>
          )}
          {onShare && (
            <Button 
              variant="outline" 
              onClick={onShare}
              className="flex items-center space-x-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Share className="h-4 w-4" />
              <span>Share Plan</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
