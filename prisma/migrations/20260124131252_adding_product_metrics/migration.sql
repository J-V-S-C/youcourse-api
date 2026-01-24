-- CreateTable
CREATE TABLE "ProductMetrics" (
    "productId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "sales" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductMetrics_pkey" PRIMARY KEY ("productId")
);

-- AddForeignKey
ALTER TABLE "ProductMetrics" ADD CONSTRAINT "ProductMetrics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
