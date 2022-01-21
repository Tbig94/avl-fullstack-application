/*
  Warnings:

  - You are about to drop the `product_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_type_id_fkey";

-- DropTable
DROP TABLE "product_types";

-- DropTable
DROP TABLE "products";
