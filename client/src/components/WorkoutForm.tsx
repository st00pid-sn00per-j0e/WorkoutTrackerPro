import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Users,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { 
  FitnessGoal, 
  ExperienceLevel, 
  WorkoutDuration, 
  Equipment, 
  MuscleGroup, 
  WorkoutFormData 
} from "@/types";

interface WorkoutFormProps {
  onSubmit: (data: WorkoutFormData) => void;
  isLoading: boolean;
}

const FITNESS_GOALS = Object.values(FitnessGoal);
const EXPERIENCE_LEVELS = Object.values(ExperienceLevel);
const WORKOUT_DURATIONS = Object.values(WorkoutDuration);
const EQUIPMENT_OPTIONS = Object.values(Equipment);
const MUSCLE_GROUPS = Object.values(MuscleGroup);

export default function WorkoutForm({ onSubmit, isLoading }: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>({
    fitnessGoal: FitnessGoal.GENERAL_FITNESS,
    experienceLevel: ExperienceLevel.BEGINNER,
    daysPerWeek: 3,
    duration: WorkoutDuration.MEDIUM,
    equipment: [Equipment.BODYWEIGHT],
    muscleGroups: [],
    injuries: "",
  });

  const handleEquipmentChange = (equipment: Equipment, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  const handleMuscleGroupChange = (muscleGroup: MuscleGroup, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: checked 
        ? [...prev.muscleGroups, muscleGroup]
        : prev.muscleGroups.filter(m => m !== muscleGroup)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClear = () => {
    setFormData({
      fitnessGoal: FitnessGoal.GENERAL_FITNESS,
      experienceLevel: ExperienceLevel.BEGINNER,
      daysPerWeek: 3,
      duration: WorkoutDuration.MEDIUM,
      equipment: [Equipment.BODYWEIGHT],
      muscleGroups: [],
      injuries: "",
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>AI Workout Planner</span>
        </CardTitle>
        <p className="text-slate-400">Create your personalized workout plan powered by AI</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <span>Fitness Goal</span>
              </Label>
              <Select
                value={formData.fitnessGoal}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fitnessGoal: value as FitnessGoal }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_GOALS.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Experience Level</span>
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value as ExperienceLevel }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Days Per Week (1-7)</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={formData.daysPerWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, daysPerWeek: parseInt(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Workout Duration</span>
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value as WorkoutDuration }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_DURATIONS.map(duration => (
                    <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300 flex items-center space-x-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span>Available Equipment</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {EQUIPMENT_OPTIONS.map(equipment => (
                <div key={equipment} className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <Checkbox
                    id={equipment}
                    checked={formData.equipment.includes(equipment)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                  />
                  <Label 
                    htmlFor={equipment} 
                    className="text-sm text-slate-200 cursor-pointer flex-1"
                  >
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Muscle Groups */}
          <div className="space-y-3">
            <Label className="text-slate-300 flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Target Muscle Groups (Optional)</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MUSCLE_GROUPS.map(muscleGroup => (
                <div key={muscleGroup} className="flex items-center space-x-2 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <Checkbox
                    id={muscleGroup}
                    checked={formData.muscleGroups.includes(muscleGroup)}
                    onCheckedChange={(checked) => handleMuscleGroupChange(muscleGroup, checked as boolean)}
                  />
                  <Label 
                    htmlFor={muscleGroup} 
                    className="text-sm text-slate-200 cursor-pointer flex-1"
                  >
                    {muscleGroup}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Injuries/Limitations */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Injuries or Limitations (Optional)</span>
            </Label>
            <Textarea
              value={formData.injuries}
              onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
              rows={3}
              className="bg-slate-700 border-slate-600"
              placeholder="e.g., Previous knee injury, avoid high-impact exercises."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Forging Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Forge My Plan
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
