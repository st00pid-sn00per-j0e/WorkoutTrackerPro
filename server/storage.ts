import {
  users,
  workoutPlans,
  workoutSessions,
  nutritionPlans,
  nutritionLogs,
  userProgress,
  workoutPlanLikes,
  userFollows,
  type User,
  type UpsertUser,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type WorkoutSession,
  type InsertWorkoutSession,
  type NutritionPlan,
  type InsertNutritionPlan,
  type NutritionLog,
  type InsertNutritionLog,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Workout Plan operations
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined>;
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  getPublicWorkoutPlans(limit?: number): Promise<WorkoutPlan[]>;
  updateWorkoutPlan(id: string, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan>;
  deleteWorkoutPlan(id: string): Promise<void>;
  likeWorkoutPlan(userId: string, planId: string): Promise<void>;
  unlikeWorkoutPlan(userId: string, planId: string): Promise<void>;

  // Workout Session operations
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined>;
  updateWorkoutSession(id: string, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession>;
  getUserWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;

  // Nutrition operations
  createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;
  getActiveNutritionPlan(userId: string): Promise<NutritionPlan | undefined>;
  updateNutritionLog(log: InsertNutritionLog): Promise<NutritionLog>;
  getNutritionLog(userId: string, date: Date): Promise<NutritionLog | undefined>;

  // Progress tracking
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgress(userId: string, days?: number): Promise<UserProgress[]>;

  // Social features
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getUserStats(userId: string): Promise<{
    workoutsShared: number;
    totalLikes: number;
    followers: number;
    following: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [workoutPlan] = await db
      .insert(workoutPlans)
      .values(plan)
      .returning();
    return workoutPlan;
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    const [plan] = await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.id, id));
    return plan || undefined;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(desc(workoutPlans.createdAt));
  }

  async getPublicWorkoutPlans(limit = 10): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.isPublic, true))
      .orderBy(desc(workoutPlans.likes), desc(workoutPlans.createdAt))
      .limit(limit);
  }

  async updateWorkoutPlan(id: string, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan> {
    const [plan] = await db
      .update(workoutPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workoutPlans.id, id))
      .returning();
    return plan;
  }

  async deleteWorkoutPlan(id: string): Promise<void> {
    await db.delete(workoutPlans).where(eq(workoutPlans.id, id));
  }

  async likeWorkoutPlan(userId: string, planId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(workoutPlanLikes).values({ userId, workoutPlanId: planId });
      await tx
        .update(workoutPlans)
        .set({ likes: sql`${workoutPlans.likes} + 1` })
        .where(eq(workoutPlans.id, planId));
    });
  }

  async unlikeWorkoutPlan(userId: string, planId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(workoutPlanLikes)
        .where(
          and(
            eq(workoutPlanLikes.userId, userId),
            eq(workoutPlanLikes.workoutPlanId, planId)
          )
        );
      await tx
        .update(workoutPlans)
        .set({ likes: sql`${workoutPlans.likes} - 1` })
        .where(eq(workoutPlans.id, planId));
    });
  }

  async createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession> {
    const [workoutSession] = await db
      .insert(workoutSessions)
      .values(session)
      .returning();
    return workoutSession;
  }

  async getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, "active")
        )
      )
      .orderBy(desc(workoutSessions.startTime))
      .limit(1);
    return session || undefined;
  }

  async updateWorkoutSession(id: string, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession> {
    const [session] = await db
      .update(workoutSessions)
      .set(updates)
      .where(eq(workoutSessions.id, id))
      .returning();
    return session;
  }

  async getUserWorkoutSessions(userId: string, limit = 10): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startTime))
      .limit(limit);
  }

  async createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan> {
    const [nutritionPlan] = await db
      .insert(nutritionPlans)
      .values(plan)
      .returning();
    return nutritionPlan;
  }

  async getActiveNutritionPlan(userId: string): Promise<NutritionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(nutritionPlans)
      .where(
        and(
          eq(nutritionPlans.userId, userId),
          eq(nutritionPlans.isActive, true)
        )
      )
      .orderBy(desc(nutritionPlans.createdAt))
      .limit(1);
    return plan || undefined;
  }

  async updateNutritionLog(log: InsertNutritionLog): Promise<NutritionLog> {
    const [nutritionLog] = await db
      .insert(nutritionLogs)
      .values(log)
      .onConflictDoUpdate({
        target: [nutritionLogs.userId, nutritionLogs.date],
        set: log,
      })
      .returning();
    return nutritionLog;
  }

  async getNutritionLog(userId: string, date: Date): Promise<NutritionLog | undefined> {
    const [log] = await db
      .select()
      .from(nutritionLogs)
      .where(
        and(
          eq(nutritionLogs.userId, userId),
          eq(nutritionLogs.date, date)
        )
      );
    return log || undefined;
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [userProgressRecord] = await db
      .insert(userProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.date],
        set: progress,
      })
      .returning();
    return userProgressRecord;
  }

  async getUserProgress(userId: string, days = 30): Promise<UserProgress[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          sql`${userProgress.date} >= ${date}`
        )
      )
      .orderBy(desc(userProgress.date));
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await db
      .insert(userFollows)
      .values({ followerId, followingId });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        )
      );
  }

  async getUserStats(userId: string): Promise<{
    workoutsShared: number;
    totalLikes: number;
    followers: number;
    following: number;
  }> {
    const [workoutsShared] = await db
      .select({ count: count() })
      .from(workoutPlans)
      .where(
        and(
          eq(workoutPlans.userId, userId),
          eq(workoutPlans.isPublic, true)
        )
      );

    const [totalLikes] = await db
      .select({ sum: sql<number>`sum(${workoutPlans.likes})` })
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId));

    const [followers] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));

    const [following] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId));

    return {
      workoutsShared: workoutsShared.count,
      totalLikes: totalLikes.sum || 0,
      followers: followers.count,
      following: following.count,
    };
  }
}

export const storage = new DatabaseStorage();
