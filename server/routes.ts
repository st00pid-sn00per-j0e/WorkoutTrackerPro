import type { Express } from "express";
import { createServer, type Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateWorkoutPlan, generateNutritionPlan } from "./services/geminiService";
import {
  insertWorkoutPlanSchema,
  insertWorkoutSessionSchema,
  insertNutritionPlanSchema,
  insertNutritionLogSchema,
  insertUserProgressSchema,
} from "@shared/schema";
import { z } from "zod";

interface WorkoutTimerMessage {
  type: 'timer_start' | 'timer_pause' | 'timer_reset' | 'timer_update';
  sessionId?: string;
  duration?: number;
  exerciseId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workout Plan routes
  app.post('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate AI workout plan
      const aiPlan = await generateWorkoutPlan(req.body);
      
      // Create workout plan in database
      const planData = insertWorkoutPlanSchema.parse({
        ...req.body,
        userId,
        plan: aiPlan.plan,
        notes: aiPlan.notes,
        title: `${req.body.fitnessGoal} - ${req.body.experienceLevel}`,
        description: `${req.body.daysPerWeek} days/week, ${req.body.duration}`,
      });
      
      const workoutPlan = await storage.createWorkoutPlan(planData);
      res.json(workoutPlan);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  app.get('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserWorkoutPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.get('/api/workout-plans/:id', isAuthenticated, async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching workout plan:", error);
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  app.post('/api/workout-plans/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.likeWorkoutPlan(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking workout plan:", error);
      res.status(500).json({ message: "Failed to like workout plan" });
    }
  });

  app.delete('/api/workout-plans/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unlikeWorkoutPlan(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking workout plan:", error);
      res.status(500).json({ message: "Failed to unlike workout plan" });
    }
  });

  // Workout Session routes
  app.post('/api/workout-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWorkoutSessionSchema.parse({
        ...req.body,
        userId,
        startTime: new Date(),
      });
      
      const session = await storage.createWorkoutSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating workout session:", error);
      res.status(500).json({ message: "Failed to create workout session" });
    }
  });

  app.get('/api/workout-sessions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getActiveWorkoutSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active workout session:", error);
      res.status(500).json({ message: "Failed to fetch active workout session" });
    }
  });

  app.patch('/api/workout-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateWorkoutSession(req.params.id, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating workout session:", error);
      res.status(500).json({ message: "Failed to update workout session" });
    }
  });

  app.get('/api/workout-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserWorkoutSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching workout sessions:", error);
      res.status(500).json({ message: "Failed to fetch workout sessions" });
    }
  });

  // Nutrition routes
  app.post('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate AI nutrition plan
      const aiNutritionPlan = await generateNutritionPlan(req.body);
      
      const planData = insertNutritionPlanSchema.parse({
        ...req.body,
        userId,
        meals: aiNutritionPlan.meals,
        title: `${req.body.fitnessGoal} Nutrition Plan`,
      });
      
      const nutritionPlan = await storage.createNutritionPlan(planData);
      res.json(nutritionPlan);
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      res.status(500).json({ message: "Failed to create nutrition plan" });
    }
  });

  app.get('/api/nutrition-plans/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plan = await storage.getActiveNutritionPlan(userId);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching active nutrition plan:", error);
      res.status(500).json({ message: "Failed to fetch active nutrition plan" });
    }
  });

  app.post('/api/nutrition-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertNutritionLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.updateNutritionLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Error updating nutrition log:", error);
      res.status(500).json({ message: "Failed to update nutrition log" });
    }
  });

  app.get('/api/nutrition-logs/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.params.date);
      const log = await storage.getNutritionLog(userId, date);
      res.json(log);
    } catch (error) {
      console.error("Error fetching nutrition log:", error);
      res.status(500).json({ message: "Failed to fetch nutrition log" });
    }
  });

  // User Progress routes
  app.post('/api/user-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId,
      });
      
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating user progress:", error);
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  app.get('/api/user-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const progress = await storage.getUserProgress(userId, days);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Community routes
  app.get('/api/community/workouts', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const workouts = await storage.getPublicWorkoutPlans(limit);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching community workouts:", error);
      res.status(500).json({ message: "Failed to fetch community workouts" });
    }
  });

  app.get('/api/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      await storage.followUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      await storage.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time workout timers
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (data) => {
      try {
        const message: WorkoutTimerMessage = JSON.parse(data.toString());
        
        // Broadcast timer updates to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
