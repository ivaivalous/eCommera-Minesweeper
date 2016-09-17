-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: minesweeper
-- ------------------------------------------------------
-- Server version 5.7.13-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'A unique ID for the game.',
  `private` tinyint(1) NOT NULL COMMENT 'Was this a private (listed) game room?',
  `host_user_id` int(10) unsigned NOT NULL COMMENT 'ID of the user who hosted this game.',
  `number_of_players` int(10) NOT NULL DEFAULT '1',
  `game_start_time` datetime DEFAULT NULL COMMENT 'The time the game started at.',
  `game_finish_time` datetime DEFAULT NULL COMMENT 'Time the game ended.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `host_user_id_idx` (`host_user_id`),
  CONSTRAINT `host_user_id` FOREIGN KEY (`host_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `games_played`
--

DROP TABLE IF EXISTS `games_played`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games_played` (
  `user_id` int(10) unsigned NOT NULL COMMENT 'ID of the user who played a game.',
  `game_id` int(10) unsigned NOT NULL COMMENT 'The ID of the game the user played.',
  `score` int(11) NOT NULL DEFAULT '0' COMMENT 'The score the user scored.',
  PRIMARY KEY (`user_id`,`game_id`),
  KEY `game_id_idx` (`game_id`),
  CONSTRAINT `game_id` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'A unique ID for the user in the game, not changeable.',
  `email` varchar(255) NOT NULL COMMENT 'The user''s email address. It must be unique and it can be changed.\nUsed for user validation/password reset.',
  `display_name` varchar(32) NOT NULL COMMENT 'A name the user will go by in the game/high scores/etc. Not unique, changeable.',
  `active` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether the user has activated their account via email.',
  `password` char(128) NOT NULL COMMENT 'A salt + password hash, used to verify against when the user logs in.',
  `salt` char(32) NOT NULL,
  `social_network_id` varchar(90) DEFAULT NULL COMMENT 'Use if the user is authenticated via a social network account, e.g. Facebook',
  `social_network_user` tinyint(1) DEFAULT '0' COMMENT 'Whether the user is using his or her social network account instead of the normal email/password login combination. Social network users are unable to login using a password.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `social_network_id_UNIQUE` (`social_network_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-09-08 18:01:17
