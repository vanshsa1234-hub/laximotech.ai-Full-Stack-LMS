import { PrismaClient, CourseCategory, CourseLevel, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const ALL_COURSES: { slug:string;title:string;shortDesc:string;category:CourseCategory;level:CourseLevel;durationHrs:number;isFeatured:boolean }[] = [
  { slug:'ai-machine-learning-hindi',        title:'AI & Machine Learning',                    shortDesc:'From Python to Deep Learning.',                          category:'AI_ML',               level:'BEGINNER',     durationHrs:42, isFeatured:true  },
  { slug:'deep-learning-nlp-hindi',          title:'Deep Learning & NLP — Advanced',           shortDesc:'Learn Transformers, BERT, and GPT architecture.',         category:'AI_ML',               level:'ADVANCED',     durationHrs:45, isFeatured:false },
  { slug:'computer-vision-hindi',            title:'Computer Vision with OpenCV',              shortDesc:'Image processing, object detection, face recognition.',   category:'AI_ML',               level:'INTERMEDIATE', durationHrs:38, isFeatured:false },
  { slug:'natural-language-processing-hindi',title:'NLP — Text Mining & Sentiment Analysis',  shortDesc:'NLP tasks, chatbots, BERT fine-tuning.',                  category:'AI_ML',               level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'machine-learning-projects-hindi',  title:'ML Projects — Build 10 Real Projects',    shortDesc:'House price, spam detection, movie recommender.',          category:'AI_ML',               level:'INTERMEDIATE', durationHrs:50, isFeatured:false },
  { slug:'generative-ai-chatgpt-hindi',      title:'Generative AI & ChatGPT',                  shortDesc:'OpenAI API, prompt engineering, and building LLM apps.',  category:'AI_ML',               level:'BEGINNER',     durationHrs:28, isFeatured:true  },
  { slug:'data-science-beginners-hindi',     title:'Data Science for Beginners',               shortDesc:'Statistics, Python, SQL, and visualization.',            category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:38, isFeatured:true  },
  { slug:'sql-database-hindi',               title:'SQL & Database Design',                    shortDesc:'MySQL, PostgreSQL — become a database expert.',          category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:25, isFeatured:false },
  { slug:'statistics-data-science-hindi',    title:'Statistics for Data Science',               shortDesc:'Probability, distributions, hypothesis testing.',         category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:30, isFeatured:false },
  { slug:'tableau-powerbi-hindi',            title:'Tableau & Power BI — Data Visualization', shortDesc:'Build professional dashboards and data stories.',        category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:22, isFeatured:false },
  { slug:'data-analyst-excel-hindi',         title:'Data Analyst with Excel & Python',         shortDesc:'Excel, pandas, matplotlib — become a data analyst.',     category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:28, isFeatured:false },
  { slug:'python-programming-hindi',         title:'Python Programming — Zero to Hero',        shortDesc:'Go from absolute zero to Python expert.',                category:'PROGRAMMING',          level:'BEGINNER',     durationHrs:30, isFeatured:false },
  { slug:'web-development-hindi',            title:'Full Stack Web Development',               shortDesc:'Become a full-stack developer with React + Node.js.',    category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:55, isFeatured:true  },
  { slug:'django-flask-hindi',               title:'Django & Flask — Backend Python Web',      shortDesc:'Build web apps and REST APIs with Python.',              category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'react-nextjs-hindi',               title:'React & Next.js — Modern Frontend',        shortDesc:'Learn React hooks, Next.js 14, and Tailwind CSS.',       category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:42, isFeatured:false },
  { slug:'nodejs-backend-hindi',             title:'Node.js & Express — Backend Development',  shortDesc:'REST APIs, authentication, and databases.',              category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:38, isFeatured:false },
  { slug:'android-development-hindi',        title:'Android Development with Kotlin',          shortDesc:'Build native Android apps with Kotlin.',                 category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:45, isFeatured:false },
  { slug:'iot-robotics-arduino-hindi',       title:'IoT & Robotics with Arduino',              shortDesc:'Build real robots with Arduino + Raspberry Pi.',         category:'ROBOTICS_IOT',         level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'raspberry-pi-hindi',               title:'Raspberry Pi Projects',                    shortDesc:'Linux, Python, GPIO — what you can build with Raspberry Pi.', category:'ROBOTICS_IOT',    level:'INTERMEDIATE', durationHrs:30, isFeatured:false },
  { slug:'embedded-systems-hindi',           title:'Embedded Systems & Microcontrollers',      shortDesc:'8051, STM32, and real-time systems.',                    category:'ROBOTICS_IOT',         level:'ADVANCED',     durationHrs:40, isFeatured:false },
  { slug:'devops-docker-hindi',              title:'DevOps, Docker & Kubernetes',              shortDesc:'Learn CI/CD, containers, and cloud deployment.',         category:'ROBOTICS_IOT',         level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'cybersecurity-ethical-hacking-hindi',title:'Cybersecurity & Ethical Hacking',        shortDesc:'Learn ethical hacking and pentesting, legally.',         category:'CYBERSECURITY_CLOUD',  level:'INTERMEDIATE', durationHrs:40, isFeatured:true  },
  { slug:'network-security-hindi',           title:'Network Security & CCNA Prep',             shortDesc:'Networking fundamentals, Cisco CCNA preparation.',        category:'CYBERSECURITY_CLOUD',  level:'BEGINNER',     durationHrs:32, isFeatured:false },
  { slug:'cloud-aws-hindi',                  title:'AWS Cloud Fundamentals',                   shortDesc:'AWS services — a foundation for cloud architects.',       category:'CYBERSECURITY_CLOUD',  level:'INTERMEDIATE', durationHrs:32, isFeatured:false },
  { slug:'ethical-hacking-advanced-hindi',   title:'Ethical Hacking Advanced — Bug Bounty',    shortDesc:'Advanced pentesting, bug bounty hunting, CEH prep.',     category:'CYBERSECURITY_CLOUD',  level:'ADVANCED',     durationHrs:48, isFeatured:false },
];

async function main() {
  console.log('🌱 Seeding laximotech.ai — Phase 2 (25 courses)...\n');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@laximotech.ai' }, update: {},
    create: { email: 'admin@laximotech.ai', name: 'Laximotech Admin', role: Role.ADMIN },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@laximotech.ai' }, update: {},
    create: { email: 'instructor@laximotech.ai', name: 'Rahul Sharma', role: Role.INSTRUCTOR, bio: '8+ years AI/ML | Ex-Google | IIT Delhi', city: 'Greater Noida West' },
  });

  const seededPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(seededPassword, 12);

  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: 'admin@laximotech.ai' } },
    update: { access_token: hashedPassword },
    create: { userId: admin.id, type: 'credentials', provider: 'credentials', providerAccountId: 'admin@laximotech.ai', access_token: hashedPassword },
  });

  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: 'instructor@laximotech.ai' } },
    update: { access_token: hashedPassword },
    create: { userId: instructor.id, type: 'credentials', provider: 'credentials', providerAccountId: 'instructor@laximotech.ai', access_token: hashedPassword },
  });
  console.log('✅ Admin + Instructor');

  let created = 0;
  for (const c of ALL_COURSES) {
    const existing = await prisma.course.findUnique({ where: { slug: c.slug } });
    if (existing) { process.stdout.write('.'); continue; }
    const course = await prisma.course.create({
      data: {
        slug: c.slug, title: c.title, shortDesc: c.shortDesc,
        description: `${c.title} — India's best course at Rs 399. Certificate included. Lifetime access.`,
        price: 399, level: c.level, category: c.category, language: 'English',
        durationHrs: c.durationHrs, totalLessons: 16, isPublished: true, isFeatured: c.isFeatured,
        instructorId: instructor.id,
        metaTitle: `${c.title} | Rs 399 | laximotech.ai`,
        metaDesc: `${c.shortDesc} Certificate included. Only Rs 399.`,
      },
    });
    const sections = ['Foundation', 'Core Concepts', 'Practical Skills', 'Projects & Certification'];
    for (let si = 0; si < sections.length; si++) {
      const section = await prisma.section.create({ data: { title: sections[si], order: si + 1, courseId: course.id } });
      const isLastSection = si === sections.length - 1;

      for (let li = 0; li < 4; li++) {
        const isQuizLesson = li === 3; // last lesson of every section is a real quiz
        const lesson = await prisma.lesson.create({
          data: {
            title: isQuizLesson ? `${sections[si]} — Quiz` : `${sections[si]} — Part ${li + 1}`,
            order: li + 1, sectionId: section.id,
            contentType: isQuizLesson ? 'QUIZ' : 'VIDEO',
            isPreview: si === 0 && li === 0,
            estimatedMinutes: isQuizLesson ? 10 : Math.floor(Math.random() * 20) + 15,
            // Demo video — replace via admin panel with real course footage.
            // Player accepts any direct MP4 URL.
            videoUrl: isQuizLesson ? null : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDurationSec: isQuizLesson ? null : 596,
          },
        });

        // Create a REAL quiz with REAL questions for every quiz-marked lesson
        if (isQuizLesson) {
          await prisma.quiz.create({
            data: {
              lessonId:     lesson.id,
              title:        `${sections[si]} — Knowledge Check`,
              passingScore: 70,
              isFinalExam:  isLastSection,
              questions: {
                create: [
                  {
                    order: 1,
                    question: `What was the most important concept covered in the "${sections[si]}" section of this course?`,
                    options: [
                      'The core fundamentals covered in this section',
                      'Nothing, I skipped the section',
                      'Only theory, no practical work',
                      'An unrelated topic',
                    ],
                    correctIndex: 0,
                    explanation: 'Each section\'s fundamentals build the foundation for the next section — that\'s why reviewing them matters.',
                  },
                  {
                    order: 2,
                    question: `What is the purpose of the practical projects in the "${c.title}" course?`,
                    options: [
                      'Just to pass the time',
                      'Real-world application and portfolio building',
                      'To make the course longer',
                      'No real purpose',
                    ],
                    correctIndex: 1,
                    explanation: 'Practical projects give you a real portfolio for interviews and job applications.',
                  },
                  {
                    order: 3,
                    question: 'If a concept doesn\'t make sense, what should you do first?',
                    options: [
                      'Drop the course',
                      'Rewatch the lesson or ask the AI Study Buddy',
                      'Ignore it and move on',
                      'Switch to a different course',
                    ],
                    correctIndex: 1,
                    explanation: 'Both the AI Study Buddy and lesson rewatch are available — using them is the best way to learn.',
                  },
                  {
                    order: 4,
                    question: 'What is required to earn the certificate?',
                    options: [
                      'Just watching the videos',
                      'Passing every section quiz and clearing the final exam',
                      'Sharing the course',
                      'Nothing at all',
                    ],
                    correctIndex: 1,
                    explanation: 'The certificate is only issued once you score a passing grade (70%+) on the final exam.',
                  },
                  {
                    order: 5,
                    question: `What should your next step be after this course, to build a career in ${c.category.replace('_', ' ')}?`,
                    options: [
                      'Build practical projects and add them to your portfolio',
                      'Do nothing',
                      'Forget the course',
                      'Just show the certificate without practicing skills',
                    ],
                    correctIndex: 0,
                    explanation: 'Applying your skills to real projects is the single most important step toward being job-ready.',
                  },
                ],
              },
            },
          });
        }
      }
    }
    created++; process.stdout.write('✅');
  }
  console.log(`\n✅ ${created} new courses (${ALL_COURSES.length} total)`);

  for (const p of [
    { slug:'become-ai-engineer',         title:'Become an AI Engineer',        description:'Python → ML → Deep Learning → Production AI.',     avgSalary:'Rs 8–35 LPA', order:1 },
    { slug:'become-data-analyst',        title:'Become a Data Analyst',        description:'SQL → Python → Power BI → Business Intelligence.', avgSalary:'Rs 4–18 LPA', order:2 },
    { slug:'become-cybersecurity-expert',title:'Become a Cybersecurity Expert',description:'Networking → Linux → Ethical Hacking → CEH.',      avgSalary:'Rs 5–25 LPA', order:3 },
    { slug:'become-iot-developer',       title:'Become an IoT Developer',      description:'Arduino → Python → Cloud → Smart Systems.',         avgSalary:'Rs 4–15 LPA', order:4 },
    { slug:'become-full-stack-developer',title:'Become a Full Stack Developer',description:'Python/JS → React → Node.js → DevOps.',            avgSalary:'Rs 5–20 LPA', order:5 },
  ]) { await prisma.careerPath.upsert({ where: { slug: p.slug }, update: {}, create: p }); }
  console.log('✅ 5 career paths');

  for (const c of [
    { code:'LAUNCH50', discountPct:50, maxUses:500,  expiresAt: new Date(Date.now() + 30*24*60*60*1000) },
    { code:'STUDENT25',discountPct:25, maxUses:null, expiresAt: null },
    { code:'DEMO100',  discountPct:26, maxUses:200,  expiresAt: new Date(Date.now() + 60*24*60*60*1000) },
  ]) { await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: { ...c, isActive: true } }); }
  console.log('✅ 3 coupons (LAUNCH50 · STUDENT25 · DEMO100)');

  for (const post of [
    { slug:'ai-jobs-india-2025',        title:'AI Jobs in India 2025 — Complete Guide',       excerpt:'The AI market in India is set to cross Rs 40,000 crore.' },
    { slug:'python-vs-r-data-science',  title:'Python vs R — Which One for Data Science?',   excerpt:'Honest comparison from an Indian job market perspective.' },
    { slug:'rs-399-course-worth-it',    title:'A Course for Rs 399? Is It Really Any Good?', excerpt:'How we deliver premium content for just Rs 399.' },
    { slug:'machine-learning-roadmap',  title:'ML Roadmap 2025 — Beginner to Job-Ready',     excerpt:'Zero to ML engineer in 6 months.' },
    { slug:'cybersecurity-career-india',title:'Cybersecurity Career in India',               excerpt:'Average salary Rs 8-25 LPA. Demand is very high.' },
  ]) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug }, update: {},
      create: { ...post, content: `<h2>${post.title}</h2><p>${post.excerpt}</p>`, authorId: admin.id, isPublished: true, publishedAt: new Date() },
    });
  }
  console.log('✅ 5 blog posts');

  const student = await prisma.user.upsert({
    where: { email: 'demo@laximotech.ai' }, update: {},
    create: { email: 'demo@laximotech.ai', name: 'Demo Student', role: Role.STUDENT, xpPoints: 450, streakDays: 7, city: 'Greater Noida West' },
  });

  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: 'demo@laximotech.ai' } },
    update: { access_token: hashedPassword },
    create: { userId: student.id, type: 'credentials', provider: 'credentials', providerAccountId: 'demo@laximotech.ai', access_token: hashedPassword },
  });
  const firstThree = await prisma.course.findMany({ take: 3, where: { isPublished: true } });
  for (const course of firstThree) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course.id } }, update: {},
      create: { userId: student.id, courseId: course.id, progress: Math.floor(Math.random() * 80) + 10 },
    });
  }
  console.log('✅ Demo student + 3 enrollments');

  console.log('\n🎉 Seed complete!');
  console.log('   Admin:        admin@laximotech.ai');
  console.log('   Instructor:   instructor@laximotech.ai');
  console.log('   Demo Student: demo@laximotech.ai');
  console.log('   Courses:      25 total across 5 categories');
  console.log('   Coupons:      LAUNCH50 · STUDENT25 · DEMO100');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
