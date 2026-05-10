-- AlterTable
ALTER TABLE "shadowing_videos" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "youtubeVideoId" DROP NOT NULL;
