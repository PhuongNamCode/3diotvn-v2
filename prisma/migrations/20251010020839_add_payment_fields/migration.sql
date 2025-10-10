-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "transactionId" TEXT;
