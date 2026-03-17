-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 17, 2026 at 01:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `internship_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('super_admin','internship_admin') DEFAULT 'internship_admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_picture` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `office_hours` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `contact_number`, `password`, `role`, `created_at`, `profile_picture`, `department`, `office_hours`, `status`, `last_login`) VALUES
(1, 'Mr.Amir Asyari', 'Amir@admin.peninsulamalaysia.edu.com', '016-633 2088', '123456', 'internship_admin', '2026-02-02 09:37:04', '/uploads/1772983805551-332236835.jpg', 'Bursary', '9:00am-5:00 pm', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `status` enum('present','absent','late','halfday') NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `mc_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `date`, `check_in_time`, `check_out_time`, `status`, `notes`, `mc_file`, `created_at`, `updated_at`) VALUES
(8, 8, '2026-03-09', '09:42:58', '09:43:01', 'present', NULL, NULL, '2026-03-08 17:42:58', '2026-03-08 17:43:01'),
(9, 8, '2026-03-13', '07:59:40', '07:59:45', 'present', NULL, NULL, '2026-03-13 15:59:40', '2026-03-13 15:59:45'),
(10, 8, '2026-03-16', '18:22:39', '18:22:41', 'present', NULL, NULL, '2026-03-16 02:22:39', '2026-03-16 02:22:41'),
(11, 8, '2026-03-17', '02:26:14', '02:26:15', 'present', NULL, NULL, '2026-03-17 10:26:14', '2026-03-17 10:26:15');

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `tasks_done` text NOT NULL,
  `challenges` text DEFAULT NULL,
  `learnings` text DEFAULT NULL,
  `hours_spent` decimal(5,2) DEFAULT 0.00,
  `attachment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `student_id`, `report_date`, `tasks_done`, `challenges`, `learnings`, `hours_spent`, `attachment`, `created_at`, `updated_at`) VALUES
(2, 8, '2026-03-16', 'presentation', 'communication', 'english', 8.00, NULL, '2026-03-08 17:47:53', '2026-03-16 02:42:22');

-- --------------------------------------------------------

--
-- Table structure for table `employers`
--

CREATE TABLE `employers` (
  `id` int(11) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `company_logo` varchar(255) DEFAULT NULL,
  `headquarters` varchar(150) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `year_founded` int(11) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `fax` varchar(50) DEFAULT NULL,
  `office_hours` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employers`
--

INSERT INTO `employers` (`id`, `company_name`, `email`, `password`, `company_logo`, `headquarters`, `website_url`, `contact_number`, `year_founded`, `industry`, `fax`, `office_hours`, `description`) VALUES
(2, 'PKT Logistics', 'pktgroup@gmail.com', '123456', '/uploads/1772988987168-158291207.png', 'Batu Kawan', 'https://pktgroup.com/', '+603 – 5161 8111', 2008, 'Logistics', '+603 – 5161 6662', '8.30 am - 5.30 pm', 'PKT is a socially responsible company providing logistics services by utilizing local human resources, building environmentally friendly warehouses, open engagement with the communities, inspire other businesses to provide positive impact to people and communities through its activities.'),
(3, 'TechNova Solutions Sdn Bhd', 'hr@technovasolutions.com', '123456', '/uploads/1773503406569-626508769.png', 'Kuala Lumpur, Malaysia', 'https://www.technovasolutions.com/', '+60 3-2145 8876', 2015, 'Software Development', '+60 3-2145 8877', 'Monday – Friday, 9:00 AM – 6:00 PM', 'TechNova Solutions specializes in enterprise software development, cloud solutions, and AI-powered applications for businesses across Southeast Asia.'),
(4, 'GreenTech Innovations Sdn Bhd', 'careers@greentechinnovations.my', '123456', '/uploads/1773503488568-905171579.jpg', 'Penang, Malaysia', 'https://www.greentechinnovations.my', '+60 4-612 3345', 2018, 'Renewable Energy Technology', '+60 4-612 3346', 'Monday – Friday, 8:30 AM – 5:30 PM', 'GreenTech Innovations develops sustainable energy solutions including solar monitoring systems and smart energy management platforms.'),
(5, 'Nexa Digital Agency', 'info@nexadigital.com.my', '123456', '/uploads/1773503577172-348713055.png', 'Johor Bahru, Malaysia', 'https://www.nexadigital.com.my', '+60 7-223 1188', 2019, 'Digital Marketing', '+60 7-223 1190', 'Monday – Friday, 9:00 AM – 5:30 PM', 'Nexa Digital Agency provides digital marketing, branding, and UI/UX design services for startups and growing businesses.');

-- --------------------------------------------------------

--
-- Table structure for table `employer_interviews`
--

CREATE TABLE `employer_interviews` (
  `id` int(11) NOT NULL,
  `employer_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `status` enum('scheduled','attending','rejected','completed') NOT NULL DEFAULT 'scheduled',
  `interview_datetime` datetime NOT NULL,
  `mode` enum('online','face_to_face') NOT NULL DEFAULT 'online',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employer_interviews`
--

INSERT INTO `employer_interviews` (`id`, `employer_id`, `job_id`, `student_id`, `application_id`, `status`, `interview_datetime`, `mode`, `notes`, `created_at`) VALUES
(6, 3, 5, 8, 6, 'completed', '2026-03-17 00:12:00', 'online', NULL, '2026-03-14 16:12:13'),
(7, 3, 5, 13, 7, 'completed', '2026-03-26 10:30:00', 'online', NULL, '2026-03-14 17:07:39'),
(8, 3, 6, 8, 9, 'completed', '2026-03-26 10:25:00', 'face_to_face', NULL, '2026-03-16 02:25:12'),
(9, 3, 6, 8, 9, 'scheduled', '2026-03-24 14:06:00', 'online', NULL, '2026-03-16 06:06:43'),
(10, 3, 5, 8, 6, 'attending', '2026-03-28 14:08:00', 'online', NULL, '2026-03-16 06:08:13');

-- --------------------------------------------------------

--
-- Table structure for table `employer_interview_outcomes`
--

CREATE TABLE `employer_interview_outcomes` (
  `id` int(11) NOT NULL,
  `interview_id` int(11) NOT NULL,
  `outcome` enum('offered','not_offered') NOT NULL,
  `join_date` date DEFAULT NULL,
  `offered_position` varchar(255) DEFAULT NULL,
  `offered_salary` varchar(100) DEFAULT NULL,
  `offer_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employer_interview_outcomes`
--

INSERT INTO `employer_interview_outcomes` (`id`, `interview_id`, `outcome`, `join_date`, `offered_position`, `offered_salary`, `offer_notes`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(10, 6, 'offered', '2026-03-25', NULL, NULL, NULL, NULL, '2026-03-14 16:15:51', '2026-03-14 16:15:51'),
(11, 7, 'offered', '2026-03-24', NULL, NULL, NULL, NULL, '2026-03-14 17:08:59', '2026-03-14 17:08:59'),
(12, 8, 'offered', '2026-03-24', NULL, NULL, NULL, NULL, '2026-03-16 02:26:50', '2026-03-16 02:26:50');

-- --------------------------------------------------------

--
-- Table structure for table `employer_reminders`
--

CREATE TABLE `employer_reminders` (
  `id` int(11) NOT NULL,
  `employer_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `reminder_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `is_done` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `generated_resumes`
--

CREATE TABLE `generated_resumes` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `status` enum('processing','completed') DEFAULT 'processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `generated_resumes`
--

INSERT INTO `generated_resumes` (`id`, `resume_id`, `template_id`, `pdf_path`, `status`, `created_at`) VALUES
(28, 4, 1, NULL, 'completed', '2026-03-08 16:32:11'),
(30, 6, 1, NULL, 'completed', '2026-03-09 03:49:48'),
(31, 7, 1, NULL, 'completed', '2026-03-09 04:06:40'),
(32, 8, 1, NULL, 'completed', '2026-03-09 04:34:02'),
(33, 4, 3, NULL, 'completed', '2026-03-13 16:07:48'),
(34, 12, 3, NULL, 'completed', '2026-03-14 17:05:00'),
(35, 4, 3, NULL, 'completed', '2026-03-16 02:20:49'),
(36, 13, 1, NULL, 'completed', '2026-03-16 05:56:46'),
(37, 4, 3, NULL, 'completed', '2026-03-16 06:39:52');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `employer_id` int(11) NOT NULL,
  `job_title` varchar(150) NOT NULL,
  `job_type` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `work_mode` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `availability` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('open','closed') DEFAULT 'open'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `employer_id`, `job_title`, `job_type`, `category`, `work_mode`, `description`, `requirements`, `availability`, `created_at`, `updated_at`, `status`) VALUES
(5, 3, 'Software Developer Intern', 'Internship', 'Software Development Department', 'Hybrid (Office + Remote)', 'TechNova Solutions Sdn Bhd is looking for a passionate Software Developer Intern to assist our development team in building and maintaining web applications. The intern will work with experienced developers and gain hands-on experience in frontend and backend development. Responsibilities include assisting with coding, debugging, testing features, and supporting the development of internal software systems.', 'Currently pursuing a Diploma or Degree in Computer Science, Software Engineering, or related field\n\nBasic knowledge of HTML, CSS, JavaScript\n\nFamiliar with React.js or similar frontend frameworks (preferred)\n\nBasic understanding of backend technologies such as Node.js or Express.js\n\nWillingness to learn and work in a team environment\n\nGood problem-solving and communication skills', 1, '2026-03-14 15:54:44', '2026-03-14 15:54:44', 'open'),
(6, 3, 'UI/UX Designer Intern', 'Internship', 'Product Design / UI-UX Department', 'On-site (Kuala Lumpur Office)', 'TechNova Solutions Sdn Bhd is seeking a creative UI/UX Designer Intern to support the design team in creating user-friendly digital interfaces. The intern will assist in designing application layouts, improving user experience, and preparing wireframes and prototypes for web and mobile applications.', 'Currently pursuing Diploma or Degree in Graphic Design, Multimedia, Computer Science, or related field\n\nBasic knowledge of UI/UX principles\n\nFamiliar with design tools such as Figma, Adobe XD, or Canva\n\nAbility to create simple wireframes and design mockups\n\nAttention to detail and creativity\n\nGood communication and teamwork skills', 1, '2026-03-14 15:55:22', '2026-03-16 02:23:43', 'open'),
(7, 2, 'Logistics Operations Intern', 'Internship', 'Logistics Operations Department', 'On-site', 'PKT Logistics Group Sdn Bhd is looking for a Logistics Operations Intern to assist the operations team in managing daily logistics activities. The intern will support shipment coordination, inventory tracking, and logistics documentation. This internship provides hands-on exposure to supply chain operations and logistics management in a fast-paced environment.', 'Currently pursuing Diploma or Degree in Logistics, Supply Chain Management, Business Administration, or related field\n\nBasic understanding of logistics and supply chain processes\n\nGood organizational and communication skills\n\nAbility to work in a team environment\n\nBasic knowledge of Microsoft Excel and reporting tools\n\nWillingness to learn and adapt in a dynamic workplace', 1, '2026-03-14 15:58:12', '2026-03-14 15:58:12', 'open'),
(8, 2, 'Supply Chain Analyst Intern', 'Internship', 'Supply Chain Management Department', 'Hybrid', 'PKT Logistics Group Sdn Bhd is seeking a Supply Chain Analyst Intern to support the team in analyzing logistics data and improving supply chain efficiency. The intern will assist in preparing reports, monitoring shipment performance, and supporting operational planning activities.', 'Currently pursuing Diploma or Degree in Supply Chain Management, Logistics, Business Analytics, or related field\n\nBasic knowledge of data analysis and reporting\n\nFamiliar with Microsoft Excel or Google Sheets\n\nStrong analytical and problem-solving skills\n\nAbility to work independently and in a team\n\nGood communication and time management skills', 1, '2026-03-14 15:59:45', '2026-03-14 15:59:45', 'open');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `resume_id` int(11) DEFAULT NULL,
  `status` enum('applied','reviewed','shortlisted','rejected','accepted') DEFAULT 'applied',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_applications`
--

INSERT INTO `job_applications` (`id`, `job_id`, `student_id`, `resume_id`, `status`, `applied_at`) VALUES
(6, 5, 8, 4, 'accepted', '2026-03-14 16:10:47'),
(7, 5, 13, 12, 'accepted', '2026-03-14 17:06:27'),
(8, 8, 8, 4, 'applied', '2026-03-16 02:21:02'),
(9, 6, 8, 4, 'applied', '2026-03-16 02:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','student','employer') NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `deadline` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reminders`
--

INSERT INTO `reminders` (`id`, `title`, `message`, `attachment`, `deadline`, `created_at`) VALUES
(11, 'Consent Form Submission', 'Students please remember to upload your consent form before the deadline ', NULL, '2026-03-17 10:30:00', '2026-03-14 16:28:54'),
(12, 'Consent Form Submission', 'Students please remember to upload your consent form before the deadline ', NULL, '2026-03-17 10:30:00', '2026-03-14 16:29:04');

-- --------------------------------------------------------

--
-- Table structure for table `resume_profiles`
--

CREATE TABLE `resume_profiles` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `current_step` int(11) DEFAULT 1,
  `progress` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `selected_template` int(11) DEFAULT 1,
  `profile_image` varchar(255) DEFAULT NULL,
  `resume_pdf_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_profiles`
--

INSERT INTO `resume_profiles` (`id`, `student_id`, `current_step`, `progress`, `created_at`, `updated_at`, `selected_template`, `profile_image`, `resume_pdf_path`) VALUES
(4, 8, 5, 100, '2026-03-08 16:00:37', '2026-03-16 06:50:39', 3, '/uploads/1772987460787-64689212.jpg', '/uploads/resume_pdfs/resume_4.pdf'),
(7, 10, 5, 100, '2026-03-09 03:52:30', '2026-03-09 04:06:44', 1, '/uploads/1773029178476-761431574.webp', '/uploads/resume_pdfs/resume_7.pdf'),
(8, 11, 5, 100, '2026-03-09 04:08:20', '2026-03-09 04:34:07', 1, '/uploads/1773030830130-465546082.jpeg', '/uploads/resume_pdfs/resume_8.pdf'),
(12, 13, 5, 100, '2026-03-14 16:36:55', '2026-03-14 17:05:34', 3, '/uploads/1773507854906-424668239.webp', '/uploads/resume_pdfs/resume_12.pdf'),
(13, 9, 5, 100, '2026-03-16 05:36:55', '2026-03-16 05:56:46', 1, '/uploads/1773640546997-618667869.webp', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `resume_step1`
--

CREATE TABLE `resume_step1` (
  `resume_id` int(11) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `career_objective` text DEFAULT NULL,
  `education` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`education`)),
  `technical_skills` text DEFAULT NULL,
  `soft_skills` text DEFAULT NULL,
  `languages` text DEFAULT NULL,
  `projects` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`projects`)),
  `experience` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`experience`)),
  `course` varchar(100) DEFAULT NULL,
  `about_me` text DEFAULT NULL,
  `ai_career_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_career_recommendations`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step1`
--

INSERT INTO `resume_step1` (`resume_id`, `full_name`, `dob`, `gender`, `phone`, `email`, `linkedin`, `github`, `address`, `career_objective`, `education`, `technical_skills`, `soft_skills`, `languages`, `projects`, `experience`, `course`, `about_me`, `ai_career_recommendations`) VALUES
(4, 'Pavithira Paramakurubaran', '2004-08-20', 'Female', '01110862608', 'paviparam26@gmail.com', 'https://www.linkedin.com/in/pavi-param-4686671a4/', 'https://github.com/PavithiraParamakurubaran', 'A-22-18 ASCOTTE BOULEVARD SEKSYEN 6 BANDAR RINCHING', 'Motivated computer science student seeking an internship opportunity and willing to learn and contribute effectively.', '[{\"institution\":\"Peninsula College Georgetown\",\"degree\":\"Bachelor\'s In Computer Science (Software Engineering)\",\"major\":\"Computer Science (Software Engineering)\",\"cgpa\":\"4.0\"}]', 'Skilled in frontend and backend web development using modern tools and frameworks.', 'Strong communication teamwork problem solving and adaptability.', 'Fluent in English Tamil and Malay.', '[{\"title\":\"Internship Management System\",\"description\":\"Built a web-based internship management system that allows students to apply for internships, upload resumes, and track application status. The system includes separate dashboards for students and employers to manage applications, review resumes, and monitor internship progress.\",\"tools\":\"React.js, Node.js, Open Ai, MySQL\",\"role\":\"Full Stack Developer & Team Leader\"}]', '[{\"organization\":\"Infitech Creations\",\"position\":\"Full Stack Developer\",\"duration\":\"8 Months \",\"responsibilities\":\"Developed and maintained web applications by implementing both frontend and backend functionalities. Built responsive user interfaces, integrated APIs, managed databases, and collaborated with the development team to design, test, and deploy efficient software solutions.\"}]', 'Bachelor\'s In Computer Science (Software Engineering)', 'Motivated computer science student specializing in software engineering with 8 months of experience as a Full Stack Developer at Infitech Creations. Skilled in frontend and backend web development using React.js, Node.js, and MySQL, with proven ability to lead projects such as an Internship Management System. Strong communicator with teamwork, problem-solving, and adaptability skills, fluent in English, Tamil, and Malay, eager to contribute effectively in an internship role.', '[{\"title\":\"Full Stack Developer\",\"reason\":\"This role leverages both frontend and backend development skills, ideal for someone with experience in React.js and Node.js. The candidate\'s project experience as a Full Stack Developer also aligns well with this position.\",\"skills\":[\"React.js\",\"Node.js\",\"MySQL\"]},{\"title\":\"Web Developer\",\"reason\":\"A position focused on building responsive web applications using HTML, CSS, and JavaScript, matching the candidate\'s technical skills. The experience in UI/UX design provides an added advantage.\",\"skills\":[\"HTML\",\"CSS\",\"JavaScript\"]},{\"title\":\"Software Engineer\",\"reason\":\"This role requires strong problem-solving abilities and software development skills, both of which the candidate demonstrates. Familiarity with RESTful API integration is also a key asset.\",\"skills\":[\"RESTful API\",\"Git\",\"Critical Thinking\"]},{\"title\":\"UI/UX Designer\",\"reason\":\"Given the candidate\'s experience in basic UI/UX design using tools like Figma and Canva, this role could be a good fit. The ability to communicate effectively adds value to collaborative design processes.\",\"skills\":[\"Figma\",\"Canva\",\"Communication\"]}]'),
(6, 'NEOH JIA YI', '2001-08-01', 'Female', '01135728288', 'neohjiayi@gmail.com', '', '', 'B-22 Pangsapuri Seri Suria Batu Kawan', 'Motivated software engineering student seeking an internship opportunity and eager to learn and contribute effectively.', '[{\"institution\":\"Peninsula Malaysia\",\"degree\":\"Computer Science\",\"major\":\"Software Engineering\",\"cgpa\":\"4\"}]', 'Microsoft excel, word, powerpoint, canva ', 'communication, teamwork', 'English, Chinese', '[{\"title\":\"Travel Website\",\"description\":\"Viewing and booking holiday destinations.\",\"tools\":\"Visual Code\",\"role\":\"PM\"}]', '[{\"organization\":\"The 12 Waves\",\"position\":\"General Manager\",\"duration\":\"Mar2025 - Feb2026\",\"responsibilities\":\"\"}]', 'Computer Science', 'Motivated Computer Science student with strong skills in Microsoft Office and Canva, fluent in English and Chinese. Experienced as a General Manager at The 12 Waves and led a travel website project as Project Manager using Visual Code. Eager to apply communication and teamwork abilities in a software engineering internship.', '[{\"title\":\"Project Manager\",\"reason\":\"With experience as a General Manager and leading a project on a travel website, you possess strong leadership and organizational skills.\",\"skills\":[\"Communication\",\"Teamwork\",\"Project Management\"]},{\"title\":\"Business Analyst\",\"reason\":\"Your technical skills in Excel and experience managing a team make you well-suited for analyzing data to drive business decisions.\",\"skills\":[\"Data Analysis\",\"Communication\",\"Problem-Solving\"]},{\"title\":\"Web Developer\",\"reason\":\"Your project experience in building a travel website indicates a foundational understanding of web development tools and processes.\",\"skills\":[\"Visual Code\",\"Teamwork\",\"Attention to Detail\"]},{\"title\":\"Marketing Coordinator\",\"reason\":\"With proficiency in Canva and experience in managing projects, you can effectively support marketing initiatives and campaigns.\",\"skills\":[\"Creativity\",\"Communication\",\"Teamwork\"]}]'),
(7, 'Varshini A/P Seger', '2003-02-01', 'Female', '01567323469', 'bsse2506011@peninsulamalaysia.edu.my', '', '', '16, lorong 22, bandar tasek mutiara, simpang ampat, penang', 'Motivated logistics student seeking an internship opportunity and willing to learn and contribute effectively.', '[{\"institution\":\"Peninsula Malaysia\",\"degree\":\"BA Marintime Logistics\",\"major\":\"\",\"cgpa\":\"4\"}]', 'Excel, Powerpoint', 'Communication, Leadership', 'english, Tamil, Malay', '[{\"title\":\"\",\"description\":\"\",\"tools\":\"\",\"role\":\"\"}]', '[{\"organization\":\"\",\"position\":\"\",\"duration\":\"\",\"responsibilities\":\"\"}]', 'BA Marintime Logistics', 'Motivated BA Maritime Logistics student with strong communication and leadership skills, proficient in Excel and PowerPoint. Eager to apply theoretical knowledge and contribute effectively through an internship opportunity. Fluent in English, Tamil, and Malay, committed to continuous learning and professional growth.', '[{\"title\":\"Logistics Coordinator\",\"reason\":\"Utilizes your BA in Maritime Logistics to manage supply chain operations effectively. Strong communication skills will enhance team collaboration.\",\"skills\":[\"Communication\",\"Excel\",\"Leadership\"]},{\"title\":\"Supply Chain Analyst\",\"reason\":\"Leverages your analytical skills and technical knowledge of Excel to optimize supply chain processes. The role requires strong problem-solving abilities.\",\"skills\":[\"Excel\",\"Analytical Thinking\",\"Leadership\"]},{\"title\":\"Operations Manager\",\"reason\":\"Oversees logistics operations and ensures efficiency, drawing on your leadership and communication skills to manage teams effectively.\",\"skills\":[\"Leadership\",\"Communication\",\"Project Management\"]},{\"title\":\"Freight Forwarder\",\"reason\":\"Involves coordinating shipments and logistics, allowing you to use your knowledge in Maritime Logistics and language skills for international communication.\",\"skills\":[\"Communication\",\"Logistics Knowledge\",\"Problem Solving\"]}]'),
(8, 'Dhevesshwaar Punnia', '2004-05-01', 'Male', '016-6786012', 'dhevesshawesome@gmail.com', '', '', '41, Lintang Kota Permai 4, Taman Kota Permai, 14000 Bukit Mertajam, Pulau Pinang', 'Motivated computer science student seeking an internship opportunity and willing to learn and contribute effectively.', '[{\"institution\":\"Peninsula College\",\"degree\":\"Computer Science\",\"major\":\"Cyber Security\",\"cgpa\":\"3.55\"}]', 'Python, AI Prompting, App Script', 'Communication, Teamwork, Leading', 'English, Malay, Tamil, Mandarin', '[{\"title\":\"Feasibility Report Automation\",\"description\":\"Automated flow of a Financial Feasibility Report\",\"tools\":\"App Script, App Sheet, Google Sheets\",\"role\":\"Lead Developer\"}]', '[{\"organization\":\"Khoshee Auctioneers Sdn. Bhd.\",\"position\":\"IT Intern\",\"duration\":\"Jan 2025 - May 2025\",\"responsibilities\":\"Develop projects and create SOPs for AI usage\"}]', 'Computer Science', 'Motivated computer science student with experience as an IT Intern at Khoshee Auctioneers Sdn. Bhd., developing projects and creating SOPs for AI usage. Skilled in Python, AI prompting, and App Script, with strong communication, teamwork, and leadership abilities. Led the development of an automated Financial Feasibility Report using App Script and Google Sheets. Fluent in English, Malay, Tamil, and Mandarin.', '[{\"title\":\"AI Developer\",\"reason\":\"Your experience with AI prompting and automation aligns well with developing AI solutions. The role leverages your technical background in Python and App Script.\",\"skills\":[\"Python\",\"AI Prompting\",\"Teamwork\"]},{\"title\":\"Data Analyst\",\"reason\":\"Your project experience in automating reports and using Google Sheets suits a role focused on data analysis and reporting. Strong communication skills will enhance stakeholder interactions.\",\"skills\":[\"App Script\",\"Google Sheets\",\"Communication\"]},{\"title\":\"Software Developer\",\"reason\":\"Your coursework in Computer Science and project experience make you a strong candidate for developing software applications. Python skills are particularly relevant for this role.\",\"skills\":[\"Python\",\"Teamwork\",\"Leading\"]},{\"title\":\"Technical Project Manager\",\"reason\":\"Your leadership experience in projects and ability to create SOPs make you suited for managing tech projects. This role requires strong communication and teamwork skills.\",\"skills\":[\"Communication\",\"Leading\",\"Teamwork\"]}]'),
(12, 'Thulasi A/P G Vijayaraj', '2004-04-07', 'Female', '01133926108', 'bsse2509287@peninsulamalaysia.edu.my', '', '', 'No 13,Jalan Sultan Abdullah, 71900 Labu , Negeri Sembilan ', 'Motivated computer science student seeking an internship opportunity and willing to learn and contribute effectively.', '[{\"institution\":\"Peninsula College Georgetown\",\"degree\":\"BSc (Hons) Computer Science (Software Engineering)\",\"major\":\"Software Engineering\",\"cgpa\":\"3.57\"}]', 'Good in programming skills such as typescript and java', 'Communication skills', 'Tamil and English', '[{\"title\":\"Student Reminder Application\",\"description\":\"Its basic reminder app for student which build for the students to make thier reminder such as assestment and exams\",\"tools\":\"Java and Android Studio\",\"role\":\"Developer\"}]', '[{\"organization\":\"Visva Digitech\",\"position\":\"UI/UX Designer\",\"duration\":\"Feb 2025 - June 2025\",\"responsibilities\":\"I managed to build and manage mobile applications according to the client requirements \"}]', 'BSc (Hons) Computer Science (Software Engineering)', 'Motivated BSc (Hons) Computer Science (Software Engineering) student with strong programming skills in TypeScript and Java. Experienced in developing mobile applications, including a Student Reminder App using Java and Android Studio. Skilled in communication and UI/UX design, having contributed to client projects at Visva Digitech. Fluent in Tamil and English, eager to learn and contribute effectively in an internship role.', '[{\"title\":\"Software Developer\",\"reason\":\"With a background in BSc (Hons) Computer Science and strong programming skills in Java and TypeScript, this role is a natural fit for application development.\",\"skills\":[\"Java\",\"TypeScript\",\"Problem-solving\"]},{\"title\":\"Mobile Application Developer\",\"reason\":\"Experience in developing mobile applications using Android Studio aligns well with this role, focusing on user-friendly solutions for clients.\",\"skills\":[\"Android Development\",\"Java\",\"User Interface Design\"]},{\"title\":\"UI/UX Designer\",\"reason\":\"Previous experience as a UI/UX Designer at Visva Digitech showcases the ability to create user-centric designs, making this role suitable.\",\"skills\":[\"User Research\",\"Prototyping\",\"Communication\"]},{\"title\":\"Technical Support Specialist\",\"reason\":\"Strong communication skills and technical knowledge can help in providing effective support for software and applications.\",\"skills\":[\"Communication\",\"Problem-solving\",\"Technical Troubleshooting\"]}]'),
(13, 'NEOH JIA YI', '2004-03-09', 'Female', '01135728288', 'bsse2506008@peninsulamalaysia.edu.my', '', '', 'No 18, Jalan Hijaun, Taman Merah, 71900 Labu, Negeri Sembilan', 'Motivated computer science student seeking an internship opportunity and willing to learn and contribute effectively.', '[{\"institution\":\"Peninsula College Georgetown\",\"degree\":\"BSc (Hons) Computer Science (Software Engineering)\",\"major\":\"Software Engineering\",\"cgpa\":\"4\"}]', 'Expert in Microsoft Excel', 'Communications', 'Mandarin and English', '[{\"title\":\"Travel Website\",\"description\":\"Help clients to book,review and schedule thier trip\",\"tools\":\"javascript,html,css\",\"role\":\"Team Leader\"}]', '[{\"organization\":\"EGH\",\"position\":\"Junior executive\",\"duration\":\"1 year\",\"responsibilities\":\"Data entry, Marketing and Sales\"}]', 'BSc (Hons) Computer Science (Software Engineering)', 'Motivated BSc (Hons) Computer Science (Software Engineering) student with strong communication skills and fluency in Mandarin and English. Experienced as a Junior Executive at EGH, handling data entry, marketing, and sales. Skilled in Microsoft Excel and led a team project developing a travel website using JavaScript, HTML, and CSS. Eager to apply technical knowledge and contribute effectively through an internship opportunity.', '[{\"title\":\"Web Developer\",\"reason\":\"Your experience leading a travel website project showcases your technical skills in web development. This role aligns with your software engineering background.\",\"skills\":[\"JavaScript\",\"HTML\",\"CSS\"]},{\"title\":\"Data Analyst\",\"reason\":\"Your expertise in Microsoft Excel and experience in data entry make you a strong candidate for analyzing and interpreting data. This role leverages your technical and analytical skills.\",\"skills\":[\"Data Analysis\",\"Excel\",\"Communication\"]},{\"title\":\"Marketing Coordinator\",\"reason\":\"Your experience in marketing and sales, combined with your communication skills, positions you well for a role that requires both technical and interpersonal abilities.\",\"skills\":[\"Marketing\",\"Sales\",\"Communication\"]},{\"title\":\"Project Manager\",\"reason\":\"As a team leader on your project, you demonstrated leadership and organizational skills, making you suitable for managing projects within tech or software development.\",\"skills\":[\"Leadership\",\"Project Management\",\"Communication\"]}]');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step2`
--

CREATE TABLE `resume_step2` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`answers`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step2`
--

INSERT INTO `resume_step2` (`id`, `resume_id`, `answers`, `created_at`, `updated_at`) VALUES
(3, 4, '[\"I had the stress by staying organised prioritising tasks and focusing on one problem at a time I remain calm under pressure and maintain a positive mindset to complete tasks efficiently\",\"I demonstrated leadership during a group project by coordinating tasks guiding team members and ensuring everyone meet deadlines which help the team successfully complete the project\",\"I once made a mistake in a project by overlooking a small detail I corrected it quickly and learn the Improvement of reviewing my work carefully before submission\",\"I face the challenge when working on tide project at 9 I manage my time carefully periodized importing task and stay focused which help me complete the project successfully\",\"I expect to gain practical industry experience improve my technical and problem-solving skills and learn how to work efficiently in a professional team environment\"]', '2026-03-08 16:17:22', '2026-03-08 16:17:22'),
(4, 6, '[\"I solve the problem creativity by brainstorming\",\"the program language I use is hdml and C plus plus\",\"money\",\"because I want the money because I want to learn something new\",\"I expect to learn something new\"]', '2026-03-09 03:37:02', '2026-03-09 03:37:02'),
(5, 7, '[\"what motivates me to succeed is money\",\"in 5 years I see myself owning a logistic company\",\"a technical concept is I don\'t know so yeah that\'s the question\",\"I use HTML and C plus plus\",\"I solve problem creatively by thinking and thinking and thinking\"]', '2026-03-09 04:01:53', '2026-03-09 04:01:53'),
(6, 8, '[\"I\'m a cyber security graduate and I have experienced as an it in 10\",\"I\'m interested in this internship because I want to complete my degree and earn experience\",\"I see myself as an expert in a cyber security field\",\"my favourite project is an AI prompting project\",\"I\'ve made a mistake and learn from it\"]', '2026-03-09 04:18:43', '2026-03-09 04:18:43'),
(7, 12, '[\"I will see myself in 5 years as a business woman\",\"I\'ve made beef steak before in my project which I\'ve been seeing my declines I and I forgot to finish on time\",\"I when I do my internship project I was too excited but and not the project have been paid\",\"I\'ve been working a team where they have lot of people and they all give a beautiful experience to me\",\"when I feel stretch your brother I tried to stay calm and organise my tasks by priority breaking work into smaller steps help me focus and computers efficiently I believe staying organised and maintain positive mindset help me handle pressure better\"]', '2026-03-14 16:48:31', '2026-03-14 16:52:27'),
(8, 13, '[\"I handle my stress by listening music and then drawing\",\"I expect to learn some experience\",\"my strength is my hard work and my weakness is my time management\",\"my challenging situation when I\'m doing my group project so I overcame it by communication with my teammates\",\"the thing motivates me to success with my hard work and also money\"]', '2026-03-16 05:47:20', '2026-03-16 05:47:20');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step2_results`
--

CREATE TABLE `resume_step2_results` (
  `resume_id` int(11) NOT NULL,
  `fluencyScore` decimal(4,2) NOT NULL,
  `level` varchar(50) NOT NULL,
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`feedback`)),
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`answers`)),
  `overallPercentage` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step2_results`
--

INSERT INTO `resume_step2_results` (`resume_id`, `fluencyScore`, `level`, `feedback`, `answers`, `overallPercentage`) VALUES
(4, 5.00, 'Intermediate', '[\"Improve grammar and sentence structure: work on articles, verb tense consistency, and subject-verb agreement.\",\"Clarify word choice and reduce typos: choose precise vocabulary and proofread (e.g., \'tight deadline\' instead of \'tide project\').\",\"Organize answers into complete sentences and use connectors and pauses when speaking to increase clarity and fluency.\"]', '[\"I had the stress by staying organised prioritising tasks and focusing on one problem at a time I remain calm under pressure and maintain a positive mindset to complete tasks efficiently\",\"I demonstrated leadership during a group project by coordinating tasks guiding team members and ensuring everyone meet deadlines which help the team successfully complete the project\",\"I once made a mistake in a project by overlooking a small detail I corrected it quickly and learn the Improvement of reviewing my work carefully before submission\",\"I face the challenge when working on tide project at 9 I manage my time carefully periodized importing task and stay focused which help me complete the project successfully\",\"I expect to gain practical industry experience improve my technical and problem-solving skills and learn how to work efficiently in a professional team environment\"]', 10.00),
(6, 4.00, 'Beginner', '[\"Work on grammar and word forms (e.g., use \'creatively\' instead of \'creativity\', and plural/subject-verb agreement).\",\"Use correct vocabulary and capitalization for technical terms (e.g., \'HTML\' and \'C++\', and say \'programming languages\').\",\"Make sentences complete and avoid repetition; combine ideas clearly (e.g., \'I solve problems creatively by brainstorming. I use HTML and C++ to write programs.\').\"]', '[\"I solve the problem creativity by brainstorming\",\"the program language I use is hdml and C plus plus\",\"money\",\"because I want the money because I want to learn something new\",\"I expect to learn something new\"]', 8.00),
(7, 5.00, 'Intermediate', '[\"Work on grammar: use correct articles and plurals (e.g., \'a logistics company\', \'solve problems\')\",\"Improve clarity and cohesion: give fuller, structured responses rather than fragmented phrases\",\"Expand vocabulary and technical accuracy (use \'C++\' and practice explaining technical concepts clearly)\"]', '[\"what motivates me to succeed is money\",\"in 5 years I see myself owning a logistic company\",\"a technical concept is I don\'t know so yeah that\'s the question\",\"I use HTML and C plus plus\",\"I solve problem creatively by thinking and thinking and thinking\"]', 10.00),
(8, 5.00, 'Intermediate', '[\"Work on grammar and tense consistency (e.g., \'I\'ve made a mistake and learned from it\', \'I have experience as an IT professional\').\",\"Improve word choice and collocations (use \'gain experience\' or \'get experience\', \'in the field of cybersecurity\' or simply \'in cybersecurity\').\",\"Focus on sentence clarity and punctuation/capitalization (start sentences with a capital letter and make unclear phrases more specific).\"]', '[\"I\'m a cyber security graduate and I have experienced as an it in 10\",\"I\'m interested in this internship because I want to complete my degree and earn experience\",\"I see myself as an expert in a cyber security field\",\"my favourite project is an AI prompting project\",\"I\'ve made a mistake and learn from it\"]', 10.00),
(12, 3.00, 'Beginner', '[\"Improve grammar and sentence structure: focus on correct word order, subject-verb agreement, and consistent verb tenses.\",\"Practice organizing answers into complete, coherent sentences; use linking words (and, but, because) to connect ideas.\",\"Increase speaking fluency by practicing aloud, shadowing native speakers, and expanding vocabulary for common topics.\"]', '[\"I will see myself in 5 years as a business woman\",\"I\'ve made beef steak before in my project which I\'ve been seeing my declines I and I forgot to finish on time\",\"I when I do my internship project I was too excited but and not the project have been paid\",\"I\'ve been working a team where they have lot of people and they all give a beautiful experience to me\",\"when I feel stretch your brother I tried to stay calm and organise my tasks by priority breaking work into smaller steps help me focus and computers efficiently I believe staying organised and maintain positive mindset help me handle pressure better\"]', 6.00),
(13, 4.00, 'Beginner', '[\"Work on basic grammar: use correct verb forms, articles, and prepositions (e.g., \'listening to music\', \'gain experience\').\",\"Practice building clear sentence structure and linking ideas with connectors to improve coherence.\",\"Expand vocabulary and practice speaking aloud to increase fluency and confidence.\"]', '[\"I handle my stress by listening music and then drawing\",\"I expect to learn some experience\",\"my strength is my hard work and my weakness is my time management\",\"my challenging situation when I\'m doing my group project so I overcame it by communication with my teammates\",\"the thing motivates me to success with my hard work and also money\"]', 8.00);

-- --------------------------------------------------------

--
-- Table structure for table `resume_step3`
--

CREATE TABLE `resume_step3` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `answers` longtext NOT NULL CHECK (json_valid(`answers`)),
  `questions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`questions`)),
  `score` decimal(4,2) NOT NULL,
  `contribution` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step3`
--

INSERT INTO `resume_step3` (`id`, `resume_id`, `answers`, `questions`, `score`, `contribution`, `created_at`, `updated_at`) VALUES
(38, 4, '[]', '[{\"question\":\"Which HTML elements are considered semantic and help improve accessibility and SEO?\",\"options\":[\"<section>\",\"<div>\",\"<nav>\",\"<span>\"],\"correctOptions\":[\"<section>\",\"<nav>\"]},{\"question\":\"Which CSS techniques are most effective for building responsive layouts?\",\"options\":[\"Use media queries to adjust styles at breakpoints\",\"Use fixed pixel widths for all containers\",\"Use CSS Flexbox for flexible alignment\",\"Use relative units (%, em, rem) instead of absolute pixels\"],\"correctOptions\":[\"Use media queries to adjust styles at breakpoints\",\"Use relative units (%, em, rem) instead of absolute pixels\"]},{\"question\":\"In React application architecture, which practices help manage state cleanly?\",\"options\":[\"Lift shared state up to a common ancestor component\",\"Always store all application state in Redux for small apps\",\"Use React hooks like useState and useReducer for local state\",\"Avoid splitting state; keep everything in one large component state\"],\"correctOptions\":[\"Lift shared state up to a common ancestor component\",\"Use React hooks like useState and useReducer for local state\"]},{\"question\":\"Which approaches are appropriate for handling asynchronous errors in an Express.js route using async/await?\",\"options\":[\"Wrap asynchronous code in try/catch and handle errors\",\"Call next(err) to forward errors to Express error handlers\",\"Use synchronous blocking database calls to avoid async errors\",\"Ignore rejected promises and let them fail silently\"],\"correctOptions\":[\"Wrap asynchronous code in try/catch and handle errors\",\"Call next(err) to forward errors to Express error handlers\"]},{\"question\":\"Which MySQL practices help ensure data integrity in a relational schema?\",\"options\":[\"Define FOREIGN KEY constraints between related tables\",\"Rely solely on client-side validation for critical checks\",\"Use transactions for multi-step operations that must be atomic\",\"Always use VARCHAR for numeric identifiers\"],\"correctOptions\":[\"Define FOREIGN KEY constraints between related tables\",\"Use transactions for multi-step operations that must be atomic\"]},{\"question\":\"Which REST principles are correct when designing an API?\",\"options\":[\"Use GET to retrieve resources without side effects\",\"Use POST to delete resources\",\"Design the API to be stateless so each request contains all necessary context\",\"Always use SOAP instead of REST for web APIs\"],\"correctOptions\":[\"Use GET to retrieve resources without side effects\",\"Design the API to be stateless so each request contains all necessary context\"]},{\"question\":\"Which Git/GitHub practices are considered good for collaborative development?\",\"options\":[\"Commit small, logical changes frequently\",\"Commit directly to the main branch for all feature work\",\"Use feature branches and pull requests for reviews\",\"Avoid writing commit messages to save time\"],\"correctOptions\":[\"Commit small, logical changes frequently\",\"Use feature branches and pull requests for reviews\"]},{\"question\":\"Which UI/UX choices typically improve usability and clarity for web users?\",\"options\":[\"Maintain consistent spacing, typography, and sufficient color contrast\",\"Use three or more different decorative fonts on the same page\",\"Provide clear, descriptive call-to-action labels\",\"Place essential actions far from the primary viewport to reduce accidental clicks\"],\"correctOptions\":[\"Maintain consistent spacing, typography, and sufficient color contrast\",\"Provide clear, descriptive call-to-action labels\"]},{\"question\":\"Which front-end performance optimizations are commonly effective for web applications?\",\"options\":[\"Minify and bundle CSS/JavaScript assets\",\"Inline all images as base64 data URIs regardless of size\",\"Implement lazy-loading for offscreen images and components\",\"Add large unused libraries to improve feature richness\"],\"correctOptions\":[\"Minify and bundle CSS/JavaScript assets\",\"Implement lazy-loading for offscreen images and components\"]},{\"question\":\"Which practices are recommended for code quality and deployment in a professional project?\",\"options\":[\"Write unit tests for key components and modules\",\"Deploy manually from a local machine without automation\",\"Use a CI/CD pipeline to run tests and automate deployments\",\"Copy files to production via untracked manual processes\"],\"correctOptions\":[\"Write unit tests for key components and modules\",\"Use a CI/CD pipeline to run tests and automate deployments\"]}]', 0.00, 0.00, '2026-03-08 16:18:27', '2026-03-08 16:18:40'),
(40, 6, '[]', '[{\"question\":\"Which data structure is most appropriate for implementing undo functionality where the last action must be reversed first?\",\"options\":[\"Queue\",\"Stack\",\"HashMap\",\"Binary Tree\"],\"correctOptions\":[\"Stack\"]},{\"question\":\"What is the average-case time complexity for searching an element in a balanced binary search tree (e.g., AVL or Red-Black tree)?\",\"options\":[\"O(n)\",\"O(log n)\",\"O(n log n)\",\"O(1)\"],\"correctOptions\":[\"O(log n)\"]},{\"question\":\"Which Excel feature is best suited for extracting, transforming and loading data from multiple external sources before analysis?\",\"options\":[\"Power Query\",\"PivotTable\",\"VLOOKUP\",\"Data Validation\"],\"correctOptions\":[\"Power Query\"]},{\"question\":\"When collaborating on a Word document, which features help reviewers communicate edits and suggestions effectively?\",\"options\":[\"Track Changes\",\"Mail Merge\",\"Comments\",\"Styles\"],\"correctOptions\":[\"Track Changes\",\"Comments\"]},{\"question\":\"Which practices improve accessibility and readability of a PowerPoint presentation for a diverse audience?\",\"options\":[\"Add alternative text to images\",\"Use many decorative animations\",\"Use high-contrast color schemes\",\"Use non-standard fonts installed only on your machine\"],\"correctOptions\":[\"Add alternative text to images\",\"Use high-contrast color schemes\"]},{\"question\":\"In Canva, which feature helps maintain consistent brand visuals (colors, logos, fonts) across multiple designs?\",\"options\":[\"Brand Kit\",\"Random templates\",\"Collaboration link\",\"High-resolution export\"],\"correctOptions\":[\"Brand Kit\"]},{\"question\":\"Which of the following sorting algorithms are stable (i.e., preserve the relative order of equal elements)?\",\"options\":[\"Merge Sort\",\"Quick Sort (Lomuto/Hoare)\",\"Bubble Sort\",\"Heap Sort\"],\"correctOptions\":[\"Merge Sort\",\"Bubble Sort\"]},{\"question\":\"As a general manager overseeing a technical team, which actions are most effective for improving team performance?\",\"options\":[\"Set clear goals and expectations\",\"Micromanage individual tasks\",\"Provide regular constructive feedback\",\"Avoid investing in training\"],\"correctOptions\":[\"Set clear goals and expectations\",\"Provide regular constructive feedback\"]},{\"question\":\"Which practices are commonly associated with Agile software development?\",\"options\":[\"Iterative delivery with regular feedback\",\"Extensive upfront design with no iterations\",\"Continuous integration and frequent builds\",\"Fixed long-term scope without reviews\"],\"correctOptions\":[\"Iterative delivery with regular feedback\",\"Continuous integration and frequent builds\"]},{\"question\":\"Which actions help protect sensitive information when sharing documents and presentations?\",\"options\":[\"Apply password protection or encryption\",\"Share via an unrestricted public link\",\"Remove hidden metadata and personal information before sharing\",\"Use weak or easily guessable passwords\"],\"correctOptions\":[\"Apply password protection or encryption\",\"Remove hidden metadata and personal information before sharing\"]}]', 0.00, 0.00, '2026-03-09 03:39:39', '2026-03-09 03:39:44'),
(42, 7, '[]', '[{\"question\":\"What is the primary focus of maritime logistics as a field of study and practice?\",\"options\":[\"Management of the movement of goods and information by sea, including ports, shipping and supply chains\",\"Design and manufacture of marine engines and ship hulls\",\"Regulation of passenger cruise itineraries and onboard hospitality\",\"Accounting standards for international banking transactions\"],\"correctOptions\":[\"Management of the movement of goods and information by sea, including ports, shipping and supply chains\"]},{\"question\":\"Which document is most commonly used as the primary evidence of contract of carriage for containerized international shipments by sea?\",\"options\":[\"Commercial invoice\",\"Certificate of origin\",\"Bill of Lading\",\"Packing list\"],\"correctOptions\":[\"Bill of Lading\"]},{\"question\":\"Which Incoterm places the maximum responsibility on the seller, including delivery to the buyer\'s premises and clearance for import?\",\"options\":[\"EXW (Ex Works)\",\"FOB (Free On Board)\",\"DDP (Delivered Duty Paid)\",\"CIF (Cost, Insurance and Freight)\"],\"correctOptions\":[\"DDP (Delivered Duty Paid)\"]},{\"question\":\"In Excel, which tool is most appropriate for quickly summarizing large shipment datasets by origin, destination and carrier?\",\"options\":[\"PivotTable\",\"Conditional Formatting\",\"Data Validation\",\"Sparklines\"],\"correctOptions\":[\"PivotTable\"]},{\"question\":\"Which of the following are best practices when preparing a professional PowerPoint presentation for a logistics operations review?\",\"options\":[\"Use a consistent template and style throughout the deck\",\"Include every detail on slides; speakers should read all slide text verbatim\",\"Limit text to key points and use visuals (charts or maps) to illustrate data\",\"Use as many transition and animation effects as possible to engage the audience\"],\"correctOptions\":[\"Use a consistent template and style throughout the deck\",\"Limit text to key points and use visuals (charts or maps) to illustrate data\"]},{\"question\":\"What is the primary purpose of the ISPS (International Ship and Port Facility Security) Code in maritime operations?\",\"options\":[\"To set global standards for ship fuel efficiency\",\"To enhance security of ships and port facilities against threats\",\"To regulate crew wage standards across countries\",\"To establish container size and weight standards internationally\"],\"correctOptions\":[\"To enhance security of ships and port facilities against threats\"]},{\"question\":\"Which of the following are commonly included components on an ocean freight invoice or rate confirmation?\",\"options\":[\"Freight rate\",\"Bunker Adjustment Factor (BAF)\",\"Import tariffs and government duties\",\"Personal income tax of the ship\'s crew\"],\"correctOptions\":[\"Freight rate\",\"Bunker Adjustment Factor (BAF)\"]},{\"question\":\"Which classification system code is used internationally to classify traded goods for customs purposes and statistical reporting?\",\"options\":[\"HS (Harmonized System) code\",\"IMO ship identification number\",\"UN/LOCODE\",\"ISO country code\"],\"correctOptions\":[\"HS (Harmonized System) code\"]},{\"question\":\"When planning container routes to improve cost efficiency, which factor is most important to evaluate?\",\"options\":[\"Shortest geographic distance regardless of port congestion\",\"Average transit time combined with fuel cost and port handling efficiency\",\"Selecting routes only based on the most popular carrier\",\"Always avoiding transshipments even if costs increase significantly\"],\"correctOptions\":[\"Average transit time combined with fuel cost and port handling efficiency\"]},{\"question\":\"Which Excel functions or approaches are appropriate for combining two shipment tables by a common shipment ID?\",\"options\":[\"VLOOKUP to pull matching fields from the second table\",\"INDEX and MATCH combination to look up values by shipment ID\",\"TEXTJOIN to merge cells into a single string for analysis\",\"GOAL SEEK to find the best matching shipment ID\"],\"correctOptions\":[\"VLOOKUP to pull matching fields from the second table\",\"INDEX and MATCH combination to look up values by shipment ID\"]}]', 0.00, 0.00, '2026-03-09 04:02:50', '2026-03-09 04:03:10'),
(44, 8, '[]', '[{\"question\":\"Which statement correctly describes the primary difference between a Python list and a tuple?\",\"options\":[\"Tuples are immutable and typically used for fixed collections; lists are mutable and used for collections that change\",\"Lists are immutable and tuples are mutable\",\"Tuples automatically optimize memory for large datasets while lists do not\",\"Lists can store only items of the same type, tuples can store mixed types\"],\"correctOptions\":[\"Tuples are immutable and typically used for fixed collections; lists are mutable and used for collections that change\"]},{\"question\":\"Which practices help avoid the common pitfall of mutable default arguments in Python functions?\",\"options\":[\"Use None as the default and assign the mutable object inside the function body\",\"Declare mutable defaults like [] or {} directly because Python creates a new copy for each call\",\"Avoid using mutable objects (e.g., lists, dicts) as default argument values\",\"Always use global variables instead of default arguments to preserve state\"],\"correctOptions\":[\"Use None as the default and assign the mutable object inside the function body\",\"Avoid using mutable objects (e.g., lists, dicts) as default argument values\"]},{\"question\":\"When working with Google Apps Script, which statements correctly describe the difference between bound and standalone scripts?\",\"options\":[\"Bound scripts are attached to a specific Google Doc/Sheet and can use functions like SpreadsheetApp.getActive()\",\"Standalone scripts are embedded inside a Google Doc and cannot be executed independently\",\"Standalone scripts are independent files stored in Google Drive and can be reused across projects\",\"Bound scripts can be executed outside the container document without any additional permissions\"],\"correctOptions\":[\"Bound scripts are attached to a specific Google Doc/Sheet and can use functions like SpreadsheetApp.getActive()\",\"Standalone scripts are independent files stored in Google Drive and can be reused across projects\"]},{\"question\":\"Which prompt-engineering techniques are effective for improving the quality and reliability of an LLM\'s output?\",\"options\":[\"Provide few-shot examples showing the desired input-to-output mapping\",\"Keep prompts extremely vague to allow the model to be creative\",\"Be explicit about the required output format, constraints, and evaluation criteria\",\"Always prepend a large unrelated text block to increase context size\"],\"correctOptions\":[\"Provide few-shot examples showing the desired input-to-output mapping\",\"Be explicit about the required output format, constraints, and evaluation criteria\"]},{\"question\":\"For evaluating a binary classification model on an imbalanced dataset, which evaluation strategies are most appropriate?\",\"options\":[\"Use accuracy as the primary metric because it summarizes performance\",\"Use precision and recall to capture performance on the positive class\",\"Use mean squared error (MSE) because it measures overall error\",\"Use F1 score to balance precision and recall when both matter\"],\"correctOptions\":[\"Use precision and recall to capture performance on the positive class\",\"Use F1 score to balance precision and recall when both matter\"]},{\"question\":\"Which elements should be included when creating a Standard Operating Procedure (SOP) for responsible AI usage in an organization?\",\"options\":[\"A documented data inventory and data consent/privacy considerations\",\"Instructions to never monitor model performance after deployment\",\"Defined monitoring, evaluation and rollback procedures for models in production\",\"A policy that all model outputs should be used without human review\"],\"correctOptions\":[\"A documented data inventory and data consent/privacy considerations\",\"Defined monitoring, evaluation and rollback procedures for models in production\"]},{\"question\":\"When deciding between async (asyncio) and threads/multiprocessing in Python, which guidance is correct?\",\"options\":[\"Prefer async for high-concurrency I/O-bound tasks where many connections or requests are served\",\"Use threads for CPU-bound parallelism because Python threads bypass the GIL for CPU tasks\",\"Use multiprocessing (separate processes) for CPU-bound tasks to work around the GIL\",\"Always prefer threads over async for simple I/O operations because threads have no overhead\"],\"correctOptions\":[\"Prefer async for high-concurrency I/O-bound tasks where many connections or requests are served\",\"Use multiprocessing (separate processes) for CPU-bound tasks to work around the GIL\"]},{\"question\":\"Which is true about Google Apps Script simple triggers (e.g., onOpen) compared to installable triggers?\",\"options\":[\"Simple triggers run without explicit user authorization and cannot call services that require authorization (e.g., GmailApp)\",\"Simple triggers can access advanced services and perform actions requiring OAuth consent\",\"Installable triggers can run with the installer\'s authorization and access services requiring permissions\",\"Simple triggers always run with elevated permissions and can bypass user restrictions\"],\"correctOptions\":[\"Simple triggers run without explicit user authorization and cannot call services that require authorization (e.g., GmailApp)\",\"Installable triggers can run with the installer\'s authorization and access services requiring permissions\"]},{\"question\":\"Which prompt design choices help reduce hallucination and improve factuality of generated responses?\",\"options\":[\"Provide grounding context and cite source material the model can reference\",\"Set generation parameters to increase randomness (higher temperature) for factual tasks\",\"Ask the model to provide citations or to state uncertainty when not confident\",\"Ask the model to produce the longest possible answer regardless of relevance\"],\"correctOptions\":[\"Provide grounding context and cite source material the model can reference\",\"Ask the model to provide citations or to state uncertainty when not confident\"]},{\"question\":\"When preparing to deploy a Python-based AI application to production, which practices are most important for reliability and security?\",\"options\":[\"Store API keys and secrets in environment variables or a secret manager rather than in source code\",\"Commit plaintext credentials to the repository for easy access during debugging\",\"Implement CI/CD pipelines to automate testing, linting, and deployment\",\"Deploy directly from a developer laptop to speed up release cycles\"],\"correctOptions\":[\"Store API keys and secrets in environment variables or a secret manager rather than in source code\",\"Implement CI/CD pipelines to automate testing, linting, and deployment\"]}]', 0.00, 0.00, '2026-03-09 04:22:06', '2026-03-09 04:22:21'),
(46, 12, '[]', '[{\"question\":\"Which of the following are correct uses of TypeScript\'s type system to improve code quality?\",\"options\":[\"Use union and intersection types to model possible values\",\"Replace all types with \'any\' to avoid compilation errors\",\"Prefer interfaces or type aliases to describe object shapes\",\"Use type assertions everywhere instead of fixing types\"],\"correctOptions\":[\"Use union and intersection types to model possible values\",\"Prefer interfaces or type aliases to describe object shapes\"]},{\"question\":\"Which techniques can be used to safely coordinate threads in Java?\",\"options\":[\"Use the synchronized keyword for critical sections\",\"Use ReentrantLock from java.util.concurrent.locks\",\"Spawn threads and share mutable data without synchronization\",\"Rely on Thread.stop() to terminate threads cleanly\"],\"correctOptions\":[\"Use the synchronized keyword for critical sections\",\"Use ReentrantLock from java.util.concurrent.locks\"]},{\"question\":\"For building responsive mobile app layouts across device sizes, which approaches are appropriate?\",\"options\":[\"Use fixed pixel dimensions for all components\",\"Use relative/density-independent units and constraint-based layouts\",\"Design flexible grid or constraint systems that adapt to screen size\",\"Assume one layout fits all devices without testing\"],\"correctOptions\":[\"Use relative/density-independent units and constraint-based layouts\",\"Design flexible grid or constraint systems that adapt to screen size\"]},{\"question\":\"When managing application state in a TypeScript-based mobile app, which practices are recommended?\",\"options\":[\"Lift state up to the nearest common ancestor for shared local state\",\"Store all UI state in the backend to simplify the client\",\"Use a global state library (Redux, MobX, Zustand) for widely shared state\",\"Store transient UI state exclusively in localStorage\"],\"correctOptions\":[\"Lift state up to the nearest common ancestor for shared local state\",\"Use a global state library (Redux, MobX, Zustand) for widely shared state\"]},{\"question\":\"Which are effective strategies to improve perceived performance in mobile apps?\",\"options\":[\"Lazy-load or code-split features to reduce initial bundle size\",\"Use caching for images and API responses where appropriate\",\"Increase default animation durations to make transitions smoother\",\"Bundle all assets and code into one large file to minimize requests\"],\"correctOptions\":[\"Lazy-load or code-split features to reduce initial bundle size\",\"Use caching for images and API responses where appropriate\"]},{\"question\":\"Which practices are considered RESTful and scalable for public APIs?\",\"options\":[\"Use appropriate HTTP methods (GET, POST, PUT, DELETE) and make GET requests idempotent\",\"Keep the API stateful by storing client session on the server between requests\",\"Support pagination, filtering and sorting for list endpoints\",\"Expose database schemas directly in responses without abstraction\"],\"correctOptions\":[\"Use appropriate HTTP methods (GET, POST, PUT, DELETE) and make GET requests idempotent\",\"Support pagination, filtering and sorting for list endpoints\"]},{\"question\":\"When writing unit tests for Java and TypeScript codebases, which practices improve maintainability and reliability?\",\"options\":[\"Mock external dependencies to isolate the unit under test\",\"Write tests that assert the public behavior rather than private implementation details\",\"Depend on third-party services in unit tests to validate integration\",\"Commit tests that are flaky and only pass intermittently\"],\"correctOptions\":[\"Mock external dependencies to isolate the unit under test\",\"Write tests that assert the public behavior rather than private implementation details\"]},{\"question\":\"Which accessibility practices should a UI/UX designer apply to mobile applications?\",\"options\":[\"Provide meaningful labels and alt text for interactive elements and images\",\"Rely solely on color to convey important information\",\"Ensure sufficient color contrast and scalable font sizes\",\"Disable system font scaling to preserve layout fidelity\"],\"correctOptions\":[\"Provide meaningful labels and alt text for interactive elements and images\",\"Ensure sufficient color contrast and scalable font sizes\"]},{\"question\":\"Which measures help protect mobile and web applications from common security vulnerabilities?\",\"options\":[\"Validate and sanitize user input on both client and server sides\",\"Use HTTPS/TLS for all network communication\",\"Store authentication tokens in plain text on the device without protection\",\"Accept unchecked redirects and external resource URLs\"],\"correctOptions\":[\"Validate and sanitize user input on both client and server sides\",\"Use HTTPS/TLS for all network communication\"]},{\"question\":\"Which practices contribute to higher code quality and faster delivery in a software engineering team?\",\"options\":[\"Use continuous integration with automated tests\",\"Perform regular code reviews and pair programming\",\"Avoid writing tests to save time during development\",\"Follow a strict waterfall plan without iterative feedback\"],\"correctOptions\":[\"Use continuous integration with automated tests\",\"Perform regular code reviews and pair programming\"]}]', 0.00, 0.00, '2026-03-14 16:53:47', '2026-03-14 16:54:07'),
(48, 13, '[]', '[{\"question\":\"Which Excel features are most appropriate for summarizing large datasets by category or criteria?\",\"options\":[\"PivotTable\",\"SUMIFS function\",\"VLOOKUP\",\"FILTER function\"],\"correctOptions\":[\"PivotTable\",\"SUMIFS function\"]},{\"question\":\"Which Excel tools are best suited to automate repetitive data preparation and transformation tasks?\",\"options\":[\"Macros (VBA)\",\"Power Query\",\"Conditional Formatting\",\"Data Validation\"],\"correctOptions\":[\"Macros (VBA)\",\"Power Query\"]},{\"question\":\"When preparing sales data for reporting, which practices are considered best practice for maintainability and auditability?\",\"options\":[\"Remove duplicates immediately from the only copy of the dataset\",\"Store raw data in one sheet/table and create separate report sheets\",\"Hard-code final numbers into reports to improve performance\",\"Use consistent date and time formats across the dataset\"],\"correctOptions\":[\"Store raw data in one sheet/table and create separate report sheets\",\"Use consistent date and time formats across the dataset\"]},{\"question\":\"Which Git commands are used to record changes locally and then send them to a remote repository?\",\"options\":[\"git commit\",\"git push\",\"git clone\",\"git pull\"],\"correctOptions\":[\"git commit\",\"git push\"]},{\"question\":\"In SQL, which clauses/statements are essential to retrieve aggregated sales totals grouped by customer?\",\"options\":[\"SELECT\",\"GROUP BY\",\"JOIN\",\"CREATE\"],\"correctOptions\":[\"SELECT\",\"GROUP BY\"]},{\"question\":\"Which Excel dynamic array functions automatically return spill ranges when returning multiple values?\",\"options\":[\"UNIQUE\",\"INDEX\",\"SEQUENCE\",\"VLOOKUP\"],\"correctOptions\":[\"UNIQUE\",\"SEQUENCE\"]},{\"question\":\"Which changes will typically improve performance of large Excel workbooks?\",\"options\":[\"Replace volatile functions (e.g., INDIRECT) with structured references\",\"Switch to manual calculation mode while making many edits\",\"Convert frequently updated formulas to hard-coded values permanently\",\"Enable iterative calculations for complex formula chains\"],\"correctOptions\":[\"Replace volatile functions (e.g., INDIRECT) with structured references\",\"Switch to manual calculation mode while making many edits\"]},{\"question\":\"For showing monthly sales trends over time, which chart types are most appropriate?\",\"options\":[\"Line chart\",\"Stacked area chart\",\"Pie chart\",\"Scatter plot\"],\"correctOptions\":[\"Line chart\",\"Stacked area chart\"]},{\"question\":\"In Excel VBA, which constructs are used to define a procedure and to change default error handling behavior?\",\"options\":[\"Sub ... End Sub\",\"Function ... End Function\",\"On Error Resume Next\",\"Option Explicit\"],\"correctOptions\":[\"Sub ... End Sub\",\"On Error Resume Next\"]},{\"question\":\"Which software engineering practices help improve code quality and maintainability in a team environment?\",\"options\":[\"Code reviews\",\"Writing unit tests\",\"One developer owning the entire codebase\",\"Avoiding automated testing to speed delivery\"],\"correctOptions\":[\"Code reviews\",\"Writing unit tests\"]}]', 0.00, 0.00, '2026-03-16 05:48:59', '2026-03-16 05:49:25');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step3_results`
--

CREATE TABLE `resume_step3_results` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `contribution` decimal(5,2) NOT NULL DEFAULT 0.00,
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`feedback`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step3_results`
--

INSERT INTO `resume_step3_results` (`id`, `resume_id`, `answers`, `score`, `contribution`, `feedback`, `created_at`, `updated_at`) VALUES
(4, 4, '[{\"questionIndex\":0,\"selectedOptions\":[\"<section>\",\"<nav>\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Use media queries to adjust styles at breakpoints\",\"Use CSS Flexbox for flexible alignment\",\"Use relative units (%, em, rem) instead of absolute pixels\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Lift shared state up to a common ancestor component\",\"Use React hooks like useState and useReducer for local state\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Wrap asynchronous code in try/catch and handle errors\",\"Call next(err) to forward errors to Express error handlers\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Define FOREIGN KEY constraints between related tables\",\"Use transactions for multi-step operations that must be atomic\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Use GET to retrieve resources without side effects\",\"Design the API to be stateless so each request contains all necessary context\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Commit small, logical changes frequently\",\"Use feature branches and pull requests for reviews\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Maintain consistent spacing, typography, and sufficient color contrast\",\"Provide clear, descriptive call-to-action labels\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Minify and bundle CSS/JavaScript assets\",\"Implement lazy-loading for offscreen images and components\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Write unit tests for key components and modules\",\"Use a CI/CD pipeline to run tests and automate deployments\"]}]', 9.00, 18.00, '[\"Q1: Correct\",\"Q2: Incorrect. Correct: Use media queries to adjust styles at breakpoints, Use relative units (%, em, rem) instead of absolute pixels\",\"Q3: Correct\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '2026-03-08 16:19:49', '2026-03-08 16:19:49'),
(5, 6, '[{\"questionIndex\":0,\"selectedOptions\":[\"Queue\"]},{\"questionIndex\":1,\"selectedOptions\":[\"O(log n)\"]},{\"questionIndex\":2,\"selectedOptions\":[\"VLOOKUP\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Track Changes\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Use high-contrast color schemes\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Brand Kit\",\"High-resolution export\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Quick Sort (Lomuto/Hoare)\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Provide regular constructive feedback\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Iterative delivery with regular feedback\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Remove hidden metadata and personal information before sharing\"]}]', 1.00, 2.00, '[\"Q1: Incorrect. Correct: Stack\",\"Q2: Correct\",\"Q3: Incorrect. Correct: Power Query\",\"Q4: Incorrect. Correct: Track Changes, Comments\",\"Q5: Incorrect. Correct: Add alternative text to images, Use high-contrast color schemes\",\"Q6: Incorrect. Correct: Brand Kit\",\"Q7: Incorrect. Correct: Merge Sort, Bubble Sort\",\"Q8: Incorrect. Correct: Set clear goals and expectations, Provide regular constructive feedback\",\"Q9: Incorrect. Correct: Iterative delivery with regular feedback, Continuous integration and frequent builds\",\"Q10: Incorrect. Correct: Apply password protection or encryption, Remove hidden metadata and personal information before sharing\"]', '2026-03-09 03:42:06', '2026-03-09 03:42:06'),
(6, 7, '[{\"questionIndex\":0,\"selectedOptions\":[\"Regulation of passenger cruise itineraries and onboard hospitality\",\"Accounting standards for international banking transactions\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Bill of Lading\",\"Certificate of origin\"]},{\"questionIndex\":2,\"selectedOptions\":[\"EXW (Ex Works)\",\"DDP (Delivered Duty Paid)\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Data Validation\",\"Conditional Formatting\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Include every detail on slides; speakers should read all slide text verbatim\",\"Limit text to key points and use visuals (charts or maps) to illustrate data\"]},{\"questionIndex\":5,\"selectedOptions\":[\"To regulate crew wage standards across countries\",\"To enhance security of ships and port facilities against threats\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Import tariffs and government duties\",\"Freight rate\"]},{\"questionIndex\":7,\"selectedOptions\":[\"IMO ship identification number\",\"ISO country code\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Selecting routes only based on the most popular carrier\",\"Shortest geographic distance regardless of port congestion\"]},{\"questionIndex\":9,\"selectedOptions\":[\"INDEX and MATCH combination to look up values by shipment ID\",\"GOAL SEEK to find the best matching shipment ID\"]}]', 0.00, 0.00, '[\"Q1: Incorrect. Correct: Management of the movement of goods and information by sea, including ports, shipping and supply chains\",\"Q2: Incorrect. Correct: Bill of Lading\",\"Q3: Incorrect. Correct: DDP (Delivered Duty Paid)\",\"Q4: Incorrect. Correct: PivotTable\",\"Q5: Incorrect. Correct: Use a consistent template and style throughout the deck, Limit text to key points and use visuals (charts or maps) to illustrate data\",\"Q6: Incorrect. Correct: To enhance security of ships and port facilities against threats\",\"Q7: Incorrect. Correct: Freight rate, Bunker Adjustment Factor (BAF)\",\"Q8: Incorrect. Correct: HS (Harmonized System) code\",\"Q9: Incorrect. Correct: Average transit time combined with fuel cost and port handling efficiency\",\"Q10: Incorrect. Correct: VLOOKUP to pull matching fields from the second table, INDEX and MATCH combination to look up values by shipment ID\"]', '2026-03-09 04:03:55', '2026-03-09 04:03:55'),
(7, 8, '[{\"questionIndex\":0,\"selectedOptions\":[\"Tuples automatically optimize memory for large datasets while lists do not\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Use None as the default and assign the mutable object inside the function body\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Standalone scripts are embedded inside a Google Doc and cannot be executed independently\",\"Bound scripts can be executed outside the container document without any additional permissions\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Be explicit about the required output format, constraints, and evaluation criteria\",\"Provide few-shot examples showing the desired input-to-output mapping\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Use mean squared error (MSE) because it measures overall error\"]},{\"questionIndex\":5,\"selectedOptions\":[\"A documented data inventory and data consent/privacy considerations\",\"Defined monitoring, evaluation and rollback procedures for models in production\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Use multiprocessing (separate processes) for CPU-bound tasks to work around the GIL\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Installable triggers can run with the installer\'s authorization and access services requiring permissions\",\"Simple triggers run without explicit user authorization and cannot call services that require authorization (e.g., GmailApp)\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Provide grounding context and cite source material the model can reference\",\"Ask the model to provide citations or to state uncertainty when not confident\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Store API keys and secrets in environment variables or a secret manager rather than in source code\"]}]', 4.00, 8.00, '[\"Q1: Incorrect. Correct: Tuples are immutable and typically used for fixed collections; lists are mutable and used for collections that change\",\"Q2: Incorrect. Correct: Use None as the default and assign the mutable object inside the function body, Avoid using mutable objects (e.g., lists, dicts) as default argument values\",\"Q3: Incorrect. Correct: Bound scripts are attached to a specific Google Doc/Sheet and can use functions like SpreadsheetApp.getActive(), Standalone scripts are independent files stored in Google Drive and can be reused across projects\",\"Q4: Correct\",\"Q5: Incorrect. Correct: Use precision and recall to capture performance on the positive class, Use F1 score to balance precision and recall when both matter\",\"Q6: Correct\",\"Q7: Incorrect. Correct: Prefer async for high-concurrency I/O-bound tasks where many connections or requests are served, Use multiprocessing (separate processes) for CPU-bound tasks to work around the GIL\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Incorrect. Correct: Store API keys and secrets in environment variables or a secret manager rather than in source code, Implement CI/CD pipelines to automate testing, linting, and deployment\"]', '2026-03-09 04:28:52', '2026-03-09 04:28:52'),
(8, 12, '[{\"questionIndex\":0,\"selectedOptions\":[\"Use union and intersection types to model possible values\",\"Prefer interfaces or type aliases to describe object shapes\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Use the synchronized keyword for critical sections\",\"Use ReentrantLock from java.util.concurrent.locks\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Use relative/density-independent units and constraint-based layouts\",\"Design flexible grid or constraint systems that adapt to screen size\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Lift state up to the nearest common ancestor for shared local state\",\"Use a global state library (Redux, MobX, Zustand) for widely shared state\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Lazy-load or code-split features to reduce initial bundle size\",\"Use caching for images and API responses where appropriate\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Use appropriate HTTP methods (GET, POST, PUT, DELETE) and make GET requests idempotent\",\"Support pagination, filtering and sorting for list endpoints\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Write tests that assert the public behavior rather than private implementation details\",\"Mock external dependencies to isolate the unit under test\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Provide meaningful labels and alt text for interactive elements and images\",\"Ensure sufficient color contrast and scalable font sizes\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Validate and sanitize user input on both client and server sides\",\"Use HTTPS/TLS for all network communication\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Use continuous integration with automated tests\",\"Perform regular code reviews and pair programming\"]}]', 10.00, 20.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Correct\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '2026-03-14 16:59:00', '2026-03-14 16:59:00'),
(9, 13, '[{\"questionIndex\":0,\"selectedOptions\":[\"PivotTable\",\"SUMIFS function\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Macros (VBA)\",\"Power Query\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Store raw data in one sheet/table and create separate report sheets\",\"Use consistent date and time formats across the dataset\"]},{\"questionIndex\":3,\"selectedOptions\":[\"git push\",\"git commit\"]},{\"questionIndex\":4,\"selectedOptions\":[\"SELECT\",\"GROUP BY\"]},{\"questionIndex\":5,\"selectedOptions\":[\"UNIQUE\",\"SEQUENCE\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Replace volatile functions (e.g., INDIRECT) with structured references\",\"Switch to manual calculation mode while making many edits\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Line chart\",\"Stacked area chart\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Sub ... End Sub\",\"On Error Resume Next\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Code reviews\",\"Writing unit tests\"]}]', 10.00, 20.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Correct\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '2026-03-16 05:50:54', '2026-03-16 05:50:54');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step4`
--

CREATE TABLE `resume_step4` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `questions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`questions`)),
  `answers` longtext NOT NULL CHECK (json_valid(`answers`)),
  `score` decimal(4,2) NOT NULL DEFAULT 0.00,
  `contribution` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step4`
--

INSERT INTO `resume_step4` (`id`, `resume_id`, `questions`, `answers`, `score`, `contribution`, `created_at`, `updated_at`) VALUES
(58, 4, '[{\"question\":\"Which tasks are typically part of a Full Stack Developer\'s responsibilities when building web applications?\",\"options\":[\"Implement frontend UI using HTML/CSS/JS\",\"Design and manage backend APIs and databases\",\"Only handle project management and client communication\",\"Perform network administration and hardware installation\"],\"correctOptions\":[\"Implement frontend UI using HTML/CSS/JS\",\"Design and manage backend APIs and databases\"]},{\"question\":\"What practices help ensure responsive user interfaces?\",\"options\":[\"Use CSS media queries and flexible layouts\",\"Hard-code pixel values for all elements\",\"Optimize images and assets for different screen sizes\",\"Disable JavaScript to prevent layout shifts\"],\"correctOptions\":[\"Use CSS media queries and flexible layouts\",\"Optimize images and assets for different screen sizes\"]},{\"question\":\"When integrating third-party APIs, which are best practices?\",\"options\":[\"Validate and sanitize all incoming data\",\"Store API keys in source code repository\",\"Implement retries and error handling\",\"Expose API keys in client-side code for easier debugging\"],\"correctOptions\":[\"Validate and sanitize all incoming data\",\"Implement retries and error handling\"]},{\"question\":\"Which database tasks are commonly performed by a Full Stack Developer?\",\"options\":[\"Design database schema and write queries\",\"Set up RAID configurations on physical servers\",\"Optimize queries and create indexes\",\"Only use NoSQL databases and avoid SQL\"],\"correctOptions\":[\"Design database schema and write queries\",\"Optimize queries and create indexes\"]},{\"question\":\"In collaboration and team development workflow, which are appropriate actions?\",\"options\":[\"Use version control systems like Git for code collaboration\",\"Avoid code reviews to speed up development\",\"Write unit tests and participate in testing\",\"Ignore merge conflicts and overwrite others\' changes\"],\"correctOptions\":[\"Use version control systems like Git for code collaboration\",\"Write unit tests and participate in testing\"]},{\"question\":\"During deployment of web applications, what\'s important to ensure reliable releases?\",\"options\":[\"Automate deployment using CI/CD pipelines\",\"Manually upload files via FTP for every release\",\"Monitor application performance and logs after deployment\",\"Never roll back changes even when errors occur\"],\"correctOptions\":[\"Automate deployment using CI/CD pipelines\",\"Monitor application performance and logs after deployment\"]},{\"question\":\"Which techniques improve backend performance?\",\"options\":[\"Implement caching for frequent queries\",\"Process all tasks synchronously regardless of load\",\"Use connection pooling for database access\",\"Increase server memory by adding swap space as primary method\"],\"correctOptions\":[\"Implement caching for frequent queries\",\"Use connection pooling for database access\"]},{\"question\":\"Security best practices when building web applications include:\",\"options\":[\"Use parameterized queries to prevent SQL injection\",\"Trust user input without validation for speed\",\"Implement authentication and authorization\",\"Serve sensitive data over HTTP to reduce overhead\"],\"correctOptions\":[\"Use parameterized queries to prevent SQL injection\",\"Implement authentication and authorization\"]},{\"question\":\"When testing web applications, which activities are typical?\",\"options\":[\"Write unit and integration tests to validate functionality\",\"Skip testing in development and only test in production\",\"Perform cross-browser and responsive layout testing\",\"Rely solely on manual testing and avoid automated tests\"],\"correctOptions\":[\"Write unit and integration tests to validate functionality\",\"Perform cross-browser and responsive layout testing\"]},{\"question\":\"Which statements describe API integration challenges a Full Stack Developer may face?\",\"options\":[\"Handling rate limits and pagination\",\"APIs always return consistent response formats\",\"Managing API versioning and backward compatibility\",\"Client-side code should contain all business logic for APIs\"],\"correctOptions\":[\"Handling rate limits and pagination\",\"Managing API versioning and backward compatibility\"]}]', '[]', 0.00, 0.00, '2026-03-08 16:21:08', '2026-03-08 16:26:49'),
(62, 6, '[{\"question\":\"As General Manager at The 12 Waves, which activities are typically part of your role?\",\"options\":[\"Setting strategic direction for the organization\",\"Writing production-level code daily\",\"Overseeing budgets, P&L, and operations\",\"Performing detailed unit testing on every release\"],\"correctOptions\":[\"Setting strategic direction for the organization\",\"Overseeing budgets, P&L, and operations\"]},{\"question\":\"Which approaches are most effective for assessing product-market fit?\",\"options\":[\"Conducting structured user interviews and qualitative research\",\"Relying solely on internal intuition and leadership opinion\",\"Running A/B tests and measuring user engagement metrics\",\"Cutting server costs to improve margins\"],\"correctOptions\":[\"Conducting structured user interviews and qualitative research\",\"Running A/B tests and measuring user engagement metrics\"]},{\"question\":\"When hiring an engineering manager for a growing product team, which factors should be prioritized?\",\"options\":[\"Deep individual contributor coding ability above all else\",\"Leadership and people management skills\",\"Cultural fit and clear communication\",\"Holding an advanced academic degree in computer science\"],\"correctOptions\":[\"Leadership and people management skills\",\"Cultural fit and clear communication\"]},{\"question\":\"To increase deployment frequency and reduce time-to-market, which actions are most effective?\",\"options\":[\"Implement continuous integration and continuous delivery (CI/CD) pipelines\",\"Hire more front-end developers immediately\",\"Adopt feature flags and progressive rollout strategies\",\"Reduce automated testing to speed up releases\"],\"correctOptions\":[\"Implement continuous integration and continuous delivery (CI/CD) pipelines\",\"Adopt feature flags and progressive rollout strategies\"]},{\"question\":\"Which KPIs are most relevant to track for SaaS growth under your management?\",\"options\":[\"Monthly Recurring Revenue (MRR)\",\"Total lines of code written per month\",\"Customer churn rate\",\"Number of internal meetings per week\"],\"correctOptions\":[\"Monthly Recurring Revenue (MRR)\",\"Customer churn rate\"]},{\"question\":\"When planning to scale infrastructure cost-effectively, which strategies should you consider?\",\"options\":[\"Migrate to autoscaling cloud infrastructure and managed services\",\"Keep everything on a single large VM to simplify management\",\"Optimize resource usage and implement monitoring and cost alerts\",\"Rewrite the entire codebase in a new programming language immediately\"],\"correctOptions\":[\"Migrate to autoscaling cloud infrastructure and managed services\",\"Optimize resource usage and implement monitoring and cost alerts\"]},{\"question\":\"If a security breach is detected in production, what are the immediate actions a General Manager should ensure?\",\"options\":[\"Contain the breach and isolate affected systems\",\"Delete logs to avoid regulatory scrutiny\",\"Notify stakeholders, customers (as required), and legal/compliance teams\",\"Assign blame publicly to the responsible engineer\"],\"correctOptions\":[\"Contain the breach and isolate affected systems\",\"Notify stakeholders, customers (as required), and legal/compliance teams\"]},{\"question\":\"Which product roadmapping/prioritization frameworks are appropriate for a GM to use when deciding what to build next?\",\"options\":[\"RICE (Reach, Impact, Confidence, Effort) scoring\",\"MoSCoW (Must, Should, Could, Won\'t)\",\"Random selection based on popular vote\",\"Cost-plus pricing\"],\"correctOptions\":[\"RICE (Reach, Impact, Confidence, Effort) scoring\",\"MoSCoW (Must, Should, Could, Won\'t)\"]},{\"question\":\"To improve cross-functional collaboration between engineering, product, and design, which practices are most effective?\",\"options\":[\"Hold short regular cross-functional standups or syncs\",\"Intentionally isolate teams to reduce communication overhead\",\"Maintain a shared documentation repository and knowledge base\",\"Restrict access to the roadmap to leadership only\"],\"correctOptions\":[\"Hold short regular cross-functional standups or syncs\",\"Maintain a shared documentation repository and knowledge base\"]},{\"question\":\"Which metrics most ethically reflect engineering team productivity and quality?\",\"options\":[\"Lines of code per developer\",\"Cycle time and lead time for work items\",\"Number of open pull requests regardless of context\",\"Customer-reported issues rate and production incident frequency\"],\"correctOptions\":[\"Cycle time and lead time for work items\",\"Customer-reported issues rate and production incident frequency\"]}]', '[]', 0.00, 0.00, '2026-03-09 03:43:32', '2026-03-09 03:43:53'),
(64, 7, '[{\"question\":\"Which of the following are primary responsibilities of a maritime logistics manager?\",\"options\":[\"Coordinate loading and unloading at ports\",\"Negotiate ship engine maintenance schedules\",\"Oversee shipping documentation and customs clearance\",\"Conduct onboard crew medical procedures\"],\"correctOptions\":[\"Coordinate loading and unloading at ports\",\"Oversee shipping documentation and customs clearance\"]},{\"question\":\"Which document serves as a receipt of goods and evidence of the contract of carriage?\",\"options\":[\"Bill of Lading\",\"Commercial Invoice\",\"Packing List\",\"Certificate of Origin\"],\"correctOptions\":[\"Bill of Lading\"]},{\"question\":\"Which Incoterm places the greatest responsibility and cost on the seller?\",\"options\":[\"FOB (Free On Board)\",\"EXW (Ex Works)\",\"CIF (Cost, Insurance & Freight)\",\"DDP (Delivered Duty Paid)\"],\"correctOptions\":[\"DDP (Delivered Duty Paid)\"]},{\"question\":\"Which international conventions regulate ship safety and pollution prevention?\",\"options\":[\"SOLAS (Safety of Life at Sea)\",\"MARPOL (Marine Pollution)\",\"CITES (Convention on Trade in Endangered Species)\",\"GDPR (General Data Protection Regulation)\"],\"correctOptions\":[\"SOLAS (Safety of Life at Sea)\",\"MARPOL (Marine Pollution)\"]},{\"question\":\"Which unit is commonly used to express container capacity in liner shipping?\",\"options\":[\"TEU (Twenty-foot Equivalent Unit)\",\"CBM (Cubic Meters)\",\"DWT (Deadweight Tons)\",\"GRT (Gross Register Tonnage)\"],\"correctOptions\":[\"TEU (Twenty-foot Equivalent Unit)\"]},{\"question\":\"Which activities are part of container stowage planning on a vessel?\",\"options\":[\"Weight distribution and trim planning\",\"Lashing and securing arrangements\",\"Issuance of the commercial invoice\",\"Container manufacturing\"],\"correctOptions\":[\"Weight distribution and trim planning\",\"Lashing and securing arrangements\"]},{\"question\":\"Which factors commonly influence maritime route planning?\",\"options\":[\"Weather conditions and sea state\",\"Port hotel availability\",\"Piracy risk in a region\",\"Ship\'s onboard restaurant menu\"],\"correctOptions\":[\"Weather conditions and sea state\",\"Piracy risk in a region\"]},{\"question\":\"Which of the following are typical services provided by a freight forwarder?\",\"options\":[\"Cargo consolidation and grouping\",\"Vessel hull repair\",\"Customs clearance assistance\",\"Container manufacturing\"],\"correctOptions\":[\"Cargo consolidation and grouping\",\"Customs clearance assistance\"]},{\"question\":\"Which of the following are common categories of maritime cargo?\",\"options\":[\"Bulk cargo (e.g., grain, coal)\",\"Breakbulk cargo (individual pieces)\",\"Containerized cargo\",\"Pharmaceutical research equipment\"],\"correctOptions\":[\"Bulk cargo (e.g., grain, coal)\",\"Containerized cargo\"]},{\"question\":\"Which regulation specifically addresses prevention of oil pollution from ships?\",\"options\":[\"MARPOL Annex I\",\"SOLAS Chapter V\",\"ISPS Code\",\"STCW Convention\"],\"correctOptions\":[\"MARPOL Annex I\"]}]', '[]', 0.00, 0.00, '2026-03-09 04:04:26', '2026-03-09 04:04:48'),
(66, 8, '[{\"question\":\"Which steps are essential when starting an AI project for auction price prediction?\",\"options\":[\"Collect and clean historical auction data\",\"Select and validate ML models using cross-validation\",\"Design a flashy UI before any model work\",\"Deploy the model to production without testing\"],\"correctOptions\":[\"Collect and clean historical auction data\",\"Select and validate ML models using cross-validation\"]},{\"question\":\"What should a company AI Standard Operating Procedure (SOP) include?\",\"options\":[\"Data governance and access controls\",\"A model retraining and monitoring schedule\",\"Hire an external consultant for every decision\",\"Publish private API keys in internal docs\"],\"correctOptions\":[\"Data governance and access controls\",\"A model retraining and monitoring schedule\"]},{\"question\":\"Which metrics are most appropriate for evaluating a regression model that predicts final auction prices?\",\"options\":[\"Root Mean Square Error (RMSE)\",\"R-squared (coefficient of determination)\",\"Classification accuracy\",\"F1 score\"],\"correctOptions\":[\"Root Mean Square Error (RMSE)\",\"R-squared (coefficient of determination)\"]},{\"question\":\"Which measures help protect customer privacy when using auction data to train AI models?\",\"options\":[\"Anonymize or pseudonymize personally identifiable information (PII)\",\"Encrypt sensitive data at rest and in transit\",\"Publish raw customer records internally for transparency\",\"Share database credentials with all team members\"],\"correctOptions\":[\"Anonymize or pseudonymize personally identifiable information (PII)\",\"Encrypt sensitive data at rest and in transit\"]},{\"question\":\"What are best practices for deploying and monitoring an AI model in production?\",\"options\":[\"Implement prediction logging and data drift detection\",\"Run controlled A/B tests or canary releases\",\"Never roll back even if the model performs poorly\",\"Disable monitoring to improve performance\"],\"correctOptions\":[\"Implement prediction logging and data drift detection\",\"Run controlled A/B tests or canary releases\"]},{\"question\":\"Which actions help reduce model bias in auction outcome predictions?\",\"options\":[\"Audit model outputs for disparate impact and fairness issues\",\"Include diverse and representative training data\",\"Ignore fairness tests because they slow development\",\"Only increase model complexity to solve bias\"],\"correctOptions\":[\"Audit model outputs for disparate impact and fairness issues\",\"Include diverse and representative training data\"]},{\"question\":\"What are effective versioning practices for machine learning projects?\",\"options\":[\"Track code, model artifacts, and dataset versions in source control or artifact stores\",\"Only track code; never version data or models\",\"Use semantic versioning or model registry entries for model releases\",\"Manage versions by manually copying files between folders\"],\"correctOptions\":[\"Track code, model artifacts, and dataset versions in source control or artifact stores\",\"Use semantic versioning or model registry entries for model releases\"]},{\"question\":\"When creating SOPs for AI usage within the company, which items should be explicitly defined?\",\"options\":[\"Approval process and roles for model changes\",\"A step-by-step deployment and rollback checklist\",\"Leave responsibilities vague to allow flexibility\",\"Never include a rollback plan to avoid admitting failure\"],\"correctOptions\":[\"Approval process and roles for model changes\",\"A step-by-step deployment and rollback checklist\"]},{\"question\":\"Which security practices should be applied to AI model endpoints serving auction predictions?\",\"options\":[\"Require authentication and rate limiting on endpoints\",\"Use input validation and sanitize user input to prevent injection\",\"Place plaintext tokens in query strings for convenience\",\"Disable validation to speed up responses\"],\"correctOptions\":[\"Require authentication and rate limiting on endpoints\",\"Use input validation and sanitize user input to prevent injection\"]},{\"question\":\"Which practices improve reproducibility of AI experiments developed during the internship?\",\"options\":[\"Use containerization (e.g., Docker) to capture the runtime environment\",\"Set and document random seeds for training and evaluation\",\"Rely only on informal code comments for reproducibility\",\"Keep experiments in ad-hoc notebooks without tracking runs\"],\"correctOptions\":[\"Use containerization (e.g., Docker) to capture the runtime environment\",\"Set and document random seeds for training and evaluation\"]}]', '[]', 0.00, 0.00, '2026-03-09 04:29:33', '2026-03-09 04:29:50'),
(68, 12, '[{\"question\":\"Which responsibilities best describe the UI/UX Designer role you performed at Visva Digitech?\",\"options\":[\"Create visual designs and interactive prototypes\",\"Write backend API endpoints in Node.js\",\"Manage and build mobile applications according to client requirements\",\"Perform network configuration for servers\"],\"correctOptions\":[\"Create visual designs and interactive prototypes\",\"Manage and build mobile applications according to client requirements\"]},{\"question\":\"What are appropriate first steps when starting a new client mobile app project?\",\"options\":[\"Collect and analyze client requirements\",\"Immediately start coding the UI\",\"Create a high-fidelity prototype without user research\",\"Set up the project repository and tooling\"],\"correctOptions\":[\"Collect and analyze client requirements\",\"Set up the project repository and tooling\"]},{\"question\":\"Which tool is commonly used by UI/UX designers to create mobile app prototypes?\",\"options\":[\"Figma\",\"Postman\",\"Docker\",\"MySQL\"],\"correctOptions\":[\"Figma\"]},{\"question\":\"Which activities are part of conducting usability testing for a mobile application?\",\"options\":[\"Observe users completing tasks\",\"Measure task completion rates and time on task\",\"Rewrite the business requirements document\",\"Optimize SQL queries for faster reports\"],\"correctOptions\":[\"Observe users completing tasks\",\"Measure task completion rates and time on task\"]},{\"question\":\"Which practices help ensure alignment between client requirements and the delivered mobile app UX?\",\"options\":[\"Conduct regular client feedback sessions\",\"Ignore client feedback to avoid scope creep\",\"Maintain a living style guide or design system\",\"Only use default OS controls without customization\"],\"correctOptions\":[\"Conduct regular client feedback sessions\",\"Maintain a living style guide or design system\"]},{\"question\":\"Which metrics are useful for evaluating mobile user experience?\",\"options\":[\"Task success rate\",\"Bounce rate on unrelated web pages\",\"Time on task\",\"CPU temperature\"],\"correctOptions\":[\"Task success rate\",\"Time on task\"]},{\"question\":\"Which accessibility considerations should be addressed in mobile UI/UX design?\",\"options\":[\"Ensure sufficient color contrast\",\"Rely solely on color to convey information\",\"Provide scalable text and touch target sizes\",\"Remove all labels to save space\"],\"correctOptions\":[\"Ensure sufficient color contrast\",\"Provide scalable text and touch target sizes\"]},{\"question\":\"Which version control practices are relevant when managing mobile app development?\",\"options\":[\"Use Git branches for features and bug fixes\",\"Commit directly to main without reviews\",\"Write clear commit messages\",\"Store large binary design files only on local drives\"],\"correctOptions\":[\"Use Git branches for features and bug fixes\",\"Write clear commit messages\"]},{\"question\":\"What deliverables would a UI/UX Designer typically provide to the development team?\",\"options\":[\"Interactive prototypes and design specs\",\"Final compiled APK without source\",\"Style guides and component libraries\",\"Sales invoices\"],\"correctOptions\":[\"Interactive prototypes and design specs\",\"Style guides and component libraries\"]},{\"question\":\"When balancing client requirements with user needs, which approaches are appropriate?\",\"options\":[\"Prioritize user research insights and negotiate requirements\",\"Always implement every client request without question\",\"Use analytics and A/B testing to inform decisions\",\"Disable analytics to avoid data-driven changes\"],\"correctOptions\":[\"Prioritize user research insights and negotiate requirements\",\"Use analytics and A/B testing to inform decisions\"]}]', '[]', 0.00, 0.00, '2026-03-14 16:59:50', '2026-03-14 17:00:08'),
(70, 13, '[{\"question\":\"Which practices help ensure accuracy when performing manual data entry?\",\"options\":[\"Double-entry verification (entering data twice and comparing)\",\"Relying on memory to speed up entry\",\"Using input validation rules and mandatory fields\",\"Entering data only at end of the day to batch work\"],\"correctOptions\":[\"Double-entry verification (entering data twice and comparing)\",\"Using input validation rules and mandatory fields\"]},{\"question\":\"Which spreadsheet features are most useful for cleaning and standardizing datasets?\",\"options\":[\"VLOOKUP or equivalent functions to merge/lookup values\",\"Data validation rules to restrict allowed values\",\"Conditional formatting purely for aesthetic color themes\",\"Freehand typing to overwrite formulas\"],\"correctOptions\":[\"VLOOKUP or equivalent functions to merge/lookup values\",\"Data validation rules to restrict allowed values\"]},{\"question\":\"When entering customer records into a CRM, what should be prioritized?\",\"options\":[\"Collecting every possible personal detail regardless of relevance\",\"Ensuring data accuracy (correct fields, up-to-date info)\",\"Using consistent formatting and field conventions\",\"Assigning random IDs to speed up entry\"],\"correctOptions\":[\"Ensuring data accuracy (correct fields, up-to-date info)\",\"Using consistent formatting and field conventions\"]},{\"question\":\"Which SQL statement correctly retrieves all columns from a table named customers?\",\"options\":[\"SELECT * FROM customers;\",\"GET ALL FROM customers;\",\"FETCH customers ALL;\",\"READ customers;\"],\"correctOptions\":[\"SELECT * FROM customers;\"]},{\"question\":\"Which metrics are most useful for evaluating an online marketing campaign\'s effectiveness?\",\"options\":[\"Conversion rate (percentage of visitors who take a desired action)\",\"Click-through rate (CTR)\",\"Gross margin of unrelated product lines\",\"Browser window size on the user\'s device\"],\"correctOptions\":[\"Conversion rate (percentage of visitors who take a desired action)\",\"Click-through rate (CTR)\"]},{\"question\":\"Which actions align with good data protection practices for customer information?\",\"options\":[\"Encrypt personal data at rest and in transit\",\"Share account passwords freely among team members\",\"Anonymize or pseudonymize data when full identifiers are not needed\",\"Store sensitive files in an unrestricted public folder\"],\"correctOptions\":[\"Encrypt personal data at rest and in transit\",\"Anonymize or pseudonymize data when full identifiers are not needed\"]},{\"question\":\"Which of the following are typical early stages in a sales pipeline?\",\"options\":[\"Lead (initial contact or inquiry)\",\"Prospect (qualified potential customer)\",\"Negotiation closure with final contract only\",\"Immediate rejection without qualification\"],\"correctOptions\":[\"Lead (initial contact or inquiry)\",\"Prospect (qualified potential customer)\"]},{\"question\":\"Which automation approaches can reduce repetitive manual data entry?\",\"options\":[\"Creating Excel macros or scripts to automate repetitive tasks\",\"API integration to sync systems automatically\",\"Manually copying and pasting between applications\",\"Intentionally introducing delays to slow work\"],\"correctOptions\":[\"Creating Excel macros or scripts to automate repetitive tasks\",\"API integration to sync systems automatically\"]},{\"question\":\"What are effective ways to present sales and marketing results to non-technical stakeholders?\",\"options\":[\"Use clear visualizations (charts, dashboards) to highlight trends\",\"Present only raw, unfiltered data tables without summary\",\"Provide concise, actionable insights and recommended next steps\",\"Rely heavily on technical jargon to show expertise\"],\"correctOptions\":[\"Use clear visualizations (charts, dashboards) to highlight trends\",\"Provide concise, actionable insights and recommended next steps\"]},{\"question\":\"Which factors commonly cause data entry errors in operational tasks?\",\"options\":[\"Ambiguous field definitions or unclear instructions\",\"Fatigue or loss of concentration from repetitive tasks\",\"Automated validation rules that block incorrect input\",\"Consistent naming conventions enforced by the system\"],\"correctOptions\":[\"Ambiguous field definitions or unclear instructions\",\"Fatigue or loss of concentration from repetitive tasks\"]}]', '[]', 0.00, 0.00, '2026-03-16 05:52:23', '2026-03-16 05:52:43');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step4_results`
--

CREATE TABLE `resume_step4_results` (
  `resume_id` int(11) NOT NULL,
  `score` decimal(4,2) NOT NULL,
  `contribution` decimal(5,2) NOT NULL,
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`feedback`)),
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`answers`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step4_results`
--

INSERT INTO `resume_step4_results` (`resume_id`, `score`, `contribution`, `feedback`, `answers`) VALUES
(4, 8.00, 8.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Correct\",\"Q4: Incorrect. Correct: Designing normalized schemas, Optimizing queries and indexes\",\"Q5: Incorrect. Correct: Unit testing, End-to-end testing\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Implementing both frontend and backend functionalities\",\"Integrating APIs and managing databases\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Using CSS Flexbox and Grid\",\"Using media queries\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Validate and sanitize all external data\",\"Handle HTTP errors and retries\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Designing normalized schemas\",\"Running database backups and migrations\",\"Optimizing queries and indexes\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Unit testing\",\"End-to-end testing\",\"Automated regression testing\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Continuous Integration/Continuous Deployment (CI/CD)\",\"Using containerization (e.g., Docker)\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Code reviews and pair programming\",\"Design discussions and sprint planning\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Input validation and output encoding\",\"Using HTTPS and secure cookies\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Local component state\",\"Global state management libraries (e.g., Redux)\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Minifying and bundling assets\",\"Lazy-loading images and code splitting\"]}]'),
(6, 0.00, 0.00, '[\"Q1: Incorrect. Correct: Setting strategic direction for the organization, Overseeing budgets, P&L, and operations\",\"Q2: Incorrect. Correct: Conducting structured user interviews and qualitative research, Running A/B tests and measuring user engagement metrics\",\"Q3: Incorrect. Correct: Leadership and people management skills, Cultural fit and clear communication\",\"Q4: Incorrect. Correct: Implement continuous integration and continuous delivery (CI/CD) pipelines, Adopt feature flags and progressive rollout strategies\",\"Q5: Incorrect. Correct: Monthly Recurring Revenue (MRR), Customer churn rate\",\"Q6: Incorrect. Correct: Migrate to autoscaling cloud infrastructure and managed services, Optimize resource usage and implement monitoring and cost alerts\",\"Q7: Incorrect. Correct: Contain the breach and isolate affected systems, Notify stakeholders, customers (as required), and legal/compliance teams\",\"Q8: Incorrect. Correct: RICE (Reach, Impact, Confidence, Effort) scoring, MoSCoW (Must, Should, Could, Won\'t)\",\"Q9: Incorrect. Correct: Hold short regular cross-functional standups or syncs, Maintain a shared documentation repository and knowledge base\",\"Q10: Incorrect. Correct: Cycle time and lead time for work items, Customer-reported issues rate and production incident frequency\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Setting strategic direction for the organization\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Running A/B tests and measuring user engagement metrics\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Deep individual contributor coding ability above all else\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Implement continuous integration and continuous delivery (CI/CD) pipelines\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Customer churn rate\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Keep everything on a single large VM to simplify management\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Contain the breach and isolate affected systems\"]},{\"questionIndex\":7,\"selectedOptions\":[\"MoSCoW (Must, Should, Could, Won\'t)\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Maintain a shared documentation repository and knowledge base\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Lines of code per developer\",\"Cycle time and lead time for work items\"]}]'),
(7, 2.00, 2.00, '[\"Q1: Incorrect. Correct: Coordinate loading and unloading at ports, Oversee shipping documentation and customs clearance\",\"Q2: Incorrect. Correct: Bill of Lading\",\"Q3: Incorrect. Correct: DDP (Delivered Duty Paid)\",\"Q4: Incorrect. Correct: SOLAS (Safety of Life at Sea), MARPOL (Marine Pollution)\",\"Q5: Incorrect. Correct: TEU (Twenty-foot Equivalent Unit)\",\"Q6: Incorrect. Correct: Weight distribution and trim planning, Lashing and securing arrangements\",\"Q7: Correct\",\"Q8: Incorrect. Correct: Cargo consolidation and grouping, Customs clearance assistance\",\"Q9: Correct\",\"Q10: Incorrect. Correct: MARPOL Annex I\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Negotiate ship engine maintenance schedules\",\"Oversee shipping documentation and customs clearance\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Bill of Lading\",\"Packing List\"]},{\"questionIndex\":2,\"selectedOptions\":[\"EXW (Ex Works)\",\"DDP (Delivered Duty Paid)\"]},{\"questionIndex\":3,\"selectedOptions\":[\"SOLAS (Safety of Life at Sea)\",\"CITES (Convention on Trade in Endangered Species)\"]},{\"questionIndex\":4,\"selectedOptions\":[\"TEU (Twenty-foot Equivalent Unit)\",\"DWT (Deadweight Tons)\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Lashing and securing arrangements\",\"Issuance of the commercial invoice\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Piracy risk in a region\",\"Weather conditions and sea state\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Vessel hull repair\",\"Container manufacturing\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Containerized cargo\",\"Bulk cargo (e.g., grain, coal)\"]},{\"questionIndex\":9,\"selectedOptions\":[\"SOLAS Chapter V\",\"ISPS Code\"]}]'),
(8, 7.00, 7.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Incorrect. Correct: Root Mean Square Error (RMSE), R-squared (coefficient of determination)\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Incorrect. Correct: Require authentication and rate limiting on endpoints, Use input validation and sanitize user input to prevent injection\",\"Q10: Incorrect. Correct: Use containerization (e.g., Docker) to capture the runtime environment, Set and document random seeds for training and evaluation\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Collect and clean historical auction data\",\"Select and validate ML models using cross-validation\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Data governance and access controls\",\"A model retraining and monitoring schedule\"]},{\"questionIndex\":2,\"selectedOptions\":[\"R-squared (coefficient of determination)\",\"Classification accuracy\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Anonymize or pseudonymize personally identifiable information (PII)\",\"Encrypt sensitive data at rest and in transit\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Implement prediction logging and data drift detection\",\"Run controlled A/B tests or canary releases\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Audit model outputs for disparate impact and fairness issues\",\"Include diverse and representative training data\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Track code, model artifacts, and dataset versions in source control or artifact stores\",\"Use semantic versioning or model registry entries for model releases\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Approval process and roles for model changes\",\"A step-by-step deployment and rollback checklist\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Use input validation and sanitize user input to prevent injection\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Use containerization (e.g., Docker) to capture the runtime environment\"]}]'),
(12, 10.00, 10.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Correct\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Create visual designs and interactive prototypes\",\"Manage and build mobile applications according to client requirements\"]},{\"questionIndex\":1,\"selectedOptions\":[\"Collect and analyze client requirements\",\"Set up the project repository and tooling\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Figma\"]},{\"questionIndex\":3,\"selectedOptions\":[\"Observe users completing tasks\",\"Measure task completion rates and time on task\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Conduct regular client feedback sessions\",\"Maintain a living style guide or design system\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Task success rate\",\"Time on task\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Ensure sufficient color contrast\",\"Provide scalable text and touch target sizes\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Use Git branches for features and bug fixes\",\"Write clear commit messages\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Interactive prototypes and design specs\",\"Style guides and component libraries\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Prioritize user research insights and negotiate requirements\",\"Use analytics and A/B testing to inform decisions\"]}]'),
(13, 10.00, 10.00, '[\"Q1: Correct\",\"Q2: Correct\",\"Q3: Correct\",\"Q4: Correct\",\"Q5: Correct\",\"Q6: Correct\",\"Q7: Correct\",\"Q8: Correct\",\"Q9: Correct\",\"Q10: Correct\"]', '[{\"questionIndex\":0,\"selectedOptions\":[\"Double-entry verification (entering data twice and comparing)\",\"Using input validation rules and mandatory fields\"]},{\"questionIndex\":1,\"selectedOptions\":[\"VLOOKUP or equivalent functions to merge/lookup values\",\"Data validation rules to restrict allowed values\"]},{\"questionIndex\":2,\"selectedOptions\":[\"Ensuring data accuracy (correct fields, up-to-date info)\",\"Using consistent formatting and field conventions\"]},{\"questionIndex\":3,\"selectedOptions\":[\"SELECT * FROM customers;\"]},{\"questionIndex\":4,\"selectedOptions\":[\"Conversion rate (percentage of visitors who take a desired action)\",\"Click-through rate (CTR)\"]},{\"questionIndex\":5,\"selectedOptions\":[\"Encrypt personal data at rest and in transit\",\"Anonymize or pseudonymize data when full identifiers are not needed\"]},{\"questionIndex\":6,\"selectedOptions\":[\"Lead (initial contact or inquiry)\",\"Prospect (qualified potential customer)\"]},{\"questionIndex\":7,\"selectedOptions\":[\"Creating Excel macros or scripts to automate repetitive tasks\",\"API integration to sync systems automatically\"]},{\"questionIndex\":8,\"selectedOptions\":[\"Use clear visualizations (charts, dashboards) to highlight trends\",\"Provide concise, actionable insights and recommended next steps\"]},{\"questionIndex\":9,\"selectedOptions\":[\"Fatigue or loss of concentration from repetitive tasks\",\"Ambiguous field definitions or unclear instructions\"]}]');

-- --------------------------------------------------------

--
-- Table structure for table `resume_step_scores`
--

CREATE TABLE `resume_step_scores` (
  `id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `score` decimal(4,2) NOT NULL,
  `contribution` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resume_step_scores`
--

INSERT INTO `resume_step_scores` (`id`, `resume_id`, `step_number`, `score`, `contribution`, `created_at`) VALUES
(57, 4, 2, 5.00, 10.00, '2026-03-08 16:17:34'),
(59, 4, 3, 9.00, 18.00, '2026-03-08 16:19:49'),
(60, 4, 4, 8.00, 8.00, '2026-03-08 16:22:23'),
(61, 6, 2, 4.00, 8.00, '2026-03-09 03:37:13'),
(63, 6, 3, 1.00, 2.00, '2026-03-09 03:42:06'),
(64, 6, 4, 0.00, 0.00, '2026-03-09 03:45:37'),
(65, 7, 2, 5.00, 10.00, '2026-03-09 04:02:02'),
(67, 7, 3, 0.00, 0.00, '2026-03-09 04:03:55'),
(68, 7, 4, 2.00, 2.00, '2026-03-09 04:05:27'),
(69, 8, 2, 5.00, 10.00, '2026-03-09 04:18:54'),
(71, 8, 3, 4.00, 8.00, '2026-03-09 04:28:52'),
(72, 8, 4, 7.00, 7.00, '2026-03-09 04:32:49'),
(73, 12, 2, 3.00, 6.00, '2026-03-14 16:48:41'),
(77, 12, 3, 10.00, 20.00, '2026-03-14 16:59:00'),
(78, 12, 4, 10.00, 10.00, '2026-03-14 17:03:18'),
(79, 13, 2, 4.00, 8.00, '2026-03-16 05:47:31'),
(81, 13, 3, 10.00, 20.00, '2026-03-16 05:50:54'),
(82, 13, 4, 10.00, 10.00, '2026-03-16 05:53:51');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('unemployed','employed') DEFAULT 'unemployed',
  `ic_number` varchar(20) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `marital_status` enum('single','married') DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `academic_advisor` varchar(100) DEFAULT NULL,
  `emergency_contact` varchar(50) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `generated_resume_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `name`, `email`, `password`, `status`, `ic_number`, `course`, `gender`, `marital_status`, `age`, `contact_number`, `academic_advisor`, `emergency_contact`, `profile_picture`, `generated_resume_id`) VALUES
(8, 'BSSE2506005', 'Pavithira Paramakurubaran', 'bsse2506005@peninsulamalaysia.edu.my', '123456', 'unemployed', '040826101024', 'BSc (Hons) Computer Science (Software Engineering)', 'female', 'single', 22, '01110862608', 'Mr.Chin', '0146673767', '/uploads/1772985422104-797097520.jpg', NULL),
(9, 'BSSE2506008', 'NEOH JIA YI', 'bsse2506008@peninsulamalaysia.edu.my', '12345', 'unemployed', '010811081827', 'BSc (Hons) Computer Science (Software Engineering)', 'female', 'single', 25, '01135728288', 'Mr Eric', '012-9876543', '/uploads/1773026067682-45382734.jpg', NULL),
(10, 'BSSE2506011', 'Varshini A/P Seger', 'bsse2506011@peninsulamalaysia.edu.my', '12345', 'unemployed', '030201076356', 'BSc (Hons) Computer Science (Software Engineering)', 'female', 'single', 20, '0152347893', 'Mr Eric', '0153457895', NULL, NULL),
(11, 'BSCS2509282', 'DHEVESSHWAAR PUNNIA ', 'bscs2509282@peninsulamalaysia.edu.my', '12345', 'unemployed', '040501070573', 'BSc (Hons) Computer Science (Cyber security)', 'male', 'single', 22, '0166786012', 'Ms. Nafisah', '', NULL, NULL),
(13, 'BSSE2509287', 'Thulasi A/P G Vijayaraj', 'bsse2509287@peninsulamalaysia.edu.my', '123456', 'unemployed', '040408100424', 'BSc (Hons) Computer Science (Software Engineering)', 'female', 'single', 22, '01133926108', 'Mr.Eric', '0169573177 Puvhaneswary', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_documents`
--

CREATE TABLE `student_documents` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_documents`
--

INSERT INTO `student_documents` (`id`, `student_id`, `document_name`, `file_path`, `file_type`, `created_at`) VALUES
(3, 9, 'AI_Internship_Resume (43).pdf', '/uploads/documents/1773026135040-193266414.pdf', 'application/pdf', '2026-03-09 03:15:35'),
(4, 13, 'student_import_template (1).csv', '/uploads/documents/1773506201279-717292790.csv', 'text/csv', '2026-03-14 16:36:41');

-- --------------------------------------------------------

--
-- Table structure for table `student_reminders`
--

CREATE TABLE `student_reminders` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `reminder_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_reminders`
--

INSERT INTO `student_reminders` (`id`, `student_id`, `title`, `reminder_date`, `created_at`) VALUES
(4, 8, 'test', '2026-03-24', '2026-03-16 06:47:30');

-- --------------------------------------------------------

--
-- Table structure for table `weekly_reports`
--

CREATE TABLE `weekly_reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `week_end` date NOT NULL,
  `summary` text NOT NULL,
  `achievements` text DEFAULT NULL,
  `challenges` text DEFAULT NULL,
  `next_week_plan` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_date` (`student_id`,`date`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_date` (`student_id`,`report_date`);

--
-- Indexes for table `employers`
--
ALTER TABLE `employers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employer_interviews`
--
ALTER TABLE `employer_interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employer_id` (`employer_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `employer_interview_outcomes`
--
ALTER TABLE `employer_interview_outcomes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `interview_id` (`interview_id`);

--
-- Indexes for table `employer_reminders`
--
ALTER TABLE `employer_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employer_date` (`employer_id`,`reminder_date`);

--
-- Indexes for table `generated_resumes`
--
ALTER TABLE `generated_resumes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employer_id` (`employer_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_job` (`job_id`,`student_id`),
  ADD KEY `fk_app_student` (`student_id`),
  ADD KEY `fk_app_resume` (`resume_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resume_profiles`
--
ALTER TABLE `resume_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resume_step1`
--
ALTER TABLE `resume_step1`
  ADD PRIMARY KEY (`resume_id`);

--
-- Indexes for table `resume_step2`
--
ALTER TABLE `resume_step2`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resume_step2_results`
--
ALTER TABLE `resume_step2_results`
  ADD PRIMARY KEY (`resume_id`);

--
-- Indexes for table `resume_step3`
--
ALTER TABLE `resume_step3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_resume` (`resume_id`);

--
-- Indexes for table `resume_step3_results`
--
ALTER TABLE `resume_step3_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resume_step3_result` (`resume_id`);

--
-- Indexes for table `resume_step4`
--
ALTER TABLE `resume_step4`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_resume_step4_resume_id` (`resume_id`);

--
-- Indexes for table `resume_step4_results`
--
ALTER TABLE `resume_step4_results`
  ADD PRIMARY KEY (`resume_id`);

--
-- Indexes for table `resume_step_scores`
--
ALTER TABLE `resume_step_scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_step` (`resume_id`,`step_number`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `student_reminders`
--
ALTER TABLE `student_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `weekly_reports`
--
ALTER TABLE `weekly_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_week` (`student_id`,`week_start`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employers`
--
ALTER TABLE `employers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employer_interviews`
--
ALTER TABLE `employer_interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `employer_interview_outcomes`
--
ALTER TABLE `employer_interview_outcomes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `employer_reminders`
--
ALTER TABLE `employer_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `generated_resumes`
--
ALTER TABLE `generated_resumes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `resume_profiles`
--
ALTER TABLE `resume_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `resume_step2`
--
ALTER TABLE `resume_step2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `resume_step3`
--
ALTER TABLE `resume_step3`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `resume_step3_results`
--
ALTER TABLE `resume_step3_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `resume_step4`
--
ALTER TABLE `resume_step4`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `resume_step_scores`
--
ALTER TABLE `resume_step_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_reminders`
--
ALTER TABLE `student_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `weekly_reports`
--
ALTER TABLE `weekly_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD CONSTRAINT `fk_daily_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employer_interviews`
--
ALTER TABLE `employer_interviews`
  ADD CONSTRAINT `fk_interview_application` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_interview_employer` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_interview_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_interview_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employer_interview_outcomes`
--
ALTER TABLE `employer_interview_outcomes`
  ADD CONSTRAINT `fk_outcome_interview` FOREIGN KEY (`interview_id`) REFERENCES `employer_interviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employer_reminders`
--
ALTER TABLE `employer_reminders`
  ADD CONSTRAINT `fk_employer_reminders_employer` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_app_resume` FOREIGN KEY (`resume_id`) REFERENCES `resume_profiles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_app_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `resume_step3_results`
--
ALTER TABLE `resume_step3_results`
  ADD CONSTRAINT `fk_resume_step3_result` FOREIGN KEY (`resume_id`) REFERENCES `resume_step3` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD CONSTRAINT `fk_student_documents` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_reminders`
--
ALTER TABLE `student_reminders`
  ADD CONSTRAINT `fk_student_reminders_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `weekly_reports`
--
ALTER TABLE `weekly_reports`
  ADD CONSTRAINT `fk_weekly_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
