-- Utility commands to be executed on the sql server.
CREATE DATABASE IF NOT EXISTS TravelPlanner;
USE  TravelPlanner;


CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30),
    Pno  DOUBLE,    
    email VARCHAR(50),
    password VARCHAR(50)
);

