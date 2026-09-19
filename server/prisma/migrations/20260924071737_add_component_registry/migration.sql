-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ComponentVersionStatus" AS ENUM ('DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "status" "ComponentStatus" NOT NULL DEFAULT 'DRAFT',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB,
    "compatibleStyles" JSONB,
    "compatibleSkills" JSONB,
    "propsSchema" JSONB,
    "slotsSchema" JSONB,
    "responsiveRules" JSONB,
    "accessibilityRules" JSONB,
    "mediaRequirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentVersion" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "implementationCode" TEXT NOT NULL,
    "implementationType" TEXT NOT NULL DEFAULT 'html',
    "status" "ComponentVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "changelog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentVariant" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "propsSchema" JSONB,
    "layoutRules" JSONB,
    "responsiveRules" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Component_slug_key" ON "Component"("slug");

-- CreateIndex
CREATE INDEX "ComponentVersion_componentId_idx" ON "ComponentVersion"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentVersion_componentId_version_key" ON "ComponentVersion"("componentId", "version");

-- CreateIndex
CREATE INDEX "ComponentVariant_componentId_idx" ON "ComponentVariant"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentVariant_componentId_slug_key" ON "ComponentVariant"("componentId", "slug");

-- AddForeignKey
ALTER TABLE "ComponentVersion" ADD CONSTRAINT "ComponentVersion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentVariant" ADD CONSTRAINT "ComponentVariant_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
