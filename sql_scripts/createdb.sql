create database LearningGroupsDB;
use LearningGroupsDB;

create table Users
(
	ID int primary key auto_increment,
    Login varchar(30) not null unique,
    PasswordHash varchar(40) not null,
    FirstName varchar(15) not null,
    LastName varchar(20) not null,
    NickName varchar(15) unique
);

create table Lessons
(
	ID int primary key auto_increment,
    DateDMY varchar(10),
    Theme tinytext not null,
    Hometask text not null,
    ProfComment text not null
);

create table Marks
(
	ID int primary key auto_increment,
    Mark int
);

create table Evaluating
(
	ID int primary key auto_increment,
    Lesson_ID int,
    Mark_ID int,
    foreign key (Lesson_ID) references Lessons (ID),
    foreign key (Mark_ID) references Marks (ID)
);

create table Learning
(
	ID int primary key auto_increment,
    User_ID int,
    Evaluation_ID int,
    foreign key (User_ID) references Users (ID),
    foreign key (Evaluation_ID) references Evaluating (ID)
);

create table UserGroups
(
	ID int primary key auto_increment,
    NameInfo varchar(30) not null,
    OtherInfo text
);

create table UserGrouping
(
	ID int primary key auto_increment,
    User_ID int,
    Group_ID int,
    foreign key (User_ID) references Users (ID),
    foreign key (Group_ID) references UserGroups (ID)
);

create table News
(
	ID int primary key auto_increment,
    DateDMY varchar(10),
    Title varchar(20) not null,
    Body text not null,
    Epilogue varchar(15)
);

create table Informing
(
	ID int primary key auto_increment,
    New_ID int,
    Group_ID int,
    foreign key (New_ID) references News (ID),
    foreign key (Group_ID) references UserGroups (ID)
);

create table Messages
(
	ID int primary key auto_increment,
	DateDMY varchar(16),
    Sender varchar(15) not null,
    body text not null
);

create table Communicating
(
	ID int primary key auto_increment,
    Message_ID int,
    Group_ID int,
    foreign key (Message_ID) references Messages (ID),
    foreign key (Group_ID) references UserGroups (ID)
);