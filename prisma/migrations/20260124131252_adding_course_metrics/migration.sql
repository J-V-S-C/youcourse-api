-- CreateTable
CREATE TABLE "CourseMetrics" (
    "courseId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "sales" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CourseMetrics_pkey" PRIMARY KEY ("courseId")
);

-- AddForeignKey
ALTER TABLE "CourseMetrics" ADD CONSTRAINT "CourseMetrics_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
