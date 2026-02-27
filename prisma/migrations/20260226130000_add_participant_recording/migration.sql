-- AlterTable
ALTER TABLE "MeetupRoom" ADD COLUMN IF NOT EXISTS "allowParticipantRecording" BOOLEAN NOT NULL DEFAULT false;
