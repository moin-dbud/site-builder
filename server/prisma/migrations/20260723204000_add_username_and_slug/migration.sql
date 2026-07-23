-- AlterTable
ALTER TABLE "user" ADD COLUMN "username" TEXT;

-- AlterTable
ALTER TABLE "WebsiteProject" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteProject_userId_slug_key" ON "WebsiteProject"("userId", "slug");
