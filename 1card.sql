CREATE TABLE `accounts` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`password` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`nickname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`avatar_id` SMALLINT(5) NULL DEFAULT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `username` (`username`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=6
;

CREATE TABLE `invitationCodes` (
	`id` INT(10) NOT NULL,
	`invitation_code` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`is_used` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`player_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`avatar_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;


CREATE TABLE `records` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`accountId` VARCHAR(50) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_0900_ai_ci',
	`num_of_game` INT(10) NULL DEFAULT '0',
	`most_game` INT(10) NULL DEFAULT '0',
	`least_game` INT(10) NULL DEFAULT '0',
	`experience` INT(10) NULL DEFAULT '0',
	`experienced_cards` INT(10) NULL DEFAULT '0',
	`max_card` TINYINT(3) NULL DEFAULT '0',
	`max_card_amount` TINYINT(3) NULL DEFAULT '0',
	`min_card` TINYINT(3) NULL DEFAULT '0',
	`min_card_amount` TINYINT(3) NULL DEFAULT '0',
	`max_combo` TINYINT(3) NULL DEFAULT '0',
	`least_cards` TINYINT(3) NULL DEFAULT '-1',
	`most_cards` TINYINT(3) NULL DEFAULT '0',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;