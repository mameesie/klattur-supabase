-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "chats" (
	"chat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);
--> statement-breakpoint
ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid,
	"user_id" uuid,
	"role" varchar(50) NOT NULL,
	"text_field" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"subscription_plan" text DEFAULT 'free',
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "profiles_subscription_plan_check" CHECK (subscription_plan = ANY (ARRAY['free'::text, 'premium'::text]))
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("chat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chats_user_created" ON "chats" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE POLICY "Users can CRUD own tasks" ON "chats" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can CRUD own tasks" ON "messages" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
*/