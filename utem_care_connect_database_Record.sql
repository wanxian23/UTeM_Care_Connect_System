-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3301
-- Generation Time: Dec 25, 2025 at 10:27 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `utem_care_connect`
--

-- --------------------------------------------------------

--
-- Table structure for table `dass`
--

DROP TABLE IF EXISTS `dass`;
CREATE TABLE IF NOT EXISTS `dass` (
  `dassId` int(11) NOT NULL AUTO_INCREMENT,
  `dassCreatedDateTime` datetime DEFAULT current_timestamp(),
  `status` enum('Pending','Completed') DEFAULT 'Pending',
  `staffId` int(11) DEFAULT NULL,
  `studentId` int(11) DEFAULT NULL,
  `dassCompletedDateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`dassId`),
  KEY `staffId` (`staffId`),
  KEY `studentId` (`studentId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `dass`
--

INSERT INTO `dass` (`dassId`, `dassCreatedDateTime`, `status`, `staffId`, `studentId`, `dassCompletedDateTime`) VALUES
(1, '2025-12-12 13:32:22', 'Completed', 1, 3, '2025-12-12 15:20:05'),
(4, '2025-12-12 15:03:22', 'Pending', 1, 2, NULL),
(5, '2025-12-15 13:51:23', 'Completed', 2, 9, '2025-12-15 17:15:40'),
(7, '2025-12-25 17:31:44', 'Completed', 2, 10, '2025-12-25 17:36:25'),
(8, '2025-12-25 17:37:42', 'Completed', 2, 1, '2025-12-25 17:38:17');

-- --------------------------------------------------------

--
-- Table structure for table `dassquestion`
--

DROP TABLE IF EXISTS `dassquestion`;
CREATE TABLE IF NOT EXISTS `dassquestion` (
  `dassQuestionId` int(11) NOT NULL AUTO_INCREMENT,
  `question` longtext DEFAULT NULL,
  `type` enum('Depression','Anxiety','Stress') NOT NULL,
  PRIMARY KEY (`dassQuestionId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `dassquestion`
--

INSERT INTO `dassquestion` (`dassQuestionId`, `question`, `type`) VALUES
(1, 'I find it hard to stay calm.', 'Stress'),
(2, 'I realize that my mouth always feel dry.', 'Anxiety'),
(3, 'I can\'t seem to experience positive feelings at all.', 'Depression'),
(4, 'I am having difficulty in breathing (For example, breathing too fast, gasping for breath even when not doing physical activity).', 'Anxiety'),
(5, 'I don\'t have enthusiastic to start something.', 'Depression'),
(6, 'I tend to overreact to a certain situation.', 'Stress'),
(7, 'I used to tremble (For example, hands).', 'Anxiety'),
(8, 'I think I\'m too nervous.', 'Stress'),
(9, 'I\'m worried that a situation will arise where I panic and act foolishly.', 'Anxiety'),
(10, 'I don\'t think that there\'s anything that I\'m hoping for (Give up hope).', 'Depression'),
(11, 'I find that I get restless easily.', 'Stress'),
(12, 'I find it hard to relax.', 'Stress'),
(13, 'I feel gloomy and sad.', 'Depression'),
(14, 'I cannot accept anything that prevents me from continuing what I am doing.', 'Stress'),
(15, 'I feel almost panicked.', 'Anxiety'),
(16, 'I\'m not excited at all.', 'Depression'),
(17, 'I felt worthless.', 'Depression'),
(18, 'I am easily offended.', 'Stress'),
(19, 'Even though I am not doing any physical activity, I am aware of my heart beating (e.g. faster heartbeat).', 'Anxiety'),
(20, 'I feel scare for no reason.', 'Anxiety'),
(21, 'I feel like this life has no meaning anymore.', 'Depression');

-- --------------------------------------------------------

--
-- Table structure for table `dassrecord`
--

DROP TABLE IF EXISTS `dassrecord`;
CREATE TABLE IF NOT EXISTS `dassrecord` (
  `dassId` int(11) NOT NULL,
  `dassQuestionId` int(11) NOT NULL,
  `scale` int(3) DEFAULT NULL,
  PRIMARY KEY (`dassId`,`dassQuestionId`),
  KEY `dassQuestionId` (`dassQuestionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `dassrecord`
--

INSERT INTO `dassrecord` (`dassId`, `dassQuestionId`, `scale`) VALUES
(1, 1, 0),
(1, 2, 0),
(1, 3, 0),
(1, 4, 1),
(1, 5, 1),
(1, 6, 1),
(1, 7, 2),
(1, 8, 2),
(1, 9, 2),
(1, 10, 3),
(1, 11, 3),
(1, 12, 3),
(1, 13, 2),
(1, 14, 2),
(1, 15, 2),
(1, 16, 1),
(1, 17, 1),
(1, 18, 1),
(1, 19, 0),
(1, 20, 0),
(1, 21, 0),
(5, 1, 2),
(5, 2, 2),
(5, 3, 1),
(5, 4, 0),
(5, 5, 3),
(5, 6, 3),
(5, 7, 0),
(5, 8, 0),
(5, 9, 0),
(5, 10, 0),
(5, 11, 1),
(5, 12, 0),
(5, 13, 0),
(5, 14, 1),
(5, 15, 0),
(5, 16, 0),
(5, 17, 0),
(5, 18, 0),
(5, 19, 1),
(5, 20, 0),
(5, 21, 0),
(7, 1, 1),
(7, 2, 0),
(7, 3, 1),
(7, 4, 0),
(7, 5, 0),
(7, 6, 2),
(7, 7, 0),
(7, 8, 1),
(7, 9, 1),
(7, 10, 0),
(7, 11, 0),
(7, 12, 0),
(7, 13, 1),
(7, 14, 2),
(7, 15, 0),
(7, 16, 0),
(7, 17, 0),
(7, 18, 1),
(7, 19, 0),
(7, 20, 0),
(7, 21, 0),
(8, 1, 2),
(8, 2, 3),
(8, 3, 2),
(8, 4, 2),
(8, 5, 2),
(8, 6, 3),
(8, 7, 3),
(8, 8, 3),
(8, 9, 2),
(8, 10, 2),
(8, 11, 3),
(8, 12, 3),
(8, 13, 3),
(8, 14, 2),
(8, 15, 2),
(8, 16, 2),
(8, 17, 3),
(8, 18, 3),
(8, 19, 3),
(8, 20, 3),
(8, 21, 2);

-- --------------------------------------------------------

--
-- Table structure for table `entries`
--

DROP TABLE IF EXISTS `entries`;
CREATE TABLE IF NOT EXISTS `entries` (
  `entriesId` int(11) NOT NULL,
  `entries` varchar(100) DEFAULT NULL,
  `entriesStoreLocation` varchar(255) DEFAULT NULL,
  `entriesTypeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`entriesId`),
  KEY `entriesTypeId` (`entriesTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `entries`
--

INSERT INTO `entries` (`entriesId`, `entries`, `entriesStoreLocation`, `entriesTypeId`) VALUES
(1, 'Assignment', '/AcademicIcon/assignmentIcon.png', 1),
(2, 'Difficult Subject', '/AcademicIcon/difficultSubjectIcon.png', 1),
(3, 'Exam', '/AcademicIcon/examIcon.png', 1),
(4, 'Grade Stress', '/AcademicIcon/gradeCGPAIcon.png', 1),
(5, 'Group Work Stress', '/AcademicIcon/groupWorkIcon.png', 1),
(6, 'Lecturer Expectation', '/AcademicIcon/lecturerIcon.png', 1),
(7, 'Presentation', '/AcademicIcon/presentationIcon.png', 1),
(8, 'Time Management', '/AcademicIcon/timeManagementIcon.png', 1),
(9, 'Device Problem', '/TechnicalIcon/deviceProblemIcon.png', 2),
(10, 'Difficult Subject', '/TechnicalIcon/onlineLearningIcon.png', 2),
(11, 'Exam', '/TechnicalIcon/submissionProblemIcon.png', 2),
(12, 'Friendship Problem', '/SocialIcon/bullyIcon.png', 3),
(13, 'Difficult Subject', '/SocialIcon/friendshipIcon.png', 3),
(14, 'Loneliness', '/SocialIcon/lonelinessIcon.png', 3),
(15, 'Peer Comparison', '/SocialIcon/peerComparisonIcon.png', 3),
(16, 'Relationship', '/SocialIcon/relationshipIcon.png', 3),
(17, 'Friendship Problem', '/EmotionalIcon/burnout_ExhaustedIcon.png', 4),
(18, 'Difficult Subject', '/EmotionalIcon/lowMotivationIcon.png', 4),
(19, 'Loneliness', '/EmotionalIcon/poorEatingHabitIcon.png', 4),
(20, 'Peer Comparison', '/EmotionalIcon/selfDoubtIcon.png', 4),
(21, 'Relationship', '/EmotionalIcon/sleepProblemIcon.png', 4),
(22, 'Financial Problem', '/financialIcon/financialProblemIcon.png', 5),
(23, 'Accomodation Issue', '/financialIcon/accomodationIssueIcon.png', 5),
(24, 'Parttime Stress', '/financialIcon/parttimeWorkStressIcon.png', 5),
(25, 'Transportation Issue', '/financialIcon/transportationIssueIcon.png', 5),
(26, 'Financial Problem', '/HealthIcon/lackOfExerciseIcon.png', 6),
(27, 'Accomodation Issue', '/HealthIcon/mentalHealthIcon.png', 6),
(28, 'Parttime Stress', '/HealthIcon/physicalIllnessIcon.png', 6),
(29, 'Transportation Issue', '/HealthIcon/unconfortableEnvironmentIcon.png', 6);

-- --------------------------------------------------------

--
-- Table structure for table `entriesrecord`
--

DROP TABLE IF EXISTS `entriesrecord`;
CREATE TABLE IF NOT EXISTS `entriesrecord` (
  `entriesRecordId` int(11) NOT NULL AUTO_INCREMENT,
  `moodId` int(11) DEFAULT NULL,
  `entriesTypeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`entriesRecordId`),
  KEY `moodId` (`moodId`),
  KEY `entriesTypeId_2` (`entriesTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `entriesrecord`
--

INSERT INTO `entriesrecord` (`entriesRecordId`, `moodId`, `entriesTypeId`) VALUES
(3, 2, 1),
(7, 3, 1),
(15, 37, 1),
(16, 37, 3),
(17, 38, 1),
(18, 39, 1),
(19, 39, 3),
(21, 41, 1),
(29, 47, 2),
(31, 50, 1),
(33, 53, 1),
(34, 53, 3),
(75, 52, 1),
(84, 62, 1),
(85, 62, 5),
(86, 63, 1),
(87, 63, 5),
(88, 65, 1),
(89, 65, 3),
(90, 66, 1),
(91, 66, 2),
(92, 66, 4),
(93, 69, 1),
(94, 70, 1),
(96, 72, 1),
(97, 72, 4),
(98, 74, 1),
(99, 75, 2),
(107, 83, 1),
(108, 84, 4),
(116, 92, 5),
(124, 91, 3),
(134, 35, 1),
(135, 35, 2),
(136, 35, 3),
(137, 61, 1),
(141, 71, 4),
(144, 40, 1),
(146, 85, 1),
(148, 80, 1),
(149, 90, 1),
(151, 93, 4),
(158, 105, 1);

-- --------------------------------------------------------

--
-- Table structure for table `entriestype`
--

DROP TABLE IF EXISTS `entriestype`;
CREATE TABLE IF NOT EXISTS `entriestype` (
  `entriesTypeId` int(11) NOT NULL AUTO_INCREMENT,
  `entriesType` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`entriesTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `entriestype`
--

INSERT INTO `entriestype` (`entriesTypeId`, `entriesType`) VALUES
(1, 'Academic'),
(2, 'Technical'),
(3, 'Social'),
(4, 'Emotional'),
(5, 'Financial'),
(6, 'Health');

-- --------------------------------------------------------

--
-- Table structure for table `mood`
--

DROP TABLE IF EXISTS `mood`;
CREATE TABLE IF NOT EXISTS `mood` (
  `moodTypeId` int(11) NOT NULL AUTO_INCREMENT,
  `moodStatus` varchar(50) DEFAULT NULL,
  `moodStoreLocation` varchar(255) DEFAULT NULL,
  `priority` int(3) DEFAULT NULL,
  `category` enum('Positive','Neutral','Negative') DEFAULT 'Positive',
  PRIMARY KEY (`moodTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `mood`
--

INSERT INTO `mood` (`moodTypeId`, `moodStatus`, `moodStoreLocation`, `priority`, `category`) VALUES
(1, 'Excited', '/EmotionCuteEmoji/4.png', 7, 'Positive'),
(2, 'Happy', '/EmotionCuteEmoji/1.png', 6, 'Positive'),
(3, 'Neutral', '/EmotionCuteEmoji/10.png', 5, 'Neutral'),
(4, 'Sad', '/EmotionCuteEmoji/11.png', 1, 'Negative'),
(5, 'Crying', '/EmotionCuteEmoji/7.png', 0, 'Negative'),
(6, 'Angry', '/EmotionCuteEmoji/6.png', 2, 'Negative'),
(7, 'Anxious', '/EmotionCuteEmoji/12.png', 3, 'Negative'),
(8, 'Annoying', '/EmotionCuteEmoji/13.png', 4, 'Negative');

-- --------------------------------------------------------

--
-- Table structure for table `moodtracking`
--

DROP TABLE IF EXISTS `moodtracking`;
CREATE TABLE IF NOT EXISTS `moodtracking` (
  `moodId` int(11) NOT NULL AUTO_INCREMENT,
  `stressLevel` int(3) DEFAULT NULL,
  `note` longtext DEFAULT NULL,
  `datetimeRecord` datetime DEFAULT current_timestamp(),
  `studentId` int(11) DEFAULT NULL,
  `moodTypeId` int(11) DEFAULT NULL,
  `notePrivacy` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`moodId`),
  KEY `studentId` (`studentId`),
  KEY `moodTypeId` (`moodTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `moodtracking`
--

INSERT INTO `moodtracking` (`moodId`, `stressLevel`, `note`, `datetimeRecord`, `studentId`, `moodTypeId`, `notePrivacy`) VALUES
(2, 10, 'Today felt like stepping into a quiet library just as the sun beams through the tall windows. The morning started calm, with soft light painting golden streaks across your desk, but the air was alive with subtle tension—like a page waiting to be turned. Each task you tackled was a little puzzle, some pieces fitting perfectly, others testing your patience.\r\n\r\nBy afternoon, there was a spark of excitement—a tiny victory, a moment of laughter, or an idea that finally clicked. Yet, the world outside reminded you to pause and breathe, with gentle whispers of wind and distant chatter grounding you.\r\n\r\nAs evening approaches, it feels like a cozy blanket settling around your shoulders. Today was a mix of focus and reflection, small wins and gentle lessons, leaving you with a sense of quiet accomplishment and the soft promise of tomorrow.', '2025-11-26 22:43:44', 1, 2, 1),
(3, 20, 'Today started off as a rather neutral day, neither particularly exciting nor overwhelmingly dull. The morning air felt calm as I got ready, and for a moment, I felt a sense of quiet balance. It was the kind of day where nothing dramatic happened, but at the same time, everything seemed to demand a little attention. My energy was steady, and I approached my tasks with a moderate focus, aware that the day would require careful management to avoid slipping into unnecessary stress.\r\n\r\nBy mid-morning, my thoughts began to drift toward the looming assignments that were due soon. Each task seemed manageable on its own, but seeing them all lined up created a subtle tension. I reminded myself to take things one step at a time, prioritizing the most urgent work first. Even though my stress level was relatively low, around 20%, the presence of these responsibilities lingered in the back of my mind, nudging me to stay organized and on track.\r\n\r\nThe afternoon was consumed by preparation for upcoming exams. I reviewed my notes and tried to mentally rehearse possible questions, but occasionally I found myself distracted by minor worries. The pressure wasn’t overwhelming, but it was enough to keep me alert. I felt a quiet determination to do my best, understanding that consistency matters more than perfection. This gentle push kept me productive without tipping the day into high stress.\r\n\r\nLater in the day, I considered the expectations set by my lecturer. While they were reasonable, they added another layer of responsibility that needed attention. It was not stressful enough to cause anxiety, but it reminded me to maintain a disciplined approach to my work. I took short breaks to relax my mind, appreciating that even neutral days benefit from small moments of self-care.\r\n\r\nAs the evening approached, I reflected on the day. Despite having a few sources of mild stress—assignments, exams, and lecturer expectations—the overall feeling remained calm and manageable. It was a reminder that stress doesn’t always have to be overwhelming; even when tasks accumulate, a neutral and steady approach can help keep things under control. The day closed quietly, leaving me with a sense of accomplishment for handling multiple responsibilities without losing balance.', '2025-11-27 02:00:22', 1, 3, 1),
(35, 100, '...............................................................', '2025-12-01 17:53:52', 1, 6, 1),
(37, 0, 'Today was surprisingly exciting, and honestly, I’m really happy about it. My stress level feels like 0%, which is such a great feeling because it’s been a while since I felt this light. From the moment I woke up, I felt a kind of positive energy that just stayed with me throughout the day. I felt more motivated, more alive, and more ready to take things on.\r\n\r\nEven though I’m excited and stress-free today, I still know deep down that some of my stress usually comes from academic pressure and a bit of social stuff too. Academically, I sometimes worry about whether I’m keeping up, whether I’m doing enough, and whether my results will reflect the effort I put in. I always remind myself that I’m trying my best, but the pressure still sticks around sometimes. As for social stress, it’s more subtle — it’s not always obvious, but sometimes I get anxious about how I present myself to others, whether I’m connecting well with people, or whether I’m meeting expectations. It’s not overwhelming, but it’s there in the background.\r\n\r\nBut today? None of that really pulled me down. It felt like my mind finally took a break. I felt free, present, and genuinely excited about everything happening around me. Maybe it’s because I accomplished something meaningful, or maybe it’s just one of those days where everything aligns and feels right.\r\n\r\nI’m glad I had a day like this. I’m grateful for the excitement, the peace, and the sense of confidence I felt. I hope I can carry this feeling forward — even when academic or social stress comes back, at least I know I can still have days like today where everything feels okay.', '2025-12-01 17:56:20', 1, 1, 1),
(38, 0, 'Happy Everyday OK!', '2025-12-01 21:22:07', 2, 2, 1),
(39, 0, 'Today is a good day! I\'m always happy all the time :) Have a nice sleep and relax OK! BRO!', '2025-12-01 21:24:38', 2, 1, 1),
(40, 28, 'It\'s already midnight 12AM, I\'m just finish watching douyin and decide to continue fighting with my final year project. To be honest, I don\'t know what to write, but since I wanna test this website, so yeah, it\'s time to write something. I think it is good to write down things that happen recently or maybe some life lesson that I learnt these days. \r\n\r\nSo yeah, the first thing I wanna written was, I felt that I\'m like lack of motivation in doing anything. It\'s like I\'m stress and I knew that I gonna rush and finish it as soon as possible. But there are something that stop you from continue moving on. Yeah, you might said that it\'s because of my laziness, but for me, I really like feel empty. \r\n\r\nBut yeah, it has no time for me to relax anymore, even if I have no motivation, but life needs to keep moving on. Just, continue fighting Sis :)', '2025-12-02 00:25:26', 1, 3, 1),
(41, 70, 'Today was one of those days where everything felt just slightly off, and every small thing somehow managed to get on my nerves.\r\n\r\nNothing huge happened, but it was like the whole day was filled with tiny irritations — the kind that slowly build up and make me want to sigh every five minutes. People talking at the wrong time, things not working the way they should, and my patience just wearing thinner and thinner as the hours went by.\r\n\r\nI wasn’t angry, not really. Just… annoyed.\r\nAnnoyed at interruptions, annoyed at small mistakes, annoyed at things that normally wouldn’t bother me but today felt like too much.\r\n\r\nHonestly, I just want the day to end so I can reset.\r\nHoping tomorrow decides to be kinder, because today definitely wasn’t.', '2025-12-02 20:27:34', 1, 8, 1),
(47, 20, 'Today tested my patience in ways I didn’t ask for.\r\nFrom the moment I woke up, it felt like the world was set to “irritate mode.”\r\n\r\nLittle things kept piling up — delays, interruptions, people asking things at the worst possible time. Every task seemed harder than it needed to be, and every sound felt louder than usual. I kept trying to stay calm, but honestly, my tolerance was running dangerously low.\r\n\r\nI wasn’t in a bad mood at first, but the day slowly dragged me into one.\r\nIt’s like the universe kept poking me just to see if I’d react.\r\n\r\nI didn’t snap at anyone, but trust me, the internal eye-rolls were constant.\r\n\r\nAnyway… I survived the day, even though it drained me more than it should have.\r\nHopefully tomorrow doesn’t copy today, because I’ve had enough of this annoying energy.', '2025-12-02 21:38:52', 2, 8, 1),
(50, 0, 'Today was such an unexpectedly exciting day, and honestly, I felt zero stress the whole time. It’s rare for me to have a day where my mood is completely lifted without anything dragging me down, but today was one of those days.\r\n\r\nEverything felt energizing — even small things. I woke up with this light feeling, like something good was going to happen, and that mood just stayed with me. My thoughts were clear, my energy was high, and I couldn’t stop smiling at random moments.\r\n\r\nI got things done easily, without that usual heaviness or pressure. Nothing bothered me, nothing felt too hard, and everything just flowed. I even caught myself feeling excited about things I normally wouldn’t care much about. Maybe it’s the relief from finishing other work earlier, or maybe it’s just one of those good days that decides to show up.\r\n\r\nWhatever the reason, I’m grateful.\r\nIt felt refreshing to live a whole day without any stress hanging over me — just pure excitement, motivation, and good vibes.\r\n\r\nIf only more days could feel like this.', '2025-12-03 16:09:13', 7, 1, 1),
(52, 10, 'Today has been a bright and uplifting day overall. I felt genuinely happy throughout most of it, and my mood stayed positive despite having a bit of stress lingering in the background. The happiness came naturally — I felt lighter, more energetic, and more motivated than usual. Even small moments felt enjoyable, and I managed to go through the day with a sense of ease and optimism.\r\n\r\nMy stress level today is around 10%, which is relatively low, but still present enough for me to notice. This stress mainly comes from academic-related issues. There are tasks, deadlines, and expectations that occasionally weigh on my mind. Even though the workload isn’t overwhelming right now, the constant reminder of assignments and upcoming responsibilities keeps me slightly tense. It’s the kind of stress that sits quietly at the back of my thoughts — not strong enough to ruin my mood, but enough to make me aware that I need to stay on track.\r\n\r\nDespite that, I’m proud that the stress didn’t take over my day. I managed to balance my emotions well, staying cheerful and productive. Today felt like a reminder that even with small pressures in life, I can still maintain positivity and enjoy the moments around me. I hope the next few days continue in the same direction, with happiness growing and stress staying small and manageable.', '2025-12-08 20:05:49', 2, 1, 1),
(53, 100, 'Today has been an extremely heavy and overwhelming day. My mood has been deeply emotional, and I found myself breaking down into tears more than once. It feels like everything I’ve been carrying suddenly became too much to hold in, and the weight of it all finally pushed me past my limit. There’s a sense of sadness and exhaustion that I can’t ignore, and my heart feels unusually fragile today.\r\n\r\nMy stress level is at 100%, and it’s painfully clear that both academic pressure and relationship issues are hitting me at the same time. Academically, things feel chaotic — deadlines, expectations, and the fear of falling behind are all swirling in my mind nonstop. No matter how much I try to focus, the stress just keeps piling up, and it feels like I’m losing grip on the balance I used to have.\r\n\r\nOn top of that, the emotional strain from relationship matters makes everything even harder to handle. It’s the kind of hurt that sits deep inside — confusing, draining, and making me question things I normally wouldn’t. The mix of academic worries and relationship tension creates a storm inside me, making it nearly impossible to calm down or think clearly.\r\n\r\nToday feels like one of those days where everything collapses at once, and all I can do is let myself cry it out. Even though it’s overwhelming, I know this feeling won’t last forever. Right now, I’m just giving myself space to feel the pain, to acknowledge the stress, and to accept that it’s okay to not be okay sometimes.', '2025-12-08 21:50:24', 2, 5, 0),
(61, 20, 'Today felt surprisingly uplifting, and I’m genuinely excited about everything that unfolded. There’s a kind of energy in me that makes the day feel brighter and more motivating than usual. Even though I still have some academic tasks on my mind, the stress level is very manageable—around 20%—and it isn’t weighing me down the way it sometimes does. Instead, it feels like a small reminder that I have responsibilities, but they’re not stopping me from enjoying the moment.\r\n\r\nThe excitement comes from a sense of progress and clarity in my academic journey. Maybe it’s understanding something better, completing something important, or simply feeling more confident about what’s ahead. Whatever it is, that spark really lifted my mood today. I felt more positive, more willing to engage, and more ready to take on what’s coming next.\r\n\r\nEven with academics being the reason behind the little bit of stress I’m carrying, it doesn’t affect the excitement in a negative way. In fact, it almost feels like part of the motivation—like the challenges are pushing me forward rather than slowing me down.\r\n\r\nOverall, today was a good mix of productivity, enthusiasm, and a refreshing emotional boost. I’m hoping I can carry this energy forward and keep using it to move through my academic tasks with confidence and momentum.', '2025-12-09 23:44:33', 1, 1, 0),
(62, 30, 'Today I’m feeling genuinely happy, and it feels refreshing. Even though life still has its challenges, I can feel a lightness in my mood that makes the day brighter. My stress level is around 30%, which means the pressure is still there, but it isn’t weighing me down too much. I’m still able to smile, stay positive, and enjoy the little things happening around me.\r\n\r\nSome of my stress is coming from academic responsibilities and a bit from financial and lifestyle concerns. Those thoughts do pop up in the background, reminding me of the things I still need to handle and improve. But even with those worries, I’m choosing to stay hopeful and appreciate how far I’ve come. It feels good to know that I can be happy while still dealing with challenges — it shows I’m growing stronger and learning to balance everything better.\r\n\r\nOverall, today feels like a good day. I’m grateful for moments like this where happiness comes naturally, even with stress lingering around. I hope the rest of the day continues to carry this positive energy, and I’ll keep reminding myself that I’m capable of managing whatever comes next.', '2025-12-10 17:21:09', 7, 1, 1),
(63, 100, 'Today has been overwhelmingly heavy, and I’ve been feeling deeply sad throughout the day. Even small tasks feel heavier than usual, and my thoughts keep circling around the things that are stressing me out. My stress level feels like it’s at 100%, almost like everything is piling up at the same time with no room to breathe. It’s exhausting emotionally, and it’s been affecting my focus, mood, and even my motivation.\r\n\r\nA big part of this sadness comes from academic pressure and the weight of financial and lifestyle concerns. Academically, I feel like I’m constantly trying to catch up, constantly trying to meet expectations that keep increasing. No matter how much effort I put in, it still feels overwhelming. And on top of that, the financial and lifestyle stress keeps adding more to the burden—worrying about money, planning daily expenses, thinking about the future, and trying to manage everything at once. All these things together make the day feel especially tough.\r\n\r\nEven though today is difficult, I’m still here trying to process everything honestly. I know that some days will be heavier than others, and this is one of those days where I just need to acknowledge how I feel. It’s okay to feel sad when life becomes too much. I’m hoping that with time, rest, and support, the pressure will ease and I’ll feel lighter again. For now, I’m allowing myself to feel this sadness, knowing that it doesn’t define me and that better days will come.', '2025-12-10 17:24:50', 7, 4, 1),
(64, 30, 'Today feels like a very steady and balanced day. My mood is neutral — not particularly high or low — just somewhere comfortably in the middle. There isn’t anything overwhelming happening emotionally, and at the same time, nothing exceptionally uplifting either. It’s one of those days where things simply move at a normal pace, and I’m going along with it without much disturbance.\r\n\r\nMy stress level today is around 35%, which is manageable and not too heavy. It’s more like a small background tension rather than something tied to any specific problem. Sometimes this kind of mild stress just appears naturally from daily routines, responsibilities, or a busy mind, even when nothing major is actually wrong.\r\n\r\nInterestingly, there’s no clear reason behind the stress. It’s just there — quiet, soft, and not demanding too much attention. I can still function well, think clearly, and do what I need to do. It feels like one of those days where my mind is calm but slightly alert, keeping an even balance between rest and awareness.\r\n\r\nOverall, it’s a steady, uneventful day emotionally. Nothing dramatic, nothing overwhelming — just neutral. And sometimes, that’s perfectly okay.', '2025-12-10 18:49:12', 1, 3, 0),
(65, 100, 'Today feels overwhelmingly heavy, and that anger sitting inside me is burning at its peak. With a stress level hitting 100%, it’s clear that everything from academics to social and interpersonal situations is pushing me to my limit. Handling academic pressure alone is already exhausting—deadlines, expectations, and the constant fear of not performing well enough keep stacking up until it feels like I’m suffocating under the weight. But adding social and interpersonal stress into the mix makes everything even more frustrating. Whether it’s misunderstandings, conflicts, or just feeling disconnected from the people around me, it all builds up into this intense emotional storm.\r\n\r\nRight now, it feels like I’m carrying too much at once. Every little thing triggers irritation, and even small problems feel huge because the frustration has nowhere to go. I’m trying to manage everything, but it’s like every time I take one step forward, something else pushes me two steps back. Still, even in moments like this, I know that these emotions won’t last forever. I just need time—time to breathe, time to sort out my thoughts, and time to let the anger cool down. For now, I’m acknowledging how I feel, accepting that it’s valid, and reminding myself that it’s okay to pause and reset when everything becomes too much.', '2025-12-12 13:35:56', 3, 6, 0),
(66, 64, 'xxx', '2025-12-12 14:31:18', 3, 3, 0),
(67, 20, 'Today felt relatively calm and steady overall. My mood stayed neutral, without any strong emotional highs or lows. It was one of those days where nothing particularly exciting or upsetting happened, and I was able to go through my routine at a comfortable pace. I felt emotionally balanced and grounded, just moving through the day as it came.\r\n\r\nMy stress level today was around 20%, which is quite low. There wasn’t any specific reason behind the stress — it felt more like a natural, background tension that comes from daily life rather than any particular problem or pressure. It didn’t interfere with my focus or mood, and I was able to manage everything without feeling overwhelmed.\r\n\r\nEven though the day wasn’t especially memorable, it felt peaceful in its own way. Having a neutral day reminds me that not every day needs to be emotionally intense to be meaningful. Sometimes, simply feeling okay and stable is enough, and today was one of those moments where balance mattered more than excitement or struggle.', '2025-12-14 22:10:23', 3, 3, 0),
(68, 5, 'Today has been a refreshing and uplifting day. I felt genuinely excited from the moment I started the day, with a sense of positivity and anticipation carrying me through each moment. There was a lightness in my mood that made everything feel more enjoyable, and even simple tasks felt rewarding. It’s one of those days where energy flows naturally, and motivation comes without force.\r\n\r\nMy stress level today is very low, around 5%, barely noticeable. Any small worries that appeared were easy to manage and didn’t stay for long. Instead of feeling pressured, I felt calm and confident, able to focus on what mattered without feeling overwhelmed. This low level of stress allowed me to enjoy the day fully and stay present in the moment.\r\n\r\nOverall, today felt exciting in a gentle, reassuring way — not rushed or chaotic, but filled with good energy and optimism. Days like this remind me that balance is possible, and that even small moments of happiness can make a big difference. I hope to carry this feeling forward and let it motivate me in the days ahead.', '2025-12-14 23:57:02', 3, 1, 1),
(69, 65, 'Today has been filled with a constant sense of uneasiness. My overall mood is anxious, and even though nothing feels completely out of control, there’s a lingering tension that I can’t easily shake off. My mind keeps jumping from one thought to another, making it hard to fully relax or feel settled. It’s not overwhelming panic, but rather a quiet, persistent worry that stays with me throughout the day.\r\n\r\nMy stress level today feels around 65%, which means it’s noticeably affecting my emotions and focus. I find myself overthinking small details and replaying situations in my head, wondering if I’ve done enough or if something might go wrong. This anxiety makes me feel restless and slightly drained, even when I try to take breaks or distract myself.\r\n\r\nDespite this, I’m still pushing through the day as best as I can. I remind myself that feeling anxious doesn’t mean I’m failing — it simply means I’m human and dealing with things that matter to me. Hopefully, with some rest, reassurance, and time, this anxious feeling will ease, and I’ll be able to regain a sense of calm and balance again.', '2025-12-15 00:08:54', 3, 7, 1),
(70, 100, 'amasyam i love u', '2025-12-15 13:42:24', 9, 2, 1),
(71, 45, 'Today, I’ve been feeling quite annoyed. It’s one of those days where everything seems to irritate me a little more than usual. Even small inconveniences or minor disruptions in my routine feel frustrating, and it’s taking more effort than normal to stay calm. My stress level is around 40%, which is moderate, and the main reasons come from emotional and personal stressors. These could be lingering worries, unresolved personal matters, or small interactions that unexpectedly affect my mood.\r\n\r\nDespite the annoyance, I’m trying to remind myself that it’s okay to feel this way. It’s normal to have off days, and acknowledging my emotions is the first step in managing them. I’ve noticed that some of my reactions are amplified because I’ve been carrying minor tensions over the past few days. I hope that by taking short breaks, practicing patience, and focusing on things I can control, I can gradually calm down and regain a sense of balance.\r\n\r\nEven though I feel irritated, I know I’m capable of handling these feelings without letting them take over my whole day. I will try to approach the challenges with a bit of humor and perspective, and remind myself that emotions are temporary—they come and go, and this annoyance will eventually fade. For now, I’ll accept that it’s okay to feel annoyed, and use this awareness to treat myself with a little extra care and patience.', '2025-12-16 16:42:07', 1, 8, 0),
(72, 85, 'Today has been a really tough day emotionally. I’ve been feeling overwhelmingly sad, and my stress level is very high at around 85%. The primary reasons for this stress come from academic pressures and emotional or personal stressors. Academically, I’ve been feeling the weight of deadlines, assignments, or exams, and it’s making it hard to focus or find motivation. Every task feels heavier than usual, and I keep worrying about whether I can meet expectations, which is exhausting.\r\n\r\nOn top of that, personal and emotional stressors are adding to the heaviness I feel. Whether it’s unresolved conflicts, personal disappointments, or just an internal struggle with my feelings, it’s making it difficult to manage my mood. I feel drained and low on energy, like even small tasks require extra effort.\r\n\r\nDespite this, I am trying to acknowledge my feelings rather than suppress them. I know that sadness is a natural response to pressure and challenges, and it’s okay to feel this way. I am reminding myself to take breaks, breathe, and focus on small steps to ease the pressure. Reaching out to someone I trust or writing about my feelings might also help me process what I’m going through.\r\n\r\nAlthough today feels heavy and emotionally challenging, I understand that these feelings are temporary. By recognizing the sources of my stress and being mindful of my emotional state, I hope to regain a bit of clarity and strength to face tomorrow with a calmer mindset. For now, I will allow myself to feel this sadness while looking for small ways to care for my mental and emotional well-being.', '2025-12-16 17:31:51', 1, 4, 1),
(73, 20, 'Today feels light and positive overall. I’m in a happy mood, and my stress level is very low at around 10%, which makes everything feel more manageable and enjoyable. I feel more relaxed and at ease with myself, and there’s a sense of balance in how the day has gone so far. Even if there were small tasks or responsibilities to take care of, they didn’t feel overwhelming or heavy.\r\n\r\nI noticed that I was able to focus better and enjoy the simple moments throughout the day, whether it was completing work smoothly, having a pleasant interaction, or just taking some quiet time for myself. My thoughts feel clearer, and I’m not carrying much emotional or mental tension. This calm and positive state makes me feel more motivated and appreciative of what I have.\r\n\r\nHaving such a low stress level reminds me how important it is to slow down and acknowledge good days like this. I want to remember this feeling and carry it forward, especially on more challenging days. Overall, today has been a genuinely pleasant day, and I’m grateful for the happiness and peace I feel right now.', '2025-12-17 21:10:20', 1, 2, 0),
(74, 95, 'Today has been extremely overwhelming, and I feel deeply sad with my stress level reaching around 95%. Academic pressure is the main reason behind this feeling. The workload feels endless, and the expectations placed on me seem very heavy right now. Assignments, deadlines, and the fear of falling behind have been constantly on my mind, making it difficult to relax or feel at ease throughout the day.\r\n\r\nI find myself overthinking my academic performance and worrying about whether I’m doing enough or doing things correctly. Even when I try to focus, my thoughts keep drifting back to what I still need to complete, which increases my anxiety and emotional exhaustion. This pressure has drained my motivation and made everything feel harder than it normally would.\r\n\r\nEmotionally, the stress from academics has turned into sadness and frustration. It feels discouraging when I put in effort but still feel uncertain about the outcomes. The fear of disappointing myself or others adds to this emotional weight, making the day feel longer and more tiring.\r\n\r\nDespite feeling overwhelmed, I know that this is a difficult phase rather than a permanent situation. I’m trying to remind myself that it’s okay to feel sad and stressed when things become too much. Taking small breaks, organizing my tasks step by step, and giving myself permission to rest might help me slowly regain control.\r\n\r\nAlthough today feels very heavy, I hope that by acknowledging how intense my stress is and recognizing its academic source, I can find healthier ways to cope and move forward one step at a time. Tomorrow, I aim to approach my studies with a clearer mind and a bit more self-compassion.', '2025-12-17 22:16:49', 1, 4, 0),
(75, 80, 'Today has been extremely frustrating, and I feel genuinely angry because of ongoing technical and system-related issues. My stress level is very high at around 80%, mainly because things that were supposed to work smoothly kept failing or behaving unexpectedly. These technical problems disrupted my workflow, wasted a lot of time, and made simple tasks feel unnecessarily complicated.\r\n\r\nWhat made it worse was the feeling of helplessness — no matter how much effort I put into fixing the issues, the system did not respond the way I expected. Errors, bugs, slow performance, or system failures kept piling up, and each problem added to my frustration. It felt unfair that progress depended so much on technology that was out of my control.\r\n\r\nThis situation affected my patience and emotional balance. I noticed myself becoming irritated more easily, thinking negatively, and losing focus. Instead of working productively, I spent most of my energy trying to troubleshoot, repeat steps, or search for solutions. The anger mostly came from the sense that my time and effort were being wasted due to technical limitations rather than my own mistakes.\r\n\r\nDespite feeling angry, I am trying to calm myself down and step back for a moment. Taking short breaks, restarting tasks later, or seeking help from others might reduce the pressure. I remind myself that technical problems are temporary and can eventually be resolved, even if they feel overwhelming in the moment.\r\n\r\nAlthough today was dominated by frustration and anger, I hope that once these system issues are fixed, I can regain control and move forward with a clearer and calmer mindset. For now, acknowledging this anger helps me understand my emotional state and reminds me to be patient with both myself and the situation.', '2025-12-17 23:16:10', 6, 6, 1),
(78, 90, 'Annoy', '2025-12-18 00:00:16', 3, 8, 1),
(79, 65, 'angry', '2025-12-18 00:01:34', 3, 3, 1),
(80, 24, 'Happy with 10% Stress level', '2025-12-18 00:03:55', 1, 2, 1),
(81, 25, 'Neutral with 25% stress', '2025-12-18 00:07:20', 6, 3, 1),
(83, 9, 'test', '2025-12-18 11:24:34', 6, 2, 0),
(84, 72, 'Annoying 72% Stress Level and Emotional Stress as Reason', '2025-12-18 11:56:13', 2, 8, 0),
(85, 26, 'test', '2025-12-18 13:55:31', 1, 1, 1),
(90, 37, 'Today feels a little heavier than usual. I’m feeling anxious, and my stress level is around 35%, mostly coming from academic pressure. Even though it’s not overwhelming, the constant thoughts about assignments, deadlines, and expectations keep lingering in my mind. I find myself worrying about whether I’m doing enough, whether I understand everything properly, and whether my efforts will pay off in the end.\r\n\r\nAt times, the anxiety comes quietly—just a sense of uneasiness while studying or thinking about upcoming tasks. It doesn’t completely stop me from functioning, but it makes everything feel slightly more tiring than it should be. I have moments where I overthink small academic matters, replaying them in my head even when I try to rest.\r\n\r\nStill, I’m trying to stay grounded and remind myself that this stress is manageable. I know that feeling anxious doesn’t mean I’m failing—it just means I care about my progress and my future. Taking short breaks, organizing my tasks, and reminding myself to go one step at a time helps keep things under control. Today is about acknowledging the anxiety without letting it take over, and trusting that with steady effort, things will gradually feel lighter.', '2025-12-25 16:41:13', 1, 7, 0),
(91, 35, 'Today feels emotionally balanced, even though there’s a quiet weight from social and interpersonal matters. My mood is neutral—not particularly happy or sad—but there’s a sense of reflection throughout the day. Interactions with others have been on my mind, whether it’s misunderstandings, unspoken expectations, or simply feeling slightly disconnected in conversations. Nothing drastic happened, yet the accumulation of small social moments made me pause and think more deeply than usual.\r\n\r\nDespite this, I managed to stay calm and composed. I didn’t let emotions overflow, nor did I suppress them completely. Instead, I tried to observe how I felt and understand where those feelings were coming from. Being neutral today feels like standing in the middle—aware of the challenges but not overwhelmed by them. It’s a reminder that not every day has to be emotionally intense to be meaningful.\r\n\r\nI’m learning that social and interpersonal stress doesn’t always show itself loudly. Sometimes it exists quietly, nudging me to reflect on boundaries, communication, and self-worth. Today was more about awareness than reaction, and that in itself feels like progress. I’m giving myself space to process these thoughts and hoping that with time, clarity and emotional ease will naturally follow.', '2025-12-25 16:44:51', 1, 3, 1),
(92, 30, '安迪要骗我钱 烦死了', '2025-12-25 17:22:17', 10, 3, 0),
(93, 76, 'Today has been quite draining emotionally, and I’ve been feeling consistently annoyed throughout the day. My stress level is around 70%, mainly due to emotional and personal stressors that have been weighing heavily on my mind. Small things that normally wouldn’t bother me seem to trigger irritation more easily, and I find myself feeling restless and impatient without a clear outlet for those emotions.\r\n\r\nThere’s a sense of internal tension that’s difficult to shake off. Personal thoughts, unresolved feelings, or ongoing emotional challenges keep replaying in my head, making it hard to fully relax or focus. Even when things appear calm on the surface, I still feel this underlying frustration building up, which adds to the feeling of being overwhelmed.\r\n\r\nI notice that this emotional stress is affecting how I react to situations and people around me. I may feel more sensitive, easily annoyed, or withdrawn, even though I don’t necessarily want to be. It’s frustrating to recognize these reactions while still struggling to control them.\r\n\r\nDespite feeling annoyed, I’m trying to be aware of my emotions instead of letting them take over completely. Taking short breaks, distancing myself from stressful thoughts, and reminding myself that emotions are temporary helps a little. I know that these emotional and personal stressors won’t last forever, and acknowledging them is an important step toward managing them better.\r\n\r\nAlthough today feels emotionally heavy and irritating, I hope that with rest, reflection, and self-care, this tension will gradually ease. For now, I’m allowing myself to feel what I feel, while staying mindful of how I respond and giving myself the time and space needed to regain emotional balance.', '2025-12-26 01:30:18', 1, 8, 0),
(105, NULL, 'Test 2', '2025-12-26 04:25:01', 1, 8, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
CREATE TABLE IF NOT EXISTS `notification` (
  `notificationId` int(11) NOT NULL AUTO_INCREMENT,
  `title` longtext DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `notiStatus` enum('UNREAD','READ') DEFAULT 'UNREAD',
  `notiType` enum('mood','dass','general') NOT NULL,
  `notiCreatedDateTime` datetime DEFAULT current_timestamp(),
  `dassId` int(11) DEFAULT NULL,
  `studentId` int(11) DEFAULT NULL,
  `staffId` int(11) DEFAULT NULL,
  `moodId` int(11) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`notificationId`),
  KEY `studentId` (`studentId`),
  KEY `staffId` (`staffId`),
  KEY `dassId` (`dassId`),
  KEY `moodId` (`moodId`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notificationId`, `title`, `content`, `notiStatus`, `notiType`, `notiCreatedDateTime`, `dassId`, `studentId`, `staffId`, `moodId`, `description`, `location`) VALUES
(57, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 17:25:09', NULL, 1, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(58, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 17:25:09', NULL, 2, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(59, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 17:25:09', NULL, 3, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(60, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 17:25:09', NULL, 4, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(61, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 17:25:09', NULL, 5, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(62, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 17:25:09', NULL, 6, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(63, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 17:25:09', NULL, 8, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(64, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 18:50:44', NULL, 1, NULL, NULL, 'How was your day? Update your mood to reflect how you’re feeling now.', '/MoodRecord'),
(65, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 18:50:44', NULL, 2, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(66, 'Daily Mood Record Time!', NULL, 'READ', 'mood', '2025-12-10 18:50:44', NULL, 3, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(67, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 18:50:44', NULL, 4, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(68, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 18:50:44', NULL, 5, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(69, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 18:50:44', NULL, 6, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(70, 'Daily Mood Record Time!', NULL, 'UNREAD', 'mood', '2025-12-10 18:50:44', NULL, 8, NULL, NULL, 'Good morning! Take a moment to record your mood and set the tone for today.', '/MoodRecord'),
(71, 'Complete Your DASS Assessment', NULL, 'READ', 'dass', '2025-12-12 13:32:22', NULL, 3, NULL, NULL, 'The DASS assessment for 12-12-2025 has assigned by your PA. Kindly click here to fill it in.', '/DassAssessment/1/1/3'),
(74, 'Complete Your DASS Assessment', NULL, 'READ', 'dass', '2025-12-12 15:03:22', NULL, 2, NULL, NULL, 'The DASS assessment for 12-12-2025 has assigned by your PA. Kindly click here to fill it in.', '/DassAssessment/4/1/2'),
(75, 'DASS Assessment Completed By A Student!', NULL, 'READ', 'dass', '2025-12-14 21:44:26', NULL, NULL, 1, NULL, 'DASS Assessment has completed by D032310403! Click and check it out.', NULL),
(76, 'Complete Your DASS Assessment', NULL, 'READ', 'dass', '2025-12-15 13:51:23', NULL, 9, NULL, NULL, 'The DASS assessment for 15-12-2025 has assigned by your PA. Kindly click here to fill it in.', '/DassAssessment/5/2/9'),
(77, 'DASS Assessment Completed By A Student!', NULL, 'READ', 'dass', '2025-12-15 13:53:22', NULL, NULL, 2, NULL, 'DASS Assessment has completed by D032310126! Click and check it out.', NULL),
(79, 'Complete Your DASS Assessment', NULL, 'READ', 'dass', '2025-12-25 17:31:43', NULL, 10, NULL, NULL, 'The DASS assessment for 25-12-2025 has assigned by your PA. Kindly click here to fill it in.', '/DassAssessment/7/2/10'),
(80, 'DASS Assessment Completed By A Student!', NULL, 'READ', 'dass', '2025-12-25 17:36:25', NULL, NULL, 2, NULL, 'DASS Assessment has completed by D032310322! Click and check it out.', NULL),
(81, 'Complete Your DASS Assessment', NULL, 'READ', 'dass', '2025-12-25 17:37:42', NULL, 1, NULL, NULL, 'The DASS assessment for 25-12-2025 has assigned by your PA. Kindly click here to fill it in.', '/DassAssessment/8/2/1'),
(82, 'DASS Assessment Completed By A Student!', NULL, 'READ', 'dass', '2025-12-25 17:38:17', NULL, NULL, 2, NULL, 'DASS Assessment has completed by D032310439! Click and check it out.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `recommendation`
--

DROP TABLE IF EXISTS `recommendation`;
CREATE TABLE IF NOT EXISTS `recommendation` (
  `recommendId` int(11) NOT NULL AUTO_INCREMENT,
  `quote` longtext DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `hyperlink` longtext DEFAULT NULL,
  PRIMARY KEY (`recommendId`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `recommendation`
--

INSERT INTO `recommendation` (`recommendId`, `quote`, `type`, `hyperlink`) VALUES
(1, 'Every small step counts.', 'positive', NULL),
(2, 'Progress is still progress, no matter how slow.', 'positive', NULL),
(3, 'You are capable of amazing things.', 'positive', NULL),
(4, 'Believe in your journey.', 'positive', NULL),
(5, 'Take it one day at a time.', 'positive', NULL),
(6, 'Your future needs you—your past does not.', 'positive', NULL),
(7, 'Be kind to yourself. You’re learning.', 'positive', NULL),
(8, 'You have survived 100% of your bad days so far.', 'positive', NULL),
(9, 'It’s okay to rest. Rest is part of the process.', 'positive', NULL),
(10, 'Even the quiet moments matter.', 'positive', NULL),
(11, 'Breathe. You’re going to be okay.', 'calm', NULL),
(12, 'Peace begins with a single breath.', 'calm', NULL),
(13, 'You deserve to feel calm.', 'calm', NULL),
(14, 'Your feelings are valid.', 'calm', NULL),
(15, 'Slow down. You’re allowed to.', 'calm', NULL),
(16, 'Resting is not wasting time.', 'calm', NULL),
(17, 'It’s okay not to be okay.', 'calm', NULL),
(18, 'Take a break. You need it.', 'calm', NULL),
(19, 'Release what you cannot control.', 'calm', NULL),
(20, 'Calmness is your superpower.', 'calm', NULL),
(21, 'You are stronger than you think.', 'motivation', NULL),
(22, 'You’ve got this.', 'motivation', NULL),
(23, 'Challenges help you grow.', 'motivation', NULL),
(24, 'Trust yourself.', 'motivation', NULL),
(25, 'Do what you can with what you have.', 'motivation', NULL),
(26, 'You’re doing better than you think.', 'motivation', NULL),
(27, 'Keep going. Your future self will thank you.', 'motivation', NULL),
(28, 'Success is built on small efforts repeated daily.', 'motivation', NULL),
(29, 'Don’t give up on yourself.', 'motivation', NULL),
(30, 'You are capable of more than you know.', 'motivation', NULL),
(31, 'Alto’s Odyssey – Calm visuals and relaxing endless sandboarding.', 'game', 'https://play.google.com/store/apps/details?id=com.noodlecake.altosodyssey'),
(32, 'Stardew Valley – A cozy farming game with a peaceful pace.', 'game', 'https://www.stardewvalley.net/'),
(33, 'Journey – A beautiful, emotional, and relaxing exploration game.', 'game', 'https://thatgamecompany.com/journey/'),
(34, 'Sky: Children of the Light – Peaceful flying and exploration.', 'game', 'https://www.thatskygame.com/'),
(35, 'Flower – Control the wind and bloom flowers in a relaxing world.', 'game', 'https://thatgamecompany.com/flower/'),
(36, 'ABZÛ – An underwater exploration game for relaxation.', 'game', 'https://abzugame.com/'),
(37, 'Monument Valley – Peaceful puzzles with stunning visuals.', 'game', 'https://www.monumentvalleygame.com/mv3'),
(38, 'Animal Crossing: Pocket Camp – Chill decorating and collecting.', 'game', 'https://ac-pocketcamp.com/en-US'),
(39, 'Neko Atsume – Cute and stress-free cat collecting game.', 'game', 'https://www.nekoatsume.com/en/'),
(40, 'My Oasis – A calming idle game with soft music and nature.', 'game', 'https://play.google.com/store/apps/details?id=com.buffstudio.myoasis');

-- --------------------------------------------------------

--
-- Table structure for table `recommendationdisplay`
--

DROP TABLE IF EXISTS `recommendationdisplay`;
CREATE TABLE IF NOT EXISTS `recommendationdisplay` (
  `recommendId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `displayCount` int(11) DEFAULT 0,
  `fbUsefulness` int(2) DEFAULT 3,
  `recommendationDisplayId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`recommendationDisplayId`),
  KEY `studentId` (`studentId`),
  KEY `recommendationdisplay_ibfk_1` (`recommendId`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `recommendationdisplay`
--

INSERT INTO `recommendationdisplay` (`recommendId`, `studentId`, `displayCount`, `fbUsefulness`, `recommendationDisplayId`) VALUES
(38, 2, 1, 0, 39),
(33, 2, 1, 0, 40),
(35, 2, 1, 0, 41),
(36, 2, 1, 0, 42),
(30, 2, 1, 1, 43),
(40, 1, 1, 3, 44),
(3, 1, 1, 1, 45),
(5, 1, 1, 1, 46),
(25, 7, 1, 3, 47),
(7, 1, 1, 3, 48),
(27, 2, 1, 3, 49),
(12, 2, 1, 3, 50),
(16, 2, 1, 3, 51),
(21, 2, 1, 3, 52),
(30, 2, 1, 3, 53),
(6, 2, 1, 3, 54),
(16, 2, 1, 3, 55),
(18, 2, 1, 3, 56),
(29, 2, 1, 3, 57),
(1, 2, 1, 3, 58),
(40, 2, 1, 3, 59),
(7, 2, 1, 3, 60),
(10, 2, 1, 3, 61),
(14, 2, 1, 3, 62),
(19, 2, 1, 3, 63),
(11, 2, 1, 3, 64),
(7, 1, 1, 3, 65),
(7, 1, 1, 3, 66),
(29, 1, 1, 3, 67),
(10, 7, 1, 3, 68),
(1, 7, 1, 3, 69),
(5, 1, 1, 3, 70),
(15, 3, 1, 3, 71),
(23, 3, 1, 0, 72),
(21, 3, 1, 1, 73),
(19, 3, 1, 3, 74),
(1, 3, 1, 3, 75),
(3, 3, 1, 3, 76),
(11, 9, 1, 3, 77),
(18, 1, 1, 3, 78),
(12, 1, 1, 3, 79),
(19, 1, 1, 3, 80),
(8, 1, 1, 3, 81),
(14, 6, 1, 3, 82),
(16, 6, 1, 3, 83),
(10, 6, 1, 3, 84),
(20, 6, 1, 3, 85),
(38, 3, 1, 3, 86),
(4, 3, 1, 3, 87),
(4, 3, 1, 3, 88),
(15, 1, 1, 3, 89),
(29, 6, 1, 0, 90),
(6, 1, 1, 3, 91),
(33, 6, 1, 3, 92),
(37, 6, 1, 3, 93),
(19, 2, 1, 3, 94),
(19, 1, 1, 3, 95),
(27, 1, 1, 3, 96),
(26, 1, 1, 3, 97),
(15, 1, 1, 3, 98),
(14, 1, 1, 3, 99),
(18, 1, 1, 3, 100),
(25, 1, 1, 3, 101),
(31, 10, 1, 0, 102),
(24, 10, 1, 1, 103),
(15, 1, 1, 3, 104),
(12, 1, 1, 3, 105),
(28, 1, 1, 3, 106),
(30, 1, 1, 3, 107),
(22, 1, 1, 3, 108),
(13, 1, 1, 3, 109),
(25, 1, 1, 3, 110),
(27, 1, 1, 3, 111),
(12, 1, 1, 3, 112),
(1, 1, 1, 3, 113),
(14, 1, 1, 3, 114),
(16, 1, 1, 3, 115),
(19, 1, 1, 3, 116),
(11, 1, 1, 3, 117),
(7, 1, 1, 3, 118),
(8, 1, 1, 3, 119),
(4, 1, 1, 3, 120),
(17, 1, 1, 3, 121),
(37, 1, 1, 3, 122),
(32, 1, 1, 3, 123),
(37, 1, 1, 3, 124),
(34, 1, 1, 3, 125),
(31, 1, 1, 3, 126);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
CREATE TABLE IF NOT EXISTS `staff` (
  `staffId` int(11) NOT NULL AUTO_INCREMENT,
  `staffNo` varchar(20) NOT NULL,
  `staffName` varchar(50) NOT NULL,
  `staffEmail` varchar(50) NOT NULL,
  `staffContact` varchar(12) NOT NULL,
  `staffFaculty` varchar(12) NOT NULL,
  `staffProPic` varchar(255) NOT NULL,
  `staffOffice` varchar(80) NOT NULL,
  `staffMemberSince` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `staffRole` varchar(30) NOT NULL,
  `staffPassword` varchar(255) NOT NULL,
  `loginToken` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`staffId`),
  UNIQUE KEY `staffNo` (`staffNo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staffId`, `staffNo`, `staffName`, `staffEmail`, `staffContact`, `staffFaculty`, `staffProPic`, `staffOffice`, `staffMemberSince`, `staffRole`, `staffPassword`, `loginToken`) VALUES
(1, 'S032310001', 'TEN LEE KONG', 's032310001@utem.edu.my', '0126785432', 'FTMK', '', 'RIGHT WING 2nd FLOOR B01', '2025-12-18 06:23:27', 'PENASIHAT AKADEMIK', '$2y$10$XzMA6eIBzTBEr.WWrZ/1o.ZWzdReplWEfx3iZzAJxxUzN1V5ig2Pa', '5cafb56defa94c8e2b94e450aee1c6f661c746dde06bb909a76e4b38d3ba80d8'),
(2, 'S032310002', 'LEE XING RU', 's032310002@utem.edu.my', '0166571254', 'FTMK', '', 'RIGHT WING 1st FLOOR B05', '2025-12-25 09:31:37', 'PENASIHAT AKADEMIK', '$2y$10$ZBaZ85aT2uOpp/F3VAx1gOtxFX9TCZbS4VciehdkCC8XXIlPm0/7a', 'b7c1ad03a32b413a631f3feed78a951a2c6d076deaa7296c7e85e636fdda10d2'),
(3, 'S032310003', 'NG JIA SENG', 's032310003@utem.edu.my', '0104571685', 'FTMK', '', 'LEFT WING 1st FLOOR B07', '2025-11-24 14:30:45', 'PENASIHAT AKADEMIK', '$2y$10$atrL3atMEo82Uc32ajT1F.x/DA5ZbCCQ1Zb5t3HsyoGXOun5eOeme', NULL),
(4, 'S032310004', 'CHIN ZHI ROU', 's032310004@utem.edu.my', '0146241524', 'FTMK', '', 'LEFT WING 3rd FLOOR B02', '2025-12-25 09:28:39', 'PENASIHAT AKADEMIK', '$2y$10$8bkUPoDQco4F1sxIfXV0seeGFVQesDivHDwQn35ynI2IhcHGc7kDC', '95499d33143b9d99283bcafbf0407a383bff57e0bdcc0557144ae2a3357060e3'),
(5, 'S032210001', 'NG KAH MING', 's032210001@utem.edu.my', '0123542165', 'FTKE', '', '1st FLOOR K03', '2025-12-25 09:30:50', 'PENASIHAT AKADEMIK', '$2y$10$NuaQM4E7ftMepgJ4MGvuHu6B9rxBRO8WALrl6YpvZMUvjPe0Lplq.', '996493a25795ed91c7ee886c03b649f169b190f26d1a1307f648e113ed21fdcb');

-- --------------------------------------------------------

--
-- Table structure for table `stress`
--

DROP TABLE IF EXISTS `stress`;
CREATE TABLE IF NOT EXISTS `stress` (
  `stressId` int(11) NOT NULL AUTO_INCREMENT,
  `stressLevel` int(3) DEFAULT NULL,
  `datetimeRecord` datetime DEFAULT current_timestamp(),
  `studentId` int(11) DEFAULT NULL,
  PRIMARY KEY (`stressId`),
  KEY `studentId` (`studentId`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `stress`
--

INSERT INTO `stress` (`stressId`, `stressLevel`, `datetimeRecord`, `studentId`) VALUES
(7, 37, '2025-12-25 16:41:13', 1),
(8, 30, '2025-12-25 17:22:17', 10),
(11, 24, '2025-12-18 00:00:00', 1),
(12, 20, '2025-12-17 00:00:00', 1),
(18, 45, '2025-12-16 00:00:00', 1),
(19, 30, '2025-12-10 00:00:00', 1),
(20, 28, '2025-12-02 00:00:00', 1),
(21, 100, '2025-12-01 00:00:00', 1),
(22, 20, '2025-12-09 00:00:00', 1),
(23, 76, '2025-12-26 01:30:18', 1);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
CREATE TABLE IF NOT EXISTS `student` (
  `studentId` int(11) NOT NULL AUTO_INCREMENT,
  `matricNo` varchar(10) NOT NULL,
  `studentName` varchar(50) NOT NULL,
  `studentEmail` varchar(50) NOT NULL,
  `studentContact` varchar(12) NOT NULL,
  `studentFaculty` varchar(100) NOT NULL,
  `studentYearOfStudy` int(4) NOT NULL,
  `studentSection` varchar(10) DEFAULT NULL,
  `studentGrp` varchar(10) DEFAULT NULL,
  `studentProPic` varchar(255) NOT NULL,
  `studentPassword` varchar(255) NOT NULL,
  `staffId` int(11) DEFAULT NULL,
  `studentCourse` varchar(100) NOT NULL,
  `studentMemberSince` datetime DEFAULT current_timestamp(),
  `loginToken` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`studentId`),
  KEY `staffId` (`staffId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`studentId`, `matricNo`, `studentName`, `studentEmail`, `studentContact`, `studentFaculty`, `studentYearOfStudy`, `studentSection`, `studentGrp`, `studentProPic`, `studentPassword`, `staffId`, `studentCourse`, `studentMemberSince`, `loginToken`) VALUES
(1, 'D032310439', 'CHONG WAN XIAN CASEY', 'd032310439@student.utem.edu.my', '0122643499', 'FTMK', 3, 'SECTION 2', 'GROUP 2', '', '$2y$10$9E8c.HpCNyuSUU2OPc7OvuVJ4gkAs0yMoJ5yRqo0h2AglN31VuZem', 2, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '0f875d5da73f1de7190ec106f828f30c0bffd80094d69cd619740eb6dffea7ee'),
(2, 'D032310456', 'CHIEW CHIN KUAN', 'd032310456@student.utem.edu.my', '0129318660', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$qVJ6AV0SqRc25DSJYjMsTOBS5.U3o2erBPvbh./8yXy6.nGGUJ2da', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '7c2acb285757b7257d95a5293ffd39f4b3257440f3027c29d5f317d45fa05165'),
(3, 'D032310403', 'A\'SYAH INSYIRAH BINTI MOHD NIZAM', 'd032310403@student.utem.edu.my', '0163249854', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$eQwLVlu2NELlJOVCmhW2F.XwegeDD0Qs03I6bnaAY9Nkey03d0D5q', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '8ffddade6e59b3750268a8680a35dd77d496316d629ca05fb91268db56c2f691'),
(4, 'D032310149', 'SIA XIN WAN', 'd032310149@student.utem.edu.my', '01110356547', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$GJ/TBuE.U9JoWDMMyMVkve04D/CHJ382FH4D53ht1XKEKkzPRuAiC', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(5, 'D032310347', 'TEOH HUI YU', 'd032310347@student.utem.edu.my', '0125428971', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$RSUuBTnnwB0VEaYFacCI8errJuhc4tRmoxrlddWfYt3Ht9IkrA0Ma', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(6, 'D032310490', 'FELICIA TEE JIA XUAN', 'd032310490@student.utem.edu.my', '0125468751', 'FTMK', 3, 'SECTION 3', 'GROUP 2', '', '$2y$10$RDxGSe2VagOKi4UhR/sgMO/GYLLY2ntI.aFFEPRnS8JZno7MIezHK', 3, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '972fc1873728894d633861a0dabc15176850e4c0af057ff8513db04bdb97aacd'),
(7, 'D032310460', 'CHAN MEI YEANG', 'd032310460@student.utem.edu.my', '01110265475', 'FTMK', 3, 'SECTION 3', 'GROUP 1', '', '$2y$10$7/YG5UbsmlPY5JHO2r89jOv9wTJVKDwxm.CvTeV.Dh8jzusUV31wS', 4, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '5805986cf6568882959c8568b9c3cab69ddffb809f52a26da63b0561693bd7d3'),
(8, 'B112420015', 'LIM KE ROU', 'b1112420015@student.utem.edu.my', '0162195483', 'FTKE', 2, 'SECTION 1', 'GROUP 1', '', '$2y$10$BhO/EVlGjtiJwJBkvGrnFeqNE5BIlgaznlwsZ5SV2EFLWEcE0xtMi', 5, 'BACHELOR IN ELECTRICAL', '2025-11-25 16:03:10', NULL),
(9, 'D032310126', 'EISYAH MAISARAH BINTI AZHARI', 'eisyahmaisarah@student.utem.edu.my', '0162195489', 'FTMK', 3, 'SECTION 2', 'GROUP 2', '', '$2y$10$/FzRDss7RcetMi4pkchwA.OjfRpPDAuYALUe0WJwQ3eraBuPVN2/m', 2, 'DIPLOMA IN COMPUTER SCIENCE', '2025-12-15 13:39:45', '83d094af2f6b1cc43d537b717925370e7917ff0b55e193eb72e7d31dbcc1cf1e'),
(10, 'D032310322', 'CHONG PUI YI', 'chongpuiyi@student.utem.edu.my', '0124568542', 'FTMK', 3, 'SECTION 2', 'GROUP 2', '', '$2y$10$RjhVTN18Ah0HYM8bouPEhefaZr3P9HPtT.5/GMs6/.ZI0FjDdqTXq', 2, 'DIPLOMA IN COMPUTER SCIENCE', '2025-12-25 17:17:49', 'c58676c9ef331d862998b459ccd3bf09644055f75d6ebf8208e8da05f6e984c3');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dass`
--
ALTER TABLE `dass`
  ADD CONSTRAINT `dass_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`),
  ADD CONSTRAINT `dass_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `student` (`studentId`);

--
-- Constraints for table `dassrecord`
--
ALTER TABLE `dassrecord`
  ADD CONSTRAINT `dassrecord_ibfk_1` FOREIGN KEY (`dassId`) REFERENCES `dass` (`dassId`),
  ADD CONSTRAINT `dassrecord_ibfk_2` FOREIGN KEY (`dassQuestionId`) REFERENCES `dassquestion` (`dassQuestionId`);

--
-- Constraints for table `entries`
--
ALTER TABLE `entries`
  ADD CONSTRAINT `entries_ibfk_1` FOREIGN KEY (`entriesTypeId`) REFERENCES `entriestype` (`entriesTypeId`);

--
-- Constraints for table `entriesrecord`
--
ALTER TABLE `entriesrecord`
  ADD CONSTRAINT `entriesrecord_ibfk_3` FOREIGN KEY (`moodId`) REFERENCES `moodtracking` (`moodId`) ON DELETE CASCADE,
  ADD CONSTRAINT `entriesrecord_ibfk_4` FOREIGN KEY (`entriesTypeId`) REFERENCES `entriestype` (`entriesTypeId`);

--
-- Constraints for table `moodtracking`
--
ALTER TABLE `moodtracking`
  ADD CONSTRAINT `moodtracking_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `student` (`studentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `moodtracking_ibfk_2` FOREIGN KEY (`moodTypeId`) REFERENCES `mood` (`moodTypeId`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `student` (`studentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`) ON DELETE SET NULL,
  ADD CONSTRAINT `notification_ibfk_3` FOREIGN KEY (`dassId`) REFERENCES `dass` (`dassId`) ON DELETE SET NULL,
  ADD CONSTRAINT `notification_ibfk_4` FOREIGN KEY (`moodId`) REFERENCES `moodtracking` (`moodId`) ON DELETE SET NULL;

--
-- Constraints for table `recommendationdisplay`
--
ALTER TABLE `recommendationdisplay`
  ADD CONSTRAINT `recommendationdisplay_ibfk_1` FOREIGN KEY (`recommendId`) REFERENCES `recommendation` (`recommendId`),
  ADD CONSTRAINT `recommendationdisplay_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `student` (`studentId`);

--
-- Constraints for table `stress`
--
ALTER TABLE `stress`
  ADD CONSTRAINT `stress_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `student` (`studentId`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
