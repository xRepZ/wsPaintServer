CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(8) NOT NULL,
  `canvas` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_code_IDX` (`code`) USING BTREE
);