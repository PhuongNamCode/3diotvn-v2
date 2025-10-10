-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "curriculum" JSONB,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "instructor" TEXT,
ADD COLUMN     "instructorAvatar" TEXT,
ADD COLUMN     "instructorBio" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'Vietnamese',
ADD COLUMN     "maxStudents" INTEGER,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "whatYouWillLearn" TEXT;
