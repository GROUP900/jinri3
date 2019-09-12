/*
 Navicat Premium Data Transfer

 Source Server         : 900
 Source Server Type    : MySQL
 Source Server Version : 50721
 Source Host           : localhost:3306
 Source Schema         : jr

 Target Server Type    : MySQL
 Target Server Version : 50721
 File Encoding         : 65001

 Date: 12/09/2019 13:44:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for administrators
-- ----------------------------
DROP TABLE IF EXISTS `administrators`;
CREATE TABLE `administrators` (
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `salt` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`username`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for cSessionInfo
-- ----------------------------
DROP TABLE IF EXISTS `cSessionInfo`;
CREATE TABLE `cSessionInfo` (
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `session_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_info` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`open_id`) USING BTREE,
  KEY `openid` (`open_id`) USING BTREE,
  KEY `skey` (`skey`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理用户信息';

-- ----------------------------
-- Table structure for changelog
-- ----------------------------
DROP TABLE IF EXISTS `changelog`;
CREATE TABLE `changelog` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `detail` longtext NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for feedback
-- ----------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` longtext NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'noname',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for globalsetting
-- ----------------------------
DROP TABLE IF EXISTS `globalsetting`;
CREATE TABLE `globalsetting` (
  `item` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `value` tinyint(1) NOT NULL,
  PRIMARY KEY (`item`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for picture
-- ----------------------------
DROP TABLE IF EXISTS `picture`;
CREATE TABLE `picture` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fronturl` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `backurl` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=156 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for resources
-- ----------------------------
DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(20) NOT NULL,
  `extra` mediumtext,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for riqian
-- ----------------------------
DROP TABLE IF EXISTS `riqian`;
CREATE TABLE `riqian` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `resourceid` int(10) DEFAULT NULL,
  `imageid` int(10) NOT NULL,
  `date` date NOT NULL,
  `likecount` int(10) unsigned NOT NULL DEFAULT '0',
  `sharecount` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `date` (`date`) USING BTREE,
  UNIQUE KEY `imageid` (`imageid`) USING BTREE,
  UNIQUE KEY `resourceid` (`resourceid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=142 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ssn
-- ----------------------------
DROP TABLE IF EXISTS `ssn`;
CREATE TABLE `ssn` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` varchar(255) NOT NULL,
  `anonymous` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `uid` int(10) NOT NULL,
  `funny` int(10) unsigned NOT NULL DEFAULT '0',
  `liked` int(10) unsigned NOT NULL DEFAULT '1',
  `showing` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `nocopy` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=440 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'noname',
  `wxopenid` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `avatarurl` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `collection` mediumtext CHARACTER SET utf8mb4,
  `likedssn` mediumtext CHARACTER SET utf8mb4,
  `ssn` mediumtext CHARACTER SET utf8mb4,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=1578 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Procedure structure for latestriqian
-- ----------------------------
DROP PROCEDURE IF EXISTS `latestriqian`;
delimiter ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `latestriqian`(
IN latest tinyint,
IN rd char(20),
OUT prevdate date,
OUT nextdate date
)
BEGIN
declare curdate date;
if (latest=1) then
	select date into curdate from riqian where date <= CURDATE() order by date desc limit 1;
else
	select rd into curdate;
end if;
SELECT IFNULL( (select max(date) from riqian where date < curdate) ,null) into prevdate;
SELECT IFNULL( (select min(date) from riqian where date > curdate and date <= CURDATE()) ,null) into nextdate;
select riqian.date as curdate,riqian.sharecount,riqian.id,prevdate,nextdate,picture.fronturl,picture.backurl,picture.content,resources.id as resourceid
from riqian inner join picture
on riqian.imageid = picture.id
left outer join resources
on riqian.resourceid = resources.id
where riqian.date = curdate;
END;
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
