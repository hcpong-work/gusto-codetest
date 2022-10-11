-- CreateTable
CREATE TABLE `prize` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `total` INTEGER NOT NULL,
    `daily` INTEGER NOT NULL,
    `odds` DECIMAL(65, 30) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `winner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entryId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `prizeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `redeemedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
