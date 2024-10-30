-- File to store SQL script to setup database for the app. 


CREATE DATABASE IF NOT EXISTS TravelPlanner;
USE  TravelPlanner;


CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30),
    Pno  DOUBLE,    
    email VARCHAR(50),
    password VARCHAR(50)
);




SELECT name 
FROM users 
WHERE email="";
