import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProgressChart from "@/components/ProgressChart";
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  Play, 
  Plus, 
  Apple,
  TrendingUp,
  Users,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: userProgress } = useQuery({
    queryKey: ['/api/user-progress'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['/api/workout-sessions'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: nutritionLog } = useQuery({
    queryKey: [`/api/nutrition-logs/${new Date().toISOString().split('T')[0]}`],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats'],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const latestProgress = userProgress?.[0];
  const recentSession = recentSessions?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Athlete'}! 💪
        </h1>
        <p className="text-slate-400">Ready to crush your fitness goals today?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Weekly Workouts</p>
                <p className="text-2xl font-bold text-slate-100">
                  {latestProgress?.weeklyWorkouts || 0}/5
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={((latestProgress?.weeklyWorkouts || 0) / 5) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Calories Burned</p>
                <p className="text-2xl font-bold text-slate-100">
                  {latestProgress?.totalCaloriesBurned || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Flame className="text-orange-500 h-6 w-6" />
              </div>
            </div>
            {latestProgress?.totalCaloriesBurned && (
              <p className="text-xs text-green-400 mt-2">↗ Great progress!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-slate-100">
                  {latestProgress?.currentStreak || 0} days
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="text-green-500 h-6 w-6" />
              </div>
            </div>
            {latestProgress?.currentStreak && latestProgress.currentStreak > 0 && (
              <p className="text-xs text-slate-400 mt-2">Keep it up!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Session</p>
                <p className="text-2xl font-bold text-slate-100">
                  {latestProgress?.averageSessionDuration || 0}m
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-500 h-6 w-6" />
              </div>
            </div>
            {latestProgress?.averageSessionDuration && (
              <p className="text-xs text-green-400 mt-2">↗ Improving!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Workouts & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/active-workout">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                    <Play className="h-6 w-6" />
                    <span className="text-sm font-medium">Start Workout</span>
                  </Button>
                </Link>
                <Link href="/workout-planner">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Create Plan</span>
                  </Button>
                </Link>
                <Link href="/nutrition">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700">
                    <Apple className="h-6 w-6" />
                    <span className="text-sm font-medium">Log Meal</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Recent Workouts</CardTitle>
              <Link href="/active-workout">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-light">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.slice(0, 3).map((session: any, index: number) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          {session.status === 'completed' ? (
                            <Trophy className="text-green-500 h-6 w-6" />
                          ) : (
                            <Play className="text-primary h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-100">{session.title}</h3>
                          <p className="text-sm text-slate-400">
                            {new Date(session.startTime).toLocaleDateString()} • {session.duration || 0} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                          className={session.status === 'completed' ? 'bg-green-600' : ''}
                        >
                          {session.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        {session.caloriesBurned && (
                          <div className="text-slate-400 text-xs mt-1">
                            {session.caloriesBurned} calories
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No workouts yet. Start your first session!</p>
                  <Link href="/workout-planner">
                    <Button className="mt-4">Create Workout Plan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          
          {/* Today's Plan */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Today's Nutrition</CardTitle>
            </CardHeader>
            <CardContent>
              {nutritionLog ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Calories</span>
                    <span className="font-medium">{nutritionLog.calories}/2200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Protein</span>
                    <span className="font-medium">{nutritionLog.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Water</span>
                    <span className="font-medium">{nutritionLog.waterGlasses}/8 glasses</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-4">No nutrition data logged today</p>
                  <Link href="/nutrition">
                    <Button size="sm">Log Your Meals</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={userProgress} />
            </CardContent>
          </Card>

          {/* Community Activity */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100">Community Stats</CardTitle>
              <Link href="/community">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-light">
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {userStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Workouts Shared</span>
                    <span className="font-medium">{userStats.workoutsShared}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Likes</span>
                    <span className="font-medium">{userStats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Followers</span>
                    <span className="font-medium">{userStats.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Following</span>
                    <span className="font-medium">{userStats.following}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">Join the community to track social stats</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
