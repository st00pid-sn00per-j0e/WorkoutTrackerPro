import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, SkipForward, Volume2 } from "lucide-react";
import { WorkoutTimerMessage } from "@/types";

interface WorkoutTimerProps {
  initialDuration: number; // in seconds
  exerciseName: string;
  sessionId: string;
  onTimerComplete?: () => void;
  onTimerUpdate?: (timeRemaining: number) => void;
}

export default function WorkoutTimer({ 
  initialDuration, 
  exerciseName, 
  sessionId,
  onTimerComplete,
  onTimerUpdate 
}: WorkoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('Timer WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const message: WorkoutTimerMessage = JSON.parse(event.data);
        if (message.sessionId === sessionId) {
          // Handle timer synchronization from other clients
          if (message.type === 'timer_start') {
            setIsRunning(true);
          } else if (message.type === 'timer_pause') {
            setIsRunning(false);
          } else if (message.type === 'timer_reset') {
            setTimeRemaining(initialDuration);
            setIsRunning(false);
            setIsCompleted(false);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, initialDuration]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Broadcast timer update
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message: WorkoutTimerMessage = {
              type: 'timer_update',
              sessionId,
              duration: newTime,
              exerciseId: exerciseName,
            };
            wsRef.current.send(JSON.stringify(message));
          }
          
          if (onTimerUpdate) {
            onTimerUpdate(newTime);
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
            playCompletionSound();
            if (onTimerComplete) {
              onTimerComplete();
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, sessionId, exerciseName, onTimerComplete, onTimerUpdate]);

  const playCompletionSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  const broadcastTimerAction = (action: 'timer_start' | 'timer_pause' | 'timer_reset') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WorkoutTimerMessage = {
        type: action,
        sessionId,
        exerciseId: exerciseName,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    broadcastTimerAction('timer_start');
  };

  const handlePause = () => {
    setIsRunning(false);
    broadcastTimerAction('timer_pause');
  };

  const handleReset = () => {
    setTimeRemaining(initialDuration);
    setIsRunning(false);
    setIsCompleted(false);
    broadcastTimerAction('timer_reset');
  };

  const handleSkip = () => {
    setTimeRemaining(0);
    setIsRunning(false);
    setIsCompleted(true);
    if (onTimerComplete) {
      onTimerComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((initialDuration - timeRemaining) / initialDuration) * 100;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-slate-100">{exerciseName}</CardTitle>
        <p className="text-slate-400">Rest Timer</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Timer Display */}
        <div className="text-center">
          <div className={`text-6xl font-bold mb-4 ${
            isCompleted ? 'text-green-400' : 
            timeRemaining <= 10 ? 'text-red-400' :
            'text-primary'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          {isCompleted && (
            <p className="text-green-400 mt-2 font-medium">Rest Complete! 🎉</p>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <Button 
              onClick={handleStart}
              disabled={isCompleted}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button 
              onClick={handlePause}
              variant="outline"
              className="border-slate-600"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={handleReset}
            variant="outline"
            className="border-slate-600"
          >
            <Square className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            onClick={handleSkip}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
        </div>

        {/* Audio Toggle */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-slate-200"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Sound Alerts On
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
