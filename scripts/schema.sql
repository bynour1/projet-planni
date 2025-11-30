-- SQL schema for the planning app (MySQL)
-- Run these statements in your XAMPP phpMyAdmin or mysql CLI to create the database and tables.

CREATE DATABASE IF NOT EXISTS `planning` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `planning`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT '',
  `nom` VARCHAR(255) DEFAULT '',
  `prenom` VARCHAR(255) DEFAULT '',
  `role` VARCHAR(50) DEFAULT 'medecin',
  `isConfirmed` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `codes` (
  `email` VARCHAR(255) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`email`),
  FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
