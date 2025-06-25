
import React from 'react';
import { WorkoutFormData, FitnessGoal, ExperienceLevel, WorkoutDuration, Equipment, MuscleGroup } from '../types';
import { FITNESS_GOALS, EXPERIENCE_LEVELS, WORKOUT_DURATIONS, AVAILABLE_EQUIPMENT, MUSCLE_GROUPS } from '../constants';

interface WorkoutFormProps {
  formData: WorkoutFormData;
  onFormChange: (newFormData: Partial<WorkoutFormData>) => void;
  onEquipmentChange: (equipmentName: Equipment, checked: boolean) => void;
  onMuscleGroupChange: (muscleGroupName: MuscleGroup, checked: boolean) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const InputLabel: React.FC<{ htmlFor: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ htmlFor, children, icon }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300 mb-1">
    {icon && <span className="mr-2 hero-icon">{icon}</span>}
    {children}
  </label>
);

const SelectInput: React.FC<{ id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; }> = ({ id, value, onChange, options }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400"
  >
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const NumberInput: React.FC<{ id: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; }> = ({ id, value, onChange, min, max }) => (
  <input
    type="number"
    id={id}
    value={value}
    onChange={onChange}
    min={min}
    max={max}
    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400"
  />
);

const CheckboxGroup: React.FC<{ title: string; options: Equipment[] | MuscleGroup[]; selected: string[]; onChange: (name: any, checked: boolean) => void; icon?: React.ReactNode }> = ({ title, options, selected, onChange, icon }) => (
  <div>
    <h3 className="text-sm font-medium text-slate-300 mb-2">
      {icon && <span className="mr-2 hero-icon">{icon}</span>}
      {title}
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center space-x-2 p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={(e) => onChange(opt, e.target.checked)}
            className="h-4 w-4 text-primary bg-slate-600 border-slate-500 rounded focus:ring-primary focus:ring-offset-slate-800"
          />
          <span className="text-sm text-slate-200">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);


const WorkoutForm: React.FC<WorkoutFormProps> = ({ formData, onFormChange, onEquipmentChange, onMuscleGroupChange, onSubmit, onClear, isLoading }) => {
  const GoalIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 12.75 9H11.25A3.375 3.375 0 0 0 7.5 12.375V18.75m13.5-9L16.5 6l-3.75 3.75L9 6l-3.75 3.75M3 12h18" /></svg>;
  const ExperienceIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
  const DaysIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>;
  const DurationIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  const EquipmentIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>;
  const MuscleIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5M11.25 4.5l-7.5 7.5 7.5 7.5" /></svg>; // Placeholder, better icon needed for muscles
  const InjuryIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;


  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputLabel htmlFor="goal" icon={GoalIcon}>Fitness Goal</InputLabel>
          <SelectInput id="goal" value={formData.goal} onChange={e => onFormChange({ goal: e.target.value as FitnessGoal })} options={FITNESS_GOALS} />
        </div>
        <div>
          <InputLabel htmlFor="experience" icon={ExperienceIcon}>Experience Level</InputLabel>
          <SelectInput id="experience" value={formData.experience} onChange={e => onFormChange({ experience: e.target.value as ExperienceLevel })} options={EXPERIENCE_LEVELS} />
        </div>
        <div>
          <InputLabel htmlFor="daysPerWeek" icon={DaysIcon}>Days Per Week (1-7)</InputLabel>
          <NumberInput id="daysPerWeek" value={formData.daysPerWeek} onChange={e => onFormChange({ daysPerWeek: parseInt(e.target.value) })} min={1} max={7} />
        </div>
        <div>
          <InputLabel htmlFor="duration" icon={DurationIcon}>Workout Duration</InputLabel>
          <SelectInput id="duration" value={formData.duration} onChange={e => onFormChange({ duration: e.target.value as WorkoutDuration })} options={WORKOUT_DURATIONS} />
        </div>
      </div>

      <CheckboxGroup title="Available Equipment" options={AVAILABLE_EQUIPMENT} selected={formData.equipment} onChange={onEquipmentChange} icon={EquipmentIcon} />
      
      <CheckboxGroup title="Specific Muscle Groups (Optional)" options={MUSCLE_GROUPS} selected={formData.muscleGroups} onChange={onMuscleGroupChange} icon={MuscleIcon} />

      <div>
        <InputLabel htmlFor="injuries" icon={InjuryIcon}>Injuries or Limitations (Optional)</InputLabel>
        <textarea
          id="injuries"
          value={formData.injuries}
          onChange={e => onFormChange({ injuries: e.target.value })}
          rows={3}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-400"
          placeholder="e.g., Previous knee injury, avoid high-impact exercises."
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex-grow justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Forging Plan...' : 'Forge My Plan'}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isLoading}
          className="w-full sm:w-auto justify-center items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear Form
        </button>
      </div>
    </form>
  );
};

export default WorkoutForm;
    