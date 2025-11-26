/**
 * Production-Quality Echo Tuition Marketplace Data
 * Real educational content with comprehensive courses, modules, and lessons
 */

export interface Teacher {
  id: number;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  yearsExperience: number;
  specializations: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  responseTime: string;
  verified: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'live';
  isFree: boolean;
  videoUrl?: string; // YouTube or video URL for the lesson
  resources?: string[];
  content?: string; // Detailed lesson content
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  duration: number; // total duration in minutes
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  subject: string;
  category: string;
  level:
    | 'elementary'
    | 'middle_school'
    | 'high_school'
    | 'college'
    | 'professional'
    | 'all_levels';
  description: string;
  longDescription: string;
  thumbnail: string;
  demoVideo?: string; // YouTube or video URL for course preview
  teacherId: number;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number; // in weeks
  totalHours: number;
  sessionsPerWeek: number;
  mode: 'online' | 'offline' | 'hybrid';
  language: string;
  enrolledStudents: number;
  maxStudents: number;
  rating: number;
  totalReviews: number;
  startDate: string;
  schedule: string[];
  modules: CourseModule[];
  learningOutcomes: string[];
  prerequisites: string[];
  targetAudience: string[];
  features: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  tags: string[];
}

export interface Review {
  id: number;
  courseId: number;
  studentName: string;
  studentAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
  subcategories: string[];
}

// Teachers Data - Educators
export const teachers: Teacher[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    title: 'Mathematics & MIT Research Scholar',
    bio: 'PhD in Mathematics from MIT with 15 years of teaching experience. Specialized in making complex mathematical concepts simple and engaging. Former Mathematics Olympiad coach with students at top universities worldwide. Published researcher in Applied Mathematics and Education Technology.',
    rating: 4.9,
    totalStudents: 2847,
    totalCourses: 12,
    yearsExperience: 15,
    specializations: [
      'Calculus',
      'Linear Algebra',
      'Statistics',
      'Advanced Mathematics',
      'JEE Advanced Math',
    ],
    education: [
      'PhD Mathematics - MIT',
      'MSc Mathematics - Stanford University',
      'BSc Honours Mathematics - Cambridge',
    ],
    certifications: [
      'Certified Math Educator - NCTM',
      'Online Teaching Excellence Award 2023',
      'Google Certified Educator Level 2',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=12',
    title: 'Physics & IIT Delhi Alumnus',
    bio: "Former IIT Delhi professor with 18 years of teaching experience. Skilled in making physics concepts come alive through real-world applications and experiments. Trained over 500+ JEE Advanced qualifiers including AIR holders. Author of 'Modern Physics Made Easy' bestselling book series.",
    rating: 4.8,
    totalStudents: 3210,
    totalCourses: 15,
    yearsExperience: 18,
    specializations: [
      'Classical Mechanics',
      'Electromagnetism',
      'Quantum Physics',
      'Thermodynamics',
      'JEE Physics',
    ],
    education: [
      'PhD Physics - IIT Delhi',
      'MTech Engineering Physics - IIT Bombay',
      'BTech - IIT Bombay',
    ],
    certifications: [
      'Physics Olympiad National Trainer',
      'CBSE Physics Subject Specialist',
      'Coursera Top Instructor 2022',
    ],
    languages: ['English', 'Hindi', 'Punjabi'],
    responseTime: '< 1 hour',
    verified: true,
  },
  {
    id: 3,
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=5',
    title: 'Organic Chemistry & NEET Specialist',
    bio: 'Research scientist at Oxford turned passionate educator. Specializes in organic chemistry and NEET preparation with innovative teaching methods. Her students have achieved 100+ NEET selections in AIIMS and top medical colleges. Known for making complex reaction mechanisms crystal clear.',
    rating: 4.9,
    totalStudents: 1956,
    totalCourses: 10,
    yearsExperience: 12,
    specializations: [
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'NEET Chemistry',
      'Reaction Mechanisms',
    ],
    education: [
      'PhD Organic Chemistry - Oxford University',
      'MSc Chemistry - Delhi University',
      'BSc Chemistry Honours - Miranda House',
    ],
    certifications: [
      'NEET Chemistry Master Trainer',
      'JEE Advanced Chemistry Specialist',
      'Royal Society of Chemistry Fellow',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 3 hours',
    verified: true,
  },
  {
    id: 4,
    name: 'Arjun Mehta',
    avatar: 'https://i.pravatar.cc/150?img=13',
    title: 'Software Engineer & Full Stack Developer',
    bio: '10+ years at Google, Microsoft, and leading tech startups. Passionate about teaching programming and making it accessible to everyone. Built products used by millions. Mentor to 1000+ developers who are now working at top tech companies. Believes in project-based learning and real-world applications.',
    rating: 4.9,
    totalStudents: 5432,
    totalCourses: 20,
    yearsExperience: 10,
    specializations: [
      'Python',
      'JavaScript',
      'React',
      'Node.js',
      'Data Structures & Algorithms',
      'System Design',
    ],
    education: [
      'BTech Computer Science - BITS Pilani',
      'Google Cloud Architect Certification',
      'Meta Frontend Developer Professional',
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional',
      'Meta Frontend Developer',
      'Oracle Java Certified',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 4 hours',
    verified: true,
  },
  {
    id: 5,
    name: 'Anita Desai',
    avatar: 'https://i.pravatar.cc/150?img=9',
    title: 'IELTS Official Examiner & English Literature',
    bio: 'Award-winning English teacher and official IELTS examiner with 14 years of experience. MA in English Literature from Cambridge. Helped 2000+ students achieve their dream band scores. Skilled in creative writing, literature analysis, and IELTS/TOEFL preparation. Featured speaker at international education conferences.',
    rating: 4.8,
    totalStudents: 2134,
    totalCourses: 8,
    yearsExperience: 14,
    specializations: [
      'IELTS',
      'TOEFL',
      'English Grammar',
      'Creative Writing',
      'Business English',
      'Literature Analysis',
    ],
    education: [
      'MA English Literature - Cambridge University',
      "BA English Honours - St. Stephen's College",
      'CELTA Certification',
    ],
    certifications: [
      'IELTS Official Examiner',
      'TOEFL Official Rater',
      'CELTA Certified Teacher',
      'Creative Writing Workshop Leader',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 6,
    name: 'Vikram Singh',
    avatar: 'https://i.pravatar.cc/150?img=14',
    title: 'MBBS & NEET Biology',
    bio: "AIIMS Delhi graduate and practicing medical doctor with 16 years of teaching experience. Specializes in making biology concepts memorable through clinical correlations and mnemonics. Students consistently score 350+ in NEET Biology. Author of 'Biology Simplified' NEET preparation series trusted by thousands of aspirants.",
    rating: 4.9,
    totalStudents: 3890,
    totalCourses: 14,
    yearsExperience: 16,
    specializations: [
      'Human Anatomy',
      'Physiology',
      'Genetics',
      'Botany',
      'Zoology',
      'NEET Biology',
    ],
    education: [
      'MBBS - AIIMS Delhi',
      'MD General Medicine',
      'PhD Molecular Biology - JNU',
    ],
    certifications: [
      'NEET Biology Topper Mentor',
      'National Biology Olympiad Coach',
      'Medical Education Specialist',
    ],
    languages: ['English', 'Hindi', 'Punjabi'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 7,
    name: 'Robert Chen',
    avatar: 'https://i.pravatar.cc/150?img=33',
    title: 'Data Science & AI/ML',
    bio: "Former Data Science Lead at Amazon and Netflix. Stanford PhD in Machine Learning. Passionate about democratizing AI education. Built recommendation systems used by millions. Author of 'Practical Machine Learning' bestseller. Mentored 500+ data scientists now working at FAANG companies.",
    rating: 4.9,
    totalStudents: 4521,
    totalCourses: 18,
    yearsExperience: 12,
    specializations: [
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'Python',
      'TensorFlow',
      'PyTorch',
    ],
    education: [
      'PhD Machine Learning - Stanford',
      'MS Computer Science - Carnegie Mellon',
      'BTech - IIT Bombay',
    ],
    certifications: [
      'Google Cloud ML Engineer',
      'AWS ML Specialty',
      'TensorFlow Developer Certificate',
      'Kaggle Grandmaster',
    ],
    languages: ['English', 'Mandarin', 'Hindi'],
    responseTime: '< 3 hours',
    verified: true,
  },
  {
    id: 8,
    name: 'Maria Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=45',
    title: 'Spanish Language & Cultural Ambassador',
    bio: 'Native Spanish speaker from Madrid with 11 years of language teaching experience. Specializes in conversational Spanish and cultural immersion. Certified DELE examiner. Helped 1500+ students achieve fluency. Uses immersive teaching methods that make learning Spanish fun and natural.',
    rating: 4.8,
    totalStudents: 2890,
    totalCourses: 9,
    yearsExperience: 11,
    specializations: [
      'Conversational Spanish',
      'Business Spanish',
      'DELE Preparation',
      'Spanish Grammar',
      'Latin American Culture',
    ],
    education: [
      'MA Spanish Linguistics - Universidad Complutense Madrid',
      'BA Hispanic Studies - Salamanca',
      'DELE C2 Certificate',
    ],
    certifications: [
      'DELE Official Examiner',
      'Instituto Cervantes Accredited',
      'Polyglot Language Teacher',
    ],
    languages: ['Spanish', 'English', 'Portuguese', 'French'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 9,
    name: 'Rahul Sharma',
    avatar: 'https://i.pravatar.cc/150?img=15',
    title: 'Digital Marketing & Growth Hacker',
    bio: 'Former Digital Marketing Head at top unicorns. Scaled brands from zero to millions in revenue. Certified by Google, Facebook, and HubSpot. 9 years helping businesses grow through digital channels. Built viral campaigns with 100M+ reach. Skilled in SEO, paid ads, social media, and content marketing.',
    rating: 4.9,
    totalStudents: 3245,
    totalCourses: 11,
    yearsExperience: 9,
    specializations: [
      'SEO',
      'Social Media Marketing',
      'Google Ads',
      'Facebook Ads',
      'Content Marketing',
      'Growth Hacking',
    ],
    education: [
      'MBA Marketing - IIM Ahmedabad',
      'BTech - IIT Delhi',
      'Digital Marketing Nanodegree - Udacity',
    ],
    certifications: [
      'Google Ads Certified',
      'Facebook Blueprint Certified',
      'HubSpot Content Marketing',
      'Google Analytics Certified',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 3 hours',
    verified: true,
  },
  {
    id: 10,
    name: 'Priya Kapoor',
    avatar: 'https://i.pravatar.cc/150?img=47',
    title: 'UX Designer at Google',
    bio: 'Senior Product Designer at Google with 8 years of experience. Worked on products used by billions. Skilled in Figma, design systems, and user research. Mentored 300+ designers who got jobs at top tech companies. Passionate about teaching design thinking and creating beautiful, user-centered products.',
    rating: 4.9,
    totalStudents: 2567,
    totalCourses: 7,
    yearsExperience: 8,
    specializations: [
      'UI/UX Design',
      'Figma',
      'Design Systems',
      'User Research',
      'Prototyping',
      'Visual Design',
    ],
    education: [
      'MDes Interaction Design - NID Ahmedabad',
      'BTech - IIIT Hyderabad',
      'Google UX Design Certificate',
    ],
    certifications: [
      'Adobe Certified Professional',
      'Figma Professional',
      'Design Thinking Facilitator',
      'UX Certification - Nielsen Norman',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 11,
    name: 'Amit Gupta',
    avatar: 'https://i.pravatar.cc/150?img=60',
    title: 'Stock Market & CFA Charterholder',
    bio: "CFA charterholder and professional trader with 15 years in financial markets. Former VP at Goldman Sachs. Helped 2000+ students start their trading journey. Specializes in technical analysis, fundamental analysis, and risk management. Author of 'Smart Trading for Indians' bestseller.",
    rating: 4.8,
    totalStudents: 4123,
    totalCourses: 13,
    yearsExperience: 15,
    specializations: [
      'Stock Trading',
      'Technical Analysis',
      'Fundamental Analysis',
      'Options Trading',
      'Risk Management',
      'Portfolio Management',
    ],
    education: [
      'CFA Charter',
      'MBA Finance - FMS Delhi',
      'BCom Honours - SRCC',
    ],
    certifications: [
      'CFA Charterholder',
      'CMT (Chartered Market Technician)',
      'NSE Certified Market Professional',
      'NISM Certified',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 4 hours',
    verified: true,
  },
  {
    id: 12,
    name: 'Sneha Reddy',
    avatar: 'https://i.pravatar.cc/150?img=32',
    title: 'Communication Coach & TEDx Speaker',
    bio: 'Professional communication coach and TEDx speaker with 10 years of experience. Trained 5000+ professionals in public speaking and business communication. Former corporate trainer at TCS and Infosys. Helps students overcome stage fear and speak confidently. Featured in Forbes 30 Under 30.',
    rating: 4.9,
    totalStudents: 3678,
    totalCourses: 10,
    yearsExperience: 10,
    specializations: [
      'Public Speaking',
      'Business Communication',
      'Soft Skills',
      'Interview Preparation',
      'Personality Development',
      'English Speaking',
    ],
    education: [
      'MA English - Delhi University',
      "BA Psychology - St. Xavier's",
      'Dale Carnegie Certification',
    ],
    certifications: [
      'Certified Professional Speaker',
      'TEDx Speaker',
      'Dale Carnegie Trainer',
      'IELTS Speaking Examiner',
    ],
    languages: ['English', 'Hindi', 'Telugu'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 13,
    name: 'David Lee',
    avatar: 'https://i.pravatar.cc/150?img=51',
    title: 'Blockchain Developer & Web3',
    bio: 'Blockchain architect with 7 years in Web3 space. Built DeFi protocols with $100M+ TVL. Former blockchain lead at ConsenSys. Ethereum Foundation grant recipient. Passionate about teaching blockchain development. 500+ students built their first dApps under his guidance.',
    rating: 4.8,
    totalStudents: 1890,
    totalCourses: 8,
    yearsExperience: 7,
    specializations: [
      'Blockchain Development',
      'Smart Contracts',
      'Solidity',
      'Web3',
      'DeFi',
      'NFTs',
    ],
    education: [
      'MS Computer Science - UC Berkeley',
      'BTech - IIT Bombay',
      'Ethereum Developer Certification',
    ],
    certifications: [
      'Certified Blockchain Developer',
      'Ethereum Foundation Grant Recipient',
      'Consensys Academy Graduate',
    ],
    languages: ['English', 'Korean', 'Hindi'],
    responseTime: '< 5 hours',
    verified: true,
  },
  {
    id: 14,
    name: 'Kavita Menon',
    avatar: 'https://i.pravatar.cc/150?img=38',
    title: 'Content Writer & Copywriting',
    bio: 'Professional copywriter and content strategist with 11 years of experience. Written for brands like Apple, Amazon, and Microsoft. Helped 1000+ students become successful freelance writers. Skilled in SEO writing, persuasive copywriting, and storytelling. Published author of 3 books.',
    rating: 4.9,
    totalStudents: 2456,
    totalCourses: 9,
    yearsExperience: 11,
    specializations: [
      'Copywriting',
      'Content Writing',
      'SEO Writing',
      'Creative Writing',
      'Storytelling',
      'Freelance Writing',
    ],
    education: [
      'MA Journalism - Columbia University',
      'BA English Literature - Lady Shri Ram College',
      'Content Marketing Certification - HubSpot',
    ],
    certifications: [
      'Certified Content Marketer',
      'Google Content Writing Expert',
      'Published Author',
      'Freelancer Success Award',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 3 hours',
    verified: true,
  },
  {
    id: 15,
    name: 'Yogi Adityanath Sharma',
    avatar: 'https://i.pravatar.cc/150?img=68',
    title: 'Certified Yoga Instructor & Wellness Coach',
    bio: 'RYT 500 certified yoga instructor with 13 years of teaching experience. Studied at Rishikesh Yoga Institute. Helped 3000+ students improve their physical and mental health. Specializes in Hatha Yoga, Vinyasa, and therapeutic yoga. Featured wellness specialist on TV shows.',
    rating: 4.8,
    totalStudents: 3234,
    totalCourses: 12,
    yearsExperience: 13,
    specializations: [
      'Hatha Yoga',
      'Vinyasa Yoga',
      'Meditation',
      'Pranayama',
      'Therapeutic Yoga',
      'Wellness Coaching',
    ],
    education: [
      'RYT 500 - Yoga Alliance',
      'Diploma in Naturopathy',
      'BA Philosophy - Banaras Hindu University',
    ],
    certifications: [
      'RYT 500 Yoga Alliance',
      'Certified Wellness Coach',
      'Meditation Teacher Training',
      'Ayurveda Practitioner',
    ],
    languages: ['English', 'Hindi', 'Sanskrit'],
    responseTime: '< 2 hours',
    verified: true,
  },
  {
    id: 16,
    name: 'Alex Thompson',
    avatar: 'https://i.pravatar.cc/150?img=70',
    title: 'Professional Photographer & Videographer',
    bio: 'Award-winning photographer with 12 years of experience. Shot for National Geographic, Vogue, and leading brands. Skilled in portrait, landscape, and commercial photography. Taught 2000+ students the art of visual storytelling. Sony and Canon brand ambassador. Featured in photography exhibitions worldwide.',
    rating: 4.9,
    totalStudents: 2789,
    totalCourses: 10,
    yearsExperience: 12,
    specializations: [
      'Portrait Photography',
      'Landscape Photography',
      'Commercial Photography',
      'Photo Editing',
      'Lightroom',
      'Photoshop',
    ],
    education: [
      'BA Photography - London College of Communication',
      'Certificate in Visual Arts',
      'Sony Alpha Professional',
    ],
    certifications: [
      'Sony Brand Ambassador',
      'Canon Professional',
      'Adobe Certified Expert',
      'Photography Excellence Award',
    ],
    languages: ['English'],
    responseTime: '< 4 hours',
    verified: true,
  },
  {
    id: 17,
    name: 'Neha Agarwal',
    avatar: 'https://i.pravatar.cc/150?img=44',
    title: 'Data Analyst & Excel MVP',
    bio: "Microsoft Excel MVP and data analytics specialist with 10 years of experience. Former Business Analyst at McKinsey. Helped 4000+ professionals master Excel and data analysis. Skilled in Power BI, SQL, and business intelligence. Author of 'Excel Mastery for Business' bestseller.",
    rating: 4.9,
    totalStudents: 5234,
    totalCourses: 14,
    yearsExperience: 10,
    specializations: [
      'Excel',
      'Power BI',
      'SQL',
      'Data Visualization',
      'Business Analytics',
      'Data Analysis',
    ],
    education: [
      'MBA Business Analytics - ISB Hyderabad',
      'BTech - BITS Pilani',
      'Microsoft Data Analyst Certification',
    ],
    certifications: [
      'Microsoft Excel MVP',
      'Power BI Expert',
      'Tableau Desktop Specialist',
      'Google Data Analytics Certificate',
    ],
    languages: ['English', 'Hindi'],
    responseTime: '< 2 hours',
    verified: true,
  },
];

// Comprehensive Courses with Detailed Curriculum
export const courses: Course[] = [
  {
    id: 1,
    title: 'Complete Calculus Mastery: From Zero to Advanced',
    slug: 'complete-calculus-mastery',
    subject: 'Mathematics',
    category: 'Science & Math',
    level: 'high_school',
    description:
      'Master calculus from fundamentals to advanced topics with practical problem-solving techniques and JEE preparation',
    longDescription:
      'This comprehensive calculus course takes you from absolute basics to advanced concepts in differential and integral calculus. Perfect for high school students, JEE aspirants, and anyone wanting to build a strong mathematical foundation. Learn through interactive visualizations, real-world applications, and 500+ practice problems. Every concept is explained with multiple approaches - algebraic, geometric, and intuitive. Includes special modules for competitive exam strategies and shortcuts.',
    thumbnail:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/WUvTyaaNkzM', // Essence of Calculus
    teacherId: 1,
    price: 2999,
    originalPrice: 4999,
    currency: 'INR',
    duration: 16,
    totalHours: 52,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 847,
    maxStudents: 1000,
    rating: 4.9,
    totalReviews: 456,
    startDate: '2025-11-01',
    schedule: ['Mon 6:00 PM', 'Wed 6:00 PM', 'Fri 6:00 PM'],
    learningOutcomes: [
      'Master limits, continuity, and differentiability with deep conceptual understanding',
      'Solve complex differentiation problems using all rules and techniques',
      'Apply derivatives to optimization, rate of change, and curve sketching problems',
      'Master integration techniques including substitution, parts, and partial fractions',
      'Solve definite integrals and apply them to area, volume calculations',
      'Tackle JEE Advanced level calculus problems with confidence',
      'Understand applications in physics, economics, and engineering',
      'Develop strong problem-solving and analytical thinking skills',
    ],
    prerequisites: [
      'Strong foundation in algebra and basic functions',
      'Understanding of trigonometry (sin, cos, tan and their graphs)',
      'Knowledge of coordinate geometry basics',
      'Class 10 mathematics completed or equivalent',
    ],
    targetAudience: [
      'High school students (Class 11-12) studying calculus',
      'JEE Main and Advanced aspirants',
      'SAT/AP Calculus exam takers',
      'Engineering students needing strong calculus foundation',
      'Anyone passionate about mathematics',
    ],
    features: [
      '52 hours of comprehensive video lectures',
      '500+ practice problems with detailed solutions',
      'Weekly live doubt clearing sessions',
      'Interactive Desmos visualizations for every concept',
      'JEE Previous Year Questions (1990-2024) with solutions',
      'Downloadable formula sheets and quick reference guides',
      'Monthly tests with performance analytics',
      'Lifetime access to all course materials',
      'Certificate of completion',
      'Direct WhatsApp access to instructor',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    tags: [
      'Calculus',
      'JEE',
      'Advanced Math',
      'Problem Solving',
      'Differentiation',
      'Integration',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Limits and Continuity - Building the Foundation',
        description:
          'Master the fundamental concept of limits which forms the backbone of calculus. Understand what calculus is really about and why limits matter.',
        duration: 420,
        lessons: [
          {
            id: 1,
            title: 'The Birth of Calculus: Historical Context',
            description:
              'Understand why calculus was invented and how Newton and Leibniz revolutionized mathematics',
            duration: 25,
            type: 'video',
            isFree: true,
            content:
              'Explore the fascinating story of how calculus emerged from problems in physics and geometry. Learn about the contributions of Newton, Leibniz, and other mathematicians.',
          },
          {
            id: 2,
            title: 'What is a Limit? Intuitive Understanding',
            description:
              'Build an intuitive understanding of limits through visual examples and real-world scenarios',
            duration: 35,
            type: 'video',
            isFree: true,
            content:
              "Understand limits as 'approaching' rather than 'reaching'. Visualize limits using graphs and animations. Learn why limits are the foundation of calculus.",
          },
          {
            id: 3,
            title: 'Formal Definition and Notation of Limits',
            description:
              'Learn the mathematical notation and formal epsilon-delta definition',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master the lim notation. Understand left-hand and right-hand limits. Learn the epsilon-delta definition for rigorous proofs.',
          },
          {
            id: 4,
            title: 'Evaluating Limits: Direct Substitution',
            description:
              'Calculate limits by direct substitution when functions are continuous',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Learn when direct substitution works. Practice evaluating limits of polynomials, rational functions, and trigonometric expressions.',
          },
          {
            id: 5,
            title: 'Indeterminate Forms: 0/0 and ∞/∞',
            description:
              'Handle indeterminate forms using factoring and rationalization techniques',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Recognize indeterminate forms. Master factoring, rationalization, and algebraic manipulation to resolve them.',
          },
          {
            id: 6,
            title: "L'Hôpital's Rule for Indeterminate Forms",
            description: 'Use differentiation to evaluate tricky limits',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              "Learn when and how to apply L'Hôpital's rule. Solve challenging limit problems efficiently.",
          },
          {
            id: 7,
            title: 'Limits at Infinity and Infinite Limits',
            description:
              'Understand behavior of functions as x approaches infinity',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Master horizontal and vertical asymptotes. Understand end behavior of rational and exponential functions.',
          },
          {
            id: 8,
            title: 'Squeeze Theorem (Sandwich Theorem)',
            description:
              'Use the squeeze theorem for limits involving trigonometric functions',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Understand the squeeze theorem conceptually. Apply it to prove important limits like lim(sin x)/x = 1.',
          },
          {
            id: 9,
            title: 'Continuity: Definition and Types',
            description:
              'Learn what makes a function continuous and identify discontinuities',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Understand continuous functions. Classify discontinuities: removable, jump, and infinite.',
          },
          {
            id: 10,
            title: 'Intermediate Value Theorem',
            description: 'Apply IVT to prove existence of roots and solutions',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Understand the Intermediate Value Theorem. Use it to prove existence of solutions to equations.',
          },
          {
            id: 11,
            title: 'Practice Session: 50 Limit Problems',
            description:
              'Solve a variety of limit problems from basic to JEE Advanced level',
            duration: 45,
            type: 'assignment',
            isFree: false,
            resources: [
              'Limit Problems PDF',
              'Solutions with Explanations',
              'JEE Previous Year Questions',
            ],
            content:
              'Comprehensive problem set covering all limit techniques learned in this module.',
          },
          {
            id: 12,
            title: 'Module 1 Assessment Quiz',
            description: 'Test your understanding of limits and continuity',
            duration: 30,
            type: 'quiz',
            isFree: false,
            content:
              '20 multiple choice questions covering all concepts from Module 1. Instant feedback and explanations.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Differential Calculus - The Power of Derivatives',
        description:
          'Master differentiation - the process of finding rates of change. Learn all differentiation rules and apply them to solve real-world problems.',
        duration: 600,
        lessons: [
          {
            id: 13,
            title: 'Introduction to Derivatives: The Concept of Rate of Change',
            description:
              "Understand what derivatives represent and why they're powerful",
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              "Visualize derivatives as slopes and rates of change. Understand the definition using limits: f'(x) = lim(h→0)[f(x+h)-f(x)]/h",
          },
          {
            id: 14,
            title: 'Derivative Notation and First Principles',
            description:
              'Learn different notations and derive derivatives from first principles',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              "Master notations: f'(x), dy/dx, df/dx. Calculate derivatives using the limit definition (first principles).",
          },
          {
            id: 15,
            title: 'Power Rule: The Fundamental Differentiation Rule',
            description:
              'Learn and apply the power rule to polynomial functions',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Master d/dx(x^n) = nx^(n-1). Apply to polynomials and functions with negative/fractional exponents.',
          },
          {
            id: 16,
            title: 'Product Rule and Quotient Rule',
            description: 'Differentiate products and quotients of functions',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              "Learn (uv)' = u'v + uv' and (u/v)' = (u'v - uv')/v². Master application with complex functions.",
          },
          {
            id: 17,
            title: 'Chain Rule: Differentiating Composite Functions',
            description: 'Master the most powerful differentiation rule',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand composition of functions. Learn dy/dx = dy/du × du/dx. Solve challenging nested functions.',
          },
          {
            id: 18,
            title: 'Derivatives of Trigonometric Functions',
            description:
              'Master differentiation of sin, cos, tan and their combinations',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Derive and memorize derivatives of all six trig functions. Apply chain rule to complex trig expressions.',
          },
          {
            id: 19,
            title: 'Derivatives of Exponential and Logarithmic Functions',
            description: 'Differentiate e^x, a^x, ln(x) and log_a(x)',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master d/dx(e^x) = e^x and d/dx(ln x) = 1/x. Handle exponential and logarithmic combinations.',
          },
          {
            id: 20,
            title: 'Implicit Differentiation',
            description:
              'Differentiate equations where y is not explicitly defined',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn to differentiate equations like x² + y² = 1. Master the technique of treating y as a function of x.',
          },
          {
            id: 21,
            title: 'Higher Order Derivatives',
            description: 'Calculate second, third, and nth derivatives',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              "Understand f''(x), f'''(x), and f^(n)(x). Learn applications in physics (velocity, acceleration, jerk).",
          },
          {
            id: 22,
            title: 'Parametric Differentiation',
            description: 'Differentiate parametrically defined functions',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Master dy/dx when x = f(t) and y = g(t). Apply to curves defined parametrically.',
          },
          {
            id: 23,
            title: 'Logarithmic Differentiation',
            description: 'Use logarithms to simplify complex differentiations',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn when to use logarithmic differentiation. Handle products, quotients, and powers efficiently.',
          },
          {
            id: 24,
            title: 'Applications: Tangents and Normals',
            description: 'Find equations of tangent and normal lines to curves',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Use derivatives to find slopes. Write equations of tangent and normal lines at any point.',
          },
          {
            id: 25,
            title: 'Applications: Rate of Change Problems',
            description: 'Solve real-world problems involving rates of change',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Apply derivatives to physics (velocity, acceleration), economics (marginal cost), and geometry problems.',
          },
          {
            id: 26,
            title: 'Applications: Maxima and Minima',
            description: 'Find maximum and minimum values using derivatives',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master first and second derivative tests. Solve optimization problems from various fields.',
          },
          {
            id: 27,
            title: 'Applications: Curve Sketching',
            description: 'Use derivatives to analyze and sketch curves',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Find critical points, inflection points, concavity. Sketch accurate graphs using calculus.',
          },
          {
            id: 28,
            title: 'Live Problem Solving: Differentiation Masterclass',
            description:
              'Interactive session solving JEE and Olympiad level problems',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Live session with Sarah Johnson solving challenging problems and answering student questions.',
          },
          {
            id: 29,
            title: 'Practice: 100 Differentiation Problems',
            description:
              'Comprehensive problem set covering all differentiation techniques',
            duration: 60,
            type: 'assignment',
            isFree: false,
            resources: [
              'Differentiation Problems PDF',
              'Detailed Solutions',
              'JEE PYQs 2015-2024',
            ],
            content:
              'Problems ranging from basic to JEE Advanced level covering all concepts.',
          },
          {
            id: 30,
            title: 'Module 2 Assessment',
            description: 'Comprehensive test on differential calculus',
            duration: 45,
            type: 'quiz',
            isFree: false,
            content:
              '30 questions testing all aspects of differentiation. Detailed feedback provided.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Integral Calculus - Reverse Engineering Derivatives',
        description:
          'Master integration - the reverse process of differentiation. Learn techniques to evaluate indefinite and definite integrals and apply them to area, volume calculations.',
        duration: 660,
        lessons: [
          {
            id: 31,
            title: 'Introduction to Integration: The Concept',
            description:
              'Understand integration as anti-differentiation and accumulation',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Visualize integration as area under curves. Understand the relationship between differentiation and integration.',
          },
          {
            id: 32,
            title: 'Indefinite Integrals and Basic Integration Rules',
            description: 'Learn fundamental integration formulas',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master ∫x^n dx, ∫e^x dx, ∫(1/x) dx, and basic trig integrals. Understand the constant of integration.',
          },
          {
            id: 33,
            title: 'Integration by Substitution (U-Substitution)',
            description: 'Transform complex integrals into simpler forms',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master the substitution method. Choose appropriate substitutions for different types of integrands.',
          },
          {
            id: 34,
            title: 'Integration by Parts',
            description:
              'Integrate products of functions using the parts formula',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn ∫u dv = uv - ∫v du. Master the ILATE rule for choosing u and dv.',
          },
          {
            id: 35,
            title: 'Integration of Trigonometric Functions',
            description: 'Techniques for integrating trig functions',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master integrals of sin^n x, cos^n x, and their products. Use trig identities strategically.',
          },
          {
            id: 36,
            title: 'Integration using Partial Fractions',
            description: 'Break down rational functions for easier integration',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master partial fraction decomposition. Handle proper and improper fractions, repeated factors.',
          },
          {
            id: 37,
            title: 'Trigonometric Substitution',
            description:
              'Use trig substitutions for integrals involving radicals',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn when to use sin, tan, or sec substitutions. Master integration of √(a²-x²), √(x²+a²), √(x²-a²).',
          },
          {
            id: 38,
            title: 'Definite Integrals: Fundamental Theorem of Calculus',
            description: 'Connect differentiation and integration through FTC',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Understand both parts of FTC. Evaluate definite integrals using antiderivatives.',
          },
          {
            id: 39,
            title: 'Properties of Definite Integrals',
            description: 'Learn important properties to simplify calculations',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master properties like ∫[a,b] = -∫[b,a], additivity, and symmetry properties for even/odd functions.',
          },
          {
            id: 40,
            title: 'Applications: Area Under and Between Curves',
            description: 'Calculate areas using definite integrals',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Find areas under curves, between curves, and in parametric/polar forms. Handle functions above/below x-axis.',
          },
          {
            id: 41,
            title: 'Applications: Volume of Solids of Revolution',
            description:
              'Calculate volumes using disk, washer, and shell methods',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master disk method, washer method, and cylindrical shell method for different scenarios.',
          },
          {
            id: 42,
            title: 'Applications: Arc Length and Surface Area',
            description: 'Find lengths of curves and surface areas',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Calculate arc length using integration. Find surface areas of solids of revolution.',
          },
          {
            id: 43,
            title: 'Improper Integrals',
            description:
              'Handle integrals with infinite limits or discontinuities',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Evaluate improper integrals using limits. Test for convergence and divergence.',
          },
          {
            id: 44,
            title: "Numerical Integration: Trapezoidal and Simpson's Rule",
            description:
              'Approximate definite integrals when exact solutions are difficult',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              "Learn trapezoidal rule and Simpson's rule. Understand error estimation.",
          },
          {
            id: 45,
            title: 'JEE Strategy: Integration Shortcuts and Tricks',
            description: 'Time-saving techniques for competitive exams',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master quick recognition of standard forms. Learn shortcuts used by toppers.',
          },
          {
            id: 46,
            title: 'Live Masterclass: Integration Problem Solving',
            description: 'Solve challenging integration problems live',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Interactive problem-solving session with focus on JEE Advanced level questions.',
          },
          {
            id: 47,
            title: 'Practice: 150 Integration Problems',
            description: 'Comprehensive integration practice set',
            duration: 75,
            type: 'assignment',
            isFree: false,
            resources: [
              'Integration Problems PDF',
              'Step-by-Step Solutions',
              'JEE Advanced PYQs',
            ],
            content:
              'Problems covering all integration techniques from basic to advanced level.',
          },
          {
            id: 48,
            title: 'Module 3 Final Assessment',
            description: 'Comprehensive test on integral calculus',
            duration: 60,
            type: 'quiz',
            isFree: false,
            content:
              '40 questions covering indefinite integrals, definite integrals, and applications.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Advanced Topics and JEE Preparation',
        description:
          'Master advanced calculus topics, compete exam strategies, and previous year JEE questions with detailed solutions.',
        duration: 420,
        lessons: [
          {
            id: 49,
            title: 'Differential Equations: Introduction',
            description: 'Introduction to ordinary differential equations',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Understand what differential equations are. Learn to classify and identify order and degree.',
          },
          {
            id: 50,
            title: 'Methods of Solving First Order ODEs',
            description:
              'Variable separable, linear, and exact differential equations',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master techniques for solving common types of first-order differential equations.',
          },
          {
            id: 51,
            title: 'Applications of Differential Equations',
            description:
              'Model real-world phenomena using differential equations',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Apply ODEs to population growth, radioactive decay, cooling problems, and motion under gravity.',
          },
          {
            id: 52,
            title: 'Sequences and Series Convergence',
            description: 'Understand infinite sequences and series',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn convergence tests: ratio test, comparison test, integral test. Apply to power series.',
          },
          {
            id: 53,
            title: 'Taylor and Maclaurin Series',
            description: 'Represent functions as infinite series',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Derive Taylor series. Find Maclaurin series for common functions. Understand radius of convergence.',
          },
          {
            id: 54,
            title: 'JEE Advanced: Previous Year Questions (2020-2024)',
            description: 'Solve recent JEE Advanced calculus problems',
            duration: 90,
            type: 'assignment',
            isFree: false,
            resources: [
              'JEE Advanced Papers PDF',
              'Video Solutions',
              'Common Mistakes Guide',
            ],
            content:
              'Complete analysis of calculus questions from JEE Advanced 2020-2024.',
          },
          {
            id: 55,
            title: 'JEE Main: Topic-wise Question Bank',
            description: 'Master JEE Main calculus through topic-wise practice',
            duration: 60,
            type: 'assignment',
            isFree: false,
            resources: [
              'Question Bank PDF',
              'Solutions Manual',
              'Time Management Tips',
            ],
            content:
              '500+ JEE Main level questions organized by topic with detailed solutions.',
          },
          {
            id: 56,
            title: 'Mock Test 1: JEE Main Level',
            description: 'Full-length mock test simulating JEE Main',
            duration: 60,
            type: 'quiz',
            isFree: false,
            content:
              '30 questions in 60 minutes. Detailed performance analysis and percentile calculation.',
          },
          {
            id: 57,
            title: 'Mock Test 2: JEE Advanced Level',
            description: 'Challenging mock test at JEE Advanced difficulty',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              '20 challenging questions. Video solutions and strategy discussion for each problem.',
          },
          {
            id: 58,
            title: 'Final Live Session: Exam Strategy & Doubt Clearing',
            description: 'Last-minute tips and comprehensive doubt clearing',
            duration: 120,
            type: 'live',
            isFree: false,
            content:
              "Sarah's proven exam strategies, common pitfalls, and answering all your calculus doubts.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Physics for JEE: Complete Mechanics & Thermodynamics',
    slug: 'physics-jee-mechanics-thermodynamics',
    subject: 'Physics',
    category: 'Science & Math',
    level: 'high_school',
    description:
      'Comprehensive physics course for JEE covering Mechanics and Thermodynamics with 1000+ problems and concept clarity',
    longDescription:
      'Master physics for JEE Main and Advanced with deep conceptual understanding and problem-solving skills. This course covers Classical Mechanics (Kinematics, Dynamics, Work-Energy-Power, Rotational Motion, Gravitation) and Thermodynamics with extensive problem practice. Learn from Rajesh Kumar, IIT Delhi alumnus who has trained 500+ JEE Advanced qualifiers. Every topic includes theory, problem-solving techniques, JEE previous year questions, and live doubt sessions. Includes special modules on building physical intuition and exam strategy.',
    thumbnail:
      'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/b1t41Q3xRM8',
    teacherId: 2,
    price: 3499,
    originalPrice: 5999,
    currency: 'INR',
    duration: 20,
    totalHours: 68,
    sessionsPerWeek: 4,
    mode: 'online',
    language: 'English',
    enrolledStudents: 1234,
    maxStudents: 1500,
    rating: 4.8,
    totalReviews: 678,
    startDate: '2025-11-05',
    schedule: ['Mon 7:00 PM', 'Tue 7:00 PM', 'Thu 7:00 PM', 'Sat 5:00 PM'],
    learningOutcomes: [
      'Build rock-solid conceptual foundation in Classical Mechanics',
      'Master problem-solving for JEE Main and Advanced',
      'Develop physical intuition to tackle unseen problems',
      'Solve 1000+ problems from basic to Olympiad level',
      'Understand real-world applications of physics concepts',
      'Learn exam strategies and time management from IIT professor',
      'Master free body diagrams and problem visualization',
      'Score 90+ in Physics for JEE Advanced',
    ],
    prerequisites: [
      'Basic mathematics (algebra, trigonometry, calculus)',
      'Class 10 physics fundamentals',
      'Enthusiasm to learn and practice regularly',
      'Access to pen, paper for problem practice',
    ],
    targetAudience: [
      'JEE Main aspirants (11th and 12th class)',
      'JEE Advanced serious aspirants',
      'NEET students (for Mechanics portion)',
      'Physics Olympiad aspirants',
      'Engineering students needing strong physics base',
    ],
    features: [
      '68 hours of comprehensive video lectures',
      '1000+ problems from basic to JEE Advanced level',
      'Weekly live problem-solving sessions',
      'Animated simulations for every concept',
      'Complete JEE Previous Year Questions (1980-2024)',
      'Formula sheets and quick revision notes',
      'Monthly full-length mock tests',
      'Personal mentorship from Rajesh Kumar',
      'Dedicated doubt clearing on Telegram group',
      'Performance analytics and weak area identification',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'Physics',
      'JEE',
      'Mechanics',
      'Thermodynamics',
      'Competitive Exams',
      'IIT',
    ],
    modules: [
      {
        id: 1,
        title: 'Unit 1: Kinematics - The Study of Motion',
        description:
          'Master motion in one and two dimensions with deep conceptual clarity. Learn to solve complex kinematics problems systematically.',
        duration: 480,
        lessons: [
          {
            id: 1,
            title: 'Introduction to Motion: Frame of Reference',
            description:
              'Understand what motion is and the importance of reference frames',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              'Learn about position, displacement, and the concept of relative motion. Understand inertial and non-inertial frames.',
          },
          {
            id: 2,
            title: 'Scalars vs Vectors: The Fundamental Difference',
            description: 'Master vector mathematics essential for physics',
            duration: 40,
            type: 'video',
            isFree: true,
            content:
              'Understand scalars and vectors. Learn vector addition, subtraction, resolution into components, dot and cross products.',
          },
          {
            id: 3,
            title: 'Distance, Displacement, Speed, and Velocity',
            description: 'Distinguish between these fundamental concepts',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn the difference between distance and displacement. Understand average and instantaneous velocity.',
          },
          {
            id: 4,
            title: 'Acceleration: Rate of Change of Velocity',
            description: 'Understanding acceleration in different scenarios',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn average and instantaneous acceleration. Understand uniform and non-uniform acceleration.',
          },
          {
            id: 5,
            title: 'Equations of Motion for Uniform Acceleration',
            description: 'Derive and apply the three fundamental equations',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Derive v = u + at, s = ut + ½at², v² = u² + 2as from first principles. Master their application.',
          },
          {
            id: 6,
            title: 'Graphs in Kinematics: Position-Time and Velocity-Time',
            description: 'Interpret and draw motion graphs',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn to extract information from s-t, v-t, and a-t graphs. Find displacement and acceleration from graphs.',
          },
          {
            id: 7,
            title: 'Free Fall and Motion Under Gravity',
            description:
              'Understand motion under constant gravitational acceleration',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Apply equations of motion to free fall. Solve problems involving objects thrown upward/downward.',
          },
          {
            id: 8,
            title: 'Projectile Motion: Theory and Derivations',
            description: 'Master motion in two dimensions under gravity',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Derive equations for range, maximum height, time of flight. Understand trajectory and angle of projection.',
          },
          {
            id: 9,
            title: 'Projectile Motion: Advanced Problem Solving',
            description: 'Tackle complex projectile motion problems',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Solve problems involving projectile on inclined plane, maximum range, projection from height.',
          },
          {
            id: 10,
            title: 'Relative Motion in One Dimension',
            description: 'Understand motion from different reference frames',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn relative velocity concept. Solve river-boat, rain, and chase problems.',
          },
          {
            id: 11,
            title: 'Relative Motion in Two Dimensions',
            description: 'Master complex relative motion scenarios',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Apply vector addition to relative velocity. Solve shortest time and distance problems.',
          },
          {
            id: 12,
            title: 'Circular Motion: Uniform and Non-Uniform',
            description: 'Understand motion in circular paths',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn angular velocity, angular acceleration, centripetal acceleration. Derive v = rω and a = rω².',
          },
          {
            id: 13,
            title: 'JEE Problem Solving Session: Kinematics',
            description: 'Solve JEE Advanced level kinematics problems',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Live session solving tricky JEE problems with Rajesh Kumar. Learn problem-solving strategies.',
          },
          {
            id: 14,
            title: 'Practice Assignment: Kinematics (200 Problems)',
            description:
              'Comprehensive problem set covering all kinematics topics',
            duration: 60,
            type: 'assignment',
            isFree: false,
            resources: [
              'Kinematics Problems PDF',
              'Detailed Solutions',
              'JEE PYQs 2015-2024',
            ],
            content:
              '200 problems from basic to JEE Advanced level with complete solutions.',
          },
        ],
      },
      {
        id: 2,
        title: "Unit 2: Newton's Laws of Motion and Applications",
        description:
          'Build deep understanding of forces and their applications. Master free body diagrams and problem-solving techniques.',
        duration: 540,
        lessons: [
          {
            id: 15,
            title: "Newton's First Law: Law of Inertia",
            description: 'Understand inertia and inertial frames',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn concept of inertia. Understand why objects resist change in motion. Real-world examples.',
          },
          {
            id: 16,
            title: "Newton's Second Law: F = ma",
            description:
              'The fundamental law connecting force and acceleration',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Derive F = ma. Understand force as rate of change of momentum. Learn units and dimensions.',
          },
          {
            id: 17,
            title: "Newton's Third Law: Action-Reaction Pairs",
            description: 'Master the concept of action-reaction pairs',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Understand action-reaction pairs. Learn they act on different bodies. Solve conceptual problems.',
          },
          {
            id: 18,
            title: 'Free Body Diagrams: The Most Important Skill',
            description: 'Master drawing and using FBDs',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn systematic approach to FBDs. Identify all forces correctly. Practice with complex systems.',
          },
          {
            id: 19,
            title: 'Friction: Static and Kinetic',
            description: 'Understand frictional forces and their applications',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn difference between static and kinetic friction. Master μ and limiting friction. Solve problems.',
          },
          {
            id: 20,
            title: 'Problems on Friction: Blocks and Inclines',
            description: 'Advanced friction problems',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Solve problems involving multiple blocks, inclined planes, and friction. Learn problem-solving strategies.',
          },
          {
            id: 21,
            title: 'Circular Motion and Centripetal Force',
            description: 'Forces in circular motion',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Derive Fc = mv²/r. Solve problems on banked roads, conical pendulum, and vertical circular motion.',
          },
          {
            id: 22,
            title: 'Motion in Vertical Circle: Energy Method',
            description: 'Combine circular motion with energy conservation',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Analyze motion in vertical circles. Find minimum velocity at highest point. String tension analysis.',
          },
          {
            id: 23,
            title: 'Connected Bodies and Pulleys',
            description: 'Systems of masses connected by strings',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              "Solve problems with Atwood's machine, multiple pulleys, and constraints. Master tension calculation.",
          },
          {
            id: 24,
            title: 'Pseudo Forces in Non-Inertial Frames',
            description: 'Understanding fictitious forces',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn when pseudo forces arise. Solve problems in accelerating frames. Master concept deeply.',
          },
          {
            id: 25,
            title: "Spring Force and Hooke's Law",
            description: 'Understand elastic forces',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn F = -kx. Solve problems with springs in series and parallel. Energy in springs.',
          },
          {
            id: 26,
            title: 'JEE Masterclass: Laws of Motion',
            description: "Solve challenging JEE problems on Newton's laws",
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Live problem-solving session covering tricky JEE questions. Learn shortcuts and strategies.',
          },
          {
            id: 27,
            title: 'Practice Assignment: Laws of Motion (250 Problems)',
            description: 'Comprehensive problem set on forces',
            duration: 75,
            type: 'assignment',
            isFree: false,
            resources: [
              'Laws of Motion Problems',
              'Solutions Manual',
              'JEE Advanced PYQs',
            ],
            content:
              "250 problems covering all aspects of Newton's laws with detailed solutions.",
          },
        ],
      },
      // Additional modules for Work-Energy-Power, Rotational Motion, Gravitation, and Thermodynamics would follow
    ],
  },
  {
    id: 3,
    title: 'Data Structures & Algorithms Masterclass',
    slug: 'data-structures-algorithms-masterclass',
    subject: 'Computer Science',
    category: 'Technology',
    level: 'college',
    description:
      'Master DSA for coding interviews at Google, Microsoft, Amazon. 300+ problems with optimal solutions and detailed explanations',
    longDescription:
      'Comprehensive course covering all essential data structures and algorithms needed for technical interviews at top tech companies. Learn arrays, linked lists, trees, graphs, dynamic programming, and more. Each topic includes theory, implementation in multiple languages, time-space complexity analysis, and interview problems. Taught by Arjun Mehta, Senior Engineer at Google with 10 years of experience interviewing candidates. This course has helped 1000+ students land jobs at FAANG companies.',
    thumbnail:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/8hly31xKli0',
    teacherId: 4,
    price: 3999,
    originalPrice: 6999,
    currency: 'INR',
    duration: 12,
    totalHours: 45,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 1567,
    maxStudents: 2000,
    rating: 4.9,
    totalReviews: 892,
    startDate: '2025-11-08',
    schedule: ['Tue 8:00 PM', 'Thu 8:00 PM', 'Sat 8:00 PM'],
    learningOutcomes: [
      'Master all fundamental data structures: arrays, linked lists, stacks, queues, trees, graphs, heaps',
      'Implement efficient algorithms for searching, sorting, and traversal',
      'Solve 300+ coding interview problems from LeetCode, HackerRank',
      'Analyze time and space complexity using Big O notation',
      'Master dynamic programming and greedy algorithms',
      'Crack coding interviews at Google, Amazon, Microsoft, Meta',
      'Learn problem-solving patterns and techniques',
      'Build confidence to tackle any DSA problem',
    ],
    prerequisites: [
      'Basic programming knowledge in any language',
      'Understanding of loops, conditionals, functions',
      'No prior DSA knowledge required',
      'Enthusiasm to practice and learn',
    ],
    targetAudience: [
      'College students preparing for tech interviews',
      'Software engineers switching jobs',
      'Self-taught programmers aiming for FAANG',
      'Anyone wanting to master DSA',
      'Competitive programming aspirants',
    ],
    features: [
      '45 hours of in-depth video lectures',
      '300+ coding problems with optimal solutions',
      'Code implementations in Python, Java, C++',
      'Weekly live coding sessions',
      'Mock interviews with feedback',
      'LeetCode premium-style problem discussions',
      'Time complexity analysis for every solution',
      'Company-wise question patterns (Google, Amazon, etc.)',
      'Lifetime access and updates',
      'Certificate of completion',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'DSA',
      'Algorithms',
      'Coding Interview',
      'FAANG',
      'LeetCode',
      'Programming',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Arrays and Strings',
        description:
          'Master the most frequently asked data structure in interviews. Learn essential array and string manipulation techniques.',
        duration: 300,
        lessons: [
          {
            id: 1,
            title: 'Introduction to DSA and Interview Preparation',
            description:
              'Overview of what to expect and how to prepare effectively',
            duration: 20,
            type: 'video',
            isFree: true,
            content:
              'Understand the interview process at top tech companies. Learn how to structure your preparation and practice efficiently.',
          },
          {
            id: 2,
            title: 'Time and Space Complexity Analysis',
            description:
              'Master Big O notation to analyze algorithm efficiency',
            duration: 40,
            type: 'video',
            isFree: true,
            content:
              'Learn Big O, Big Theta, Big Omega notations. Analyze time and space complexity of common operations and algorithms.',
          },
          {
            id: 3,
            title: 'Arrays: Internal Working and Operations',
            description: 'Deep dive into array data structure',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Understand how arrays are stored in memory. Learn about static vs dynamic arrays, and basic operations.',
          },
          {
            id: 4,
            title: 'Two Pointer Technique',
            description: 'Master this essential array problem-solving pattern',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn when and how to use two pointers. Solve problems like two sum, three sum, container with most water.',
          },
          {
            id: 5,
            title: 'Sliding Window Pattern',
            description:
              'Optimize array subarray problems using sliding window',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master fixed and variable size sliding windows. Solve maximum sum subarray, longest substring problems.',
          },
          {
            id: 6,
            title: 'String Manipulation Techniques',
            description: 'Essential string operations and pattern matching',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn string reversal, palindrome checking, anagram detection, and basic pattern matching algorithms.',
          },
          {
            id: 7,
            title: 'Problem Solving: 50 Array & String Problems',
            description: 'Practice problems from easy to hard',
            duration: 65,
            type: 'assignment',
            isFree: false,
            resources: [
              'Problem List PDF',
              'Solutions in Python/Java/C++',
              'Video explanations',
            ],
            content:
              '50 curated problems covering all array and string patterns. Includes LeetCode medium and hard problems.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Linked Lists',
        description:
          'Master linked list operations, reversal, cycle detection, and merge techniques essential for interviews.',
        duration: 240,
        lessons: [
          {
            id: 8,
            title: 'Linked List Fundamentals',
            description: 'Understand singly and doubly linked lists',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn node structure, insertion, deletion, traversal. Compare with arrays. Implement from scratch.',
          },
          {
            id: 9,
            title: 'Linked List Reversal Techniques',
            description: 'Master iterative and recursive reversal',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn to reverse linked lists iteratively and recursively. Solve reverse in groups, reverse between positions.',
          },
          {
            id: 10,
            title: 'Fast and Slow Pointer Technique',
            description: 'Detect cycles and find middle elements',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              "Master Floyd's cycle detection algorithm. Find middle element, detect and remove loops.",
          },
          {
            id: 11,
            title: 'Merging and Sorting Linked Lists',
            description: 'Merge sorted lists and sort using merge sort',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Implement merge two sorted lists, merge k sorted lists. Apply merge sort to linked lists.',
          },
          {
            id: 12,
            title: 'Practice: 40 Linked List Problems',
            description: 'Problems from Amazon, Microsoft, Google interviews',
            duration: 65,
            type: 'assignment',
            isFree: false,
            resources: ['40 Problems PDF', 'Optimal Solutions', 'Company Tags'],
            content:
              'Curated problems frequently asked in FAANG interviews with detailed solutions.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Trees and Graphs',
        description:
          'Master tree and graph data structures, traversals, and common algorithms for technical interviews.',
        duration: 420,
        lessons: [
          {
            id: 13,
            title: 'Binary Trees: Structure and Traversals',
            description: 'Learn tree fundamentals and traversal techniques',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand tree terminology. Master inorder, preorder, postorder, level order traversals recursively and iteratively.',
          },
          {
            id: 14,
            title: 'Binary Search Trees (BST)',
            description: 'Master BST operations and properties',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn BST properties, insertion, deletion, searching. Validate BST, find kth smallest/largest element.',
          },
          {
            id: 15,
            title: 'Tree Problem-Solving Patterns',
            description: 'Common patterns for tree interview problems',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master patterns: path sum, diameter, lowest common ancestor, tree views, serialize/deserialize.',
          },
          {
            id: 16,
            title: 'Graph Representation and Traversals',
            description: 'Learn graph fundamentals and BFS/DFS',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Represent graphs using adjacency list/matrix. Master BFS and DFS for traversal and problem solving.',
          },
          {
            id: 17,
            title: 'Advanced Graph Algorithms',
            description: 'Shortest path, MST, and topological sorting',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              "Learn Dijkstra's, Bellman-Ford, Kruskal's, Prim's algorithms. Master topological sort and its applications.",
          },
          {
            id: 18,
            title: 'Live Coding: Trees and Graphs',
            description: 'Solve hard problems live with explanations',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Live session solving Google and Amazon level tree and graph problems with optimization techniques.',
          },
          {
            id: 19,
            title: 'Practice: 80 Trees & Graph Problems',
            description: 'Comprehensive problem set for mastery',
            duration: 70,
            type: 'assignment',
            isFree: false,
            resources: [
              '80 Problems Collection',
              'Video Solutions',
              'Pattern Guide',
            ],
            content:
              'Problems covering all tree and graph patterns from easy to hard difficulty.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Dynamic Programming & Advanced Topics',
        description:
          'Master DP patterns, backtracking, and other advanced algorithms to solve the hardest interview problems.',
        duration: 360,
        lessons: [
          {
            id: 20,
            title: 'Introduction to Dynamic Programming',
            description: 'Understand memoization and tabulation',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn DP fundamentals. Master top-down (memoization) and bottom-up (tabulation) approaches.',
          },
          {
            id: 21,
            title: 'Classic DP Problems',
            description: 'Solve fibonacci, climbing stairs, coin change',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master classic DP problems to build intuition. Learn to identify optimal substructure and overlapping subproblems.',
          },
          {
            id: 22,
            title: 'DP on Strings',
            description: 'Longest common subsequence, edit distance',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master string DP problems: LCS, LIS, edit distance, palindromic subsequence, pattern matching.',
          },
          {
            id: 23,
            title: 'DP on Arrays and Subsequences',
            description: 'Solve subset sum, knapsack, partition problems',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Learn 0/1 knapsack, subset sum, partition problems, and their variations. Master optimization.',
          },
          {
            id: 24,
            title: 'Backtracking Algorithms',
            description: 'Generate permutations, combinations, subsets',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master backtracking for generating all possibilities. Solve N-Queens, Sudoku solver, word search.',
          },
          {
            id: 25,
            title: 'Mock Interview Session',
            description: 'Simulate real technical interview',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              '45-minute mock interview followed by detailed feedback. Experience actual interview pressure and learn improvement areas.',
          },
          {
            id: 26,
            title: 'Final Practice: 100 Mixed Problems',
            description: 'Comprehensive problem set across all topics',
            duration: 40,
            type: 'assignment',
            isFree: false,
            resources: [
              '100 Problems PDF',
              'Company-wise Categorization',
              'Video Solutions',
            ],
            content:
              'Mixed problems from all modules simulating real interview question distribution.',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Organic Chemistry Mastery for NEET & JEE',
    slug: 'organic-chemistry-neet-jee',
    subject: 'Chemistry',
    category: 'Science & Math',
    level: 'high_school',
    description:
      'Complete organic chemistry from basics to advanced with 500+ reactions, mechanisms, and NEET/JEE problem-solving',
    longDescription:
      'Master organic chemistry from fundamentals to complex reactions with Priya Sharma, Oxford PhD and NEET specialist. Learn nomenclature, isomerism, reaction mechanisms, and stereochemistry with visual 3D models. This course makes organic chemistry logical and easy to remember through pattern recognition and systematic approach. Includes 500+ named reactions, complete mechanism animations, and 1000+ NEET/JEE previous year questions with detailed solutions. Her students consistently score 350+/360 in NEET chemistry.',
    thumbnail:
      'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/GOGjID43oDc',
    teacherId: 3,
    price: 3299,
    originalPrice: 5499,
    currency: 'INR',
    duration: 18,
    totalHours: 58,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 1089,
    maxStudents: 1500,
    rating: 4.9,
    totalReviews: 634,
    startDate: '2025-11-10',
    schedule: ['Mon 7:00 PM', 'Wed 7:00 PM', 'Sat 6:00 PM'],
    learningOutcomes: [
      'Master IUPAC nomenclature for all organic compounds',
      'Understand and predict reaction mechanisms step-by-step',
      'Learn 500+ named reactions with applications',
      'Master stereochemistry and 3D visualization of molecules',
      'Solve 1000+ NEET and JEE chemistry problems',
      'Remember reactions through logical patterns, not rote memorization',
      'Score 90+ in organic chemistry for competitive exams',
      'Build strong foundation for medicinal and pharmaceutical chemistry',
    ],
    prerequisites: [
      'Basic chemistry concepts (Class 10 level)',
      'Understanding of atomic structure and bonding',
      'Knowledge of chemical equations',
      'Enthusiasm to learn systematic organic chemistry',
    ],
    targetAudience: [
      'NEET aspirants (Biology/Medical students)',
      'JEE Main and Advanced aspirants',
      'Class 11 and 12 chemistry students',
      'Anyone struggling with organic chemistry',
      'Students aiming for AIIMS, JIPMER, top medical colleges',
    ],
    features: [
      '58 hours of comprehensive lectures with animations',
      '3D molecular models for stereochemistry visualization',
      '500+ named reactions with complete mechanisms',
      '1000+ NEET PYQs (2005-2024) with solutions',
      'Mnemonics and memory techniques for reactions',
      'Weekly live doubt clearing sessions',
      'Downloadable reaction sheets and summary notes',
      'Monthly tests with NEET/JEE pattern',
      'Personal mentorship from Priya Sharma',
      'Lifetime access with free updates',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    tags: [
      'Organic Chemistry',
      'NEET',
      'JEE',
      'Chemistry',
      'Reactions',
      'Mechanisms',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Fundamentals of Organic Chemistry',
        description:
          'Build strong foundation with bonding, hybridization, resonance, and basic concepts essential for organic chemistry.',
        duration: 360,
        lessons: [
          {
            id: 1,
            title: 'What is Organic Chemistry? - Introduction',
            description:
              'Understand the scope and importance of organic chemistry',
            duration: 25,
            type: 'video',
            isFree: true,
            content:
              "Learn what makes organic chemistry unique. Understand carbon's special properties and why millions of organic compounds exist.",
          },
          {
            id: 2,
            title: 'Chemical Bonding: Covalent Bonds in Organic Compounds',
            description:
              'Master bonding concepts specific to organic molecules',
            duration: 35,
            type: 'video',
            isFree: true,
            content:
              'Learn sigma and pi bonds, bond length, bond energy, bond polarity. Understand how structure affects properties.',
          },
          {
            id: 3,
            title: 'Hybridization: sp³, sp², sp',
            description: 'Visualize molecular geometry through hybridization',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master sp³ (tetrahedral), sp² (trigonal), sp (linear) hybridization with 3D models. Predict molecular shapes.',
          },
          {
            id: 4,
            title: 'Resonance and Aromaticity',
            description:
              'Understand electron delocalization and aromatic stability',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              "Learn to draw resonance structures correctly. Master Hückel's rule and identify aromatic compounds.",
          },
          {
            id: 5,
            title: 'Inductive and Mesomeric Effects',
            description: 'Electronic effects that govern reactivity',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Understand +I, -I, +M, -M effects. Learn how these affect acidity, basicity, and reactivity of organic compounds.',
          },
          {
            id: 6,
            title: 'Hyperconjugation',
            description: 'Stabilization through sigma bond interactions',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Learn hyperconjugation and its role in carbocation stability. Understand stability order of carbocations.',
          },
          {
            id: 7,
            title: 'IUPAC Nomenclature: Part 1 - Basic Rules',
            description: 'Master systematic naming of organic compounds',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn IUPAC rules for naming alkanes, alkenes, alkynes. Master priority of functional groups.',
          },
          {
            id: 8,
            title: 'IUPAC Nomenclature: Part 2 - Complex Compounds',
            description: 'Name complex polyfunctional organic molecules',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master naming of compounds with multiple functional groups, cyclic compounds, and substituted benzene.',
          },
          {
            id: 9,
            title: 'Practice Assignment: Fundamentals (100 Problems)',
            description:
              'Test understanding of basic organic chemistry concepts',
            duration: 50,
            type: 'assignment',
            isFree: false,
            resources: [
              '100 Conceptual Problems',
              'Detailed Solutions',
              'NEET PYQs',
            ],
            content:
              'Problems on bonding, hybridization, resonance, nomenclature from NEET and JEE.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Stereochemistry & Isomerism',
        description:
          'Master 3D chemistry - optical isomerism, geometrical isomerism, and chirality essential for NEET/JEE.',
        duration: 420,
        lessons: [
          {
            id: 10,
            title: 'Types of Isomerism: Overview',
            description: 'Classify structural and stereoisomerism',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Understand different types: chain, position, functional, geometrical, optical isomerism.',
          },
          {
            id: 11,
            title: 'Geometrical Isomerism: Cis-Trans and E-Z',
            description:
              'Master geometrical isomers in alkenes and cyclic compounds',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn cis-trans notation. Master E-Z nomenclature using CIP rules. Identify geometric isomers.',
          },
          {
            id: 12,
            title: 'Optical Isomerism: Chirality and Enantiomers',
            description:
              'Understand 3D molecular structure and optical activity',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn chirality, chiral centers, enantiomers, diastereomers. Understand optical activity and specific rotation.',
          },
          {
            id: 13,
            title: 'R-S Configuration: CIP Rules',
            description: 'Assign absolute configuration to chiral centers',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master Cahn-Ingold-Prelog rules. Assign R and S configurations to complex molecules.',
          },
          {
            id: 14,
            title: 'Fischer Projections and Newman Projections',
            description: 'Represent 3D molecules in 2D',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn to draw and interpret Fischer and Newman projections. Analyze conformations and stereochemistry.',
          },
          {
            id: 15,
            title: 'Conformational Analysis',
            description: 'Study rotational isomers and their stability',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master eclipsed, staggered, gauche, anti conformations. Analyze cyclohexane chair and boat forms.',
          },
          {
            id: 16,
            title: 'Meso Compounds and Racemic Mixtures',
            description: 'Special cases in stereochemistry',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Identify meso compounds with internal symmetry. Understand racemic mixtures and resolution techniques.',
          },
          {
            id: 17,
            title: 'Live Session: 3D Visualization with Models',
            description: 'Interactive session with molecular models',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Priya demonstrates stereochemistry using 3D models. Practice identifying chirality and configurations.',
          },
          {
            id: 18,
            title: 'Practice: Stereochemistry (150 Problems)',
            description: 'Master stereochemistry through extensive practice',
            duration: 40,
            type: 'assignment',
            isFree: false,
            resources: [
              '150 Stereochemistry Problems',
              '3D Diagrams',
              'NEET PYQs 2010-2024',
            ],
            content:
              'Comprehensive problem set covering all stereochemistry topics from NEET and JEE.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Reaction Mechanisms & Organic Reactions',
        description:
          'Master all organic reactions, mechanisms, and reagents essential for NEET and JEE exams.',
        duration: 600,
        lessons: [
          {
            id: 19,
            title: 'Types of Organic Reactions',
            description:
              'Classify reactions: addition, substitution, elimination',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Understand different reaction types. Learn when each type occurs based on substrate and conditions.',
          },
          {
            id: 20,
            title: 'Reaction Mechanisms: Arrow Pushing',
            description: 'Master electron movement in organic reactions',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn curved arrow notation. Understand nucleophiles, electrophiles, and electron flow in mechanisms.',
          },
          {
            id: 21,
            title: 'Alkanes: Reactions and Halogenation',
            description: 'Free radical substitution in alkanes',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn halogenation mechanism. Understand stability of free radicals and product formation.',
          },
          {
            id: 22,
            title: 'Alkenes: Addition Reactions',
            description: "Master electrophilic addition and Markovnikov's rule",
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn hydrohalogenation, hydration, halogenation. Master Markovnikov and anti-Markovnikov additions.',
          },
          {
            id: 23,
            title: 'Alkynes: Reactions and Transformations',
            description: 'Addition reactions and special alkyne chemistry',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master terminal alkyne acidity. Learn addition reactions and conversion to other functional groups.',
          },
          {
            id: 24,
            title: 'Aromatic Compounds: Electrophilic Substitution',
            description: 'Complete benzene chemistry and substitution patterns',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master nitration, sulfonation, halogenation, Friedel-Crafts reactions. Understand directing effects.',
          },
          {
            id: 25,
            title: 'Alcohols, Phenols, and Ethers',
            description: 'Reactions of oxygen-containing compounds',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn preparation and reactions of alcohols, phenols, ethers. Master oxidation, dehydration, and esterification.',
          },
          {
            id: 26,
            title: 'Carbonyl Compounds: Aldehydes and Ketones',
            description: 'Nucleophilic addition reactions',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master nucleophilic addition, aldol condensation, Cannizzaro reaction, and carbonyl tests.',
          },
          {
            id: 27,
            title: 'Carboxylic Acids and Derivatives',
            description: 'Acidity, esterification, and derivatives',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn reactions of COOH group. Master esters, amides, acid chlorides, and anhydrides.',
          },
          {
            id: 28,
            title: 'Amines: Basicity and Reactions',
            description: 'Nitrogen-containing organic compounds',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Understand amine basicity. Learn diazotization, coupling reactions, and amine preparations.',
          },
          {
            id: 29,
            title: 'Named Reactions: Part 1',
            description: 'Essential name reactions for NEET/JEE',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master Hell-Volhard-Zelinsky, Wurtz, Kolbe, Reimer-Tiemann, and other important reactions.',
          },
          {
            id: 30,
            title: 'Named Reactions: Part 2',
            description: 'Advanced name reactions and organic synthesis',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn Gabriel phthalimide, Hofmann bromamide, Sandmeyer, Gattermann reactions and more.',
          },
          {
            id: 31,
            title: 'Live Masterclass: Organic Synthesis Problems',
            description: 'Multi-step synthesis and retrosynthesis',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Learn to plan multi-step organic synthesis. Solve NEET and JEE synthesis problems live.',
          },
          {
            id: 32,
            title: 'Practice: Reactions (300 Problems)',
            description: 'Comprehensive reaction practice for mastery',
            duration: 65,
            type: 'assignment',
            isFree: false,
            resources: [
              '300 Reaction Problems',
              'Mechanism Videos',
              'NEET PYQ Analysis',
            ],
            content:
              'Problems covering all reaction types, mechanisms, and named reactions from NEET/JEE.',
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'IELTS Mastery: Band 8+ in 8 Weeks',
    slug: 'ielts-mastery-band-8',
    subject: 'English Language',
    category: 'Languages',
    level: 'all_levels',
    description:
      'Complete IELTS preparation from official examiner. Master all 4 modules with proven strategies for Band 8+ score',
    longDescription:
      'Achieve your dream IELTS band score with Anita Desai, official IELTS examiner with 14 years of experience. This comprehensive course covers all four modules: Listening, Reading, Writing, and Speaking with insider strategies directly from an examiner. Learn exactly what examiners look for and how to exceed their expectations. Includes 100+ practice tests, personalized feedback on writing and speaking, and time-tested techniques that have helped 2000+ students achieve Band 7+ scores. Perfect for students aiming for UK, Canada, Australia, or New Zealand immigration and university admissions.',
    thumbnail:
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/UXFkqA3mJ8s',
    teacherId: 5,
    price: 2499,
    originalPrice: 4499,
    currency: 'INR',
    duration: 8,
    totalHours: 32,
    sessionsPerWeek: 4,
    mode: 'online',
    language: 'English',
    enrolledStudents: 987,
    maxStudents: 1200,
    rating: 4.8,
    totalReviews: 523,
    startDate: '2025-11-12',
    schedule: ['Mon 9:00 PM', 'Tue 9:00 PM', 'Thu 9:00 PM', 'Sat 9:00 PM'],
    learningOutcomes: [
      'Achieve Band 7+ in all four IELTS modules',
      'Master listening strategies for all question types',
      'Speed read and answer reading comprehension accurately',
      'Write Task 1 and Task 2 essays meeting Band 8 criteria',
      'Speak fluently with complex grammar and rich vocabulary',
      'Learn time management for each module',
      "Understand marking criteria from examiner's perspective",
      'Build confidence to score your target band',
    ],
    prerequisites: [
      'Intermediate English proficiency (B1-B2 level)',
      'Basic grammar and vocabulary knowledge',
      'Commitment to practice daily',
      'Target score of Band 6.5 or higher',
    ],
    targetAudience: [
      'Students applying to UK, Australia, Canada universities',
      'Professionals seeking immigration (Express Entry, Skilled Worker)',
      'Anyone needing IELTS for work or education',
      "Students who have attempted IELTS but didn't get desired score",
      'First-time IELTS takers wanting comprehensive preparation',
    ],
    features: [
      '32 hours of expert instruction from official examiner',
      '100+ full-length practice tests (Academic & General)',
      'Personalized feedback on 20 writing tasks',
      'Mock speaking tests with band score breakdown',
      'British Council style test simulations',
      'Vocabulary lists categorized by topics (1000+ words)',
      'Grammar masterclass for complex structures',
      'Weekly live Q&A sessions',
      'IELTS tips and tricks document from examiner',
      'Lifetime access to all materials and updates',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    tags: [
      'IELTS',
      'English',
      'Language Test',
      'Study Abroad',
      'Immigration',
      'Band 8',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: IELTS Listening Mastery',
        description:
          'Master all listening question types with proven strategies. Learn to handle different accents and complex audio passages.',
        duration: 480,
        lessons: [
          {
            id: 1,
            title: 'IELTS Overview: Test Format and Scoring',
            description:
              'Understand the complete IELTS structure and band descriptors',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              'Learn about Academic vs General Training. Understand how each module is scored and what each band represents.',
          },
          {
            id: 2,
            title: 'Listening Section 1: Form Completion',
            description: 'Master personal information and form filling',
            duration: 40,
            type: 'video',
            isFree: true,
            content:
              'Learn strategies for catching names, numbers, dates, addresses. Practice with real test recordings.',
          },
          {
            id: 3,
            title: 'Listening Section 2: Monologues and Descriptions',
            description: 'Handle one-person talks and descriptions',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master map labeling, multiple choice in monologues. Learn to predict answers and follow directions.',
          },
          {
            id: 4,
            title: 'Listening Section 3: Academic Discussions',
            description: 'Follow conversations between multiple speakers',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn to identify speakers and follow academic discussions. Master matching and classification questions.',
          },
          {
            id: 5,
            title: 'Listening Section 4: Academic Lectures',
            description: 'Handle complex academic monologues',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master note completion in lectures. Learn to identify signposting language and main ideas.',
          },
          {
            id: 6,
            title: 'Handling Different Accents',
            description:
              'Practice British, Australian, American, and other accents',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Expose yourself to various English accents. Learn pronunciation differences and common variations.',
          },
          {
            id: 7,
            title: 'Time Management and Transfer Techniques',
            description: 'Maximize your listening score with smart strategies',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn the 10-minute transfer time strategy. Master spelling and number writing without errors.',
          },
          {
            id: 8,
            title: 'Practice Tests: Listening (20 Full Tests)',
            description: 'Real test simulations with answer explanations',
            duration: 250,
            type: 'assignment',
            isFree: false,
            resources: [
              '20 Listening Tests',
              'Audio Files',
              'Answer Keys with Explanations',
            ],
            content:
              'Cambridge-style listening tests with increasing difficulty. Track your band score progress.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: IELTS Reading Mastery',
        description:
          'Speed read and accurately answer all question types. Master skimming, scanning, and time management.',
        duration: 480,
        lessons: [
          {
            id: 9,
            title: 'Reading Strategies: Skimming and Scanning',
            description: 'Essential speed reading techniques for IELTS',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master skimming for main ideas and scanning for specific information. Learn when to use each technique.',
          },
          {
            id: 10,
            title: 'True/False/Not Given Questions',
            description: 'The most challenging IELTS question type',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn the crucial difference between False and Not Given. Master this tricky question type with foolproof strategies.',
          },
          {
            id: 11,
            title: 'Matching Headings and Information',
            description: 'Match paragraphs with headings and information',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn to identify paragraph topics quickly. Master matching headings without reading the entire text.',
          },
          {
            id: 12,
            title: 'Multiple Choice and Sentence Completion',
            description: 'Handle MCQs and complete sentences accurately',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master elimination techniques for MCQs. Learn to complete sentences with exact word limits.',
          },
          {
            id: 13,
            title: 'Summary, Diagram, and Flow-Chart Completion',
            description: 'Complete various types of visual and text summaries',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn to handle summary completion with word banks. Master diagram labeling and process descriptions.',
          },
          {
            id: 14,
            title: 'Time Management for 60 Minutes',
            description: 'Complete 40 questions in time without stress',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn the 20-20-20 time strategy. Master pacing yourself across three passages of increasing difficulty.',
          },
          {
            id: 15,
            title: 'Building Academic Vocabulary',
            description: 'Essential vocabulary for IELTS Reading',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn high-frequency IELTS words categorized by topics. Master synonyms and paraphrasing recognition.',
          },
          {
            id: 16,
            title: 'Practice Tests: Reading (20 Full Tests)',
            description: 'Cambridge-style reading tests with strategies',
            duration: 280,
            type: 'assignment',
            isFree: false,
            resources: [
              '20 Reading Tests',
              'Strategy Guide',
              'Vocabulary Lists',
            ],
            content:
              'Academic and General Training reading tests. Detailed explanations for every answer.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: IELTS Writing Band 8',
        description:
          'Write Task 1 and Task 2 essays meeting Band 8 criteria with examiner feedback on your writing.',
        duration: 540,
        lessons: [
          {
            id: 17,
            title: 'Writing Band Descriptors Explained',
            description: 'Understand exactly what examiners look for',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn the 4 criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammar. Know what Band 7, 8, 9 looks like.',
          },
          {
            id: 18,
            title: 'Task 1 Academic: Graphs, Charts, and Diagrams',
            description: 'Describe visual information clearly and accurately',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master the structure for Task 1. Learn language for trends, comparisons, and describing processes.',
          },
          {
            id: 19,
            title: 'Task 1 General Training: Letter Writing',
            description: 'Write formal, semi-formal, and informal letters',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn letter formats and appropriate tone. Master opening, body, and closing for different letter types.',
          },
          {
            id: 20,
            title: 'Task 2: Essay Structure and Planning',
            description: 'Plan and organize 250-word essays effectively',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master the 4-paragraph structure. Learn to plan in 5 minutes and write focused, coherent essays.',
          },
          {
            id: 21,
            title: 'Task 2 Essay Types: Opinion, Discussion, Problem-Solution',
            description: 'Handle all Task 2 question types',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Learn specific approaches for each essay type. Master thesis statements and topic sentences.',
          },
          {
            id: 22,
            title: 'Grammar for Band 7+: Complex Structures',
            description: 'Use advanced grammar accurately and naturally',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master conditionals, passive voice, relative clauses, inversions. Learn to write error-free sentences.',
          },
          {
            id: 23,
            title: 'Vocabulary and Collocations for Writing',
            description: 'Use sophisticated vocabulary appropriately',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn topic-specific vocabulary and collocations. Master paraphrasing and avoiding repetition.',
          },
          {
            id: 24,
            title: 'Coherence and Cohesion Masterclass',
            description: 'Link ideas smoothly with cohesive devices',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn to use linking words naturally. Master paragraph progression and idea development.',
          },
          {
            id: 25,
            title: 'Practice Writing with Feedback (20 Tasks)',
            description:
              'Submit your writing for personalized examiner feedback',
            duration: 160,
            type: 'assignment',
            isFree: false,
            resources: [
              '20 Writing Tasks',
              'Model Answers',
              'Personal Feedback',
            ],
            content:
              'Write 10 Task 1 and 10 Task 2 essays. Receive detailed feedback with band scores from Anita.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: IELTS Speaking Band 8',
        description:
          'Speak fluently and confidently in all three parts of the speaking test with natural expressions and complex grammar.',
        duration: 420,
        lessons: [
          {
            id: 26,
            title: 'Speaking Test Format and Assessment',
            description: 'Understand the three parts and marking criteria',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Learn what happens in the 11-14 minute speaking test. Understand how fluency, vocabulary, grammar, pronunciation are scored.',
          },
          {
            id: 27,
            title: 'Part 1: Introduction and Interview',
            description: 'Answer common questions about yourself naturally',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master responses for common topics: home, work, studies, hobbies. Learn to extend answers beyond one sentence.',
          },
          {
            id: 28,
            title: 'Part 2: Long Turn (Cue Card)',
            description: 'Speak for 2 minutes on a given topic',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn the 1-minute planning strategy. Master structuring 2-minute responses and handling different topic types.',
          },
          {
            id: 29,
            title: 'Part 3: Discussion and Abstract Questions',
            description: 'Handle complex, abstract questions with depth',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn to discuss abstract concepts. Master giving opinions with justifications and examples.',
          },
          {
            id: 30,
            title: 'Fluency and Coherence: Speaking Naturally',
            description: 'Speak smoothly without long pauses',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn filler phrases and discourse markers. Master pausing naturally and self-correcting appropriately.',
          },
          {
            id: 31,
            title: 'Pronunciation and Intonation',
            description: 'Be easily understood with clear pronunciation',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Master stress, rhythm, and intonation in English. Learn common pronunciation errors and how to fix them.',
          },
          {
            id: 32,
            title: 'Advanced Vocabulary and Idioms',
            description: 'Use sophisticated expressions naturally',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn Band 8 vocabulary and collocations. Master using idioms appropriately without sounding forced.',
          },
          {
            id: 33,
            title: 'Mock Speaking Tests (10 Full Tests)',
            description: 'Practice with real examiner-style mock tests',
            duration: 125,
            type: 'live',
            isFree: false,
            content:
              '10 one-on-one mock speaking tests with Anita. Receive detailed band score breakdown and improvement tips.',
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Full Stack Web Development: MERN Stack Bootcamp',
    slug: 'full-stack-mern-bootcamp',
    subject: 'Web Development',
    category: 'Technology',
    level: 'professional',
    description:
      'Master MongoDB, Express, React, Node.js and build 10 real-world projects. From beginner to job-ready in 16 weeks',
    longDescription:
      'Become a full-stack web developer by building real-world applications with the MERN stack. This intensive bootcamp covers everything from HTML/CSS basics to deploying scalable web applications. Learn MongoDB for databases, Express.js for backend APIs, React for frontend, and Node.js for server-side programming. Build 10 portfolio-worthy projects including e-commerce site, social media app, and real-time chat application. Taught by Arjun Mehta, Senior Engineer with 10 years at Google and Microsoft. This course has helped 500+ students land developer jobs at tech companies.',
    thumbnail:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/nu_pCVPKzTk',
    teacherId: 4,
    price: 4999,
    originalPrice: 8999,
    currency: 'INR',
    duration: 16,
    totalHours: 65,
    sessionsPerWeek: 4,
    mode: 'online',
    language: 'English',
    enrolledStudents: 2134,
    maxStudents: 3000,
    rating: 4.9,
    totalReviews: 1245,
    startDate: '2025-11-15',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Fri 8:00 PM', 'Sun 8:00 PM'],
    learningOutcomes: [
      'Build full-stack web applications from scratch',
      'Master React for modern, responsive frontends',
      'Create RESTful APIs with Node.js and Express',
      'Work with MongoDB and Mongoose for databases',
      'Implement authentication and authorization',
      'Deploy applications to cloud platforms',
      'Use Git, GitHub for version control',
      'Build a professional portfolio with 10 projects',
      'Prepare for web developer job interviews',
    ],
    prerequisites: [
      'Basic computer skills and internet navigation',
      'Enthusiasm to learn coding',
      'No prior programming experience required',
      'Computer with 8GB RAM minimum',
    ],
    targetAudience: [
      'Complete beginners wanting to become web developers',
      'Career changers entering tech industry',
      'Freelancers wanting to build web applications',
      'Students preparing for tech internships',
      'Entrepreneurs wanting to build their own products',
    ],
    features: [
      '65 hours of comprehensive video tutorials',
      '10 real-world projects for your portfolio',
      'Live coding sessions every week',
      'Code reviews and personalized feedback',
      'Resume and LinkedIn profile optimization',
      'Mock technical interviews',
      'Job search strategies and referrals',
      'Access to private community of developers',
      'Lifetime access to all materials and updates',
      'Certificate of completion',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'Web Development',
      'MERN Stack',
      'React',
      'Node.js',
      'MongoDB',
      'Full Stack',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Frontend Fundamentals',
        description:
          'Master HTML, CSS, JavaScript, and modern frontend development before diving into React.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Web Development in 2025: Complete Roadmap',
            description: 'Understand the web development landscape',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              "Learn about frontend, backend, full-stack roles. Understand what you'll learn and career opportunities.",
          },
          {
            id: 2,
            title: 'HTML Essentials: Structure of Web Pages',
            description: 'Master semantic HTML5 elements',
            duration: 50,
            type: 'video',
            isFree: true,
            content:
              'Learn HTML tags, attributes, semantic elements. Build your first web page from scratch.',
          },
          {
            id: 3,
            title: 'CSS Fundamentals: Styling the Web',
            description: 'Style web pages with CSS3',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master selectors, box model, colors, fonts. Learn flexbox and CSS grid for layouts.',
          },
          {
            id: 4,
            title: 'Responsive Design: Mobile-First Approach',
            description: 'Build websites that work on all devices',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master media queries, responsive units, mobile-first design. Make your sites look great on any screen size.',
          },
          {
            id: 5,
            title: 'JavaScript Basics: Programming Fundamentals',
            description: 'Learn programming with JavaScript',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Master variables, data types, operators, control flow, loops. Write your first JavaScript programs.',
          },
          {
            id: 6,
            title: 'JavaScript Functions and Scope',
            description: 'Master functions, closures, and scope',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Learn function declarations, expressions, arrow functions, scope, closures, IIFE.',
          },
          {
            id: 7,
            title: 'DOM Manipulation and Events',
            description: 'Make web pages interactive',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Master selecting elements, modifying DOM, handling events, creating interactive interfaces.',
          },
          {
            id: 8,
            title: 'Asynchronous JavaScript: Promises and Async/Await',
            description: 'Handle asynchronous operations',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master callbacks, promises, async/await, fetch API. Learn to work with APIs and handle data.',
          },
          {
            id: 9,
            title: 'Project 1: Portfolio Website',
            description: 'Build your first responsive portfolio site',
            duration: 155,
            type: 'assignment',
            isFree: false,
            resources: [
              'Project Starter Files',
              'Design Mockup',
              'Deployment Guide',
            ],
            content:
              'Create a fully responsive portfolio website using HTML, CSS, and JavaScript. Deploy it live.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: React Frontend Development',
        description:
          'Master React, the most popular frontend library. Build modern, performant user interfaces.',
        duration: 720,
        lessons: [
          {
            id: 10,
            title: 'React Fundamentals: Components and JSX',
            description:
              'Introduction to React and component-based architecture',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand React philosophy. Learn JSX, components, props. Create your first React app.',
          },
          {
            id: 11,
            title: 'State and Props: Managing Data in React',
            description: 'Handle component data and communication',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master useState hook, props passing, lifting state up. Build interactive components.',
          },
          {
            id: 12,
            title: 'React Hooks: useEffect and Custom Hooks',
            description:
              'Side effects and reusable logic in functional components',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Master useEffect for side effects, data fetching. Create custom hooks for reusable logic.',
          },
          {
            id: 13,
            title: 'React Router: Navigation and Routing',
            description: 'Build single-page applications with routing',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master React Router v6. Implement navigation, nested routes, protected routes, URL parameters.',
          },
          {
            id: 14,
            title: 'State Management with Context API and Redux',
            description: 'Manage global state in large applications',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn Context API for simple state. Master Redux Toolkit for complex state management.',
          },
          {
            id: 15,
            title: 'React Best Practices and Performance',
            description: 'Write clean, performant React code',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn code organization, performance optimization, React.memo, useMemo, useCallback.',
          },
          {
            id: 16,
            title: 'Styling in React: CSS Modules and Styled Components',
            description: 'Different approaches to styling React apps',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master CSS Modules, Styled Components, Tailwind CSS integration for styling.',
          },
          {
            id: 17,
            title: 'Project 2: Todo App with Local Storage',
            description: 'Build a feature-rich todo application',
            duration: 120,
            type: 'assignment',
            isFree: false,
            resources: ['Figma Design', 'Starter Code', 'Testing Guide'],
            content:
              'Create a todo app with CRUD operations, filtering, local storage persistence.',
          },
          {
            id: 18,
            title: 'Project 3: Movie Search App using API',
            description: 'Fetch and display data from external API',
            duration: 205,
            type: 'assignment',
            isFree: false,
            resources: ['API Documentation', 'Design Files', 'Solution Code'],
            content:
              'Build a movie search application using OMDb API. Implement search, filtering, detailed views.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Backend with Node.js and Express',
        description:
          'Build robust backend APIs with Node.js, Express, and MongoDB for your applications.',
        duration: 660,
        lessons: [
          {
            id: 19,
            title: 'Node.js Fundamentals: Server-Side JavaScript',
            description: 'Introduction to Node.js and its ecosystem',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand Node.js architecture, event loop. Work with modules, npm, and file system.',
          },
          {
            id: 20,
            title: 'Express.js: Building Web Servers and APIs',
            description: 'Create RESTful APIs with Express',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master Express routing, middleware, request/response. Build your first REST API.',
          },
          {
            id: 21,
            title: 'MongoDB: NoSQL Database Fundamentals',
            description: 'Store and query data with MongoDB',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn MongoDB CRUD operations, queries, indexing. Use MongoDB Atlas cloud database.',
          },
          {
            id: 22,
            title: 'Mongoose: ODM for MongoDB',
            description: 'Model data and relationships in MongoDB',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master Mongoose schemas, models, validation, relationships. Build structured data models.',
          },
          {
            id: 23,
            title: 'Authentication: JWT and Passport.js',
            description: 'Implement secure user authentication',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Master JWT tokens, password hashing with bcrypt. Implement registration, login, protected routes.',
          },
          {
            id: 24,
            title: 'File Upload and Image Processing',
            description: 'Handle file uploads in your applications',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn Multer for file uploads. Process and resize images with Sharp library.',
          },
          {
            id: 25,
            title: 'Error Handling and Validation',
            description: 'Build robust APIs with proper error handling',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master error handling middleware. Implement input validation with Joi or Express Validator.',
          },
          {
            id: 26,
            title: 'Project 4: Blog REST API',
            description: 'Build a complete blog backend with CRUD operations',
            duration: 270,
            type: 'assignment',
            isFree: false,
            resources: [
              'API Specification',
              'Postman Collection',
              'Database Schema',
            ],
            content:
              'Create a full-featured blog API with posts, comments, users, authentication, and authorization.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Full Stack Projects and Deployment',
        description:
          'Connect frontend and backend. Build complete full-stack applications and deploy them to production.',
        duration: 900,
        lessons: [
          {
            id: 27,
            title: 'Connecting React Frontend to Node Backend',
            description: 'Integrate frontend and backend seamlessly',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Handle CORS, proxy setup, API calls from React. Manage loading states and errors.',
          },
          {
            id: 28,
            title: 'Project 5: E-Commerce Application',
            description:
              'Build a full-stack e-commerce site with cart and checkout',
            duration: 300,
            type: 'assignment',
            isFree: false,
            resources: [
              'Complete Design',
              'Feature Specifications',
              'Deployment Checklist',
            ],
            content:
              'Create an e-commerce platform with products, shopping cart, user authentication, order management.',
          },
          {
            id: 29,
            title: 'Project 6: Social Media App with Image Upload',
            description: 'Build a social media platform with posts and likes',
            duration: 280,
            type: 'assignment',
            isFree: false,
            resources: ['Figma Design', 'Database Schema', 'Feature List'],
            content:
              'Create a social media app with posts, likes, comments, image uploads, user profiles.',
          },
          {
            id: 30,
            title: 'Real-Time Communication with Socket.io',
            description: 'Add real-time features to your applications',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Master Socket.io for WebSocket communication. Build real-time notifications and chat.',
          },
          {
            id: 31,
            title: 'Project 7: Real-Time Chat Application',
            description: 'Build a chat app with private and group messaging',
            duration: 200,
            type: 'live',
            isFree: false,
            content:
              'Create a real-time chat application with Socket.io, online status, typing indicators, message history.',
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Biology for NEET: Complete Preparation Course',
    slug: 'biology-neet-complete',
    subject: 'Biology',
    category: 'Science & Math',
    level: 'high_school',
    description:
      'Complete NEET Biology with 350+ score guarantee. Master Botany, Zoology, Human Physiology with clinical correlations',
    longDescription:
      'Comprehensive NEET Biology course by Vikram Singh, AIIMS graduate and practicing doctor with 16 years of teaching experience. Master all NEET Biology topics with clinical correlations that make concepts memorable. Learn Botany, Zoology, Human Anatomy, Physiology, Genetics, Ecology with visual diagrams and mnemonics. This course includes 1500+ NEET previous year questions, high-yield topic emphasis, and systematic approach to scoring 350+/360 in NEET Biology. Students consistently achieve 95%+ in Biology after this course.',
    thumbnail:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/URUJD5NEXC8',
    teacherId: 6,
    price: 3499,
    originalPrice: 5999,
    currency: 'INR',
    duration: 20,
    totalHours: 62,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 1456,
    maxStudents: 2000,
    rating: 4.9,
    totalReviews: 789,
    startDate: '2025-11-18',
    schedule: ['Tue 7:00 PM', 'Thu 7:00 PM', 'Sat 7:00 PM'],
    learningOutcomes: [
      'Master all NEET Biology syllabus: Botany, Zoology, Human Biology',
      'Score 350+/360 in NEET Biology section',
      'Understand concepts through clinical correlations',
      'Remember complex topics using proven mnemonics',
      'Solve 1500+ NEET PYQs with complete explanations',
      'Master diagrams and labeling for exam',
      'Develop time management for Biology section',
      'Build confidence for AIIMS, JIPMER, NEET exams',
    ],
    prerequisites: [
      'Class 10 Biology basics',
      'Understanding of basic cell structure',
      'Enthusiasm to learn medical biology',
      'Target: Medical college admission',
    ],
    targetAudience: [
      'NEET aspirants (Class 11 and 12)',
      'Students targeting AIIMS, JIPMER',
      'Those who need strong Biology foundation',
      'Re-takers wanting to improve Biology score',
      'Students aiming for top medical colleges',
    ],
    features: [
      '62 hours of doctor-taught biology lectures',
      '1500+ NEET PYQs (1990-2024) with solutions',
      'Clinical correlations for every topic',
      'Comprehensive diagram bank with practice',
      'Mnemonics and memory techniques throughout',
      'Topic-wise tests and full-length mocks',
      'Weekly live doubt clearing sessions',
      'High-yield topics and question patterns analysis',
      'Personal mentorship from Vikram',
      'Lifetime access with free content updates',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    tags: [
      'Biology',
      'NEET',
      'Medical Entrance',
      'Botany',
      'Zoology',
      'Human Physiology',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Cell Biology and Biomolecules',
        description:
          'Foundation of life - cell structure, cell cycle, and biomolecules essential for NEET.',
        duration: 420,
        lessons: [
          {
            id: 1,
            title: 'The Cell: Unit of Life',
            description: 'Prokaryotic and eukaryotic cells with ultrastructure',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Master cell structure, organelles, and their functions. Learn to draw and label cell diagrams for exams.',
          },
          {
            id: 2,
            title: 'Biomolecules: Structure and Function',
            description: 'Carbohydrates, proteins, lipids, nucleic acids',
            duration: 50,
            type: 'video',
            isFree: true,
            content:
              'Understand structure and biological roles of all biomolecules. Master enzyme kinetics and regulation.',
          },
          {
            id: 3,
            title: 'Cell Cycle and Cell Division',
            description: 'Mitosis, meiosis and their significance',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master phases of cell cycle, mitosis, and meiosis. Understand chromosomal behavior and significance.',
          },
          {
            id: 4,
            title: 'Practice: Cell Biology (150 NEET Questions)',
            description: 'Previous year questions on cell biology',
            duration: 60,
            type: 'assignment',
            isFree: false,
            resources: [
              '150 NEET PYQs',
              'Diagram Practice',
              'Solutions Manual',
            ],
            content:
              'Comprehensive practice covering all cell biology topics from NEET 2005-2024.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Plant Physiology and Botany',
        description:
          'Complete botany for NEET including plant anatomy, physiology, reproduction, and ecology.',
        duration: 540,
        lessons: [
          {
            id: 5,
            title: 'Plant Anatomy: Tissues and Tissue Systems',
            description: 'Meristematic and permanent tissues in plants',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master plant tissue structure and organization. Learn anatomy of root, stem, and leaf.',
          },
          {
            id: 6,
            title: 'Photosynthesis: Light and Dark Reactions',
            description: 'Complete mechanism of photosynthesis',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand light reactions and Calvin cycle. Master C3, C4, and CAM pathways with diagrams.',
          },
          {
            id: 7,
            title: 'Plant Respiration and Mineral Nutrition',
            description: 'Cellular respiration and essential nutrients',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn glycolysis, Krebs cycle, ETC. Master macro and micronutrients with deficiency symptoms.',
          },
          {
            id: 8,
            title: 'Plant Growth and Development',
            description: 'Growth regulators and their applications',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master auxins, gibberellins, cytokinins, ethylene, ABA. Understand photoperiodism and vernalization.',
          },
          {
            id: 9,
            title: 'Plant Reproduction: Sexual and Asexual',
            description: 'Complete reproductive biology of flowering plants',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand flower structure, pollination, fertilization, seed formation. Master asexual reproduction methods.',
          },
          {
            id: 10,
            title: 'Practice: Botany (300 NEET Questions)',
            description: 'Comprehensive botany practice for NEET',
            duration: 70,
            type: 'assignment',
            isFree: false,
            resources: [
              '300 Botany Questions',
              'Diagram Bank',
              'Topic-wise Analysis',
            ],
            content:
              'Questions covering all botany topics with detailed explanations and diagrams.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Human Physiology and Health',
        description:
          'Complete human anatomy and physiology with clinical correlations for NEET.',
        duration: 660,
        lessons: [
          {
            id: 11,
            title: 'Digestive System and Nutrition',
            description: 'Alimentary canal, digestion, absorption',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master digestive system anatomy, enzyme functions, absorption mechanisms. Learn clinical correlations.',
          },
          {
            id: 12,
            title: 'Respiratory System and Gas Exchange',
            description: 'Breathing mechanism and transport of gases',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand lung anatomy, breathing mechanism, O2 and CO2 transport. Master respiratory disorders.',
          },
          {
            id: 13,
            title: 'Circulatory System: Heart and Blood',
            description: 'Cardiac cycle, blood vessels, and blood composition',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Learn heart structure, cardiac cycle, ECG. Master blood groups, coagulation, and disorders.',
          },
          {
            id: 14,
            title: 'Excretory System and Osmoregulation',
            description: 'Kidney structure and urine formation',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master nephron structure, urine formation mechanism, hormonal regulation. Learn kidney disorders.',
          },
          {
            id: 15,
            title: 'Nervous System and Sense Organs',
            description: 'CNS, PNS, and sensory reception',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Understand neuron structure, impulse transmission, brain anatomy. Master eye and ear structure.',
          },
          {
            id: 16,
            title: 'Endocrine System and Hormones',
            description: 'Glands and their hormone secretions',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master all endocrine glands, hormones, functions. Learn hypo and hyper secretion disorders.',
          },
          {
            id: 17,
            title: 'Immune System and Immunity',
            description: 'Innate and acquired immunity mechanisms',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand immune organs, cells, antibodies. Master active/passive immunity, vaccines, immunological disorders.',
          },
          {
            id: 18,
            title: 'Reproduction and Development',
            description: 'Human reproductive system and embryology',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master male and female reproductive systems, gametogenesis, fertilization, embryonic development.',
          },
          {
            id: 19,
            title: 'Practice: Human Physiology (400 Questions)',
            description: 'Extensive practice on all physiology topics',
            duration: 75,
            type: 'assignment',
            isFree: false,
            resources: [
              '400 Physiology Questions',
              'Clinical Cases',
              'Diagram Practice',
            ],
            content:
              'Comprehensive questions with clinical correlations and detailed explanations.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Genetics, Evolution, and Ecology',
        description:
          'Master genetics, molecular biology, evolution, and ecology for NEET with problem-solving.',
        duration: 540,
        lessons: [
          {
            id: 20,
            title: 'Mendelian Genetics and Inheritance',
            description: 'Laws of inheritance and pedigree analysis',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              "Master Mendel's laws, test cross, back cross. Solve pedigree problems and predict inheritance patterns.",
          },
          {
            id: 21,
            title: 'Molecular Basis of Inheritance',
            description: 'DNA, RNA, replication, transcription, translation',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand DNA structure, central dogma, genetic code. Master replication, transcription, translation mechanisms.',
          },
          {
            id: 22,
            title: 'Biotechnology and Applications',
            description: 'rDNA technology and its applications',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn genetic engineering techniques, PCR, cloning vectors. Understand biotechnology applications in medicine, agriculture.',
          },
          {
            id: 23,
            title: 'Evolution: Origin and Evidence',
            description: 'Theories of evolution and supporting evidence',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              "Master Darwin's theory, modern synthetic theory. Understand evidences, Hardy-Weinberg principle, speciation.",
          },
          {
            id: 24,
            title: 'Ecology and Environment',
            description: 'Ecosystem, biodiversity, conservation',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand ecosystem components, energy flow, biogeochemical cycles. Master biodiversity and conservation strategies.',
          },
          {
            id: 25,
            title: 'Live Session: High-Yield Topics Revision',
            description: 'Focus on most important topics for NEET',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Vikram covers high-yield topics with quick revision techniques and exam strategies.',
          },
          {
            id: 26,
            title: 'Final Practice: 500 Mixed Biology Questions',
            description: 'Full-length practice covering entire syllabus',
            duration: 80,
            type: 'assignment',
            isFree: false,
            resources: ['500 Questions PDF', 'OMR Sheet', 'Detailed Analysis'],
            content:
              'NEET-style questions covering all topics with time-bound practice and performance analysis.',
          },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Machine Learning & AI: From Basics to Advanced',
    slug: 'machine-learning-ai-complete',
    subject: 'Artificial Intelligence',
    category: 'Technology',
    level: 'professional',
    description:
      'Complete ML/AI course with hands-on projects. Master algorithms, deep learning, NLP, and deploy production models',
    longDescription:
      'Comprehensive Machine Learning and AI course by Robert Chen, former Data Science Lead at Amazon and Netflix with Stanford PhD. Master supervised and unsupervised learning, deep learning with TensorFlow and PyTorch, Natural Language Processing, Computer Vision, and deployment strategies. Build 8 industry-level projects including recommendation system, image classifier, chatbot, and more. This course has helped 500+ students transition into AI/ML roles at top tech companies. Perfect for aspiring data scientists, ML engineers, and AI researchers.',
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/aircAruvnKk',
    teacherId: 7,
    price: 5999,
    originalPrice: 9999,
    currency: 'INR',
    duration: 20,
    totalHours: 72,
    sessionsPerWeek: 4,
    mode: 'online',
    language: 'English',
    enrolledStudents: 2345,
    maxStudents: 3000,
    rating: 4.9,
    totalReviews: 1456,
    startDate: '2025-11-20',
    schedule: ['Mon 9:00 PM', 'Tue 9:00 PM', 'Thu 9:00 PM', 'Sat 9:00 PM'],
    learningOutcomes: [
      'Master machine learning algorithms from scratch',
      'Build and train deep neural networks with TensorFlow/PyTorch',
      'Implement NLP models for text analysis and generation',
      'Create computer vision systems for image recognition',
      'Deploy ML models to production with MLOps',
      'Work with real-world datasets and handle data preprocessing',
      'Understand mathematics behind ML algorithms',
      'Build portfolio with 8 production-ready ML projects',
    ],
    prerequisites: [
      'Python programming proficiency',
      'Basic mathematics (linear algebra, calculus, probability)',
      'Understanding of programming concepts',
      'Passion for AI and machine learning',
    ],
    targetAudience: [
      'Software engineers transitioning to ML/AI',
      'Data analysts wanting to become data scientists',
      'Students pursuing ML research or careers',
      'Product managers wanting to understand AI',
      'Anyone passionate about artificial intelligence',
    ],
    features: [
      '72 hours of in-depth ML/AI instruction',
      '8 industry-level projects for portfolio',
      'Code in Python, TensorFlow, PyTorch, scikit-learn',
      'Kaggle competition strategies and practice',
      'Research paper discussions and implementations',
      'Interview preparation for ML engineer roles',
      'Access to GPU cloud resources for training',
      'Weekly live coding and Q&A sessions',
      'Lifetime access to course and future updates',
      'Certificate of completion from Stanford PhD',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'Machine Learning',
      'AI',
      'Deep Learning',
      'TensorFlow',
      'PyTorch',
      'Data Science',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Machine Learning Foundations',
        description:
          'Build strong ML foundations with supervised and unsupervised learning algorithms.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Introduction to Machine Learning and AI',
            description: 'Overview of ML landscape and career paths',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              'Understand ML vs AI vs DL. Learn about different types of learning, applications, and career opportunities.',
          },
          {
            id: 2,
            title: 'Python for Machine Learning',
            description: 'NumPy, Pandas, Matplotlib essentials',
            duration: 50,
            type: 'video',
            isFree: true,
            content:
              'Master essential Python libraries for ML. Learn data manipulation, visualization, and numerical computing.',
          },
          {
            id: 3,
            title: 'Linear Regression: Theory and Implementation',
            description: 'Your first ML algorithm from scratch',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand linear regression mathematics. Implement from scratch and using scikit-learn. Master gradient descent.',
          },
          {
            id: 4,
            title: 'Logistic Regression for Classification',
            description: 'Binary and multiclass classification',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master logistic regression for classification. Understand sigmoid function, decision boundary, and regularization.',
          },
          {
            id: 5,
            title: 'Decision Trees and Random Forests',
            description: 'Ensemble learning methods',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn decision tree algorithms. Master random forests, bagging, feature importance.',
          },
          {
            id: 6,
            title: 'Support Vector Machines (SVM)',
            description: 'Powerful classification algorithm with kernels',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Understand SVM mathematics, kernel trick. Implement for linear and non-linear classification.',
          },
          {
            id: 7,
            title: 'Clustering: K-Means and Hierarchical',
            description: 'Unsupervised learning algorithms',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master K-means clustering algorithm. Learn hierarchical clustering and when to use each.',
          },
          {
            id: 8,
            title: 'Dimensionality Reduction: PCA and t-SNE',
            description: 'Reduce features while preserving information',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Understand Principal Component Analysis. Learn t-SNE for visualization, feature engineering.',
          },
          {
            id: 9,
            title: 'Model Evaluation and Validation',
            description: 'Metrics, cross-validation, bias-variance tradeoff',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master accuracy, precision, recall, F1, ROC-AUC. Learn cross-validation, overfitting prevention.',
          },
          {
            id: 10,
            title: 'Project 1: House Price Prediction',
            description: 'End-to-end ML project with regression',
            duration: 170,
            type: 'assignment',
            isFree: false,
            resources: [
              'Dataset',
              'Jupyter Notebook Template',
              'Evaluation Metrics',
            ],
            content:
              'Build complete ML pipeline: data preprocessing, feature engineering, model training, evaluation, deployment.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Deep Learning with Neural Networks',
        description:
          'Master deep learning fundamentals and build neural networks with TensorFlow and PyTorch.',
        duration: 720,
        lessons: [
          {
            id: 11,
            title: 'Neural Networks: Perceptrons to Deep Networks',
            description: 'Build intuition for how neural networks learn',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand neurons, activation functions, forward propagation. Learn backpropagation mathematically.',
          },
          {
            id: 12,
            title: 'TensorFlow and Keras Fundamentals',
            description: 'Master TensorFlow 2.x for deep learning',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn TensorFlow basics, Keras API. Build your first neural network, train and evaluate.',
          },
          {
            id: 13,
            title: 'Convolutional Neural Networks (CNN)',
            description: 'Deep learning for computer vision',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Master CNN architecture: convolution, pooling, filters. Implement image classification networks.',
          },
          {
            id: 14,
            title: 'Recurrent Neural Networks and LSTM',
            description: 'Sequential data and time series modeling',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand RNN, LSTM, GRU for sequences. Master vanishing gradient problem and solutions.',
          },
          {
            id: 15,
            title: 'Transfer Learning and Fine-Tuning',
            description: 'Leverage pre-trained models for your tasks',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn transfer learning with ResNet, VGG, BERT. Master fine-tuning strategies for different tasks.',
          },
          {
            id: 16,
            title: 'Hyperparameter Tuning and Optimization',
            description: 'Improve model performance systematically',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master grid search, random search, Bayesian optimization. Learn learning rate scheduling, batch size tuning.',
          },
          {
            id: 17,
            title: 'Project 2: Image Classification with CNN',
            description: 'Build production-ready image classifier',
            duration: 180,
            type: 'assignment',
            isFree: false,
            resources: [
              'Image Dataset',
              'Pre-trained Models',
              'Deployment Guide',
            ],
            content:
              'Create image classification system using CNN and transfer learning. Deploy as REST API.',
          },
          {
            id: 18,
            title: 'Project 3: Sentiment Analysis with RNN',
            description: 'Text classification using deep learning',
            duration: 205,
            type: 'assignment',
            isFree: false,
            resources: [
              'Text Dataset',
              'Word Embeddings',
              'Evaluation Metrics',
            ],
            content:
              'Build sentiment analysis model for movie reviews using LSTM networks and word embeddings.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Advanced Topics: NLP, CV, and Transformers',
        description:
          'Master cutting-edge AI with NLP, Computer Vision, and Transformer architectures.',
        duration: 660,
        lessons: [
          {
            id: 19,
            title: 'Natural Language Processing Fundamentals',
            description: 'Text preprocessing and feature extraction',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn tokenization, stemming, lemmatization. Master TF-IDF, word embeddings (Word2Vec, GloVe).',
          },
          {
            id: 20,
            title: 'Transformers and Attention Mechanism',
            description: 'Revolutionary architecture powering modern NLP',
            duration: 65,
            type: 'video',
            isFree: false,
            content:
              'Understand self-attention, multi-head attention. Learn Transformer architecture in detail.',
          },
          {
            id: 21,
            title: 'BERT, GPT, and Large Language Models',
            description: 'State-of-the-art NLP models',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master BERT for understanding, GPT for generation. Learn to fine-tune LLMs for specific tasks.',
          },
          {
            id: 22,
            title: 'Object Detection: YOLO and R-CNN',
            description: 'Detect and localize objects in images',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand object detection architectures. Implement YOLO, Faster R-CNN for real-time detection.',
          },
          {
            id: 23,
            title: 'Generative AI: GANs and Diffusion Models',
            description: 'Create synthetic data and images',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Master GAN architecture. Learn diffusion models for image generation (Stable Diffusion concepts).',
          },
          {
            id: 24,
            title: 'Recommender Systems',
            description: 'Build personalization engines',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn collaborative filtering, content-based filtering, hybrid systems. Understand Netflix-style recommendations.',
          },
          {
            id: 25,
            title: 'Project 4: Chatbot with Transformers',
            description: 'Build conversational AI using BERT/GPT',
            duration: 200,
            type: 'assignment',
            isFree: false,
            resources: [
              'Conversation Dataset',
              'Pre-trained Models',
              'Deployment Code',
            ],
            content:
              'Create an intelligent chatbot using transformer models. Fine-tune for specific domain conversations.',
          },
          {
            id: 26,
            title: 'Live Session: Cutting-Edge AI Research',
            description: 'Discussion of latest papers and trends',
            duration: 120,
            type: 'live',
            isFree: false,
            content:
              'Chen discusses latest AI research, breakthrough papers, and future directions in the field.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: MLOps and Production Deployment',
        description:
          'Deploy ML models to production with best practices and MLOps principles.',
        duration: 540,
        lessons: [
          {
            id: 27,
            title: 'Model Deployment Strategies',
            description: 'Serve ML models in production',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn REST APIs, batch inference, real-time inference. Master Flask, FastAPI for model serving.',
          },
          {
            id: 28,
            title: 'Docker and Containerization for ML',
            description: 'Package ML applications',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master Docker for ML. Create containers for reproducible ML environments.',
          },
          {
            id: 29,
            title: 'Cloud ML: AWS SageMaker and GCP AI',
            description: 'Deploy on cloud platforms',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Learn AWS SageMaker, GCP AI Platform. Deploy and scale ML models on cloud.',
          },
          {
            id: 30,
            title: 'ML Monitoring and Maintenance',
            description: 'Track model performance in production',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Monitor models for drift, performance degradation. Implement A/B testing, continuous training.',
          },
          {
            id: 31,
            title: 'Interview Preparation for ML Roles',
            description: 'Crack ML engineer and data scientist interviews',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Common ML interview questions, coding problems, system design. Mock interview practice.',
          },
          {
            id: 32,
            title: 'Final Project: End-to-End ML System',
            description: 'Build complete production ML pipeline',
            duration: 285,
            type: 'assignment',
            isFree: false,
            resources: [
              'Project Requirements',
              'Cloud Credits',
              'Best Practices Guide',
            ],
            content:
              'Create full ML system: data pipeline, model training, deployment, monitoring. Present to peer review.',
          },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Python Programming: From Zero to Advanced',
    slug: 'python-programming-complete',
    subject: 'Programming',
    category: 'Technology',
    level: 'all_levels',
    description:
      'Complete Python course for beginners. Master programming fundamentals, OOP, data structures, and build real projects',
    longDescription:
      "Learn Python from scratch with Arjun Mehta, Senior Engineer at Google. This beginner-friendly course covers Python basics, data structures, object-oriented programming, file handling, web scraping, APIs, and more. Build 15+ projects including games, web apps, automation scripts, and data analysis tools. Perfect for absolute beginners with zero programming experience. By the end, you'll be proficient in Python and ready to build your own applications or transition to specialized fields like web development, data science, or automation.",
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
    teacherId: 4,
    price: 1999,
    originalPrice: 3999,
    currency: 'INR',
    duration: 10,
    totalHours: 38,
    sessionsPerWeek: 4,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3456,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 2134,
    startDate: '2025-11-22',
    schedule: ['Mon 10:00 PM', 'Tue 10:00 PM', 'Thu 10:00 PM', 'Sat 10:00 PM'],
    learningOutcomes: [
      'Master Python programming from absolute basics',
      'Understand programming fundamentals: variables, loops, functions',
      'Work with data structures: lists, dictionaries, sets, tuples',
      'Write object-oriented code with classes and objects',
      'Handle files and work with external APIs',
      'Build web scrapers and automation scripts',
      'Create GUI applications with Tkinter',
      'Build 15+ real-world Python projects',
    ],
    prerequisites: [
      'Basic computer literacy',
      'No programming experience required',
      'Enthusiasm to learn coding',
      'Computer with internet connection',
    ],
    targetAudience: [
      'Complete programming beginners',
      'Students learning first programming language',
      'Professionals wanting to learn automation',
      'Anyone interested in data science, web dev, or AI',
      'Career changers entering tech industry',
    ],
    features: [
      '38 hours of beginner-friendly instruction',
      '15+ hands-on Python projects',
      'Exercise problems after every lesson',
      'Weekly live coding sessions and doubt clearing',
      'Code review and personalized feedback',
      'Python best practices and coding standards',
      'Career guidance for Python developers',
      'Access to private community',
      'Lifetime access to all course materials',
      'Certificate upon completion',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    tags: [
      'Python',
      'Programming',
      'Beginner',
      'Coding',
      'Software Development',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Python Basics',
        description:
          'Start your programming journey with Python fundamentals. Learn syntax, variables, and basic operations.',
        duration: 420,
        lessons: [
          {
            id: 1,
            title: 'Introduction to Programming and Python',
            description: 'Why Python? Setting up your environment',
            duration: 25,
            type: 'video',
            isFree: true,
            content:
              'Understand what programming is. Learn why Python is perfect for beginners. Install Python and VS Code.',
          },
          {
            id: 2,
            title: 'Your First Python Program',
            description: 'Write and run your first code',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              "Write 'Hello World' program. Understand print function, comments, and basic syntax.",
          },
          {
            id: 3,
            title: 'Variables and Data Types',
            description: 'Store and manipulate data',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master variables, integers, floats, strings, booleans. Learn type conversion and dynamic typing.',
          },
          {
            id: 4,
            title: 'Operators and Expressions',
            description: 'Perform calculations and comparisons',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Learn arithmetic, comparison, logical, and assignment operators. Master operator precedence.',
          },
          {
            id: 5,
            title: 'Input and Output',
            description: 'Interact with users',
            duration: 30,
            type: 'video',
            isFree: false,
            content:
              'Get user input using input(). Format output with f-strings. Build interactive programs.',
          },
          {
            id: 6,
            title: 'Conditional Statements: if, elif, else',
            description: 'Make decisions in your programs',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master if-elif-else statements. Learn nested conditions and boolean logic.',
          },
          {
            id: 7,
            title: 'Loops: for and while',
            description: 'Repeat actions efficiently',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master for and while loops. Learn break, continue, range(). Build practical looping programs.',
          },
          {
            id: 8,
            title: 'Projects: Calculator, Number Guessing Game',
            description: 'Build your first Python projects',
            duration: 165,
            type: 'assignment',
            isFree: false,
            resources: [
              'Project Requirements',
              'Starter Code',
              'Solution Videos',
            ],
            content:
              'Create calculator app and number guessing game. Practice everything learned so far.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Data Structures and Functions',
        description:
          "Master Python's built-in data structures and write reusable code with functions.",
        duration: 540,
        lessons: [
          {
            id: 9,
            title: 'Lists: The Most Versatile Data Structure',
            description: 'Store and manipulate collections of data',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master list operations: indexing, slicing, appending, sorting. Learn list comprehensions.',
          },
          {
            id: 10,
            title: 'Tuples and Sets',
            description: 'Immutable sequences and unique collections',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Understand tuples for immutable data. Master sets for unique elements and set operations.',
          },
          {
            id: 11,
            title: 'Dictionaries: Key-Value Pairs',
            description: 'Store data with meaningful labels',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master dictionary operations. Learn nested dictionaries, dictionary methods, and use cases.',
          },
          {
            id: 12,
            title: 'Functions: Reusable Code Blocks',
            description: "Write DRY (Don't Repeat Yourself) code",
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Define functions, parameters, return values. Master *args, **kwargs, default arguments.',
          },
          {
            id: 13,
            title: 'Lambda Functions and Built-in Functions',
            description: "Anonymous functions and Python's toolbox",
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn lambda functions. Master map, filter, reduce, zip, enumerate functions.',
          },
          {
            id: 14,
            title: 'Modules and Packages',
            description: 'Organize and reuse code across projects',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Import modules, create your own modules. Understand __name__, __main__, and package structure.',
          },
          {
            id: 15,
            title: 'Projects: Todo App, Contact Book',
            description: 'Build CLI applications with data structures',
            duration: 260,
            type: 'assignment',
            isFree: false,
            resources: [
              'Feature Requirements',
              'Database Design',
              'Testing Guide',
            ],
            content:
              'Create command-line todo app and contact management system using lists and dictionaries.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Object-Oriented Programming',
        description:
          'Master OOP concepts: classes, objects, inheritance, and build scalable applications.',
        duration: 480,
        lessons: [
          {
            id: 16,
            title: 'Introduction to OOP Concepts',
            description: 'Think in objects and classes',
            duration: 35,
            type: 'video',
            isFree: false,
            content:
              'Understand classes, objects, attributes, methods. Learn why OOP matters.',
          },
          {
            id: 17,
            title: 'Creating Classes and Objects',
            description: 'Define your own data types',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Create classes with __init__. Define methods, instance variables, class variables.',
          },
          {
            id: 18,
            title: 'Inheritance and Polymorphism',
            description: 'Reuse and extend existing code',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master inheritance, method overriding, super(). Understand polymorphism and its benefits.',
          },
          {
            id: 19,
            title: 'Encapsulation and Abstraction',
            description: 'Hide complexity and protect data',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn public, private, protected members. Master property decorators, getters, setters.',
          },
          {
            id: 20,
            title: 'Special Methods and Operator Overloading',
            description: 'Make your classes behave like built-in types',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master __str__, __repr__, __len__, __add__. Overload operators for custom classes.',
          },
          {
            id: 21,
            title: 'Projects: Library Management System',
            description: 'Build complete OOP application',
            duration: 255,
            type: 'assignment',
            isFree: false,
            resources: ['Class Diagram', 'UML Design', 'Requirements Doc'],
            content:
              'Create library management system with books, members, transactions using OOP principles.',
          },
        ],
      },
      {
        id: 4,
        title: 'Module 4: File Handling, APIs, and Real Projects',
        description:
          'Work with external data sources and build practical Python applications.',
        duration: 600,
        lessons: [
          {
            id: 22,
            title: 'File Handling: Read and Write Files',
            description: 'Persist data and work with text files',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master file operations: reading, writing, appending. Learn context managers and with statement.',
          },
          {
            id: 23,
            title: 'Working with CSV and JSON',
            description: 'Handle structured data formats',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Read and write CSV files with csv module. Parse and create JSON with json module.',
          },
          {
            id: 24,
            title: 'Error and Exception Handling',
            description: 'Write robust code that handles failures',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master try-except-finally blocks. Handle common exceptions, create custom exceptions.',
          },
          {
            id: 25,
            title: 'Working with APIs and Requests',
            description: 'Fetch data from the internet',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Use requests library to call APIs. Parse JSON responses, handle API authentication.',
          },
          {
            id: 26,
            title: 'Web Scraping with BeautifulSoup',
            description: 'Extract data from websites',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master BeautifulSoup for HTML parsing. Scrape websites ethically and legally.',
          },
          {
            id: 27,
            title: 'GUI Programming with Tkinter',
            description: 'Create desktop applications with interfaces',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Build GUI applications with Tkinter. Create windows, buttons, labels, entry fields, and layouts.',
          },
          {
            id: 28,
            title: 'Final Projects: Weather App, Expense Tracker',
            description: 'Build complete Python applications',
            duration: 300,
            type: 'assignment',
            isFree: false,
            resources: ['API Keys', 'UI Mockups', 'Deployment Guide'],
            content:
              'Create weather app using API and GUI expense tracker. Apply all Python concepts learned.',
          },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Spanish Language: From Beginner to Conversational',
    slug: 'spanish-language-complete',
    subject: 'Spanish',
    category: 'Languages',
    level: 'all_levels',
    description:
      'Learn Spanish from native speaker. Master conversation, grammar, and culture for real-world communication',
    longDescription:
      'Comprehensive Spanish course with Maria Rodriguez, native speaker from Madrid and certified DELE examiner with 11 years of teaching experience. This immersive course covers Spanish from A1 (beginner) to B2 (upper intermediate) levels. Learn practical conversation, essential grammar, cultural insights, and achieve fluency through interactive lessons, real-world scenarios, and consistent practice. Perfect for travelers, professionals working with Spanish speakers, students preparing for DELE exams, or anyone passionate about learning this beautiful language spoken by 500+ million people worldwide.',
    thumbnail:
      'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/DAp_v7EH9AA',
    teacherId: 8,
    price: 2299,
    originalPrice: 3999,
    currency: 'INR',
    duration: 16,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 1234,
    maxStudents: 1500,
    rating: 4.8,
    totalReviews: 678,
    startDate: '2025-11-25',
    schedule: ['Tue 8:30 PM', 'Thu 8:30 PM', 'Sat 8:30 PM'],
    learningOutcomes: [
      'Speak Spanish confidently in everyday situations',
      'Understand native Spanish speakers at normal pace',
      'Master essential Spanish grammar and verb conjugations',
      'Read Spanish texts and write coherent paragraphs',
      'Learn about Spanish and Latin American culture',
      'Achieve B1-B2 level proficiency (CEFR)',
      'Prepare for DELE Spanish certification exams',
      'Build vocabulary of 2000+ common Spanish words',
    ],
    prerequisites: [
      'No prior Spanish knowledge required',
      'Commitment to practice 30 minutes daily',
      'Enthusiasm to learn a new language',
      'Willingness to speak and make mistakes',
    ],
    targetAudience: [
      'Complete beginners wanting to learn Spanish',
      'Travelers planning trips to Spanish-speaking countries',
      'Professionals working with Spanish clients',
      'Students preparing for DELE certification',
      'Anyone passionate about languages and cultures',
    ],
    features: [
      '48 hours of immersive Spanish instruction',
      'Conversational practice in every lesson',
      'Native speaker pronunciation and accent training',
      'Cultural insights about Spain and Latin America',
      'Interactive exercises and quizzes',
      'Weekly live conversation practice sessions',
      'Vocabulary building with spaced repetition',
      'Grammar explanations in English and Spanish',
      'DELE exam preparation materials',
      'Lifetime access to course and resources',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    tags: [
      'Spanish',
      'Language Learning',
      'Conversation',
      'DELE',
      'Grammar',
      'Culture',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Spanish Basics (A1 Level)',
        description:
          'Start speaking Spanish from day one. Learn greetings, introductions, and essential everyday phrases.',
        duration: 540,
        lessons: [
          {
            id: 1,
            title: 'Introduction to Spanish Language',
            description: 'Why learn Spanish? Pronunciation guide',
            duration: 30,
            type: 'video',
            isFree: true,
            content:
              'Learn Spanish alphabet, pronunciation rules. Understand why Spanish is valuable to learn.',
          },
          {
            id: 2,
            title: 'Greetings and Introductions',
            description: 'Start conversations in Spanish',
            duration: 40,
            type: 'video',
            isFree: true,
            content:
              'Master Hola, Buenos días, ¿Cómo estás? Introduce yourself: Me llamo..., Soy de...',
          },
          {
            id: 3,
            title: 'Numbers, Days, and Months',
            description: 'Essential vocabulary for daily life',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Count in Spanish 1-1000. Learn days of week, months, tell dates and time.',
          },
          {
            id: 4,
            title: 'Present Tense: Regular Verbs',
            description: 'Form basic sentences in present tense',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master -ar, -er, -ir verb conjugations. Practice hablar, comer, vivir with all pronouns.',
          },
          {
            id: 5,
            title: "Ser vs Estar: The Two 'To Be' Verbs",
            description: 'Master the famous Spanish distinction',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Understand when to use ser (permanent) vs estar (temporary). Practice with examples.',
          },
          {
            id: 6,
            title: 'Family and Describing People',
            description: 'Talk about your family and appearance',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn family vocabulary: madre, padre, hermano. Describe physical appearance and personality.',
          },
          {
            id: 7,
            title: 'At the Restaurant and Food Vocabulary',
            description: 'Order food and drinks in Spanish',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master restaurant phrases: Quisiera..., La cuenta, por favor. Learn common Spanish foods.',
          },
          {
            id: 8,
            title: 'Shopping and Numbers Practice',
            description: 'Buy things and negotiate prices',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn shopping vocabulary: ¿Cuánto cuesta? Learn to bargain and handle money.',
          },
          {
            id: 9,
            title: 'Live Conversation Practice: Basics',
            description: 'Speak Spanish with Maria and classmates',
            duration: 90,
            type: 'live',
            isFree: false,
            content:
              'Practice greetings, introductions, basic conversations. Get feedback on pronunciation.',
          },
          {
            id: 10,
            title: 'A1 Level Assessment',
            description: 'Test your beginner Spanish knowledge',
            duration: 75,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive test covering all A1 topics. Receive feedback and improvement suggestions.',
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Elementary Spanish (A2 Level)',
        description:
          'Expand vocabulary and grammar. Discuss past events, make plans, and express preferences.',
        duration: 600,
        lessons: [
          {
            id: 11,
            title: 'Past Tense: Preterite',
            description: 'Talk about completed actions in the past',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master preterite conjugations for regular and irregular verbs. Tell stories about past.',
          },
          {
            id: 12,
            title: 'Past Tense: Imperfect',
            description: 'Describe past habits and continuous actions',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn imperfect tense. Understand preterite vs imperfect distinction.',
          },
          {
            id: 13,
            title: 'Future Tense and Making Plans',
            description: 'Talk about future plans and predictions',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Master future tense conjugations. Express intentions: Voy a..., Viajaré a...',
          },
          {
            id: 14,
            title: 'Reflexive Verbs and Daily Routine',
            description: 'Describe your daily activities',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master reflexive verbs: levantarse, ducharse, vestirse. Describe morning and evening routines.',
          },
          {
            id: 15,
            title: 'Comparisons and Superlatives',
            description: 'Compare things and people',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn más que, menos que, tan...como. Express superlatives: el más, la mejor.',
          },
          {
            id: 16,
            title: 'Commands and Giving Directions',
            description: 'Tell people what to do, ask for and give directions',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Master imperative mood. Give directions: Gira a la derecha, sigue recto.',
          },
          {
            id: 17,
            title: 'Weather, Seasons, and Travel',
            description: 'Discuss weather and plan trips',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn weather expressions: Hace frío, está lloviendo. Master travel vocabulary.',
          },
          {
            id: 18,
            title: 'Health and Body Parts',
            description: 'Describe health problems and visit doctor',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Learn body parts, symptoms: Me duele la cabeza. Practice pharmacy and doctor conversations.',
          },
          {
            id: 19,
            title: 'Live Conversation: Intermediate Topics',
            description: 'Discuss past, present, future in Spanish',
            duration: 120,
            type: 'live',
            isFree: false,
            content:
              'Practice storytelling, making plans, daily routine conversations with native speaker.',
          },
          {
            id: 20,
            title: 'A2 Level Assessment',
            description: 'Evaluate elementary Spanish proficiency',
            duration: 100,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive A2 test covering all grammar and vocabulary. Speaking assessment included.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Intermediate Spanish (B1 Level)',
        description:
          'Achieve conversational fluency. Express opinions, hypothetical situations, and complex ideas.',
        duration: 660,
        lessons: [
          {
            id: 21,
            title: 'Subjunctive Mood: Introduction',
            description: 'Express wishes, doubts, and emotions',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Understand subjunctive concept. Learn present subjunctive conjugations and when to use it.',
          },
          {
            id: 22,
            title: 'Subjunctive with Emotions and Desires',
            description: 'Express hopes, fears, and wishes',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Practice: Espero que..., Quiero que..., Me alegro de que... Master WEIRDO triggers.',
          },
          {
            id: 23,
            title: 'Conditional Tense and Si Clauses',
            description: 'Talk about hypothetical situations',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Master conditional tense. Form si clauses: Si tuviera dinero, viajaría...',
          },
          {
            id: 24,
            title: 'Present Perfect and Past Perfect',
            description: 'Connect past with present',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn he/has/ha + participio. Understand present perfect vs preterite usage.',
          },
          {
            id: 25,
            title: 'Por vs Para: The Eternal Dilemma',
            description: 'Master these confusing prepositions',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Understand all uses of por and para. Practice with many examples until automatic.',
          },
          {
            id: 26,
            title: 'Expressing Opinions and Debating',
            description: 'Participate in discussions and arguments',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn phrases: En mi opinión, Creo que, (No) Estoy de acuerdo. Practice debate vocabulary.',
          },
          {
            id: 27,
            title: 'Spanish Culture and Latin America',
            description: 'Understand Spanish-speaking world',
            duration: 45,
            type: 'video',
            isFree: false,
            content:
              'Learn about Spanish and Latin American culture, traditions, history, regional differences.',
          },
          {
            id: 28,
            title: 'Idiomatic Expressions and Slang',
            description: 'Speak like a native with common phrases',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Master Spanish idioms: estar en las nubes, ponerse las pilas. Learn regional slang.',
          },
          {
            id: 29,
            title: 'Live Conversation: Complex Topics',
            description: 'Discuss abstract concepts in Spanish',
            duration: 140,
            type: 'live',
            isFree: false,
            content:
              'Debate current events, discuss culture, express complex opinions in Spanish.',
          },
          {
            id: 30,
            title: 'B1 Level Assessment and DELE Prep',
            description: 'Comprehensive intermediate assessment',
            duration: 120,
            type: 'quiz',
            isFree: false,
            content:
              'Full DELE B1-style exam: reading, writing, listening, speaking. Prepare for official certification.',
          },
        ],
      },
    ],
  },
  {
    id: 11,
    title: 'Digital Marketing & Social Media Mastery',
    slug: 'digital-marketing-social-media-mastery',
    subject: 'Digital Marketing',
    category: 'Business & Marketing',
    level: 'professional',
    description:
      'Complete digital marketing course covering SEO, Google Ads, Facebook Ads, social media, content marketing, and analytics',
    longDescription:
      'Comprehensive digital marketing program teaching you everything from SEO fundamentals to running profitable ad campaigns. Learn from Rahul Sharma who scaled multiple startups to millions in revenue. Master Google Ads, Facebook Ads, Instagram marketing, SEO, content marketing, email marketing, and analytics. Build real campaigns, get Google and Facebook certified, and start your digital marketing career or grow your business. Includes 8 live client projects and job placement assistance.',
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/nU-IIXBWlS4',
    teacherId: 9,
    price: 4499,
    originalPrice: 7999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3890,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1205,
    startDate: '2025-11-10',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 11:00 AM'],
    learningOutcomes: [
      'Master SEO and rank websites on Google first page',
      'Run profitable Google Ads and Facebook Ads campaigns',
      'Grow social media accounts organically and with ads',
      'Create content marketing strategies that convert',
      'Build and nurture email marketing campaigns',
      'Use Google Analytics and data to make decisions',
      'Get certified by Google and Facebook',
      'Launch your digital marketing career or agency',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion for marketing and business growth',
    ],
    targetAudience: [
      'Business owners wanting to grow online',
      'Marketing professionals upskilling',
      'Career switchers entering digital marketing',
      'Freelancers offering digital marketing services',
      'Students wanting high-demand skills',
    ],
    features: [
      '48 hours of practical marketing training',
      '8 live client projects for portfolio',
      'Google Ads and Facebook Blueprint certification prep',
      'SEO tools and premium resources worth ₹50,000',
      'Live campaign reviews and optimization',
      'Agency setup and client acquisition training',
      'Resume and LinkedIn profile optimization',
      'Job placement assistance',
      'Lifetime community access',
      'Certificate recognized by industry',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'Digital Marketing',
      'SEO',
      'Google Ads',
      'Facebook Ads',
      'Social Media',
      'Career',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Digital Marketing Fundamentals & SEO',
        description:
          'Build strong foundation in digital marketing and master search engine optimization.',
        duration: 720,
        lessons: [
          {
            id: 1,
            title: 'Introduction to Digital Marketing',
            description:
              'Overview of digital marketing landscape and career opportunities',
            duration: 45,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/nU-IIXBWlS4',
          },
          {
            id: 2,
            title: 'SEO Fundamentals: How Google Works',
            description: 'Understanding search engines and ranking factors',
            duration: 50,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Keyword Research Mastery',
            description: 'Find profitable keywords using tools',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'On-Page SEO: Optimizing Your Website',
            description: 'Technical and content optimization',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 5,
            title: 'Project: SEO Audit and Strategy',
            description: 'Audit a real website and create SEO strategy',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 12,
    title: 'UI/UX Design Masterclass: Figma to Portfolio',
    slug: 'ui-ux-design-masterclass-figma',
    subject: 'UI/UX Design',
    category: 'Technology',
    level: 'professional',
    description:
      'Master UI/UX design from scratch with Figma, design systems, and build a portfolio that gets you hired at top tech companies',
    longDescription:
      'Master UI/UX design from scratch with Figma, design systems, and build a portfolio that gets you hired at top tech companies Comprehensive training with hands-on projects, real-world applications, and career support.',
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
    teacherId: 10,
    price: 4999,
    originalPrice: 8999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3800,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1400,
    startDate: '2025-11-22',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts',
      'Build real-world projects for portfolio',
      'Get industry-recognized certifications',
      'Learn from expert practitioners',
      'Access to premium tools and resources',
      'Join supportive learning community',
      'Career guidance and placement support',
      'Lifetime access to course materials',
    ],
    prerequisites: [
      'Basic computer skills',
      'Passion to learn',
      'Internet connection',
    ],
    targetAudience: [
      'Career switchers entering new field',
      'Professionals upskilling',
      'Students building careers',
      'Freelancers expanding services',
      'Entrepreneurs growing businesses',
    ],
    features: [
      '48 hours of expert-led training',
      'Hands-on projects and assignments',
      'Live Q&A and mentorship sessions',
      'Industry-standard tools and software',
      'Certificate of completion',
      'Job placement assistance',
      'Lifetime community access',
      'Regular content updates',
      'Mobile and desktop access',
      '30-day money-back guarantee',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    tags: [
      'UI/UX',
      'Figma',
      'Design Systems',
      'Product Design',
      'Portfolio',
      'Career',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Fundamentals',
        description:
          'Build strong foundation with core concepts and principles.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Course Introduction and Overview',
            description: 'Welcome and course roadmap',
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
          },
          {
            id: 2,
            title: 'Core Concepts and Principles',
            description: 'Fundamental understanding',
            duration: 45,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Get your environment ready',
            duration: 40,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'First Practical Project',
            description: 'Hands-on application of concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques',
        description:
          'Level up with advanced techniques and real-world applications.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex topics',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 7,
            title: 'Case Studies Analysis',
            description: 'Learn from real examples',
            duration: 50,
            type: 'reading',
            isFree: false,
          },
          {
            id: 8,
            title: 'Major Project Work',
            description: 'Build impressive portfolio piece',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 29,
    title: 'Stock Market Trading & Investing Masterclass',
    slug: 'stock-market-trading-investing',
    subject: 'Stock Trading',
    category: 'Finance & Investment',
    level: 'professional',
    description:
      'Learn stock market fundamentals, technical analysis, trading strategies, and portfolio management from CFA charterholder',
    longDescription:
      'Learn stock market fundamentals, technical analysis, trading strategies, and portfolio management from CFA charterholder Comprehensive training with hands-on projects, real-world applications, and career support.',
    thumbnail:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/p7HKvqRI_Bo',
    teacherId: 11,
    price: 5999,
    originalPrice: 9999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3950,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1450,
    startDate: '2025-11-23',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts',
      'Build real-world projects for portfolio',
      'Get industry-recognized certifications',
      'Learn from expert practitioners',
      'Access to premium tools and resources',
      'Join supportive learning community',
      'Career guidance and placement support',
      'Lifetime access to course materials',
    ],
    prerequisites: [
      'Basic computer skills',
      'Passion to learn',
      'Internet connection',
    ],
    targetAudience: [
      'Career switchers entering new field',
      'Professionals upskilling',
      'Students building careers',
      'Freelancers expanding services',
      'Entrepreneurs growing businesses',
    ],
    features: [
      '48 hours of expert-led training',
      'Hands-on projects and assignments',
      'Live Q&A and mentorship sessions',
      'Industry-standard tools and software',
      'Certificate of completion',
      'Job placement assistance',
      'Lifetime community access',
      'Regular content updates',
      'Mobile and desktop access',
      '30-day money-back guarantee',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    tags: [
      'Stock Trading',
      'Technical Analysis',
      'Investing',
      'Finance',
      'Options Trading',
      'Portfolio',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Fundamentals',
        description:
          'Build strong foundation with core concepts and principles.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Course Introduction and Overview',
            description: 'Welcome and course roadmap',
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/p7HKvqRI_Bo',
          },
          {
            id: 2,
            title: 'Core Concepts and Principles',
            description: 'Fundamental understanding',
            duration: 45,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Get your environment ready',
            duration: 40,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'First Practical Project',
            description: 'Hands-on application of concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques',
        description:
          'Level up with advanced techniques and real-world applications.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex topics',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 7,
            title: 'Case Studies Analysis',
            description: 'Learn from real examples',
            duration: 50,
            type: 'reading',
            isFree: false,
          },
          {
            id: 8,
            title: 'Major Project Work',
            description: 'Build impressive portfolio piece',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 31,
    title: 'Spoken English & Communication Excellence',
    slug: 'spoken-english-communication-excellence',
    subject: 'English Speaking',
    category: 'Languages',
    level: 'professional',
    description:
      'Master English speaking, public speaking, business communication, and personality development with TEDx speaker',
    longDescription:
      'Master English speaking, public speaking, business communication, and personality development with TEDx speaker Comprehensive training with hands-on projects, real-world applications, and career support.',
    thumbnail:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/Z-zNHHpXoMM',
    teacherId: 12,
    price: 2999,
    originalPrice: 4999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4100,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1500,
    startDate: '2025-11-24',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts',
      'Build real-world projects for portfolio',
      'Get industry-recognized certifications',
      'Learn from expert practitioners',
      'Access to premium tools and resources',
      'Join supportive learning community',
      'Career guidance and placement support',
      'Lifetime access to course materials',
    ],
    prerequisites: [
      'Basic computer skills',
      'Passion to learn',
      'Internet connection',
    ],
    targetAudience: [
      'Career switchers entering new field',
      'Professionals upskilling',
      'Students building careers',
      'Freelancers expanding services',
      'Entrepreneurs growing businesses',
    ],
    features: [
      '48 hours of expert-led training',
      'Hands-on projects and assignments',
      'Live Q&A and mentorship sessions',
      'Industry-standard tools and software',
      'Certificate of completion',
      'Job placement assistance',
      'Lifetime community access',
      'Regular content updates',
      'Mobile and desktop access',
      '30-day money-back guarantee',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    tags: [
      'English Speaking',
      'Public Speaking',
      'Communication',
      'Personality Development',
      'Interview Skills',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Fundamentals',
        description:
          'Build strong foundation with core concepts and principles.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Course Introduction and Overview',
            description: 'Welcome and course roadmap',
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/Z-zNHHpXoMM',
          },
          {
            id: 2,
            title: 'Core Concepts and Principles',
            description: 'Fundamental understanding',
            duration: 45,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Get your environment ready',
            duration: 40,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'First Practical Project',
            description: 'Hands-on application of concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques',
        description:
          'Level up with advanced techniques and real-world applications.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex topics',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 7,
            title: 'Case Studies Analysis',
            description: 'Learn from real examples',
            duration: 50,
            type: 'reading',
            isFree: false,
          },
          {
            id: 8,
            title: 'Major Project Work',
            description: 'Build impressive portfolio piece',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 27,
    title: 'Blockchain Development & Web3 Masterclass',
    slug: 'blockchain-development-web3',
    subject: 'Blockchain',
    category: 'Technology',
    level: 'professional',
    description:
      'Build decentralized apps with Solidity, smart contracts, and Web3. Create DeFi protocols and NFT marketplaces',
    longDescription:
      'Build decentralized apps with Solidity, smart contracts, and Web3. Create DeFi protocols and NFT marketplaces Comprehensive training with hands-on projects, real-world applications, and career support.',
    thumbnail:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/gyMwXuJrbJQ',
    teacherId: 13,
    price: 6999,
    originalPrice: 11999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4250,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1550,
    startDate: '2025-11-25',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts',
      'Build real-world projects for portfolio',
      'Get industry-recognized certifications',
      'Learn from expert practitioners',
      'Access to premium tools and resources',
      'Join supportive learning community',
      'Career guidance and placement support',
      'Lifetime access to course materials',
    ],
    prerequisites: [
      'Basic computer skills',
      'Passion to learn',
      'Internet connection',
    ],
    targetAudience: [
      'Career switchers entering new field',
      'Professionals upskilling',
      'Students building careers',
      'Freelancers expanding services',
      'Entrepreneurs growing businesses',
    ],
    features: [
      '48 hours of expert-led training',
      'Hands-on projects and assignments',
      'Live Q&A and mentorship sessions',
      'Industry-standard tools and software',
      'Certificate of completion',
      'Job placement assistance',
      'Lifetime community access',
      'Regular content updates',
      'Mobile and desktop access',
      '30-day money-back guarantee',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: false,
    tags: [
      'Blockchain',
      'Web3',
      'Solidity',
      'Smart Contracts',
      'DeFi',
      'NFTs',
      'Ethereum',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Fundamentals',
        description:
          'Build strong foundation with core concepts and principles.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Course Introduction and Overview',
            description: 'Welcome and course roadmap',
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ',
          },
          {
            id: 2,
            title: 'Core Concepts and Principles',
            description: 'Fundamental understanding',
            duration: 45,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Get your environment ready',
            duration: 40,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'First Practical Project',
            description: 'Hands-on application of concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques',
        description:
          'Level up with advanced techniques and real-world applications.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex topics',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 7,
            title: 'Case Studies Analysis',
            description: 'Learn from real examples',
            duration: 50,
            type: 'reading',
            isFree: false,
          },
          {
            id: 8,
            title: 'Major Project Work',
            description: 'Build impressive portfolio piece',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 25,
    title: 'Content Writing & Copywriting Masterclass',
    slug: 'content-writing-copywriting-masterclass',
    subject: 'Content Writing',
    category: 'Business & Marketing',
    level: 'professional',
    description:
      'Master content writing, copywriting, SEO writing, and storytelling. Start your freelance writing career earning $100/hour',
    longDescription:
      'Master content writing, copywriting, SEO writing, and storytelling. Start your freelance writing career earning $100/hour Comprehensive training with hands-on projects, real-world applications, and career support.',
    thumbnail:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/CUOyFId72r4',
    teacherId: 14,
    price: 3999,
    originalPrice: 6999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4400,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1600,
    startDate: '2025-11-26',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts',
      'Build real-world projects for portfolio',
      'Get industry-recognized certifications',
      'Learn from expert practitioners',
      'Access to premium tools and resources',
      'Join supportive learning community',
      'Career guidance and placement support',
      'Lifetime access to course materials',
    ],
    prerequisites: [
      'Basic computer skills',
      'Passion to learn',
      'Internet connection',
    ],
    targetAudience: [
      'Career switchers entering new field',
      'Professionals upskilling',
      'Students building careers',
      'Freelancers expanding services',
      'Entrepreneurs growing businesses',
    ],
    features: [
      '48 hours of expert-led training',
      'Hands-on projects and assignments',
      'Live Q&A and mentorship sessions',
      'Industry-standard tools and software',
      'Certificate of completion',
      'Job placement assistance',
      'Lifetime community access',
      'Regular content updates',
      'Mobile and desktop access',
      '30-day money-back guarantee',
    ],
    isFeatured: false,
    isNew: true,
    isBestseller: true,
    tags: [
      'Content Writing',
      'Copywriting',
      'SEO Writing',
      'Freelancing',
      'Creative Writing',
      'Storytelling',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Fundamentals',
        description:
          'Build strong foundation with core concepts and principles.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Course Introduction and Overview',
            description: 'Welcome and course roadmap',
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/CUOyFId72r4',
          },
          {
            id: 2,
            title: 'Core Concepts and Principles',
            description: 'Fundamental understanding',
            duration: 45,
            type: 'video',
            isFree: true,
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Get your environment ready',
            duration: 40,
            type: 'video',
            isFree: false,
          },
          {
            id: 4,
            title: 'First Practical Project',
            description: 'Hands-on application of concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques',
        description:
          'Level up with advanced techniques and real-world applications.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex topics',
            duration: 60,
            type: 'video',
            isFree: false,
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows',
            duration: 55,
            type: 'video',
            isFree: false,
          },
          {
            id: 7,
            title: 'Case Studies Analysis',
            description: 'Learn from real examples',
            duration: 50,
            type: 'reading',
            isFree: false,
          },
          {
            id: 8,
            title: 'Major Project Work',
            description: 'Build impressive portfolio piece',
            duration: 120,
            type: 'assignment',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    id: 28,
    title: 'UI/UX Design Masterclass: Figma to Portfolio',
    slug: 'ui-ux-design-masterclass-figma',
    subject: 'UI/UX Design',
    category: 'Technology',
    level: 'professional',
    description:
      'Master UI/UX design from scratch with Figma, design systems, and build a portfolio that gets you hired at top tech companies',
    longDescription:
      'Master UI/UX design from scratch with Figma, design systems, and build a portfolio that gets you hired at top tech companies Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry professionals and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
    teacherId: 10,
    price: 4999,
    originalPrice: 8999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3800,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1400,
    startDate: '2025-11-22',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of UI/UX Design',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering UI/UX Design field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    tags: [
      'UI/UX',
      'Figma',
      'Design Systems',
      'Product Design',
      'Portfolio',
      'Career',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of UI/UX Design.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry professionals.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Advanced Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of UI/UX Design.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in UI/UX Design.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 30,
    title: 'Stock Market Trading & Investing Masterclass',
    slug: 'stock-market-trading-investing',
    subject: 'Stock Trading',
    category: 'Finance & Investment',
    level: 'professional',
    description:
      'Learn stock market fundamentals, technical analysis, trading strategies, and portfolio management from CFA charterholder',
    longDescription:
      'Learn stock market fundamentals, technical analysis, trading strategies, and portfolio management from CFA charterholder Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/p7HKvqRI_Bo',
    teacherId: 11,
    price: 5999,
    originalPrice: 9999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 3950,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1450,
    startDate: '2025-11-23',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Stock Trading',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Stock Trading field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    tags: [
      'Stock Trading',
      'Technical Analysis',
      'Investing',
      'Finance',
      'Options Trading',
      'Portfolio',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/p7HKvqRI_Bo',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Stock Trading.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry professionals.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Advanced Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Stock Trading.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Stock Trading.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 32,
    title: 'Spoken English & Communication Excellence',
    slug: 'spoken-english-communication-excellence',
    subject: 'English Speaking',
    category: 'Languages',
    level: 'professional',
    description:
      'Master English speaking, public speaking, business communication, and personality development with TEDx speaker',
    longDescription:
      'Master English speaking, public speaking, business communication, and personality development with TEDx speaker Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/Z-zNHHpXoMM',
    teacherId: 12,
    price: 2999,
    originalPrice: 4999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4100,
    maxStudents: 5000,
    rating: 5.0,
    totalReviews: 1500,
    startDate: '2025-11-24',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of English Speaking',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering English Speaking field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    tags: [
      'English Speaking',
      'Public Speaking',
      'Communication',
      'Personality Development',
      'Interview Skills',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/Z-zNHHpXoMM',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of English Speaking.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of English Speaking.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in English Speaking.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 26,
    title: 'Blockchain Development & Web3 Masterclass',
    slug: 'blockchain-development-web3',
    subject: 'Blockchain',
    category: 'Technology',
    level: 'professional',
    description:
      'Build decentralized apps with Solidity, smart contracts, and Web3. Create DeFi protocols and NFT marketplaces',
    longDescription:
      'Build decentralized apps with Solidity, smart contracts, and Web3. Create DeFi protocols and NFT marketplaces Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/gyMwXuJrbJQ',
    teacherId: 13,
    price: 6999,
    originalPrice: 11999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4250,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1550,
    startDate: '2025-11-25',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Blockchain',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Blockchain field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    tags: [
      'Blockchain',
      'Web3',
      'Solidity',
      'Smart Contracts',
      'DeFi',
      'NFTs',
      'Ethereum',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Blockchain.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Blockchain.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Blockchain.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 33,
    title: 'Content Writing & Copywriting Masterclass',
    slug: 'content-writing-copywriting-masterclass',
    subject: 'Content Writing',
    category: 'Business & Marketing',
    level: 'professional',
    description:
      'Master content writing, copywriting, SEO writing, and storytelling. Start your freelance writing career earning high income',
    longDescription:
      'Master content writing, copywriting, SEO writing, and storytelling. Start your freelance writing career earning high income Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/CUOyFId72r4',
    teacherId: 14,
    price: 3999,
    originalPrice: 6999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4400,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1600,
    startDate: '2025-11-26',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Content Writing',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Content Writing field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: true,
    isBestseller: true,
    tags: [
      'Content Writing',
      'Copywriting',
      'SEO Writing',
      'Freelancing',
      'Creative Writing',
      'Storytelling',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/CUOyFId72r4',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Content Writing.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Content Writing.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Content Writing.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 34,
    title: 'Yoga & Meditation for Complete Wellness',
    slug: 'yoga-meditation-wellness',
    subject: 'Yoga',
    category: 'Health & Wellness',
    level: 'professional',
    description:
      'Transform your body and mind with yoga, meditation, pranayama. RYT 500 certified instructor with 13 years experience',
    longDescription:
      'Transform your body and mind with yoga, meditation, pranayama. RYT 500 certified instructor with 13 years experience Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    teacherId: 15,
    price: 2499,
    originalPrice: 3999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4550,
    maxStudents: 5000,
    rating: 5.0,
    totalReviews: 1650,
    startDate: '2025-11-27',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Yoga',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Yoga field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    tags: [
      'Yoga',
      'Meditation',
      'Wellness',
      'Fitness',
      'Mental Health',
      'Mindfulness',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Yoga.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Yoga.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Yoga.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 18,
    title: 'Photography & Videography Masterclass',
    slug: 'photography-videography-masterclass',
    subject: 'Photography',
    category: 'Creative Arts',
    level: 'professional',
    description:
      'Master photography and videography from award-winning photographer. Shot for National Geographic, Vogue, and top brands',
    longDescription:
      'Master photography and videography from award-winning photographer. Shot for National Geographic, Vogue, and top brands Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/LxO-6rlihSg',
    teacherId: 16,
    price: 5499,
    originalPrice: 8999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4700,
    maxStudents: 5000,
    rating: 4.8,
    totalReviews: 1700,
    startDate: '2025-11-28',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Photography',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Photography field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    tags: [
      'Photography',
      'Videography',
      'Photo Editing',
      'Lightroom',
      'Photoshop',
      'Visual Storytelling',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/LxO-6rlihSg',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Photography.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Photography.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Photography.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 19,
    title: 'Excel & Business Analytics Masterclass',
    slug: 'excel-business-analytics-masterclass',
    subject: 'Data Analytics',
    category: 'Technology',
    level: 'professional',
    description:
      'Master Excel, Power BI, SQL, and business analytics. Excel MVP with 10 years experience. Transform into data analyst',
    longDescription:
      'Master Excel, Power BI, SQL, and business analytics. Excel MVP with 10 years experience. Transform into data analyst Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/Vl0H-qTclOg',
    teacherId: 17,
    price: 3999,
    originalPrice: 6999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 4850,
    maxStudents: 5000,
    rating: 4.9,
    totalReviews: 1750,
    startDate: '2025-11-29',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Data Analytics',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Data Analytics field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    tags: [
      'Excel',
      'Power BI',
      'SQL',
      'Data Analytics',
      'Business Intelligence',
      'Data Visualization',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/Vl0H-qTclOg',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Data Analytics.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Data Analytics.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Data Analytics.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
  {
    id: 20,
    title: 'Graphic Design: Photoshop & Illustrator Pro',
    slug: 'graphic-design-photoshop-illustrator',
    subject: 'Graphic Design',
    category: 'Creative Arts',
    level: 'professional',
    description:
      'Complete graphic design course covering Photoshop, Illustrator, branding, and portfolio building for freelancing or jobs',
    longDescription:
      'Complete graphic design course covering Photoshop, Illustrator, branding, and portfolio building for freelancing or jobs Comprehensive training with hands-on projects, real-world applications, and career support. Learn from industry experts and build an impressive portfolio.',
    thumbnail:
      'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&h=450&fit=crop',
    demoVideo: 'https://www.youtube.com/embed/GJiXZvQxzVA',
    teacherId: 10,
    price: 4499,
    originalPrice: 7999,
    currency: 'INR',
    duration: 12,
    totalHours: 48,
    sessionsPerWeek: 3,
    mode: 'online',
    language: 'English',
    enrolledStudents: 5000,
    maxStudents: 5000,
    rating: 5.0,
    totalReviews: 1800,
    startDate: '2025-11-10',
    schedule: ['Mon 8:00 PM', 'Wed 8:00 PM', 'Sat 10:00 AM'],
    learningOutcomes: [
      'Master fundamentals and advanced concepts of Graphic Design',
      'Build 5+ real-world projects for impressive portfolio',
      'Get industry-recognized certifications and credentials',
      'Learn proven techniques from expert practitioners',
      'Access premium tools, templates, and resources',
      'Join supportive community of learners and professionals',
      'Receive personalized career guidance and job placement support',
      'Get lifetime access to all course materials and updates',
    ],
    prerequisites: [
      'Basic computer and internet skills',
      'Passion and dedication to learn',
      'No prior experience required',
    ],
    targetAudience: [
      'Career switchers entering Graphic Design field',
      'Working professionals looking to upskill',
      'Students building career foundation',
      'Freelancers expanding service offerings',
      'Entrepreneurs growing their businesses',
    ],
    features: [
      '48 hours of comprehensive expert-led training',
      '5+ hands-on projects and practical assignments',
      'Weekly live Q&A and personalized mentorship sessions',
      'Access to industry-standard tools and premium software',
      'Professional certificate of completion',
      'Dedicated job placement and freelance assistance',
      'Lifetime access to exclusive community forum',
      'Regular content updates with industry trends',
      'Learn on mobile, tablet, and desktop',
      '30-day money-back satisfaction guarantee',
    ],
    isFeatured: false,
    isNew: true,
    isBestseller: true,
    tags: [
      'Graphic Design',
      'Photoshop',
      'Illustrator',
      'Branding',
      'Logo Design',
      'Freelancing',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Foundations and Core Concepts',
        description:
          'Build a strong foundation with essential concepts, principles, and practical applications.',
        duration: 600,
        lessons: [
          {
            id: 1,
            title: 'Welcome & Course Overview',
            description: "Introduction to the course and what you'll learn",
            duration: 30,
            type: 'video',
            isFree: true,
            videoUrl: 'https://www.youtube.com/embed/GJiXZvQxzVA',
            content:
              'Get an overview of the complete course curriculum and learning path.',
          },
          {
            id: 2,
            title: 'Core Concepts and Fundamentals',
            description: 'Master the fundamental principles',
            duration: 45,
            type: 'video',
            isFree: true,
            content:
              'Deep dive into core concepts that form the foundation of Graphic Design.',
          },
          {
            id: 3,
            title: 'Tools and Software Setup',
            description: 'Set up your complete learning environment',
            duration: 40,
            type: 'video',
            isFree: false,
            content:
              'Install and configure all necessary tools and software for practical work.',
          },
          {
            id: 4,
            title: 'Your First Project',
            description: 'Hands-on application of learned concepts',
            duration: 90,
            type: 'assignment',
            isFree: false,
            content:
              "Build your first real project applying the fundamental concepts you've learned.",
          },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Intermediate Techniques & Applications',
        description:
          'Level up your skills with intermediate techniques, industry best practices, and real-world projects.',
        duration: 720,
        lessons: [
          {
            id: 5,
            title: 'Advanced Concepts Deep Dive',
            description: 'Master complex and advanced topics',
            duration: 60,
            type: 'video',
            isFree: false,
            content:
              'Explore advanced concepts used by professionals in the industry.',
          },
          {
            id: 6,
            title: 'Industry Best Practices',
            description: 'Learn professional workflows and standards',
            duration: 55,
            type: 'video',
            isFree: false,
            content:
              'Understand the workflows, standards, and best practices used in professional settings.',
          },
          {
            id: 7,
            title: 'Real-World Case Studies',
            description: 'Analyze successful real-world examples',
            duration: 50,
            type: 'reading',
            isFree: false,
            content:
              'Study and analyze successful projects and implementations from the industry.',
          },
          {
            id: 8,
            title: 'Major Portfolio Project',
            description: 'Build an impressive showcase project',
            duration: 120,
            type: 'assignment',
            isFree: false,
            content:
              'Create a comprehensive project that demonstrates your mastery and can impress employers.',
          },
          {
            id: 9,
            title: 'Live Project Review & Feedback',
            description: 'Get expert feedback on your work',
            duration: 60,
            type: 'live',
            isFree: false,
            content:
              'Present your project and receive personalized feedback from industry experts.',
          },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Mastery & Career Development',
        description:
          'Achieve mastery with advanced projects, career guidance, and professional development.',
        duration: 600,
        lessons: [
          {
            id: 10,
            title: 'Expert-Level Techniques',
            description: 'Master advanced professional techniques',
            duration: 70,
            type: 'video',
            isFree: false,
            content:
              'Learn cutting-edge techniques used by top professionals in the field.',
          },
          {
            id: 11,
            title: 'Final Capstone Project',
            description: 'Your ultimate portfolio masterpiece',
            duration: 180,
            type: 'assignment',
            isFree: false,
            content:
              'Create your most impressive project that showcases complete mastery of Graphic Design.',
          },
          {
            id: 12,
            title: 'Career Strategy & Job Search',
            description: 'Land your dream job or start freelancing',
            duration: 50,
            type: 'video',
            isFree: false,
            content:
              'Learn how to market yourself, ace interviews, and land opportunities in Graphic Design.',
          },
          {
            id: 13,
            title: 'Course Completion Exam',
            description: 'Test your complete understanding',
            duration: 90,
            type: 'quiz',
            isFree: false,
            content:
              'Comprehensive assessment covering all course topics to earn your certificate.',
          },
        ],
      },
    ],
  },
];

// Reviews with detailed feedback
export const reviews: Review[] = [
  {
    id: 1,
    courseId: 1,
    studentName: 'Amit Kumar Patel',
    studentAvatar: 'https://i.pravatar.cc/100?img=33',
    rating: 5,
    date: '2025-09-15',
    comment:
      "Outstanding course! Sarah's teaching is phenomenal. The way she explains limits using real-world examples made everything click for me. I was struggling with calculus in school, but after taking this course, I'm now helping my classmates! The practice problems are extensive and really test your understanding. The live doubt sessions are super helpful. Scored 98/100 in my school exam. Highly recommend for anyone serious about mastering calculus!",
    helpful: 127,
    verified: true,
  },
  {
    id: 2,
    courseId: 1,
    studentName: 'Sneha Reddy',
    studentAvatar: 'https://i.pravatar.cc/100?img=45',
    rating: 5,
    date: '2025-09-20',
    comment:
      "Best calculus course I've ever taken! The modules are perfectly structured - starting from basics and gradually building to advanced topics. The Desmos visualizations helped me understand derivatives geometrically. The JEE previous year questions with detailed solutions are gold. Sarah personally answered my doubt about implicit differentiation in the live session. Got 95% in my board exams and feeling confident for JEE. Worth every penny! The 500+ practice problems really helped build my problem-solving speed.",
    helpful: 103,
    verified: true,
  },
  {
    id: 3,
    courseId: 2,
    studentName: 'Rohan Sharma',
    studentAvatar: 'https://i.pravatar.cc/100?img=51',
    rating: 5,
    date: '2025-09-18',
    comment:
      "Rajesh is incredible! His teaching style is perfect for JEE preparation. The physics animations make concepts so clear - especially the projectile motion and circular motion modules. The problem-solving sessions are where I learned the most. He doesn't just solve problems, he teaches you HOW to think about physics. The 1000+ problems covered every possible type. Cleared JEE Advanced with AIR 245, and physics was my strongest subject (89/100). The mock tests were exactly at JEE level. Can't thank Rajesh enough!",
    helpful: 189,
    verified: true,
  },
  {
    id: 4,
    courseId: 2,
    studentName: 'Priya Gupta',
    studentAvatar: 'https://i.pravatar.cc/100?img=23',
    rating: 5,
    date: '2025-09-10',
    comment:
      'This course transformed my understanding of mechanics. I used to memorize formulas, but Rajesh taught me to derive them and understand the physics behind them. The free body diagram section was eye-opening - now I can solve any mechanics problem. The Telegram doubt group is very active, and Rajesh himself answers complex doubts. The performance analytics helped me identify my weak areas. Scored 92% in JEE Main physics. The course is comprehensive, well-structured, and absolutely worth it for serious JEE aspirants!',
    helpful: 94,
    verified: true,
  },
  {
    id: 5,
    courseId: 1,
    studentName: 'Karthik Menon',
    studentAvatar: 'https://i.pravatar.cc/100?img=62',
    rating: 5,
    date: '2025-10-01',
    comment:
      "As someone who was terrified of calculus, this course was a blessing. Sarah breaks down complex concepts into digestible pieces. The historical context in the first module made me appreciate what calculus actually is. The practice assignments after each module ensure you've mastered the concepts before moving forward. The integration techniques module was challenging but incredibly well-taught. Used this course to ace my AP Calculus exam (5/5). The lifetime access means I can review anytime. Absolutely recommended!",
    helpful: 78,
    verified: true,
  },
];

// Categories with realistic counts
export const categories: Category[] = [
  {
    id: 1,
    name: 'Science & Math',
    icon: '🔬',
    count: 4,
    subcategories: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Astronomy',
      'Environmental Science',
    ],
  },
  {
    id: 2,
    name: 'Technology',
    icon: '💻',
    count: 8,
    subcategories: [
      'Programming',
      'Web Development',
      'Data Science',
      'AI/ML',
      'UI/UX Design',
      'Blockchain',
      'Data Analytics',
    ],
  },
  {
    id: 3,
    name: 'Languages',
    icon: '🗣️',
    count: 3,
    subcategories: [
      'English',
      'Spanish',
      'IELTS',
      'Communication Skills',
      'Public Speaking',
    ],
  },
  {
    id: 4,
    name: 'Business & Marketing',
    icon: '📈',
    count: 2,
    subcategories: [
      'Digital Marketing',
      'SEO',
      'Social Media',
      'Content Writing',
      'Copywriting',
      'Growth Hacking',
    ],
  },
  {
    id: 5,
    name: 'Finance & Investment',
    icon: '💰',
    count: 1,
    subcategories: [
      'Stock Trading',
      'Technical Analysis',
      'Portfolio Management',
      'Options Trading',
      'Investing',
    ],
  },
  {
    id: 6,
    name: 'Health & Wellness',
    icon: '🧘',
    count: 1,
    subcategories: [
      'Yoga',
      'Meditation',
      'Fitness',
      'Mental Health',
      'Wellness Coaching',
      'Nutrition',
    ],
  },
  {
    id: 7,
    name: 'Creative Arts',
    icon: '🎨',
    count: 2,
    subcategories: [
      'Photography',
      'Graphic Design',
      'Video Editing',
      'Visual Arts',
      'Creative Writing',
    ],
  },
  {
    id: 8,
    name: 'Business & Finance',
    icon: '💼',
    count: 97,
    subcategories: [
      'Accounting',
      'Finance & Investment',
      'Marketing & Sales',
      'Entrepreneurship',
      'Economics',
      'Stock Market',
    ],
  },
  {
    id: 9,
    name: 'Arts & Design',
    icon: '🎨',
    count: 124,
    subcategories: [
      'Graphic Design',
      'UI/UX Design',
      'Digital Art',
      'Music Production',
      'Photography',
      'Video Editing',
    ],
  },
];

// Helper Functions
export const getCourseById = (id: number): Course | undefined => {
  return courses.find((course) => course.id === id);
};

export const getCourseBySlug = (slug: string): Course | undefined => {
  return courses.find((course) => course.slug === slug);
};

export const getTeacherById = (id: number): Teacher | undefined => {
  return teachers.find((teacher) => teacher.id === id);
};

export const getCoursesByTeacher = (teacherId: number): Course[] => {
  return courses.filter((course) => course.teacherId === teacherId);
};

export const getReviewsByCourse = (courseId: number): Review[] => {
  return reviews.filter((review) => review.courseId === courseId);
};

export const getFeaturedCourses = (): Course[] => {
  return courses.filter((course) => course.isFeatured);
};

export const getBestsellerCourses = (): Course[] => {
  return courses.filter((course) => course.isBestseller);
};

export const getNewCourses = (): Course[] => {
  return courses.filter((course) => course.isNew);
};

export const getCoursesByCategory = (category: string): Course[] => {
  return courses.filter((course) => course.category === category);
};

export const getCoursesBySubject = (subject: string): Course[] => {
  return courses.filter((course) => course.subject === subject);
};

export const getTopRatedCourses = (minRating: number = 4.5): Course[] => {
  return courses
    .filter((course) => course.rating >= minRating)
    .sort((a, b) => b.rating - a.rating);
};

export const searchCourses = (query: string): Course[] => {
  const lowerQuery = query.toLowerCase();
  return courses.filter(
    (course) =>
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description.toLowerCase().includes(lowerQuery) ||
      course.subject.toLowerCase().includes(lowerQuery) ||
      course.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
