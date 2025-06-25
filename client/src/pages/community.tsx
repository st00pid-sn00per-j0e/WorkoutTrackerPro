import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Share, 
  Play, 
  Users, 
  Trophy, 
  Clock, 
  Flame,
  Plus,
  Search,
  Filter,
  TrendingUp
} from "lucide-react";
import { WorkoutPlan } from "@/types";

export default function Community() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("popular");

  // Get community workouts
  const { data: communityWorkouts } = useQuery({
    queryKey: ['/api/community/workouts', { limit: 20 }],
    retry: false,
  });

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats'],
    retry: false,
  });

  // Get user's own workout plans
  const { data: userWorkouts } = useQuery({
    queryKey: ['/api/workout-plans'],
    retry: false,
  });

  // Like workout mutation
  const likeMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest('POST', `/api/workout-plans/${planId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/workouts'] });
      toast({
        title: "Liked!",
        description: "You liked this workout plan.",
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
        description: "Failed to like workout",
        variant: "destructive",
      });
    },
  });

  // Unlike workout mutation
  const unlikeMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest('DELETE', `/api/workout-plans/${planId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/workouts'] });
      toast({
        title: "Unliked",
        description: "You unliked this workout plan.",
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
        description: "Failed to unlike workout",
        variant: "destructive",
      });
    },
  });

  const handleLike = (planId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate(planId);
    } else {
      likeMutation.mutate(planId);
    }
  };

  const handleShare = (plan: WorkoutPlan) => {
    const shareText = `Check out this awesome workout plan: ${plan.title} - ${plan.description}`;
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      toast({
        title: "Copied!",
        description: "Workout plan link copied to clipboard.",
      });
    }
  };

  const filteredWorkouts = communityWorkouts?.filter((workout: WorkoutPlan) =>
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Community</h1>
        <p className="text-slate-400">Share workouts, get inspired, and connect with fellow fitness enthusiasts</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {communityWorkouts?.length || 0}
            </div>
            <div className="text-slate-400">Shared Workouts</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-500 mb-2">8,932</div>
            <div className="text-slate-400">Active Members</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-500 mb-2">42,156</div>
            <div className="text-slate-400">Workouts Completed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Featured Workouts */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-slate-100">Featured Workouts</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant={filterBy === "popular" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterBy("popular")}
                    className={filterBy === "popular" ? "" : "border-slate-600"}
                  >
                    Popular
                  </Button>
                  <Button 
                    variant={filterBy === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterBy("recent")}
                    className={filterBy === "recent" ? "" : "border-slate-600"}
                  >
                    Recent
                  </Button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredWorkouts.length > 0 ? (
                <div className="space-y-6">
                  {filteredWorkouts.map((workout: WorkoutPlan) => (
                    <div key={workout.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt="User" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-100">{workout.title}</h3>
                              <p className="text-sm text-slate-400">
                                by User • {new Date(workout.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(workout.id, false)} // Assuming not liked for now
                              className="text-slate-400 hover:text-red-400"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-slate-300 mb-3">
                            {workout.description || `A ${workout.experienceLevel.toLowerCase()} ${workout.fitnessGoal.toLowerCase()} workout plan for ${workout.daysPerWeek} days per week.`}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {workout.duration}
                              </span>
                              <span className="flex items-center">
                                <Flame className="h-4 w-4 mr-1" />
                                {workout.daysPerWeek} days/week
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {workout.completedCount} completed
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {workout.experienceLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShare(workout)}
                                className="border-slate-600"
                              >
                                <Share className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Try It
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Users className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg mb-2">No workouts found</p>
                  <p>Be the first to share a workout with the community!</p>
                </div>
              )}
              
              {filteredWorkouts.length > 0 && (
                <div className="text-center mt-6">
                  <Button variant="outline" className="border-slate-600">
                    Load More Workouts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Share Your Workout */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Share Your Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Help others reach their fitness goals by sharing your favorite workouts!
              </p>
              {userWorkouts && userWorkouts.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {userWorkouts.slice(0, 3).map((workout: WorkoutPlan) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-sm text-slate-300 truncate">{workout.title}</span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        {workout.isPublic ? 'Public' : 'Make Public'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create & Share
              </Button>
            </CardContent>
          </Card>

          {/* Your Stats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Your Community Stats</CardTitle>
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
                  <p className="text-slate-400 text-sm">Loading community stats...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Tags */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Trending Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["#HIIT", "#FullBody", "#Strength", "#Beginner", "#Cardio", "#HomeWorkout", "#30MinMax", "#NoEquipment"].map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-slate-600 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Alex T.", points: 2847, rank: 1 },
                  { name: "Sarah M.", points: 2634, rank: 2 },
                  { name: "Mike R.", points: 2501, rank: 3 },
                ].map((user, index) => (
                  <div key={user.name} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.rank === 1 ? 'bg-yellow-500 text-black' :
                      user.rank === 2 ? 'bg-slate-400 text-black' :
                      'bg-purple-500 text-white'
                    }`}>
                      {user.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-slate-100">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.points} points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
