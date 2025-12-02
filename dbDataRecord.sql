CREATE TABLE staff (
    staffId INT PRIMARY KEY AUTO_INCREMENT,
    staffNo VARCHAR(20) NOT NULL UNIQUE,
    staffName VARCHAR(50) NOT NULL,
    staffEmail VARCHAR(50) NOT NULL,
    staffContact VARCHAR(12) NOT NULL,
    staffFaculty VARCHAR(12) NOT NULL,
    staffProPic VARCHAR(255) NOT NULL,
    staffOffice VARCHAR(80) NOT NULL,
    staffMemberSince TIMESTAMP NOT NULL,
    staffRole varchar(30) NOT NULL,
    staffPassword VARCHAR(255) NOT NULL
);

create table student (
    studentId int AUTO_INCREMENT PRIMARY KEY,
    matricNo varchar(10) unique not null,
    studentName varchar(50) not null,
    studentEmail varchar(50) not null,
    studentContact varchar(12) not null,
    studentFaculty varchar(100) not null,
    studentCourse varchar(100) not null,
    studentYearOfStudy int(4) not null,
    studentSection varchar(10) not null,
    studentGrp varchar(10) not null, 
    studentProPic varchar(255) not null,
    studentMemberSince datetime default current_timestamp,
    studentPassword varchar(255) not null,
    staffId int,
    FOREIGN KEY (staffId) REFERENCES staff(staffId)
);

create table mood (
  	moodTypeId int PRIMARY KEY AUTO_INCREMENT,
    moodStatus varchar(50),
    moodStoreLocation varchar(255)
);

CREATE TABLE entriesType (
    entriesTypeId int PRIMARY KEY AUTO_INCREMENT,
    entriesType varchar(100)
)

create table entries (
    entriesId int PRIMARY KEY AUTO_INCREMENT,
    entries varchar(100),
    entriesTypeId int,
    entriesStoreLocation varchar(255),
    FOREIGN KEY (entriesTypeId) REFERENCES entriesType(entriesTypeId)
);

create table moodTracking (
    moodId int AUTO_INCREMENT PRIMARY KEY,
    moodTypeId int,
    stressLevel varchar(20),
    note longtext,
    datetimeRecord datetime DEFAULT CURRENT_TIMESTAMP,
    studentId int,
    FOREIGN KEY (studentId) REFERENCES student(studentId) ON DELETE CASCADE,
    FOREIGN KEY (moodTypeId) REFERENCES mood(moodTypeId)
);

CREATE TABLE entriesRecord (
    entriesRecordId int PRIMARY KEY AUTO_INCREMENT,
    entriesTypeId int,
    moodId int,
    FOREIGN KEY (moodId) REFERENCES moodTracking(moodId),
    FOREIGN KEY (entriesTypeId) REFERENCES entriesType(entriesTypeId)
);


CREATE TABLE dass (
    dassId int AUTO_INCREMENT PRIMARY KEY,
    dassCreatedDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    staffId int,
    studentId int,
    FOREIGN KEY (staffId) REFERENCES staff(staffId),
    FOREIGN KEY (studentId) REFERENCES student(studentId) 
);

CREATE TABLE dassQuestion (
    dassQuestionId int AUTO_INCREMENT PRIMARY KEY,
    question longText,
    type ENUM('Depression', 'Anxiety', 'Stress') NOT NULL
);

CREATE TABLE dassRecord (
    dassId int,
    dassQuestionId int,
    scale int(3),
    PRIMARY KEY(dassId, dassQuestionId),
    FOREIGN KEY (dassId) REFERENCES dass(dassId),
    FOREIGN KEY (dassQuestionId) REFERENCES dassQuestion(dassQuestionId)
);

CREATE TABLE recommendation (
    recommendId int AUTO_INCREMENT PRIMARY KEY,
    quote longtext,
    type varchar(30),
    displayCount int DEFAULT 0
);

Create table recommendationDisplay (
    recommendId int,
    studentId int,
    displayCount int DEFAULT 0,
    PRIMARY KEY(recommendId, studentId),
    FOREIGN KEY (recommendId) REFERENCES recommendation(recommendId),
    FOREIGN KEY (studentId) REFERENCES student(studentId)
);

CREATE TABLE notification (
    notificationId int PRIMARY KEY AUTO_INCREMENT,
    title longtext,
    message longtext,
    notiStatus ENUM('UNREAD', 'READ') DEFAULT 'UNREAD',
    notiType ENUM('mood','dass','general') NOT NULL,
    notiCreatedDateTime datetime DEFAULT CURRENT_TIMESTAMP,
    dassId int,
    studentId int, 
    staffId int, 
    moodId int,
    FOREIGN KEY (studentId) REFERENCES student(studentId) ON DELETE SET NULL,
    FOREIGN KEY (staffId) REFERENCES staff(staffId) ON DELETE SET NULL,
    FOREIGN KEY (dassId) REFERENCES dass(dassId) ON DELETE SET NULL,
    FOREIGN KEY (moodId) REFERENCES moodtracking(moodId) ON DELETE SET NULL
);



--  For Dass Questions

INSERT INTO dassQuestion(question, type)
VALUES ("I find it hard to stay calm.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I realize that my mouth always feel dry.", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I can't seem to experience positive feelings at all.", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I am having difficulty breathing (For example, breathing too fast, gasping for breath even when not doing physical activity).", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I don't have enthusiastic to start something.", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I tend to overreact to a certain situation.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I used to tremble (For example, hands).", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I think I'm too nervous.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I'm worried that a situation will arise where I panic and act foolishly.", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I don't think that there's anything that I'm hoping for (Give up hope).", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I find that I get restless easily.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I find it hard to relax.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I feel gloomy and sad.", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I cannot accept anything that prevents me from continuing what I am doing.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("I feel almost panicked.", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I'm not excited at all.", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I felt worthless.", "Depression");

INSERT INTO dassQuestion(question, type)
VALUES ("I am easily offended.", "Stress");

INSERT INTO dassQuestion(question, type)
VALUES ("Even though I am not doing any physical activity, I am aware of my heart beating (e.g. faster heartbeat).", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I feel scare for no reason.", "Anxiety");

INSERT INTO dassQuestion(question, type)
VALUES ("I feel like this life has no meaning anymore.", "Depression");



-- For Recommendation Quote

INSERT INTO recommendation (quote, type) VALUES
("Every small step counts.", "positive"),
("Progress is still progress, no matter how slow.", "positive"),
("You are capable of amazing things.", "positive"),
("Believe in your journey.", "positive"),
("Take it one day at a time.", "positive"),
("Your future needs you—your past does not.", "positive"),
("Be kind to yourself. You’re learning.", "positive"),
("You have survived 100% of your bad days so far.", "positive"),
("It’s okay to rest. Rest is part of the process.", "positive"),
("Even the quiet moments matter.", "positive");


INSERT INTO recommendation (quote, type) VALUES
("Breathe. You’re going to be okay.", "calm"),
("Peace begins with a single breath.", "calm"),
("You deserve to feel calm.", "calm"),
("Your feelings are valid.", "calm"),
("Slow down. You’re allowed to.", "calm"),
("Resting is not wasting time.", "calm"),
("It’s okay not to be okay.", "calm"),
("Take a break. You need it.", "calm"),
("Release what you cannot control.", "calm"),
("Calmness is your superpower.", "calm");


INSERT INTO recommendation (quote, type) VALUES
("You are stronger than you think.", "motivation"),
("You’ve got this.", "motivation"),
("Challenges help you grow.", "motivation"),
("Trust yourself.", "motivation"),
("Do what you can with what you have.", "motivation"),
("You’re doing better than you think.", "motivation"),
("Keep going. Your future self will thank you.", "motivation"),
("Success is built on small efforts repeated daily.", "motivation"),
("Don’t give up on yourself.", "motivation"),
("You are capable of more than you know.", "motivation");


INSERT INTO recommendation (quote, type) VALUES
("Alto’s Odyssey – Calm visuals and relaxing endless sandboarding.", "game"),
("Stardew Valley – A cozy farming game with a peaceful pace.", "game"),
("Journey – A beautiful, emotional, and relaxing exploration game.", "game"),
("Sky: Children of the Light – Peaceful flying and exploration.", "game"),
("Flower – Control the wind and bloom flowers in a relaxing world.", "game"),
("ABZÛ – An underwater exploration game for relaxation.", "game"),
("Monument Valley – Peaceful puzzles with stunning visuals.", "game"),
("Animal Crossing: Pocket Camp – Chill decorating and collecting.", "game"),
("Neko Atsume – Cute and stress-free cat collecting game.", "game"),
("My Oasis – A calming idle game with soft music and nature.", "game");


-- For Mood Data
INSERT INTO moodData (moodStatus, moodStoreLocation) VALUES
('Excited', '/EmotionCuteEmoji/4.png'),
('Happy', '/EmotionCuteEmoji/1.png'),
('Neutral', '/EmotionCuteEmoji/10.png'),
('Sad', '/EmotionCuteEmoji/11.png'),
('Crying', '/EmotionCuteEmoji/7.png'),
('Angry', '/EmotionCuteEmoji/6.png'),
('Anxious', '/EmotionCuteEmoji/12.png'),
('Annoying', '/EmotionCuteEmoji/13.png');

-- For EntriesType Data
INSERT INTO entriesType (entriesType) VALUES
("Academic"), ("Technical"), ("Social"), ("Emotional"),
("Financial"), ("Health");

