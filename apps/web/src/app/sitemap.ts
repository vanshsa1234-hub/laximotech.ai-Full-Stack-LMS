import { MetadataRoute } from 'next';

const BASE_URL = 'https://laximotech.ai';

const COURSE_SLUGS = [
  'ai-machine-learning-hindi',
  'data-science-beginners-hindi',
  'python-programming-hindi',
  'cybersecurity-ethical-hacking-hindi',
  'iot-robotics-arduino-hindi',
  'deep-learning-nlp-hindi',
  'sql-database-hindi',
  'web-development-hindi',
  'cloud-aws-hindi',
  'computer-vision-hindi',
  'natural-language-processing-hindi',
  'data-analyst-excel-hindi',
  'django-flask-hindi',
  'react-nextjs-hindi',
  'nodejs-backend-hindi',
  'devops-docker-hindi',
  'ethical-hacking-advanced-hindi',
  'network-security-hindi',
  'raspberry-pi-hindi',
  'embedded-systems-hindi',
  'statistics-data-science-hindi',
  'tableau-powerbi-hindi',
  'android-development-hindi',
  'machine-learning-projects-hindi',
  'generative-ai-chatgpt-hindi',
];

const BLOG_SLUGS = [
  'ai-jobs-india-2025',
  'python-vs-r-data-science',
  'rs-399-course-worth-it',
  'machine-learning-roadmap',
  'cybersecurity-career-india',
  'iot-projects-beginners',
];

const CAREER_PATH_SLUGS = [
  'become-ai-engineer',
  'become-data-analyst',
  'become-cybersecurity-expert',
  'become-iot-developer',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: BASE_URL,          lastModified: now, changeFrequency: 'daily'   as const, priority: 1.0 },
    { url: `${BASE_URL}/courses`, lastModified: now, changeFrequency: 'daily'   as const, priority: 0.9 },
    { url: `${BASE_URL}/blog`,    lastModified: now, changeFrequency: 'weekly'  as const, priority: 0.8 },
    { url: `${BASE_URL}/paths`,   lastModified: now, changeFrequency: 'weekly'  as const, priority: 0.8 },
    { url: `${BASE_URL}/about`,   lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/demo`,    lastModified: now, changeFrequency: 'weekly'  as const, priority: 0.7 },
    { url: `${BASE_URL}/verify`,  lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  const coursePages = COURSE_SLUGS.map(slug => ({
    url:              `${BASE_URL}/courses/${slug}`,
    lastModified:     now,
    changeFrequency:  'weekly' as const,
    priority:         0.9,
  }));

  const blogPages = BLOG_SLUGS.map(slug => ({
    url:             `${BASE_URL}/blog/${slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }));

  const pathPages = CAREER_PATH_SLUGS.map(slug => ({
    url:             `${BASE_URL}/paths/${slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }));

  return [...staticPages, ...coursePages, ...blogPages, ...pathPages];
}
