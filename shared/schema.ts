import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout Plans
export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  fitnessGoal: varchar("fitness_goal").notNull(),
  experienceLevel: varchar("experience_level").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  duration: varchar("duration").notNull(),
  equipment: jsonb("equipment").notNull(),
  muscleGroups: jsonb("muscle_groups"),
  injuries: text("injuries"),
  plan: jsonb("plan").notNull(), // Generated workout plan JSON
  notes: text("notes"),
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  completedCount: integer("completed_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout Sessions
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutPlanId: uuid("workout_plan_id").references(() => workoutPlans.id),
  title: varchar("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  caloriesBurned: integer("calories_burned"),
  exercisesCompleted: jsonb("exercises_completed"),
  status: varchar("status").notNull().default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition Plans
export const nutritionPlans = pgTable("nutrition_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  fitnessGoal: varchar("fitness_goal").notNull(),
  dailyCalories: integer("daily_calories").notNull(),
  dailyProtein: integer("daily_protein").notNull(),
  dailyCarbs: integer("daily_carbs").notNull(),
  dailyFats: integer("daily_fats").notNull(),
  meals: jsonb("meals").notNull(), // Daily meal plan JSON
  dietaryRestrictions: jsonb("dietary_restrictions"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Nutrition Logs
export const nutritionLogs = pgTable("nutrition_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  calories: integer("calories").default(0),
  protein: integer("protein").default(0),
  carbs: integer("carbs").default(0),
  fats: integer("fats").default(0),
  waterGlasses: integer("water_glasses").default(0),
  meals: jsonb("meals"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Progress Tracking
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  weight: real("weight"),
  bodyFatPercentage: real("body_fat_percentage"),
  muscleMass: real("muscle_mass"),
  weeklyWorkouts: integer("weekly_workouts").default(0),
  currentStreak: integer("current_streak").default(0),
  totalCaloriesBurned: integer("total_calories_burned").default(0),
  averageSessionDuration: integer("average_session_duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Features - Workout Plan Likes
export const workoutPlanLikes = pgTable("workout_plan_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutPlanId: uuid("workout_plan_id").notNull().references(() => workoutPlans.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Follows
export const userFollows = pgTable("user_follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workoutPlans: many(workoutPlans),
  workoutSessions: many(workoutSessions),
  nutritionPlans: many(nutritionPlans),
  nutritionLogs: many(nutritionLogs),
  userProgress: many(userProgress),
  workoutPlanLikes: many(workoutPlanLikes),
  following: many(userFollows, { relationName: "follower" }),
  followers: many(userFollows, { relationName: "following" }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  workoutSessions: many(workoutSessions),
  likes: many(workoutPlanLikes),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workoutSessions.workoutPlanId],
    references: [workoutPlans.id],
  }),
}));

export const nutritionPlansRelations = relations(nutritionPlans, ({ one }) => ({
  user: one(users, {
    fields: [nutritionPlans.userId],
    references: [users.id],
  }),
}));

export const nutritionLogsRelations = relations(nutritionLogs, ({ one }) => ({
  user: one(users, {
    fields: [nutritionLogs.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const workoutPlanLikesRelations = relations(workoutPlanLikes, ({ one }) => ({
  user: one(users, {
    fields: [workoutPlanLikes.userId],
    references: [users.id],
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workoutPlanLikes.workoutPlanId],
    references: [workoutPlans.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

// Insert Schemas
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;
export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
