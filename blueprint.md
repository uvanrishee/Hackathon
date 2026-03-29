# Synapse Classroom — Complete Application Blueprint
### Full Engineering and Design Specification for Google Antigravity

---

# TABLE OF CONTENTS

1. Project Overview and Goals
2. Design System
3. Application Architecture
4. Authentication System
5. Database Schema
6. Backend API Structure
7. Landing Page
8. Login and Signup Pages
9. Teacher Dashboard
10. Teacher — Classroom Management Page
11. Teacher — Upload Content Page
12. Teacher — AI Quiz Generator Page
13. Teacher — Real Test Marks Entry Page
14. Teacher — Student Analytics Page
15. Student Dashboard
16. Student — Classroom View Page
17. Student — Learning Dashboard
18. Student — AI Notes Refiner Page
19. Student — Quiz Page
20. Student — AI Chatbot Tutor Page
21. Student — Mistake Corner Page
22. Anonymous Forum Page
23. Friends and Leaderboard Page
24. Gamification System
25. AI Integration Details
26. Realtime Features
27. File Storage
28. Security and Access Control
29. Deployment Notes

---

# 1. PROJECT OVERVIEW AND GOALS

## Platform Summary

Synapse Classroom is an adaptive, AI-powered learning management system with two distinct user roles — Teacher and Student — connected through intelligent, gamified, and collaborative features. The platform is web-based, mobile-responsive, and built to be deployed as a full-stack web application with a React frontend and a Flask Python backend.

## Primary Goals

The first goal is to give teachers complete visibility and control over their classroom — not just who is enrolled, but how every student is performing at a topic level, and the ability to deliver adaptively difficulty-scaled content to each student segment automatically.

The second goal is to give students a personal AI-powered study environment where their own rough notes become polished study material, where revision is structured and spaced intelligently, and where asking for help is socially safe through anonymous forums.

The third goal is to make the entire learning experience intrinsically motivating through gamification — XP points, streaks, badges, leaderboards, and friend battles — so that students return to the platform daily out of engagement rather than obligation.

## Core Design Principles

Every feature should reduce friction, not add it. The teacher should be able to generate a full adaptive quiz in under two minutes. The student should be able to convert rough notes into flashcards in under thirty seconds. The forum should require zero courage to use because it is fully anonymous.

The platform must feel cohesive. Every page should feel like part of the same product. Consistent navigation, consistent card styles, consistent color use, and consistent iconography are mandatory.

The AI must feel useful, not gimmicky. Every AI feature must produce output that a student would actually use for revision. Generic or vague AI responses are not acceptable — all AI features are deeply grounded in the specific classroom content.

---

# 2. DESIGN SYSTEM

## Color Palette

The application uses a dark-mode-first color scheme built around a deep navy base with indigo and cyan as the primary brand colors.

The primary background color is a very deep navy blue, used for the main application background across all authenticated pages. The secondary background is a slightly lighter navy, used for sidebars, cards, and elevated panels. A tertiary background level exists for hover states, modals, and deeply nested card content.

The primary brand color is electric indigo, used for primary action buttons, active navigation items, selected states, and links. A softer version of this indigo is used for secondary actions and less prominent UI elements.

The accent color is bright cyan, used for progress bars, XP indicators, active highlights, glowing borders, and any element that needs to draw the user's eye. A very low-opacity version of this cyan is used as a glow effect on card hover states.

Semantic colors include a green for success states and correct answers, an amber for average performance indicators and cautionary states, and a red for incorrect answers, failure states, and weak-category performance badges. Gold is reserved exclusively for topper badges and first-place leaderboard positions.

Text uses near-white for primary headings and body text, a muted blue-grey for secondary labels and subtext, and a dark grey for disabled states and placeholder text.

## Typography

Display headings and all page titles use Clash Display, a geometric display typeface that gives the platform its distinctive visual identity. All body text, labels, form fields, and UI copy use DM Sans, a clean humanist sans-serif that is highly readable at small sizes. Any numerical data, join codes, quiz scores displayed as raw values, or database-style information uses JetBrains Mono.

The type scale runs from 12px for tiny labels and badges up to 48px for landing page hero text. Page titles inside the app sit at 30px. Section headers within pages sit at 24px. Card titles are 18px. Body text is 16px. Secondary labels are 14px.

## Component Language

All cards use a glassmorphism treatment — semi-transparent background with a subtle blur, a thin indigo-tinted border, and a border-radius of 20px. On hover, the border glows with the cyan accent color.

Buttons come in two primary styles. The primary button uses the indigo-to-cyan gradient as its background, white text in DM Sans semi-bold, pill-shaped with generous padding, and a subtle lift on hover. The ghost button has a transparent background, a 1px indigo border, and indigo text — used for secondary actions.

Navigation badges and category chips use a pill shape with color-coded backgrounds: red for Weak, amber for Average, indigo for Above Average, and gold for Topper.

Progress rings are circular SVG indicators used on topic cards and student performance tiles. They fill clockwise with the cyan accent color from 0% to 100% completion.

All icons are from the Lucide React library. Icon size is 20px inside cards and 24px in headers and navigation items.

## Sidebar Navigation

The sidebar is 260px wide, fixed to the left edge of the screen, runs the full viewport height, and has the secondary background color. The brand logo sits at the top with the Synapse Classroom wordmark in Clash Display. Navigation items are listed below with an icon and label. The active item has a left border in cyan, a tertiary background, and the label in the accent color. Hovering inactive items shows a lighter tertiary background. The bottom of the sidebar contains Settings and Logout.

---

# 3. APPLICATION ARCHITECTURE

## Frontend Structure

The frontend is a single-page React application using React Router for client-side routing. It is divided into pages and components. Pages represent full route destinations. Components are reusable UI elements used across multiple pages.

Common components that appear throughout the app include the Sidebar navigation, the top bar, Card wrappers, Button variants, Modal dialogs, Badge chips, Progress bars, Avatars, Loading spinners, and Toast notifications.

Teacher-specific components include the Classroom Card, Student Row in analytics tables, Quiz Builder interface, Marks Uploader, and Analytics Chart wrappers.

Student-specific components include Topic Cards with progress rings, Quiz Question display, the Note Editor, Forum Post cards, Friend Cards, and Leaderboard Rows.

The app maintains an Auth Context that stores the currently authenticated user's Firebase UID, their display name, email, role, and their SQLite-resolved user ID. Every page that requires authentication checks this context and redirects to login if the user is not authenticated.

## Backend Structure

The backend is a Flask Python application structured as a factory pattern. All routes are organized into blueprints by domain: authentication, classrooms, quizzes, notes, analytics, friends, and AI. Each blueprint handles its own group of endpoints with shared middleware for authentication token verification.

A services layer sits between the routes and the database. The AI Service handles all calls to OpenAI or Gemini. The Quiz Service handles quiz generation logic and difficulty assignment. The Notes Service handles note processing and refinement. The Analytics Service handles student categorization calculations and leaderboard updates.

Every authenticated route requires a valid Firebase ID token sent in the Authorization header. The backend verifies this token using the Firebase Admin SDK, extracts the user's UID, looks up the corresponding user in SQLite, and attaches the user object to the request context before the route handler runs.

## Request Flow

A user action on the frontend — such as submitting a quiz — triggers a JavaScript fetch call to the Flask backend with the Firebase ID token in the header. Flask verifies the token, processes the request, writes to or reads from SQLite, potentially calls the AI API if the feature requires it, and returns a JSON response. The frontend updates its state with the response and re-renders the affected components. For realtime features such as leaderboard updates and forum notifications, the frontend listens to Firebase Realtime Database directly, bypassing the Flask backend entirely for those specific data paths.

---

# 4. AUTHENTICATION SYSTEM

## Firebase Authentication

Firebase Authentication is the sole authentication provider. It supports Email and Password login as well as Google Sign-In via OAuth popup. Firebase handles all credential verification, password hashing, token generation, and session management. The platform never stores or handles passwords directly.

## Signup Flow

When a new user visits the signup page they first select their role — Teacher or Student — through two large clickable cards with icons and brief descriptions. After selecting a role they fill in their full name, email address, password, and password confirmation. Alternatively they can use Google Sign-In, in which case the role selection step appears before the Google popup is triggered.

After Firebase creates the user account and returns a UID and ID token, the frontend immediately sends a registration call to the Flask backend with the Firebase UID, the user's name, email, and selected role. The backend creates a record in the SQLite users table. The user is then redirected to their role-specific dashboard.

## Login Flow

The user enters their email and password or clicks Continue with Google. Firebase validates credentials and returns an ID token. The frontend sends the token to the Flask backend's authentication endpoint to fetch the user's full profile including their role. The backend returns the role, name, and user ID. The frontend stores this in Auth Context and routes the user to the correct dashboard based on their role.

## Token Handling

The Firebase ID token is stored in memory only — never in localStorage or cookies — to prevent XSS exposure. It is refreshed automatically by the Firebase SDK every hour. Every API call to Flask includes the current token in the Authorization Bearer header. If a token is expired or invalid, the backend returns a 401 response and the frontend redirects the user to the login page.

## Role Enforcement

Role is stored in the SQLite users table. Every backend route checks the user's role before proceeding. Teacher-only routes return a 403 Forbidden response if accessed by a student account. Student-only routes return the same if accessed by a teacher. The frontend also enforces role-based routing — students who try to navigate to teacher URLs are redirected to their own dashboard.

---

# 5. DATABASE SCHEMA

## Overview

The database is SQLite managed by SQLAlchemy ORM. All tables use auto-incremented integer primary keys. Foreign key relationships are enforced at the application level. The database file is stored at instance/synapse.db inside the backend directory.

## Users Table

Stores all registered users regardless of role. Fields include the primary key ID, the Firebase UID (unique, used to link Firebase auth to the SQLite record), full name, email address, role (restricted to the values teacher or student), an optional avatar URL pointing to Firebase Storage, the user's total XP points, their current daily login streak count, their last active timestamp, and the account creation timestamp.

## Classrooms Table

Stores all classrooms created by teachers. Fields include the primary key ID, the teacher's user ID as a foreign key to the users table, the classroom name, subject, optional description, a unique six-character alphanumeric join code used for enrollment, a cover color hex value for the UI card, an is-active boolean, and the creation timestamp.

## Enrollments Table

A junction table linking students to classrooms. Fields include the primary key ID, the student's user ID, the classroom ID, and the enrollment timestamp. The combination of student ID and classroom ID is unique, preventing duplicate enrollments.

## Materials Table

Stores all files uploaded by teachers to a classroom. Fields include the primary key ID, the classroom ID, the uploader's user ID, the material title, optional description, the Firebase Storage URL for the file, the file type (pdf, ppt, doc, or image), the file size in kilobytes, a JSON array of topic tags, a boolean flag indicating whether it is an announcement, an optional announcement text field, and the upload timestamp.

## Quizzes Table

Stores quiz metadata. Fields include the primary key ID, the classroom ID, the material ID it was generated from (optional), the quiz title, the topic name, total question count, time limit in minutes, a boolean for whether it was AI-generated, and the creation timestamp.

## Quiz Questions Table

Stores individual questions within a quiz. Fields include the primary key ID, the quiz ID as foreign key, the question text, four option fields (option A through D), the correct option identifier (a, b, c, or d), the difficulty level (weak, average, above average, or topper), and an explanation text shown after the student answers.

## Quiz Attempts Table

Records each time a student takes a quiz. Fields include the primary key ID, the student's user ID, the quiz ID, the raw score, the total possible score, the percentage score as a decimal, the time taken in seconds, a JSON field storing the student's answer for each question (keyed by question ID), and the attempt timestamp.

## Student Performance Table

Stores the current performance profile for each student in each classroom. Fields include the primary key ID, the student user ID, the classroom ID, the current performance category, the average quiz score across all attempts, the latest real test score, the total number of quizzes taken, a JSON array of identified weak topics, and the last updated timestamp. The combination of student ID and classroom ID is unique.

## Real Tests Table

Stores real-world exam events created by teachers. Fields include the primary key ID, the classroom ID, the test name, the maximum marks possible, the test date, and the creation timestamp.

## Real Test Marks Table

Stores individual student marks for each real test. Fields include the primary key ID, the real test ID, the student user ID, the marks obtained, an auto-calculated grade letter, and the entry timestamp. The combination of real test ID and student ID is unique to prevent duplicate mark entries.

## Notes Table

Stores student notes both in raw form and after AI refinement. Fields include the primary key ID, the student user ID, the classroom ID, the material ID it was based on (optional), the topic name, the subtopic name, the raw notes text as entered by the student, the AI-refined notes text, a JSON array of key points, a JSON array of flashcard objects each containing a front question and back answer, a three-sentence summary, a boolean for whether the note is shared publicly with the class, an upvote count, and creation and update timestamps.

## Mistakes Table

Records every question a student answered incorrectly across all quiz attempts. Fields include the primary key ID, the student user ID, the quiz question ID, the topic name, the question text copied at the time of the mistake, the correct answer, the student's wrong answer, a boolean for whether the student has marked it as reviewed, and the timestamp.

## Friends Table

Manages the bidirectional friend relationship between students. Fields include the primary key ID, the requester's user ID, the receiver's user ID, the status (pending, accepted, or rejected), and the creation timestamp. The combination of requester ID and receiver ID is unique.

## XP Transactions Table

An append-only ledger of every XP award event. Fields include the primary key ID, the user ID, the points awarded (can be negative for future penalty features), the reason string describing the action, an optional reference ID pointing to the relevant quiz or note, and the timestamp.

## Badges Table

Records which badges each user has earned and when. Fields include the primary key ID, the user ID, the badge type identifier string, and the earned timestamp.

## Student Topics Table

Records which materials a student has pushed to their Learning Dashboard. Fields include the primary key ID, the student user ID, the material ID, the classroom ID, the topic name, a JSON array of extracted subtopics, the progress percentage from 0 to 100, a boolean confirming it was pushed to the learning dashboard, and the push timestamp.

---

# 6. BACKEND API STRUCTURE

## Authentication Routes

The auth routes handle user registration (called once after Firebase signup to create the SQLite record), profile retrieval for the currently authenticated user, and profile updates for name and avatar. All routes require a valid Firebase token except conceptually — the register route accepts a token from a freshly created Firebase account.

## Classroom Routes

Classroom routes handle listing all classrooms for the current user (teachers see classrooms they created, students see classrooms they enrolled in), creating a new classroom, retrieving classroom details, updating classroom metadata, student enrollment via join code, removing a student from a classroom, and listing all enrolled students with their current performance data.

## Materials Routes

Materials routes are nested under a specific classroom. They handle listing all materials for a classroom, uploading a new material record (the actual file upload happens directly to Firebase Storage from the frontend — the backend only stores the resulting URL), deleting a material, and a student action to push a material to their learning dashboard.

## Quiz Routes

Quiz routes handle listing all quizzes for a classroom, saving a newly generated quiz along with all its questions, retrieving a quiz's questions filtered to the requesting student's difficulty category, submitting a completed quiz attempt with all answers, and retrieving quiz results with correct answers and explanations.

## Notes Routes

Notes routes handle listing all notes for the current student, creating a new note, updating an existing note, deleting a note, toggling a note's public visibility, retrieving public notes in a classroom for peer access, and retrieving friends' notes on a specific topic.

## AI Routes

AI routes are the most complex. They handle the notes refinement request (accepts raw text and returns structured AI output), the quiz generation request (accepts material text and parameters and returns a set of four difficulty-matched question sets), the chatbot message (accepts a message with conversation history and classroom context and returns an AI response), the revision plan generator (accepts weak topics and exam date and returns a daily schedule), and the lecture context reconstruction (accepts sparse notes and material text and returns enriched notes).

## Analytics Routes

Analytics routes handle retrieving full class analytics for a teacher including category distribution, quiz performance trends, and topic weakness heatmaps. They handle student self-analytics showing their own performance history. They handle creating real test events, uploading marks for a real test, and listing all real tests for a classroom. After any marks upload the backend automatically recalculates and updates every affected student's performance category.

## Friends Routes

Friends routes handle listing all confirmed friends and pending requests, sending a friend request by email or user ID, accepting or declining a received request, removing a friend, retrieving the friends leaderboard data, creating a quiz battle challenge, and accepting a battle and submitting battle results.

## Mistakes Routes

Mistakes routes handle listing all mistakes for the current student optionally filtered by topic, marking a specific mistake as reviewed (which triggers a small XP award), and retrieving mistakes grouped by topic for the Mistake Corner analytics summary.

---

# 7. LANDING PAGE

## Purpose and Audience

The landing page is the public-facing marketing entry point for the platform. It is seen by unregistered visitors and converts them to signups. It must communicate the platform's value proposition clearly within five seconds of the page loading.

## Layout and Sections

The page is a full-screen dark-themed single-scroll layout with three major sections.

The hero section occupies the full viewport height. The background features an animated canvas visualization of glowing nodes connected by thin lines, representing a synaptic network. The main heading reads "Where Notes Become Knowledge" in Clash Display at 48px. The subheading below it in DM Sans at 20px reads "AI-powered adaptive learning for students who want to study smarter, not harder." Two call-to-action buttons sit below the subheading. The primary button reads "Get Started Free" and routes to the signup page. The secondary ghost button reads "See How It Works" and smooth-scrolls to the features section. Floating screenshots of the dashboard are shown at an angle with a glow underneath to hint at the product quality.

The features section shows six feature cards arranged in a three-by-two grid. Each card has a Lucide icon in cyan at 32px, a bold title in Clash Display, and a two-line description in DM Sans. The six features showcased are AI Notes Refiner, Adaptive Quizzes, Anonymous Forum, Smart Peer Matching, Gamified Leaderboards, and Exam-Aware Revision Planner. Cards use the glassmorphism style with hover glow.

The final call-to-action section has a dark gradient background, large text reading "Ready to transform how you learn?", and a single prominent button reading "Create Your Free Account →". A minimal footer below includes navigation links and copyright.

## Navigation Bar

The navbar on the landing page is transparent over the hero background. It contains the Synapse Classroom logo on the left in Clash Display, and two buttons on the right — Login (ghost style) and Sign Up (primary gradient style).

---

# 8. LOGIN AND SIGNUP PAGES

## Login Page Layout

The login page uses a split-screen layout. The left sixty percent of the screen is a full-height dark panel containing an abstract glowing illustration of a neural network or brain motif. The right forty percent contains a vertically centered auth card.

The card shows the Synapse Classroom logo at top, a heading reading "Welcome back", an email input field, a password input field with a show/hide toggle icon, a primary Login button that shows a spinner inside it while Firebase is processing, a divider line with "OR" text, a Google Sign-In button with the Google logo and white background, and a small link at the bottom reading "Don't have an account? Sign up." Inline error messages appear below the relevant field if login fails. The most common errors are wrong password, no account found for that email, and too many failed attempts.

## Signup Page Layout

The signup page uses the same split-screen layout as login.

The form is a two-step wizard. Step one shows a role selection screen with a heading reading "I am a..." and two large clickable cards side by side. The left card is labeled Student with a graduation cap icon and a brief description. The right card is labeled Teacher with a chalkboard icon and a brief description. Clicking a card selects it visually with an indigo border and glow. A Continue button appears below.

Step two shows the account details form with fields for full name, email, password, and confirm password. A password strength indicator appears below the password field as a color-coded bar. A Create Account primary button is at the bottom alongside a Continue with Google option. For Google signup, the role selection from step one is preserved and passed to the backend after the Google popup completes.

---

# 9. TEACHER DASHBOARD

## Page Purpose

The teacher dashboard is the home screen for all teachers after login. It gives an at-a-glance view of their classrooms, recent activity, and aggregate class statistics.

## Sidebar Navigation for Teachers

The sidebar for teachers lists the following navigation items in order: Home (the dashboard), My Classrooms, Upload Content, AI Quiz Generator, Real Test Marks, Student Analytics, Settings, and Logout.

## Dashboard Layout

The top bar shows a personalized greeting such as "Good morning, Kavitha" alongside the current date. A prominent "+ New Classroom" button sits in the top right.

Below the top bar is a row of four summary stat cards. The first shows total classrooms created. The second shows total students enrolled across all classrooms. The third shows total quizzes generated. The fourth shows the average quiz score across all classrooms as a percentage. Each card has a large bold number in Clash Display and a small descriptive label.

Below the stat row, the main area is split into two columns. The left column (approximately two-thirds width) shows the Active Classrooms grid. Classrooms are displayed as cards in a two-column grid. Each classroom card has a colored top border corresponding to the classroom's assigned cover color, the classroom name in Clash Display, the subject in a small tag, the student count, the material count, the last activity timestamp, and three quick action buttons: View Students, Upload Material, and Generate Quiz. The classroom's unique join code is shown as a small copyable chip at the bottom of the card.

The right column (approximately one-third width) shows a Recent Activity feed — a vertical timeline of recent events such as "Riya completed a quiz," "New enrollment in Physics class," "Quiz results available," and "Marks uploaded for Midterm." Each event has a timestamp, a small icon indicating the event type, and optionally a link to the relevant page.

---

# 10. TEACHER — CLASSROOM MANAGEMENT PAGE

## Page Purpose

This page is the detailed view of a single classroom. It is reached by clicking on any classroom card from the Teacher Dashboard or the My Classrooms page.

## Sub-Tab Navigation

The page has four sub-tabs displayed as a horizontal tab row below the classroom header. The tabs are Overview, Students, Materials, and Announcements.

## Overview Tab

The overview tab shows the classroom name in large Clash Display text at the top, with the subject below it. An edit icon beside the name allows inline editing. Below that, a three-column stat row shows the number of enrolled students, the number of uploaded materials, and the number of active quizzes. The join code is displayed prominently in a monospace font chip with a copy-to-clipboard button. A short description field can be edited inline. A Danger Zone section at the bottom allows the teacher to archive or delete the classroom, both with confirmation dialogs.

## Students Tab

The students tab shows a search input at the top, followed by filter chips for All, Weak, Average, Above Average, and Topper. Below is a sortable table with columns for student name, enrollment date, average quiz score shown as a percentage, current performance category shown as a color-coded badge, and an Actions column with a View Details button and a Remove Student button.

Clicking View Details on a student row expands an inline panel below that row (or opens a slide-in drawer on the right side). This panel shows the student's topic-wise performance as a horizontal bar chart, their quiz history as a timeline, their attendance of revision sessions, and their current weak topics listed as chips. The teacher can see all this data but the student themselves cannot see their category.

The Remove Student action opens a confirmation modal before proceeding.

## Materials Tab

The materials tab shows a grid of all uploaded files. Each file card has a type-appropriate icon (PDF, PPT, or image), the file title, the upload date, the file size, and tag chips for the associated topics. Two action buttons appear on hover: Download and Delete. A third contextual button reads "Generate Quiz from This" which pre-fills the quiz generator with this material selected.

## Announcements Tab

This tab shows all materials that were flagged as announcements, displayed as a linear list sorted by most recent first. Each announcement shows the text content, the posting date, and an optional attached file. A compose area at the top allows the teacher to write and post a new announcement instantly.

---

# 11. TEACHER — UPLOAD CONTENT PAGE

## Page Purpose

This dedicated page allows the teacher to upload learning materials to any of their classrooms. It is designed to make the upload process fast, clear, and error-free.

## Page Layout

The page has a classroom selector dropdown at the top that defaults to the classroom the teacher navigated from (if applicable). Below it is a large drag-and-drop upload zone with a dashed border, a cloud-upload icon, and the text "Drag files here or click to browse." It accepts PDF, PPTX, DOCX, and common image formats. Multiple files can be selected at once.

Below the upload zone are fields for Material Title (required, auto-populated from file name but editable), Description (optional), Topic Tags (a multi-input chip field where the teacher types a topic name and presses Enter to add it), and an Announcement toggle switch that reveals a text area for announcement message if enabled.

An upload progress bar appears for each file while it uploads to Firebase Storage. After all files are uploaded and metadata is saved, a success toast appears and the materials list updates automatically.

---

# 12. TEACHER — AI QUIZ GENERATOR PAGE

## Page Purpose

This page allows the teacher to generate a full set of adaptive quizzes from their uploaded classroom material using AI, review the generated questions, edit them if needed, and publish them to the classroom.

## Page Layout

The page is divided into a left configuration panel and a right preview panel.

## Left Configuration Panel

The left panel walks the teacher through a step-by-step quiz setup.

Step one asks the teacher to select the classroom from a dropdown, then select the specific material from a second dropdown that shows materials uploaded to that classroom.

Step two defines the quiz parameters. The teacher sets the total number of questions to generate using a number input (default is 30). They set how many questions each student should receive per quiz session using a second number input (default is 10, meaning a pool of 30 is split into sets of 10 each). A description block below explains that the AI will create four separate question sets — one for each student performance category — ensuring every student gets difficulty-appropriate questions.

Step three is an optional text area where the teacher can provide specific guidance or topic emphasis for the AI, such as "Focus on Newton's third law and include real-world examples." If left empty the AI covers the entire material evenly.

At the bottom of the left panel a large primary button reads "Generate Quiz with AI" with a lightning bolt icon. While the AI is processing, the button shows a loading spinner and the text "Generating..." The process typically takes fifteen to thirty seconds depending on document length.

## Right Preview Panel

After generation, the preview panel becomes active. It shows four sub-tabs labeled Weak, Average, Above Average, and Topper. Each tab displays the questions assigned to that difficulty level.

Each question is shown as a card with the question text in bold, four labeled option rows (A through D), and the correct answer highlighted in a subtle green background. Below the correct answer a small explanation text appears. Each question card has an Edit button that makes the text and options editable inline, a Delete button to remove that question, and a Regenerate button that calls the AI to generate a replacement question at the same difficulty level.

At the bottom of the preview panel two buttons appear: Save Draft (stores the quiz without making it visible to students) and Publish to Classroom (makes the quiz available immediately). A quiz title field and time limit input sit above these buttons.

---

# 13. TEACHER — REAL TEST MARKS ENTRY PAGE

## Page Purpose

This page handles entering marks from real-world examinations — midterms, finals, periodic tests — that take place offline. After marks are entered, the system automatically recalculates each student's performance category and updates all analytics dashboards.

## Page Layout

The top section is a test creation panel. It has fields for test name (for example "Mid Semester Exam"), maximum marks, and test date. A Create Test button saves the test event to the database. After creation, the test appears in a list on the left sidebar of the page, allowing the teacher to manage multiple tests per classroom.

## Manual Entry Tab

After selecting a test from the list, the main area shows the student roster as an editable table. Columns are student name, student email, marks obtained (an input field accepting values from zero to maximum marks), and an automatically calculated grade that updates in real time as the marks are typed. Grade thresholds are A for 90 and above, B for 75 and above, C for 60 and above, D for 45 and above, and F below 45. A "Save All Marks" button at the bottom triggers the batch update.

## CSV Upload Tab

The alternative tab shows a drag-and-drop zone for CSV file upload. A "Download Template" link above it provides a pre-formatted CSV with the correct column headers: student_email and marks. After uploading, the system parses the CSV and shows a preview table. Rows where the email doesn't match any enrolled student are highlighted in red with a warning icon. The teacher can review and confirm before submitting. A "Confirm and Save" button processes the upload.

## After Submission

A toast notification confirms how many students' marks were saved and notes that performance categories have been updated. The page then shows a summary panel below the table: how many students moved into each category, how many improved, and how many declined. A link navigates to the full Student Analytics page.

---

# 14. TEACHER — STUDENT ANALYTICS PAGE

## Page Purpose

This is the teacher's intelligence hub — a comprehensive view of class-wide and individual student performance built to help teachers make informed instructional decisions.

## Page Layout

The top section has a classroom selector for teachers who run multiple classes. Below it is a row of five summary tiles: total students, and a count with percentage for each of the four performance categories. The category tiles use their respective colors — red, amber, indigo, and gold.

## Charts Section

Below the summary tiles is a two-by-two grid of data visualizations.

The first chart is a donut chart showing category distribution. The four segments are color-coded and labeled with both the category name and the student count.

The second chart is a line chart showing quiz performance over time. The x-axis shows quiz dates, the y-axis shows percentage scores. A single line represents the class average. This allows the teacher to see if overall performance is trending up or down.

The third chart is a horizontal bar chart showing topic-wise weakness. Each bar represents a topic extracted from uploaded materials. The bar length shows what percentage of students are identified as struggling with that topic. This tells the teacher where to focus their next lesson.

The fourth chart is a histogram showing the distribution of real test scores. The x-axis is score ranges (0-10, 11-20, and so on up to the maximum). The y-axis is number of students. This gives a visual sense of the class's spread.

## Student Detail Table

Below the charts is a full student table with sortable columns: name, current category badge, quiz average, latest real test score, number of active topics in their learning dashboard, and last active date. The search bar at the top allows filtering by name.

Clicking any row opens a detailed slide-in panel on the right. This panel shows the student's full performance timeline as a line chart, their topic-by-topic quiz scores as a bar chart, their identified weak topics as chips, their review activity in the Mistake Corner, and a comparison line overlaid on the class average charts so the teacher can see how this student positions relative to the class.

---

# 15. STUDENT DASHBOARD

## Page Purpose

The student dashboard is the home screen after login. It combines motivation, continuity, and navigation into a single welcoming view that shows the student where they left off and what needs attention next.

## Sidebar Navigation for Students

The sidebar for students lists Home, My Classrooms, Learning Dashboard, My Notes, AI Chatbot, Mistake Corner, Discussion Forums, Friends and Leaderboard, Settings, and Logout.

## Dashboard Layout

The top section is a welcome banner with the student's name and a motivational message. A streak counter shows the number of consecutive days they have logged in, with a flame icon. Below it is an XP progress bar showing how much XP they have earned toward the next level, with the level number and label displayed at both ends of the bar.

Below the banner is the Active Classrooms row — a horizontally scrollable row of classroom cards. Each card shows the subject name, the teacher's name, a badge for any unread announcements, a count of new materials uploaded since the student last visited, and a count of pending quizzes. Clicking a card navigates into the classroom.

Below the classrooms row is the Continue Learning section — a horizontally scrollable row of topic cards from the student's Learning Dashboard. Each card shows the topic name, the subject it belongs to, the progress ring (0 to 100% completion), and the current subtopic they are on. A "Continue →" button is on each card.

The rightmost section of the dashboard is a Recent Activity feed showing quiz completion results, new materials from teachers, friend activity like "Aryan completed a quiz on Thermodynamics," and new replies to the student's forum posts.

---

# 16. STUDENT — CLASSROOM VIEW PAGE

## Page Purpose

This is the student's view of a specific classroom they have enrolled in. It is their primary interface for accessing teacher content and interacting with classmates.

## Sub-Tab Navigation

The page has four tabs: Feed, Materials, Forum, and Members.

## Feed Tab

The feed is the default view. It shows a chronological list of activity from the teacher. Announcements from the teacher appear at the very top with a distinct card style — a megaphone icon, a slightly different background, and a bold label reading "Announcement." Below announcements, material uploads appear as cards with the file type icon, file name, upload date, and a brief description if provided. Each material card has a primary action button reading "Push to Learning Dashboard" with a small rocket icon. Clicking this opens a quick modal asking the student to confirm the topic name (auto-populated from the material title) and showing any subtopics that were auto-extracted from the material tags. Confirming the push adds the topic to the student's Learning Dashboard.

## Materials Tab

A grid view of all uploaded materials. Each card shows the file type, title, date, and size. Clicking a card opens the file (PDF in a viewer, PPT as a download link). A "Push to Learn" button appears on each card.

## Forum Tab

This is a shortcut to the Anonymous Forum filtered to this specific classroom. See the dedicated Forum section for full specification.

## Members Tab

A grid of enrolled student avatars with only first name shown (last name truncated to initial) to preserve some privacy. Students who are also the viewing student's friends are highlighted with a small friend badge. An "Add Friend" button appears on classmates who are not yet friends. No performance data or category information is visible here.

---

# 17. STUDENT — LEARNING DASHBOARD

## Page Purpose

This is the student's personal study workspace. When a student pushes a material from their classroom into the Learning Dashboard, it becomes an interactive learning module here. This is where quizzes, notes, and the chatbot are all accessed in the context of a specific topic.

## Page Layout

The page has a left panel and a right workspace panel.

## Left Panel — Topic List

The left panel shows all topics the student has pushed to their dashboard. Each topic is a card showing the topic name, the subject it belongs to, the classroom it came from, and a progress ring showing 0 to 100% completion. Topics are sorted by last accessed by default. The progress percentage is calculated as the average completion of all its subtopics. A "Mark Complete" button appears on topics where all subtopics are done.

Clicking a topic loads its workspace in the right panel.

## Right Panel — Topic Workspace

The workspace panel has a header with the topic name, the classroom name, and the overall progress ring.

Below the header, subtopics are listed as sequential level cards — similar to levels in a game. The first subtopic is always unlocked. Subsequent subtopics unlock when the previous one reaches a completion threshold (set at 70% quiz score or completion of notes for that subtopic). Each level card shows the subtopic name, the completion percentage, the quiz score achieved, whether notes have been taken, and a status icon — a checkmark for completed, an open lock for available, and a closed lock for not yet unlocked.

When the student clicks into an unlocked subtopic, the level card expands to show four action buttons arranged in a row: Take Notes, Take Quiz, Ask Chatbot, and See Friends' Notes.

The Take Notes action opens an inline rich text editor below the action buttons. The editor supports basic formatting: bold, italic, bullet lists, and numbered lists. An auto-save indicator shows when notes were last saved. A prominent "Refine with AI" button appears to the right of the editor, which sends the current note content to the AI Notes Refiner and returns the structured output.

The Take Quiz action navigates to the Quiz Page pre-loaded with that subtopic's quiz at the appropriate difficulty level.

The Ask Chatbot action opens a compact chat panel within the workspace using the classroom's AI context.

The See Friends' Notes action shows a list of friends who have added notes to this same subtopic. Clicking a friend's name shows their public notes in a read-only view with an upvote button and an inline comment field.

---

# 18. STUDENT — AI NOTES REFINER PAGE

## Page Purpose

A dedicated full-page experience for students to refine their rough notes using AI into polished, structured study material.

## Page Layout

The page uses a split view with the input side on the left and the AI-generated output on the right.

## Input Side

At the top of the input panel are two fields: topic name and subtopic name. Below them is a tab row with three input method options.

The Type tab shows a large text area where the student can paste or type their raw notes. A character counter shows below the text area.

The Upload File tab shows a drag-and-drop zone for uploading a PDF or DOCX. The system extracts the text from the file automatically.

The Upload Image tab shows a drag-and-drop zone for uploading a photo of handwritten notes. The system uses OCR to extract the text from the image before sending it to the AI.

At the bottom of the input panel is the primary button reading "Refine My Notes with AI" with a sparkle icon. The button changes to a loading state with the text "Refining..." while the AI processes the input.

## Output Side

The output panel is initially empty with a placeholder illustration and text reading "Your refined notes will appear here." After processing completes, the output panel fills with four clearly labeled sections.

The first section is Refined Notes — the full clean structured explanation of the topic. This is the main body content, written in clear paragraphs with proper formatting.

The second section is Key Points — a bullet-pointed list of five to eight critical facts or concepts from the topic that the student must know.

The third section is Flashcards — a set of interactive flip cards. Each flashcard shows the front (a question or term) by default. Clicking or tapping the card flips it to reveal the back (the answer or definition). Navigation arrows allow cycling through all cards.

The fourth section is Summary — a three-sentence summary designed for last-minute pre-exam review.

At the bottom of the output panel are three action buttons: Save to My Notes (persists the refined output to the student's notes library), Share with Class (toggles the note public so classmates can see it), and Download as PDF.

---

# 19. STUDENT — QUIZ PAGE

## Page Purpose

A focused, full-screen quiz-taking experience with a timer, question navigation, and immediate results upon submission.

## Pre-Quiz Screen

Before the quiz starts, a centered card shows the quiz title, the topic and subtopic, the number of questions, the time limit, and the rules: each correct answer earns 10 XP, there is no negative marking, and the timer cannot be paused. A large "Start Quiz →" button begins the session.

## Quiz Taking Screen

Once started, the interface collapses into a focused mode. The sidebar is hidden or collapsed. A top bar shows the current question number out of total, a countdown timer in large monospace font that turns red in the final 60 seconds, and the XP potential for completing this quiz.

The question is displayed as a large centered card with the question text in bold Clash Display at the top. Below it are four option cards labeled A through D. Each option is a full-width clickable card. The selected option highlights in the cyan accent color. Clicking another option switches the selection. A student can change their answer at any time before submitting.

At the very bottom is a question map — a row of numbered circles, one per question. Grey circles are unanswered. Filled cyan circles are answered. Clicking any circle jumps to that question.

Navigation arrows at the bottom center allow moving to the previous or next question. A Submit Quiz button in the bottom right is active at all times — not gated on answering all questions — so students can submit if time pressure requires it. If questions are unanswered at submission, a confirmation dialog asks "You have 3 unanswered questions. Submit anyway?"

When the timer reaches zero the quiz auto-submits.

## Results Screen

The results screen shows a large animated score ring that fills from 0 to the student's percentage score with the percentage number in the center. Below it the raw score is shown (for example 12 out of 15). A grade label based on percentage appears below the score.

A secondary line shows the XP earned in this session with a plus sign and the XP amount in the cyan accent color. If the student maintained their streak today, a flame emoji and "Streak maintained!" message appears.

Three action buttons offer Review Answers (shows every question with the student's answer highlighted and the correct answer indicated), See Mistakes (navigates to the Mistake Corner filtered to this quiz), and Retake Quiz (starts a new attempt).

---

# 20. STUDENT — AI CHATBOT TUTOR PAGE

## Page Purpose

A conversational AI tutor that answers subject-specific questions using the uploaded materials of the student's classrooms as its knowledge base.

## Page Layout

The page is a full-height chat interface styled like a high-quality messaging application.

## Top Bar

The top bar shows the Synapse Classroom logo, the label "AI Tutor," and a classroom selector dropdown. The selected classroom determines which uploaded materials the AI uses as its context. Switching classrooms resets the conversation.

## Chat Window

The chat window is a scrollable area. The AI's messages appear on the left with a small synapse logo as its avatar. The student's messages appear on the right aligned to the right edge. Both message types use speech-bubble styling with rounded corners. The AI's messages are on a dark card background. The student's messages use the indigo brand color.

## Suggested Questions

On first load (before any messages), a row of suggestion chips appears above the input bar. These are three auto-generated questions relevant to the selected classroom, such as "What is the main concept in Chapter 3?" and "Can you give me an example of kinetic energy?" Clicking a chip populates it into the input as if the student typed it.

## Input Bar

The input bar at the bottom has a text field, a send button (arrow icon), and an attachment icon for uploading an image of a question to ask visually.

## Behavior

Every message the student sends is forwarded to the Flask backend along with the conversation history (up to the last ten exchanges) and the full text content of all materials uploaded to the selected classroom. The AI uses this as its context window to answer accurately and relevantly. The AI's response streams back word by word for a fluid experience. The chatbot explicitly tells the student if a question falls outside the scope of the uploaded materials and suggests they check with their teacher.

---

# 21. STUDENT — MISTAKE CORNER PAGE

## Page Purpose

A dedicated space for students to review every question they answered incorrectly across all quizzes. The goal is to transform mistakes into learning moments.

## Page Layout

The top of the page shows a progress summary: "You have reviewed X of Y mistakes." A circular progress indicator shows the review completion percentage. A stat below it shows how many XP points the student has earned from reviewing mistakes.

Below the summary is a filter row. Filter options are All Mistakes, Not Yet Reviewed, Already Reviewed, and a dropdown to filter by topic name.

## Mistake Card

Each mistake appears as a card. The card header shows the topic name as a color chip and the quiz it came from and the date. The main body shows the question text in bold. Below it two rows appear side by side: "Your answer" shown in red with an X icon and the student's wrong answer text, and "Correct answer" shown in green with a checkmark icon and the right answer text. Below those rows an explanation section shows why the correct answer is right, taken from the AI-generated explanation stored at quiz creation time.

At the bottom of the card a "Mark as Reviewed" button appears on unreviewed mistakes. Clicking it checks the mistake off, adds 5 XP to the student's account, shows a small confetti burst animation, and visually fades the card while adding a green checkmark header badge.

---

# 22. ANONYMOUS FORUM PAGE

## Page Purpose

A per-classroom anonymous discussion forum where students can ask doubts, answer peers, and discuss topics without social hesitation. The teacher has no access to this forum at all.

## Page Layout

The page has a two-column layout. The main post feed occupies the left seventy percent. A filter and sorting sidebar occupies the right thirty percent.

## Posting a Question

A prominently placed button reading "+ Ask a Doubt" sits above the feed. Clicking it opens a compose modal. The modal has a text area for the question (up to 500 characters), a multi-select tag picker populated with topic names from the classroom, and an anonymity toggle that is on by default. A brief reminder text below the toggle reads "Your identity will never be revealed to anyone, including your teacher." Submitting the post closes the modal and the new post appears at the top of the feed.

## Post Card

Each post in the feed is displayed as a card. The card header shows the topic tag chip and a time-ago timestamp. The main body shows the question text. The card footer shows the upvote count with an upvote arrow button, the reply count, and a sort label showing whether it is the most recent or most upvoted response. Clicking the post card opens the thread view.

## Thread View

The thread view can be a full page or a slide-in panel. The original question sits at the top in a slightly elevated card. Below it, replies are listed in chronological order by default. Each reply shows an auto-generated anonymous identifier (such as Anon#3847) with a consistent color-coded letter avatar generated from a hash of the user and post IDs — ensuring the same person's posts always show the same color avatar within a thread without ever revealing their identity. Each reply has an upvote button and an inline downvote button. A Report button is accessible from a three-dot menu on each post and reply.

A reply input box at the bottom of the thread has a text area, an anonymous toggle, and a Submit Reply button.

## Filter and Sort Sidebar

The sidebar has a Sort By section with radio options for Most Upvoted, Most Recent, and Unanswered. Below it is a Filter by Topic section with checkboxes for each topic tag that has been used in the classroom's forum posts. At the bottom a My Posts section has links to "View My Doubts" and "My Contributions."

## Anonymity Implementation

No real names, usernames, or avatars linked to actual identities are ever shown in the forum. The backend stores the real user ID internally for moderation purposes but this information is never exposed through any forum API endpoint. Anonymous identifiers are generated deterministically from the combination of user ID and post ID so they are consistent within a thread but not linkable across threads. Reputation points for helpful answers are credited to the user's internal account without revealing who earned them.

---

# 23. FRIENDS AND LEADERBOARD PAGE

## Page Purpose

The social competitive hub of the platform. Students add friends, compare XP and performance, view ranked leaderboards, and challenge each other to quiz battles.

## Sub-Tab Navigation

The page has three tabs: Friends, Leaderboard, and Battles.

## Friends Tab

The top of the Friends tab has a search bar where students can search for classmates by name or email to send friend requests. Search results show the person's first name, how many mutual friends they share, and how many common classrooms they are in. An "Add Friend" button initiates the request.

A Pending Requests section below the search shows incoming requests with Accept and Decline buttons. Each pending request shows the requester's first name and which classroom they share.

The main friends list below shows each confirmed friend as a card. The card shows the friend's avatar, first name, current level and XP total, their current streak, how many classrooms you share, and two action buttons: View Notes (shows their publicly shared notes) and Challenge (initiates a quiz battle). A small friend removal option is available through a three-dot menu.

## Leaderboard Tab

The leaderboard tab has a toggle row at the top with four options: My Class, Friends Only, All Time, and This Week.

The leaderboard is displayed as a ranked table. The top three positions have medal icons (gold, silver, bronze) instead of numbers. Each row shows the rank, the student's avatar, their first name and last initial, their total XP, their level number and label, their current streak, and any notable badge icons. The viewing student's own row is highlighted in a subtle indigo background to make it easy to locate in a long list.

Rank change indicators appear next to each rank — a small upward green arrow with a number for students who have risen in rank since last week, or a downward red arrow for those who have fallen.

## Battles Tab

The battles tab shows three sections stacked vertically.

The Active Battles section shows any ongoing battles in progress with a live status indicator showing both players' current scores.

The Pending Invites section shows battle challenges received from friends. Each invite shows the challenger's name, the proposed topic, and Accept and Decline buttons.

A Challenge a Friend section at the top has a friend selector dropdown and a topic selector dropdown (populated from topics both students have in their learning dashboards). A Send Challenge button creates the invite.

The Completed Battles section shows past battles with the outcome (Won or Lost), the score on both sides, the topic, and the date.

## Battle Format

When both students accept and are ready, a countdown screen appears for both. The battle is ten questions on the selected topic, pulled from the Above Average difficulty set to give both players a fair challenge regardless of their individual performance categories. Both students see the same questions in the same order. A shared timer counts down from a set time limit. Both players can see each other's progress in real time through a live score indicator at the top of the screen. Results are shown simultaneously to both players after submission.

---

# 24. GAMIFICATION SYSTEM

## XP Points System

XP (experience points) is the platform's primary engagement currency. Students earn XP for completing quizzes regardless of score, with bonus XP for high performance. Scoring 70% or above on any quiz earns a performance bonus. Scoring 100% earns a perfect score bonus on top of that. Students earn XP for uploading and refining notes. They earn XP for each upvote their forum answers receive up to a daily cap. They earn XP for reviewing mistakes in the Mistake Corner. Daily login earns base XP multiplied by a streak multiplier — longer streaks earn more per day. Completing a seven-day consecutive streak earns a large bonus. Pushing a new topic to the learning dashboard earns a small amount. Winning a friend battle earns a significant amount.

## Level System

Levels are calculated from cumulative XP. Level one starts at zero XP. Each subsequent level requires more XP than the last, with the gap widening progressively. Each level has a title that escalates from Rookie through Explorer, Learner, Scholar, Achiever, Expert, Master, Champion, Legend, and finally Synapse Elite at the highest tier. When a student levels up, an animated level-up banner appears with their new title and a celebratory animation.

## Badges

Badges are one-time unlockable achievements displayed on a student's profile and leaderboard row. The Consistent badge is awarded for a seven-day login streak. The Scholar badge is awarded for completing ten distinct topics. The Quick Thinker badge is awarded for finishing a quiz in under five minutes with a score of 80% or above. The Helper badge is awarded for having ten forum answers that received upvotes. The Class Topper badge is awarded for reaching the number one position on the classroom leaderboard. The Note Master badge is awarded for refining 20 or more notes with AI. The Battle Winner badge is awarded for winning five friend battles. The Perfect Score badge is awarded for achieving 100% on any quiz.

## Streak System

The streak counter tracks consecutive calendar days of any meaningful activity on the platform — logging in alone counts, as does completing any quiz, note, or forum interaction. The streak is shown with a flame icon on the student dashboard. If a student misses a day, the streak resets to zero. A streak protection feature (post-MVP) would allow premium users to use a streak shield once per month.

---

# 25. AI INTEGRATION DETAILS

## Notes Refinement

When a student submits raw notes for refinement, the backend extracts the text content (handling direct text, PDF extraction, or OCR for images). It constructs a prompt that instructs the AI to act as an expert educational assistant, to transform the raw notes on the given topic into four specific output sections, and to respond exclusively in a structured JSON format containing the refined notes text, an array of key points, an array of flashcard objects each with a front and back field, and a short summary. The backend parses the JSON response and stores it in the notes table under the corresponding fields.

## Quiz Generation

When the teacher triggers quiz generation for a material, the backend extracts the text from the uploaded PDF or document. It constructs four separate prompts — one per difficulty level — each instructing the AI to generate the specified number of questions at the described difficulty level. The weak difficulty prompt requests basic recall and fundamental concept questions. The average prompt requests comprehension and mixed application questions. The above average prompt requests application and problem-solving questions. The topper prompt requests critical thinking, analysis, and edge case questions. Each prompt instructs the AI to respond in a JSON array format with fields for the question text, four options, the correct option identifier, and an explanation. All four sets are stored in the quiz questions table tagged with their respective difficulty levels.

## Chatbot Tutor

Each chatbot session operates with a system prompt that instructs the AI to act as a helpful tutor for a specific subject, to answer questions based only on the provided classroom materials, and to be concise and give examples. The system prompt includes the full text content of all materials uploaded to the selected classroom, truncated to fit within the context window limit. The conversation history for the last ten exchanges is included in every API call so the AI maintains conversational continuity. If the student's question is outside the scope of the materials, the AI is instructed to say so explicitly rather than hallucinating an answer.

## Revision Plan Generation

When a student's exam date is approaching (defined as within fourteen days), the system identifies the student's weak topics from the student performance table. It sends a request to the AI with the list of weak topics, the number of days until the exam, and the student's recent activity patterns. The AI returns a day-by-day revision schedule as a JSON object with dates as keys and arrays of suggested topics with estimated study duration as values. This plan is displayed on the student dashboard as a calendar-style widget.

## Lecture Context Reconstruction

This feature sends both the student's raw notes and the relevant section of the teacher's uploaded material to the AI. The prompt instructs the AI to identify gaps in the student's notes, fill those gaps with clear explanations inferred from the provided material, and return a coherent enriched version of the notes that combines the student's original observations with the reconstructed context. The output is presented as a new refined note that the student can choose to save.

---

# 26. REALTIME FEATURES

## Firebase Realtime Database Usage

Firebase Realtime Database handles four categories of live-updating data: leaderboards, forum notifications, battle state, and user notifications.

## Leaderboard Realtime Updates

The leaderboard data in Firebase is structured as a nested object keyed by classroom ID and then by user ID. Each user entry contains their display name, current XP total, level, and streak. Whenever a student earns XP (from a quiz, note, or any gamification event), the Flask backend writes the updated XP total to this Firebase node. Every student's leaderboard page holds a real-time listener on their classroom's leaderboard node. When any student's XP changes, all other students viewing the leaderboard see it update without refreshing.

## Forum Notifications

When a new reply is posted to a forum thread, the backend writes a notification event to Firebase under the original post author's notifications path. The frontend holds a listener on the current user's notification path and shows a badge count on the Forum navigation icon and a toast notification message.

## Battle State Synchronization

During an active quiz battle, both players' current scores are written to Firebase in real time as each question is answered. Both frontends hold a listener on the shared battle node and display a live score indicator showing both players' current progress. This creates the sense of a real-time competition even though the implementation uses event-based writes rather than a persistent WebSocket connection.

## User Notifications

A general notification system in Firebase handles friend requests received, battle invitations, quiz results from teachers, and achievement unlocks. A bell icon in the top bar shows a badge count of unread notifications. Clicking it opens a dropdown list of recent notifications, each with a message, timestamp, and a link to the relevant page.

---

# 27. FILE STORAGE

## Firebase Storage Structure

All user-uploaded files are stored in Firebase Storage organized into a logical folder hierarchy. Teacher-uploaded materials are stored under a path organized first by classroom ID and then by a timestamp-prefixed filename to prevent collisions. Student notes attachments and image uploads for OCR are stored under a path organized by student user ID. User profile avatars are stored under an avatars path keyed by user ID.

## Upload Process

File uploads follow a two-step process. The file is uploaded directly from the frontend to Firebase Storage using the Firebase SDK's upload function. A progress bar tracks the upload in real time. Once the upload completes, the Firebase Storage download URL is returned. This URL is then sent to the Flask backend as part of the material creation API call, where it is stored in the materials table. The Flask backend itself never handles the raw file bytes, which keeps the backend lightweight and fast.

## File Size and Type Limits

Maximum file size per upload is 50 megabytes. Accepted file types are PDF, PPTX, DOCX, JPG, PNG, and GIF. File type validation occurs both on the frontend (via the file picker accept attribute) and on the backend (by checking the file extension in the provided URL and MIME type).

---

# 28. SECURITY AND ACCESS CONTROL

## Authentication Enforcement

Every route on the Flask backend (except the registration endpoint called immediately after Firebase account creation) requires a valid Firebase ID token in the Authorization header. Routes that do not receive a valid token return a 401 Unauthorized response. Routes that receive a valid token but for a user whose role does not have permission for that action return a 403 Forbidden response.

## Data Isolation

Students can only access data belonging to classrooms they are enrolled in. They cannot access the data of classrooms they are not enrolled in, even if they know the classroom ID. This is enforced at the query level in every relevant backend route — every database query that retrieves classroom data first confirms that the requesting user is either the classroom's teacher or an enrolled student.

Teachers can only manage data in classrooms they own. A teacher cannot access, modify, or delete data from another teacher's classroom.

Forum data is never returned in any API response with the original poster's user ID or any linkable identifier. The forum API returns only the anonymous identifier, the post content, timestamps, and vote counts.

Students cannot see their own performance category. The student analytics API endpoint returns quiz scores, topic progress, XP, and other non-category data for the student's own view. The category field is omitted entirely from student-facing API responses.

## Firebase Security Rules

Firebase Realtime Database rules require authentication (non-null auth token) for all read operations. Write operations to leaderboard data are restricted so a user can only write to their own user ID node. Notification writes are permitted from any authenticated user (allowing the backend's service account to write cross-user notifications) but reads are restricted to the owner's UID only.

Firebase Storage rules require authentication for all reads. Writes to the materials folder are permitted for any authenticated user. Writes to the notes and avatars folders are restricted to the user whose UID matches the folder path, ensuring students cannot overwrite each other's files.

---

# 29. DEPLOYMENT NOTES

## Frontend Deployment

The React frontend is built using Vite and deployed to Vercel or Firebase Hosting. Environment variables for Firebase configuration are set as Vercel environment variables and accessed via the VITE_ prefix in the application code. The build command is npm run build and the output directory is dist.

## Backend Deployment

The Flask backend is deployed to Railway or Render. Both platforms support Python applications natively and provide a persistent filesystem, which is necessary for the SQLite database file. The SQLite database file lives in the instance directory of the backend repository. The Firebase service account key JSON file (for the Admin SDK) is stored as an environment variable in encoded form and written to disk at startup. The backend is started with Gunicorn as the production WSGI server.

## Environment Variables

The frontend requires the Firebase project API key, auth domain, project ID, storage bucket, messaging sender ID, app ID, and realtime database URL, plus the backend API base URL. The backend requires the Flask secret key, the SQLite database URI, the OpenAI or Gemini API key, the path to the Firebase service account key, and the allowed CORS origins set to include both the local development URL and the production frontend URL.

## Database Note

SQLite is used for the hackathon build and works without any external database service. If the platform scales beyond prototype usage, migrating to PostgreSQL requires only changing the SQLAlchemy database URL environment variable from the SQLite file path to a PostgreSQL connection string. No model definitions need to change because SQLAlchemy abstracts the underlying database engine.

## Local Development Setup

The frontend is run with npm run dev on port 5173. The backend is run with python run.py on port 5000. CORS is configured to allow requests from localhost:5173. Firebase is connected to the same project in both development and production, though a separate Firebase project for development is recommended to isolate test data.

---

*Synapse Classroom — Blueprint v2.0*
*Prepared for Google Antigravity Hackathon*
*Text specification — implementation by AI code generation*