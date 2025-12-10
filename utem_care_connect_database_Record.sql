-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3301
-- Generation Time: Dec 09, 2025 at 07:06 AM
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
CREATE DATABASE IF NOT EXISTS `utem_care_connect` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `utem_care_connect`;

-- --------------------------------------------------------

--
-- Table structure for table `dass`
--

DROP TABLE IF EXISTS `dass`;
CREATE TABLE `dass` (
  `dassId` int(11) NOT NULL,
  `dassCreatedDateTime` datetime DEFAULT current_timestamp(),
  `status` enum('Pending','Completed') DEFAULT 'Pending',
  `staffId` int(11) DEFAULT NULL,
  `studentId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `dassquestion`
--

DROP TABLE IF EXISTS `dassquestion`;
CREATE TABLE `dassquestion` (
  `dassQuestionId` int(11) NOT NULL,
  `question` longtext DEFAULT NULL,
  `type` enum('Depression','Anxiety','Stress') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
CREATE TABLE `dassrecord` (
  `dassId` int(11) NOT NULL,
  `dassQuestionId` int(11) NOT NULL,
  `scale` int(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `entries`
--

DROP TABLE IF EXISTS `entries`;
CREATE TABLE `entries` (
  `entriesId` int(11) NOT NULL,
  `entries` varchar(100) DEFAULT NULL,
  `entriesStoreLocation` varchar(255) DEFAULT NULL,
  `entriesTypeId` int(11) DEFAULT NULL
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
CREATE TABLE `entriesrecord` (
  `entriesRecordId` int(11) NOT NULL,
  `moodId` int(11) DEFAULT NULL,
  `entriesTypeId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `entriesrecord`
--

INSERT INTO `entriesrecord` (`entriesRecordId`, `moodId`, `entriesTypeId`) VALUES
(3, 2, 1),
(7, 3, 1),
(10, 35, 1),
(11, 35, 2),
(12, 35, 3),
(15, 37, 1),
(16, 37, 3),
(17, 38, 1),
(18, 39, 1),
(19, 39, 3),
(20, 40, 1),
(21, 41, 1),
(29, 47, 2),
(30, 48, 1),
(31, 50, 1),
(32, 52, 1),
(33, 53, 1),
(34, 53, 3);

-- --------------------------------------------------------

--
-- Table structure for table `entriestype`
--

DROP TABLE IF EXISTS `entriestype`;
CREATE TABLE `entriestype` (
  `entriesTypeId` int(11) NOT NULL,
  `entriesType` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
CREATE TABLE `mood` (
  `moodTypeId` int(11) NOT NULL,
  `moodStatus` varchar(50) DEFAULT NULL,
  `moodStoreLocation` varchar(255) DEFAULT NULL,
  `priority` int(3) DEFAULT NULL,
  `scale` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `mood`
--

INSERT INTO `mood` (`moodTypeId`, `moodStatus`, `moodStoreLocation`, `priority`, `scale`) VALUES
(1, 'Excited', '/EmotionCuteEmoji/4.png', 8, 8),
(2, 'Happy', '/EmotionCuteEmoji/1.png', 7, 7),
(3, 'Neutral', '/EmotionCuteEmoji/10.png', 6, 6),
(4, 'Sad', '/EmotionCuteEmoji/11.png', 2, 5),
(5, 'Crying', '/EmotionCuteEmoji/7.png', 1, 4),
(6, 'Angry', '/EmotionCuteEmoji/6.png', 3, 1),
(7, 'Anxious', '/EmotionCuteEmoji/12.png', 4, 2),
(8, 'Annoying', '/EmotionCuteEmoji/13.png', 5, 3);

-- --------------------------------------------------------

--
-- Table structure for table `moodtracking`
--

DROP TABLE IF EXISTS `moodtracking`;
CREATE TABLE `moodtracking` (
  `moodId` int(11) NOT NULL,
  `stressLevel` varchar(20) DEFAULT NULL,
  `note` longtext DEFAULT NULL,
  `datetimeRecord` datetime DEFAULT current_timestamp(),
  `studentId` int(11) DEFAULT NULL,
  `moodTypeId` int(11) DEFAULT NULL,
  `notePrivacy` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `moodtracking`
--

INSERT INTO `moodtracking` (`moodId`, `stressLevel`, `note`, `datetimeRecord`, `studentId`, `moodTypeId`, `notePrivacy`) VALUES
(2, '10', 'Today felt like stepping into a quiet library just as the sun beams through the tall windows. The morning started calm, with soft light painting golden streaks across your desk, but the air was alive with subtle tension—like a page waiting to be turned. Each task you tackled was a little puzzle, some pieces fitting perfectly, others testing your patience.\r\n\r\nBy afternoon, there was a spark of excitement—a tiny victory, a moment of laughter, or an idea that finally clicked. Yet, the world outside reminded you to pause and breathe, with gentle whispers of wind and distant chatter grounding you.\r\n\r\nAs evening approaches, it feels like a cozy blanket settling around your shoulders. Today was a mix of focus and reflection, small wins and gentle lessons, leaving you with a sense of quiet accomplishment and the soft promise of tomorrow.', '2025-11-26 22:43:44', 1, 2, 1),
(3, '20', 'Today started off as a rather neutral day, neither particularly exciting nor overwhelmingly dull. The morning air felt calm as I got ready, and for a moment, I felt a sense of quiet balance. It was the kind of day where nothing dramatic happened, but at the same time, everything seemed to demand a little attention. My energy was steady, and I approached my tasks with a moderate focus, aware that the day would require careful management to avoid slipping into unnecessary stress.\r\n\r\nBy mid-morning, my thoughts began to drift toward the looming assignments that were due soon. Each task seemed manageable on its own, but seeing them all lined up created a subtle tension. I reminded myself to take things one step at a time, prioritizing the most urgent work first. Even though my stress level was relatively low, around 20%, the presence of these responsibilities lingered in the back of my mind, nudging me to stay organized and on track.\r\n\r\nThe afternoon was consumed by preparation for upcoming exams. I reviewed my notes and tried to mentally rehearse possible questions, but occasionally I found myself distracted by minor worries. The pressure wasn’t overwhelming, but it was enough to keep me alert. I felt a quiet determination to do my best, understanding that consistency matters more than perfection. This gentle push kept me productive without tipping the day into high stress.\r\n\r\nLater in the day, I considered the expectations set by my lecturer. While they were reasonable, they added another layer of responsibility that needed attention. It was not stressful enough to cause anxiety, but it reminded me to maintain a disciplined approach to my work. I took short breaks to relax my mind, appreciating that even neutral days benefit from small moments of self-care.\r\n\r\nAs the evening approached, I reflected on the day. Despite having a few sources of mild stress—assignments, exams, and lecturer expectations—the overall feeling remained calm and manageable. It was a reminder that stress doesn’t always have to be overwhelming; even when tasks accumulate, a neutral and steady approach can help keep things under control. The day closed quietly, leaving me with a sense of accomplishment for handling multiple responsibilities without losing balance.', '2025-11-27 02:00:22', 1, 3, 1),
(35, '100', '...............................................................', '2025-12-01 17:53:52', 1, 6, 1),
(37, '0', 'Today was surprisingly exciting, and honestly, I’m really happy about it. My stress level feels like 0%, which is such a great feeling because it’s been a while since I felt this light. From the moment I woke up, I felt a kind of positive energy that just stayed with me throughout the day. I felt more motivated, more alive, and more ready to take things on.\r\n\r\nEven though I’m excited and stress-free today, I still know deep down that some of my stress usually comes from academic pressure and a bit of social stuff too. Academically, I sometimes worry about whether I’m keeping up, whether I’m doing enough, and whether my results will reflect the effort I put in. I always remind myself that I’m trying my best, but the pressure still sticks around sometimes. As for social stress, it’s more subtle — it’s not always obvious, but sometimes I get anxious about how I present myself to others, whether I’m connecting well with people, or whether I’m meeting expectations. It’s not overwhelming, but it’s there in the background.\r\n\r\nBut today? None of that really pulled me down. It felt like my mind finally took a break. I felt free, present, and genuinely excited about everything happening around me. Maybe it’s because I accomplished something meaningful, or maybe it’s just one of those days where everything aligns and feels right.\r\n\r\nI’m glad I had a day like this. I’m grateful for the excitement, the peace, and the sense of confidence I felt. I hope I can carry this feeling forward — even when academic or social stress comes back, at least I know I can still have days like today where everything feels okay.', '2025-12-01 17:56:20', 1, 1, 1),
(38, '0', 'Happy Everyday OK!', '2025-12-01 21:22:07', 2, 2, 1),
(39, '0', 'Today is a good day! I\'m always happy all the time :) Have a nice sleep and relax OK! BRO!', '2025-12-01 21:24:38', 2, 1, 1),
(40, '25', 'It\'s already midnight 12AM, I\'m just finish watching douyin and decide to continue fighting with my final year project. To be honest, I don\'t know what to write, but since I wanna test this website, so yeah, it\'s time to write something. I think it is good to write down things that happen recently or maybe some life lesson that I learnt these days. \r\n\r\nSo yeah, the first thing I wanna written was, I felt that I\'m like lack of motivation in doing anything. It\'s like I\'m stress and I knew that I gonna rush and finish it as soon as possible. But there are something that stop you from continue moving on. Yeah, you might said that it\'s because of my laziness, but for me, I really like feel empty. \r\n\r\nBut yeah, it has no time for me to relax anymore, even if I have no motivation, but life needs to keep moving on. Just, continue fighting Sis :)', '2025-12-02 00:25:26', 1, 3, 1),
(41, '70', 'Today was one of those days where everything felt just slightly off, and every small thing somehow managed to get on my nerves.\r\n\r\nNothing huge happened, but it was like the whole day was filled with tiny irritations — the kind that slowly build up and make me want to sigh every five minutes. People talking at the wrong time, things not working the way they should, and my patience just wearing thinner and thinner as the hours went by.\r\n\r\nI wasn’t angry, not really. Just… annoyed.\r\nAnnoyed at interruptions, annoyed at small mistakes, annoyed at things that normally wouldn’t bother me but today felt like too much.\r\n\r\nHonestly, I just want the day to end so I can reset.\r\nHoping tomorrow decides to be kinder, because today definitely wasn’t.', '2025-12-02 20:27:34', 1, 8, 1),
(47, '20', 'Today tested my patience in ways I didn’t ask for.\r\nFrom the moment I woke up, it felt like the world was set to “irritate mode.”\r\n\r\nLittle things kept piling up — delays, interruptions, people asking things at the worst possible time. Every task seemed harder than it needed to be, and every sound felt louder than usual. I kept trying to stay calm, but honestly, my tolerance was running dangerously low.\r\n\r\nI wasn’t in a bad mood at first, but the day slowly dragged me into one.\r\nIt’s like the universe kept poking me just to see if I’d react.\r\n\r\nI didn’t snap at anyone, but trust me, the internal eye-rolls were constant.\r\n\r\nAnyway… I survived the day, even though it drained me more than it should have.\r\nHopefully tomorrow doesn’t copy today, because I’ve had enough of this annoying energy.', '2025-12-02 21:38:52', 2, 8, 1),
(48, '25', 'Today actually felt… good.\r\nLike genuinely good, not the fake “I’m fine” I always tell people.\r\n\r\nI finally finished my last midterm — Game Design Principles — and honestly, the relief hit me immediately. Walking out of the exam felt like dropping a huge weight off my shoulders. I didn’t even realize how tense I’d been until it was over. I think I even smiled to myself like a weirdo, but I deserved that moment.\r\n\r\nThere\'s still that small cloud of stress following me around — about 25%, definitely from FYP. It’s like a reminder tapping me on the shoulder saying, “Hey, don’t relax too much, you still have things to do.” But today, that stress felt manageable. It didn’t overpower my mood. It just sat in the background quietly while I enjoyed the peace of finally finishing midterms.\r\n\r\nFor once, I allowed myself to feel proud. I’ve been pushing through a lot, and moments like this make everything feel worth it. I even had a bit more energy than usual — maybe because I wasn\'t carrying that midterm pressure anymore.\r\n\r\nThe rest of the day?\r\nHonestly, it felt lighter. I treated myself a little, took a longer break than I should’ve, and just enjoyed the freedom. I know tomorrow I’ll need to face the FYP monster again, but today… today I let myself breathe.\r\n\r\nAnd it felt really, really good.', '2025-12-03 15:19:20', 1, 2, 1),
(49, '0', 'Today was… fine. Nothing special happened, but nothing bad happened either. Just a quiet, balanced kind of day where everything moved at its own pace.\r\n\r\nI didn’t feel stressed at all — honestly, it was 0% stress, which is rare but nice. My mind felt steady, not too busy, not too empty. I just went through the day doing what I needed to do, without rushing or overthinking.\r\n\r\nNothing really triggered big emotions.\r\nNo excitement, no frustration.\r\nJust a calm, steady rhythm.\r\n\r\nI got things done, took small breaks, and didn’t feel pressured by anything. It was the kind of day that didn’t drain me or overwhelm me — just… existed peacefully.\r\n\r\nSometimes neutral days are exactly what I need.\r\nA quiet reset before everything else continues again tomorrow.', '2025-12-03 15:20:40', 1, 3, 1),
(50, '0', 'Today was such an unexpectedly exciting day, and honestly, I felt zero stress the whole time. It’s rare for me to have a day where my mood is completely lifted without anything dragging me down, but today was one of those days.\r\n\r\nEverything felt energizing — even small things. I woke up with this light feeling, like something good was going to happen, and that mood just stayed with me. My thoughts were clear, my energy was high, and I couldn’t stop smiling at random moments.\r\n\r\nI got things done easily, without that usual heaviness or pressure. Nothing bothered me, nothing felt too hard, and everything just flowed. I even caught myself feeling excited about things I normally wouldn’t care much about. Maybe it’s the relief from finishing other work earlier, or maybe it’s just one of those good days that decides to show up.\r\n\r\nWhatever the reason, I’m grateful.\r\nIt felt refreshing to live a whole day without any stress hanging over me — just pure excitement, motivation, and good vibes.\r\n\r\nIf only more days could feel like this.', '2025-12-03 16:09:13', 7, 1, 1),
(51, '5', 'Today felt surprisingly good. I decided to buy a portable monitor, and honestly, it might be one of the smartest purchases I’ve made this year. The moment I set it up beside my laptop, I could already feel the difference. Having an extra screen makes everything so much easier — especially for my final year project. Since I need to develop a whole system, switching between windows on one screen was becoming annoying, and now I finally have the space to work comfortably.\r\n\r\nIt just feels… convenient.\r\nOne screen for coding, one for documentation.\r\nOne screen for UI, one for testing.\r\nEverything feels more organized, and I’m actually excited to work on my FYP with this setup.\r\n\r\nI didn’t expect a monitor to boost my mood this much, but here we are — I’m genuinely happy today. There’s this sense of productivity and motivation that I haven’t felt in a while. Maybe it’s the new setup, or maybe it’s just the relief of solving a problem that’s been bothering me for weeks.\r\n\r\nThere’s still a tiny bit of stress in the background — maybe about 5% — because FYP is still FYP. It’s always going to remind me that there’s work waiting. But compared to before, that stress feels very small today. It didn’t overwhelm me or ruin my mood. It just sat quietly in the corner while the happiness took over.\r\n\r\nOverall, I’m glad I treated myself.\r\nThe day feels productive, satisfying, and a bit more hopeful.\r\nSometimes the right tools really do make life easier.', '2025-12-04 14:41:41', 1, 2, 1),
(52, '10', 'Today has been a bright and uplifting day overall. I felt genuinely happy throughout most of it, and my mood stayed positive despite having a bit of stress lingering in the background. The happiness came naturally — I felt lighter, more energetic, and more motivated than usual. Even small moments felt enjoyable, and I managed to go through the day with a sense of ease and optimism.\r\n\r\nMy stress level today is around 10%, which is relatively low, but still present enough for me to notice. This stress mainly comes from academic-related issues. There are tasks, deadlines, and expectations that occasionally weigh on my mind. Even though the workload isn’t overwhelming right now, the constant reminder of assignments and upcoming responsibilities keeps me slightly tense. It’s the kind of stress that sits quietly at the back of my thoughts — not strong enough to ruin my mood, but enough to make me aware that I need to stay on track.\r\n\r\nDespite that, I’m proud that the stress didn’t take over my day. I managed to balance my emotions well, staying cheerful and productive. Today felt like a reminder that even with small pressures in life, I can still maintain positivity and enjoy the moments around me. I hope the next few days continue in the same direction, with happiness growing and stress staying small and manageable.', '2025-12-08 20:05:49', 2, 1, 1),
(53, '100', 'Today has been an extremely heavy and overwhelming day. My mood has been deeply emotional, and I found myself breaking down into tears more than once. It feels like everything I’ve been carrying suddenly became too much to hold in, and the weight of it all finally pushed me past my limit. There’s a sense of sadness and exhaustion that I can’t ignore, and my heart feels unusually fragile today.\r\n\r\nMy stress level is at 100%, and it’s painfully clear that both academic pressure and relationship issues are hitting me at the same time. Academically, things feel chaotic — deadlines, expectations, and the fear of falling behind are all swirling in my mind nonstop. No matter how much I try to focus, the stress just keeps piling up, and it feels like I’m losing grip on the balance I used to have.\r\n\r\nOn top of that, the emotional strain from relationship matters makes everything even harder to handle. It’s the kind of hurt that sits deep inside — confusing, draining, and making me question things I normally wouldn’t. The mix of academic worries and relationship tension creates a storm inside me, making it nearly impossible to calm down or think clearly.\r\n\r\nToday feels like one of those days where everything collapses at once, and all I can do is let myself cry it out. Even though it’s overwhelming, I know this feeling won’t last forever. Right now, I’m just giving myself space to feel the pain, to acknowledge the stress, and to accept that it’s okay to not be okay sometimes.', '2025-12-08 21:50:24', 2, 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `notificationId` int(11) NOT NULL,
  `title` longtext DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `notiStatus` enum('UNREAD','READ') DEFAULT 'UNREAD',
  `notiType` enum('mood','dass','general') NOT NULL,
  `notiCreatedDateTime` datetime DEFAULT current_timestamp(),
  `dassId` int(11) DEFAULT NULL,
  `studentId` int(11) DEFAULT NULL,
  `staffId` int(11) DEFAULT NULL,
  `moodId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `recommendation`
--

DROP TABLE IF EXISTS `recommendation`;
CREATE TABLE `recommendation` (
  `recommendId` int(11) NOT NULL,
  `quote` longtext DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `recommendation`
--

INSERT INTO `recommendation` (`recommendId`, `quote`, `type`) VALUES
(1, 'Every small step counts.', 'positive'),
(2, 'Progress is still progress, no matter how slow.', 'positive'),
(3, 'You are capable of amazing things.', 'positive'),
(4, 'Believe in your journey.', 'positive'),
(5, 'Take it one day at a time.', 'positive'),
(6, 'Your future needs you—your past does not.', 'positive'),
(7, 'Be kind to yourself. You’re learning.', 'positive'),
(8, 'You have survived 100% of your bad days so far.', 'positive'),
(9, 'It’s okay to rest. Rest is part of the process.', 'positive'),
(10, 'Even the quiet moments matter.', 'positive'),
(11, 'Breathe. You’re going to be okay.', 'calm'),
(12, 'Peace begins with a single breath.', 'calm'),
(13, 'You deserve to feel calm.', 'calm'),
(14, 'Your feelings are valid.', 'calm'),
(15, 'Slow down. You’re allowed to.', 'calm'),
(16, 'Resting is not wasting time.', 'calm'),
(17, 'It’s okay not to be okay.', 'calm'),
(18, 'Take a break. You need it.', 'calm'),
(19, 'Release what you cannot control.', 'calm'),
(20, 'Calmness is your superpower.', 'calm'),
(21, 'You are stronger than you think.', 'motivation'),
(22, 'You’ve got this.', 'motivation'),
(23, 'Challenges help you grow.', 'motivation'),
(24, 'Trust yourself.', 'motivation'),
(25, 'Do what you can with what you have.', 'motivation'),
(26, 'You’re doing better than you think.', 'motivation'),
(27, 'Keep going. Your future self will thank you.', 'motivation'),
(28, 'Success is built on small efforts repeated daily.', 'motivation'),
(29, 'Don’t give up on yourself.', 'motivation'),
(30, 'You are capable of more than you know.', 'motivation'),
(31, 'Alto’s Odyssey – Calm visuals and relaxing endless sandboarding.', 'game'),
(32, 'Stardew Valley – A cozy farming game with a peaceful pace.', 'game'),
(33, 'Journey – A beautiful, emotional, and relaxing exploration game.', 'game'),
(34, 'Sky: Children of the Light – Peaceful flying and exploration.', 'game'),
(35, 'Flower – Control the wind and bloom flowers in a relaxing world.', 'game'),
(36, 'ABZÛ – An underwater exploration game for relaxation.', 'game'),
(37, 'Monument Valley – Peaceful puzzles with stunning visuals.', 'game'),
(38, 'Animal Crossing: Pocket Camp – Chill decorating and collecting.', 'game'),
(39, 'Neko Atsume – Cute and stress-free cat collecting game.', 'game'),
(40, 'My Oasis – A calming idle game with soft music and nature.', 'game');

-- --------------------------------------------------------

--
-- Table structure for table `recommendationdisplay`
--

DROP TABLE IF EXISTS `recommendationdisplay`;
CREATE TABLE `recommendationdisplay` (
  `recommendId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `displayCount` int(11) DEFAULT 0,
  `fbUsefulness` int(2) DEFAULT 3,
  `recommendationDisplayId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(12, 2, 1, 3, 50);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `staffId` int(11) NOT NULL,
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
  `loginToken` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staffId`, `staffNo`, `staffName`, `staffEmail`, `staffContact`, `staffFaculty`, `staffProPic`, `staffOffice`, `staffMemberSince`, `staffRole`, `staffPassword`, `loginToken`) VALUES
(1, 'S032310001', 'TEN LEE KONG', 's032310001@utem.edu.my', '0126785432', 'FTMK', '', 'RIGHT WING 2nd FLOOR B01', '2025-12-08 13:26:02', 'PENASIHAT AKADEMIK', '$2y$10$YnyUrbE32C2i8o2U92IvnOTaa7mJMlCq.wZHcuGKGTQhWC64Z4/ze', 'ecf27f0e4884a63a6575a300fa470967aa1b5369a0a781df1349f6b13a445a89'),
(2, 'S032310002', 'LEE XING RU', 's032310002@utem.edu.my', '0166571254', 'FTMK', '', 'RIGHT WING 1st FLOOR B05', '2025-12-04 07:17:22', 'PENASIHAT AKADEMIK', '$2y$10$ZBaZ85aT2uOpp/F3VAx1gOtxFX9TCZbS4VciehdkCC8XXIlPm0/7a', '899925ebe3163820434734b1e504d84281b8c42439295c0d936a9399391510a6'),
(3, 'S032310003', 'NG JIA SENG', 's032310003@utem.edu.my', '0104571685', 'FTMK', '', 'LEFT WING 1st FLOOR B07', '2025-11-24 14:30:45', 'PENASIHAT AKADEMIK', '$2y$10$atrL3atMEo82Uc32ajT1F.x/DA5ZbCCQ1Zb5t3HsyoGXOun5eOeme', NULL),
(4, 'S032310004', 'CHIN ZHI ROU', 's032310004@utem.edu.my', '0146241524', 'FTMK', '', 'LEFT WING 3rd FLOOR B02', '2025-11-24 15:01:57', 'PENASIHAT AKADEMIK', '$2y$10$8bkUPoDQco4F1sxIfXV0seeGFVQesDivHDwQn35ynI2IhcHGc7kDC', NULL),
(5, 'S032210001', 'NG KAH MING', 's032210001@utem.edu.my', '0123542165', 'FTKE', '', '1st FLOOR K03', '2025-11-24 15:02:05', 'PENASIHAT AKADEMIK', '$2y$10$NuaQM4E7ftMepgJ4MGvuHu6B9rxBRO8WALrl6YpvZMUvjPe0Lplq.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `studentId` int(11) NOT NULL,
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
  `loginToken` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`studentId`, `matricNo`, `studentName`, `studentEmail`, `studentContact`, `studentFaculty`, `studentYearOfStudy`, `studentSection`, `studentGrp`, `studentProPic`, `studentPassword`, `staffId`, `studentCourse`, `studentMemberSince`, `loginToken`) VALUES
(1, 'D032310439', 'CHONG WAN XIAN CASEY', 'd032310439@student.utem.edu.my', '0122643499', 'FTMK', 3, 'SECTION 2', 'GROUP 2', '', '$2y$10$9E8c.HpCNyuSUU2OPc7OvuVJ4gkAs0yMoJ5yRqo0h2AglN31VuZem', 2, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', 'b16a8f0d53056ec6e45a021a12d2550a1936cd8b0eba182e6b6ce63949df8c47'),
(2, 'D032310456', 'CHIEW CHIN KUAN', 'd032310456@student.utem.edu.my', '0129318660', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$qVJ6AV0SqRc25DSJYjMsTOBS5.U3o2erBPvbh./8yXy6.nGGUJ2da', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', 'de079367f113451eeda18ab2113d92efdec33273d839fdebe6afec87818075cd'),
(3, 'D032310403', 'A\'SYAH INSYIRAH BINTI MOHD NIZAM', 'd032310403@student.utem.edu.my', '0163249854', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$eQwLVlu2NELlJOVCmhW2F.XwegeDD0Qs03I6bnaAY9Nkey03d0D5q', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(4, 'D032310149', 'SIA XIN WAN', 'd032310149@student.utem.edu.my', '01110356547', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$GJ/TBuE.U9JoWDMMyMVkve04D/CHJ382FH4D53ht1XKEKkzPRuAiC', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(5, 'D032310347', 'TEOH HUI YU', 'd032310347@student.utem.edu.my', '0125428971', 'FTMK', 3, 'SECTION 1', 'GROUP 1', '', '$2y$10$RSUuBTnnwB0VEaYFacCI8errJuhc4tRmoxrlddWfYt3Ht9IkrA0Ma', 1, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(6, 'D032310490', 'FELICIA TEE JIA XUAN', 'd032310490@student.utem.edu.my', '0125468751', 'FTMK', 3, 'SECTION 3', 'GROUP 2', '', '$2y$10$RDxGSe2VagOKi4UhR/sgMO/GYLLY2ntI.aFFEPRnS8JZno7MIezHK', 3, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', NULL),
(7, 'D032310460', 'CHAN MEI YEANG', 'd032310460@student.utem.edu.my', '01110265475', 'FTMK', 3, 'SECTION 3', 'GROUP 1', '', '$2y$10$7/YG5UbsmlPY5JHO2r89jOv9wTJVKDwxm.CvTeV.Dh8jzusUV31wS', 4, 'DIPLOMA IN COMPUTER SCIENCE', '2025-11-25 16:03:10', '6f0e7055102ac79a0d850b27c8b9d28582ad8aca0ad6a81168126137b3211629'),
(8, 'B112420015', 'LIM KE ROU', 'b1112420015@student.utem.edu.my', '0162195483', 'FTKE', 2, 'SECTION 1', 'GROUP 1', '', '$2y$10$BhO/EVlGjtiJwJBkvGrnFeqNE5BIlgaznlwsZ5SV2EFLWEcE0xtMi', 5, 'BACHELOR IN ELECTRICAL', '2025-11-25 16:03:10', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dass`
--
ALTER TABLE `dass`
  ADD PRIMARY KEY (`dassId`),
  ADD KEY `staffId` (`staffId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `dassquestion`
--
ALTER TABLE `dassquestion`
  ADD PRIMARY KEY (`dassQuestionId`);

--
-- Indexes for table `dassrecord`
--
ALTER TABLE `dassrecord`
  ADD PRIMARY KEY (`dassId`,`dassQuestionId`),
  ADD KEY `dassQuestionId` (`dassQuestionId`);

--
-- Indexes for table `entries`
--
ALTER TABLE `entries`
  ADD PRIMARY KEY (`entriesId`),
  ADD KEY `entriesTypeId` (`entriesTypeId`);

--
-- Indexes for table `entriesrecord`
--
ALTER TABLE `entriesrecord`
  ADD PRIMARY KEY (`entriesRecordId`),
  ADD KEY `moodId` (`moodId`),
  ADD KEY `entriesTypeId_2` (`entriesTypeId`);

--
-- Indexes for table `entriestype`
--
ALTER TABLE `entriestype`
  ADD PRIMARY KEY (`entriesTypeId`);

--
-- Indexes for table `mood`
--
ALTER TABLE `mood`
  ADD PRIMARY KEY (`moodTypeId`);

--
-- Indexes for table `moodtracking`
--
ALTER TABLE `moodtracking`
  ADD PRIMARY KEY (`moodId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `moodTypeId` (`moodTypeId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notificationId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `staffId` (`staffId`),
  ADD KEY `dassId` (`dassId`),
  ADD KEY `moodId` (`moodId`);

--
-- Indexes for table `recommendation`
--
ALTER TABLE `recommendation`
  ADD PRIMARY KEY (`recommendId`);

--
-- Indexes for table `recommendationdisplay`
--
ALTER TABLE `recommendationdisplay`
  ADD PRIMARY KEY (`recommendationDisplayId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staffId`),
  ADD UNIQUE KEY `staffNo` (`staffNo`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`studentId`),
  ADD KEY `staffId` (`staffId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dass`
--
ALTER TABLE `dass`
  MODIFY `dassId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dassquestion`
--
ALTER TABLE `dassquestion`
  MODIFY `dassQuestionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `entriesrecord`
--
ALTER TABLE `entriesrecord`
  MODIFY `entriesRecordId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `entriestype`
--
ALTER TABLE `entriestype`
  MODIFY `entriesTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `mood`
--
ALTER TABLE `mood`
  MODIFY `moodTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `moodtracking`
--
ALTER TABLE `moodtracking`
  MODIFY `moodId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notificationId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recommendation`
--
ALTER TABLE `recommendation`
  MODIFY `recommendId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `recommendationdisplay`
--
ALTER TABLE `recommendationdisplay`
  MODIFY `recommendationDisplayId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staffId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `studentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`staffId`) REFERENCES `staff` (`staffId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
