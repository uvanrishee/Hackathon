# Synapse Classroom — Agent Brief
### Context Document for Google Antigravity Web App Generation
 
---
 
## What Is Synapse Classroom?
 
Synapse Classroom is a full-stack, AI-powered collaborative learning platform designed for schools, colleges, and coaching institutes. It reimagines the Google Classroom model by injecting intelligence into every layer — from how students take notes, to how teachers assess performance — and layering on gamified peer collaboration to make studying genuinely engaging.
 
The platform has two primary user types: Teachers and Students. Teachers manage classrooms, upload content, generate quizzes via AI, and track every student's performance with granular analytics. Students consume content, enhance their notes with AI, take adaptive quizzes tailored to their ability level, collaborate anonymously with peers, and compete on leaderboards with friends.
 
The name "Synapse" reflects the platform's core philosophy: just as synapses connect neurons to form knowledge in the brain, this platform connects students, teachers, content, and AI to form a coherent, adaptive learning ecosystem.
 
---
 
## The Core Problem Being Solved
 
Students take unstructured notes during fast-paced lectures and quickly lose the context that made those notes meaningful. Over time, revision becomes re-learning from scratch rather than reinforcing existing knowledge, which is inefficient and deeply stressful. Peer learning is massively underutilized because students are socially hesitant to ask questions, there is no structured system to facilitate collaboration, and there is no intelligent matching of students who could help each other.
 
Teachers have no easy way to adaptively assign different-difficulty content to different student segments. A single quiz handed to an entire class treats the weakest and strongest students identically, which helps neither group. There is also no platform that unifies individual learning, peer collaboration, and teacher analytics in one coherent place — most platforms solve one piece but not all three simultaneously.
 
---
 
## The Solution at a Glance
 
Synapse Classroom solves these problems through five interconnected layers working together seamlessly.
 
The Teacher Layer handles classroom creation, student management, content upload, AI quiz generation, real-test marks entry, and adaptive student categorization. The Teacher always has a clear picture of every student's progress and weaknesses without needing to manually analyze anything.
 
The Student Layer handles the personal learning dashboard, AI note refinement, adaptive quizzes, flashcards, and revision planning. The student's experience is personalized silently based on their performance — they simply notice that the platform always feels just the right amount of challenging.
 
The Collaboration Layer includes an anonymous Reddit-style discussion forum, a friend system, shared notes, and study rooms. These features remove the social barrier to peer learning and make collaboration feel natural and fun rather than forced.
 
The Intelligence Layer powers AI note structuring, quiz generation from uploaded documents, a chatbot tutor, spaced repetition reminders, and learning behavior analysis. The AI operates in the background to make every interaction smarter over time.
 
The Gamification Layer includes XP points, badges, class and friends leaderboards, 1v1 quiz battles, and competitive timed contests. This layer transforms revision from a chore into a social competitive activity students actually want to engage with.
 
---
 
## User Roles and Access Summary
 
### Teacher Role
 
A teacher creates and manages one or more classrooms, each associated with a specific subject. The teacher uploads PDFs, PowerPoint files, and text announcements for enrolled students. They generate AI-powered quizzes directly from their uploaded content with a single click. They view per-student and class-wide performance analytics through a dedicated analytics dashboard. They enter real-exam marks either manually (student by student) or by uploading a CSV file. After each marks entry the system automatically re-categorizes every student into one of four performance tiers. Teachers see topic-wise weakness heatmaps, improvement trends over time, and can compare individual students against the class average. Teachers cannot see the anonymous forum.
 
### Student Role
 
A student enrolls in multiple classrooms across different subjects using a unique join code provided by the teacher. They view all materials the teacher uploads and can push any document into their personal Learning Dashboard for deeper study. They take adaptive quizzes whose difficulty is silently matched to their performance category. They write rough notes and use the AI Notes Refiner to convert them into clean, structured, revision-ready summaries with key points and flashcards. They ask questions to an AI chatbot trained on their specific classroom's uploaded materials. They participate anonymously in a per-classroom discussion forum. They track every mistake from every quiz in a dedicated Mistake Corner. They earn XP, build daily streaks, unlock badges, add friends, compare progress on leaderboards, and challenge friends to quiz battles.
 
---
 
## Student Performance Categorization System
 
After each real-test marks upload and after cumulative quiz performance evaluations, the system silently re-evaluates each student and places them into one of four dynamic performance categories.
 
Students categorized as Weak (scoring below 40% on average) receive quizzes focused entirely on fundamental concepts and basic recall. These questions ensure they build a solid foundation before moving to harder material.
 
Students in the Average range (40 to 60%) receive mixed questions covering both fundamentals and basic application, bridging the gap between recall and understanding.
 
Students categorized as Above Average (60 to 80%) receive application-based and problem-solving questions that challenge them to use their knowledge in new contexts.
 
Topper students (above 80%) receive critical thinking, analysis, and edge-case questions that push them beyond the syllabus into deeper mastery.
 
This categorization is entirely invisible to the student. Students never see which tier they belong to. This design choice is intentional — it prevents stigma, avoids the anxiety of being labeled, and allows the system to deliver quietly tailored content. The category updates dynamically after every real test and after a periodic quiz performance review. Teachers can see each student's category but it is never displayed to the student themselves, not even in their own profile.
 
---
 
## Key Differentiating Features
 
### AI Notes Refiner
This is the platform's central differentiator. The AI Notes Refiner accepts rough, unstructured student notes in any form — typed text pasted into a box, an uploaded PDF, or even a photograph of handwritten notes. It returns a fully structured output: a clean detailed explanation of the topic, a bullet-pointed list of key points, a set of five to eight flashcard pairs for self-testing, and a three-sentence summary for last-minute revision. This transforms the way students revise by giving them professional-quality study material generated from their own imperfect raw input.
 
### Anonymous Doubt Forum
A Reddit-style Q&A space that exists per classroom, visible only to enrolled students, and completely invisible to the teacher. Students can ask doubts without fear of judgment, upvote helpful answers, reply in threaded discussions, and sort posts by most helpful, most recent, or unanswered. Anonymous posting is the default. Reputation points are awarded internally to students whose answers get upvoted, which incentivizes quality answers without revealing identity. Anonymity removes the social barrier that stops most students from raising their hand in class or admitting they do not understand something.
 
### Adaptive Quiz Engine
The teacher uploads material to the platform and optionally specifies some focus areas. The AI reads the document and generates a large pool of questions covering the full topic. It then automatically splits that pool into four difficulty-matched sets — one for each student performance category. When a student opens a quiz, they receive the set matched to their category without knowing it. No teacher intervention is needed after the initial material upload.
 
### Chatbot Tutor
An AI assistant that is not just a generic chatbot but one that has read every document uploaded to a specific classroom. When a student asks a doubt, the chatbot answers using the actual content the teacher shared — not generic internet knowledge. This makes answers directly relevant to the syllabus, the textbook used, and the level the teacher is teaching at. Students can have a full back-and-forth conversation with the chatbot, and it maintains context across the session.
 
### Exam-Aware Spaced Repetition
The system detects upcoming exam dates that the teacher enters and cross-references them with each student's identified weak topics. It generates a personalized daily revision schedule that prioritizes high-forgetting-risk content in the days before the exam. Students receive reminders based on the forgetting curve — topics they studied five days ago get re-surfaced for review, while recently revised topics are deprioritized.
 
### Friend Leaderboard and 1v1 Battles
Students add friends who are classmates. A dedicated leaderboard page ranks friends by XP earned through quiz completions, note uploads, and streak maintenance. Students can challenge any friend to a 1v1 quiz battle on a topic they both have in their learning dashboard. Both students get the same ten questions simultaneously, a countdown timer runs, and the results are shown in real time. This turns revision into a social competition that students genuinely want to participate in.
 
### Community Notes Fusion
An advanced collaborative feature where the AI aggregates notes from multiple students who have all studied the same topic and generates one consolidated, high-quality community note that combines the best insights from everyone. This is accessible to the whole class and represents the collective understanding of the student group rather than any one person's perspective.
 
### Lecture Context Reconstruction
When a student has very sparse or incomplete notes, this AI feature fills the gaps by inferring the missing explanations and adding relevant examples. It uses both the student's rough notes and the teacher's uploaded material to reconstruct what was likely discussed during the lecture, giving the student a more complete picture than their raw notes alone would provide.
 
---
 
## Technology Stack
 
The frontend is built in React with React Router for navigation and Tailwind CSS for all styling. The backend is Python with Flask, organized as a clean REST API. The database is SQLite managed through the SQLAlchemy ORM — chosen for its simplicity and zero-configuration setup, with a clean migration path to PostgreSQL when needed. Authentication is handled entirely by Firebase Authentication, supporting both Email/Password login and Google Sign-In. Realtime features — leaderboard updates, forum post notifications, battle scores, friend activity — use Firebase Realtime Database. All file uploads including PDFs, PPTs, and images are stored in Firebase Storage. AI features use either the OpenAI GPT-4 API or Google Gemini Pro API for note refinement, quiz generation, and chatbot responses.
 
---
 
## Design Identity
 
The platform name is Synapse Classroom. The tagline is "Where notes become knowledge, and learning becomes a team sport." The visual identity is dark-mode first. The primary background is a deep space navy. The brand primary color is electric indigo, used for buttons, active navigation, and primary UI elements. A bright cyan is used as the highlight and accent color for progress indicators, XP bars, active states, and glowing borders. Typography uses Clash Display for all headings and display text, DM Sans for body copy and UI labels, and JetBrains Mono for data values, join codes, and any numeric displays. The overall aesthetic should feel like a premium productivity tool — clean dark dashboard with subtle glowing card borders, animated gradient accents on active elements, and synaptic or neural motifs in background graphics. Icons are from the Lucide React library used consistently throughout the entire application.
 
---
 
## MVP Scope for Hackathon
 
The MVP must deliver a complete, demonstrable, working product. It must include Firebase authentication for both teacher and student roles with a role selection screen at signup. It must include classroom creation by teachers and student enrollment via a six-character join code. It must include teacher document upload stored in Firebase Storage with a material listing page. It must include AI quiz generation from uploaded documents and student quiz-taking with score tracking and automatic mistake logging. It must include the anonymous forum per classroom with post creation, upvoting, and threaded replies. It must include the AI notes refiner accepting text input and returning structured output. It must include a basic leaderboard within each classroom based on quiz scores. All SQLite database tables must be fully operational and the Flask backend must serve all these features via authenticated REST API endpoints.
 
---
 
## One-Line Pitch
 
Synapse Classroom transforms unstructured personal notes into structured knowledge while enabling intelligent collaboration, gamified learning, and anonymous peer-driven doubt solving — all in one adaptive platform built for how students actually learn.
