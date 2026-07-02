import { PrismaClient, CourseCategory, CourseLevel, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const ALL_COURSES: { slug:string;title:string;shortDesc:string;category:CourseCategory;level:CourseLevel;durationHrs:number;isFeatured:boolean }[] = [
  { slug:'ai-machine-learning-hindi',        title:'AI & Machine Learning — Hindi',           shortDesc:'Python se Deep Learning tak — Hindi mein.',              category:'AI_ML',               level:'BEGINNER',     durationHrs:42, isFeatured:true  },
  { slug:'deep-learning-nlp-hindi',          title:'Deep Learning & NLP — Advanced',           shortDesc:'Transformers, BERT, GPT architecture sikhein.',           category:'AI_ML',               level:'ADVANCED',     durationHrs:45, isFeatured:false },
  { slug:'computer-vision-hindi',            title:'Computer Vision with OpenCV',              shortDesc:'Image processing, object detection, face recognition.',   category:'AI_ML',               level:'INTERMEDIATE', durationHrs:38, isFeatured:false },
  { slug:'natural-language-processing-hindi',title:'NLP — Text Mining & Sentiment Analysis',  shortDesc:'NLP tasks, chatbots, BERT fine-tuning.',                  category:'AI_ML',               level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'machine-learning-projects-hindi',  title:'ML Projects — Build 10 Real Projects',    shortDesc:'House price, spam detection, movie recommender.',          category:'AI_ML',               level:'INTERMEDIATE', durationHrs:50, isFeatured:false },
  { slug:'generative-ai-chatgpt-hindi',      title:'Generative AI & ChatGPT — Hindi',          shortDesc:'OpenAI API, prompt engineering, LLM apps banana.',        category:'AI_ML',               level:'BEGINNER',     durationHrs:28, isFeatured:true  },
  { slug:'data-science-beginners-hindi',     title:'Data Science for Beginners — Hindi',       shortDesc:'Statistics, Python, SQL aur visualization.',             category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:38, isFeatured:true  },
  { slug:'sql-database-hindi',               title:'SQL & Database Design — Hindi',            shortDesc:'MySQL, PostgreSQL — database expert banein.',            category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:25, isFeatured:false },
  { slug:'statistics-data-science-hindi',    title:'Statistics for Data Science — Hindi',      shortDesc:'Probability, distributions, hypothesis testing.',         category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:30, isFeatured:false },
  { slug:'tableau-powerbi-hindi',            title:'Tableau & Power BI — Data Visualization', shortDesc:'Professional dashboards aur data stories banao.',        category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:22, isFeatured:false },
  { slug:'data-analyst-excel-hindi',         title:'Data Analyst with Excel & Python',         shortDesc:'Excel, pandas, matplotlib — analyst banein.',            category:'DATA_SCIENCE',         level:'BEGINNER',     durationHrs:28, isFeatured:false },
  { slug:'python-programming-hindi',         title:'Python Programming — Zero to Hero',        shortDesc:'Bilkul zero se Python expert banein.',                   category:'PROGRAMMING',          level:'BEGINNER',     durationHrs:30, isFeatured:false },
  { slug:'web-development-hindi',            title:'Full Stack Web Development — Hindi',       shortDesc:'React + Node.js se full stack developer banein.',        category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:55, isFeatured:true  },
  { slug:'django-flask-hindi',               title:'Django & Flask — Backend Python Web',      shortDesc:'Python se web apps aur REST APIs banana.',               category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'react-nextjs-hindi',               title:'React & Next.js — Modern Frontend',        shortDesc:'React hooks, Next.js 14, Tailwind CSS sikhein.',         category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:42, isFeatured:false },
  { slug:'nodejs-backend-hindi',             title:'Node.js & Express — Backend Development',  shortDesc:'REST APIs, authentication, database — Hindi mein.',      category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:38, isFeatured:false },
  { slug:'android-development-hindi',        title:'Android Development with Kotlin',          shortDesc:'Native Android apps banana Kotlin se.',                  category:'PROGRAMMING',          level:'INTERMEDIATE', durationHrs:45, isFeatured:false },
  { slug:'iot-robotics-arduino-hindi',       title:'IoT & Robotics with Arduino',              shortDesc:'Arduino + Raspberry Pi se real robots banao.',           category:'ROBOTICS_IOT',         level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'raspberry-pi-hindi',               title:'Raspberry Pi Projects — Hindi',             shortDesc:'Linux, Python, GPIO — Raspberry Pi se kya kya ban sakta.', category:'ROBOTICS_IOT',    level:'INTERMEDIATE', durationHrs:30, isFeatured:false },
  { slug:'embedded-systems-hindi',           title:'Embedded Systems & Microcontrollers',      shortDesc:'8051, STM32, real-time systems — Hindi mein.',           category:'ROBOTICS_IOT',         level:'ADVANCED',     durationHrs:40, isFeatured:false },
  { slug:'devops-docker-hindi',              title:'DevOps, Docker & Kubernetes — Hindi',      shortDesc:'CI/CD, containers, cloud deployment sikhein.',           category:'ROBOTICS_IOT',         level:'INTERMEDIATE', durationHrs:35, isFeatured:false },
  { slug:'cybersecurity-ethical-hacking-hindi',title:'Cybersecurity & Ethical Hacking',        shortDesc:'Ethical hacking, pentesting — legally sikhein.',         category:'CYBERSECURITY_CLOUD',  level:'INTERMEDIATE', durationHrs:40, isFeatured:true  },
  { slug:'network-security-hindi',           title:'Network Security & CCNA Prep — Hindi',     shortDesc:'Networking fundamentals, Cisco CCNA preparation.',        category:'CYBERSECURITY_CLOUD',  level:'BEGINNER',     durationHrs:32, isFeatured:false },
  { slug:'cloud-aws-hindi',                  title:'AWS Cloud Fundamentals — Hindi',            shortDesc:'AWS services — cloud architect ke liye foundation.',      category:'CYBERSECURITY_CLOUD',  level:'INTERMEDIATE', durationHrs:32, isFeatured:false },
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
        description: `${c.title} — India ka best course in Hindi at Rs 399. Certificate included. Lifetime access.`,
        price: 399, level: c.level, category: c.category, language: 'Hindi + English',
        durationHrs: c.durationHrs, totalLessons: 16, isPublished: true, isFeatured: c.isFeatured,
        instructorId: instructor.id,
        metaTitle: `${c.title} | Rs 399 | laximotech.ai`,
        metaDesc: `${c.shortDesc} Learn in Hindi. Certificate included. Only Rs 399.`,
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
                    question: `Is course ke "${sections[si]}" section mein aapne kya seekha — sabse important concept kya tha?`,
                    options: [
                      'Core fundamentals jo is section mein cover hue',
                      'Kuch bhi nahi, section skip kar diya',
                      'Sirf theory, koi practical nahi',
                      'Unrelated topic',
                    ],
                    correctIndex: 0,
                    explanation: 'Har section ke fundamentals agle section ke liye foundation banate hain — isliye revise karna important hai.',
                  },
                  {
                    order: 2,
                    question: `"${c.title}" course mein practical projects ka kya purpose hai?`,
                    options: [
                      'Sirf time pass karna',
                      'Real-world application aur portfolio building',
                      'Course ko lamba karna',
                      'Koi purpose nahi',
                    ],
                    correctIndex: 1,
                    explanation: 'Practical projects aapko interview aur job applications ke liye real portfolio dete hain.',
                  },
                  {
                    order: 3,
                    question: 'Agar koi concept samajh na aaye toh sabse pehle kya karna chahiye?',
                    options: [
                      'Course chhod dena',
                      'Lesson dobara dekhna ya AI Study Buddy se poochna',
                      'Ignore karke aage badh jaana',
                      'Kisi aur course pe switch karna',
                    ],
                    correctIndex: 1,
                    explanation: 'AI Study Buddy aur lesson re-watch dono available hain — inka use karna seekhne ka best tareeka hai.',
                  },
                  {
                    order: 4,
                    question: 'Certificate paane ke liye kya zaroori hai?',
                    options: [
                      'Sirf videos dekhna',
                      'Sabhi sections ke quizzes pass karna aur final exam clear karna',
                      'Course ko share karna',
                      'Kuch bhi nahi',
                    ],
                    correctIndex: 1,
                    explanation: 'Certificate tabhi issue hota hai jab aap final exam mein passing score (70%+) le aate hain.',
                  },
                  {
                    order: 5,
                    question: `${c.category.replace('_', ' ')} field mein career banane ke liye is course ke baad agla step kya hona chahiye?`,
                    options: [
                      'Practical projects banao aur portfolio mein add karo',
                      'Kuch mat karo',
                      'Course bhool jaao',
                      'Sirf certificate dikhao, skills practice mat karo',
                    ],
                    correctIndex: 0,
                    explanation: 'Skills ko real projects mein apply karna hi job-readiness ka sabse important step hai.',
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
    { slug:'ai-jobs-india-2025',        title:'AI Jobs in India 2025 — Complete Guide',       excerpt:'AI market India mein Rs 40,000 crore ke paar ho jayega.' },
    { slug:'python-vs-r-data-science',  title:'Python vs R — Data Science ke liye kaunsa?',  excerpt:'Honest comparison Indian job market perspective se.' },
    { slug:'rs-399-course-worth-it',    title:'Rs 399 mein Course? Kya Sach Mein Itna Acha?',excerpt:'Kaise hum Rs 399 mein premium content dete hain.' },
    { slug:'machine-learning-roadmap',  title:'ML Roadmap 2025 — Beginner to Job-Ready',     excerpt:'Zero se ML engineer 6 mahine mein.' },
    { slug:'cybersecurity-career-india',title:'Cybersecurity Career in India',               excerpt:'Average salary Rs 8-25 LPA. Bahut demand hai.' },
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
