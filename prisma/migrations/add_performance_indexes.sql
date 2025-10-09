-- Performance Indexes for 3DIoT Web
-- Based on frequent queries from terminal logs

-- Contact table indexes
CREATE INDEX IF NOT EXISTS "idx_contact_created_at" ON "public"."Contact"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_contact_email" ON "public"."Contact"("email");
CREATE INDEX IF NOT EXISTS "idx_contact_type" ON "public"."Contact"("type");
CREATE INDEX IF NOT EXISTS "idx_contact_status" ON "public"."Contact"("status");

-- Course table indexes  
CREATE INDEX IF NOT EXISTS "idx_course_created_at" ON "public"."Course"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_course_status" ON "public"."Course"("status");
CREATE INDEX IF NOT EXISTS "idx_course_category" ON "public"."Course"("category");
CREATE INDEX IF NOT EXISTS "idx_course_published_at" ON "public"."Course"("publishedAt" DESC);

-- News table indexes
CREATE INDEX IF NOT EXISTS "idx_news_published_at" ON "public"."News"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_news_category" ON "public"."News"("category");
CREATE INDEX IF NOT EXISTS "idx_news_published" ON "public"."News"("published");
CREATE INDEX IF NOT EXISTS "idx_news_importance" ON "public"."News"("importance");

-- Event table indexes
CREATE INDEX IF NOT EXISTS "idx_event_start_date" ON "public"."Event"("startDate" DESC);
CREATE INDEX IF NOT EXISTS "idx_event_status" ON "public"."Event"("status");
CREATE INDEX IF NOT EXISTS "idx_event_category" ON "public"."Event"("category");

-- Registration table indexes
CREATE INDEX IF NOT EXISTS "idx_registration_created_at" ON "public"."Registration"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_registration_event_id" ON "public"."Registration"("eventId");
CREATE INDEX IF NOT EXISTS "idx_registration_email" ON "public"."Registration"("email");
CREATE INDEX IF NOT EXISTS "idx_registration_status" ON "public"."Registration"("status");

-- CourseEnrollment table indexes
CREATE INDEX IF NOT EXISTS "idx_course_enrollment_created_at" ON "public"."CourseEnrollment"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_course_enrollment_course_id" ON "public"."CourseEnrollment"("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_enrollment_email" ON "public"."CourseEnrollment"("email");
CREATE INDEX IF NOT EXISTS "idx_course_enrollment_status" ON "public"."CourseEnrollment"("status");

-- User table indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "public"."User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "public"."User"("createdAt" DESC);

-- Setting table indexes (for admin credentials)
CREATE INDEX IF NOT EXISTS "idx_setting_key" ON "public"."Setting"("key");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_contact_type_status" ON "public"."Contact"("type", "status");
CREATE INDEX IF NOT EXISTS "idx_course_status_category" ON "public"."Course"("status", "category");
CREATE INDEX IF NOT EXISTS "idx_news_published_importance" ON "public"."News"("published", "importance");
