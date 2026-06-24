import { PrismaClient } from '../generated/prisma/client.js'
import bcrypt from 'bcryptjs'
import { PrismaNeon } from '@prisma/adapter-neon'
import { config } from 'dotenv'

config()

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create categories first
  const itCategory = await prisma.category.upsert({
    where: { name: 'IT' },
    update: {},
    create: {
      name: 'IT'
    }
  })

  const languageCategory = await prisma.category.upsert({
    where: { name: 'Language' },
    update: {},
    create: {
      name: 'Language'
    }
  })

  const cookingCategory = await prisma.category.upsert({
    where: { name: 'Cooking' },
    update: {},
    create: {
      name: 'Cooking'
    }
  })

  const artCategory = await prisma.category.upsert({
    where: { name: 'Art' },
    update: {},
    create: {
      name: 'Art'
    }
  })

  const generalKnowledgeCategory = await prisma.category.upsert({
    where: { name: 'General Knowledge' },
    update: {},
    create: {
      name: 'General Knowledge'
    }
  })

  console.log('Categories created:', itCategory.name, languageCategory.name, cookingCategory.name, artCategory.name, generalKnowledgeCategory.name)

  // Create a teacher user first
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: hashedPassword,
      role: 'TEACHER',
      profile: {
        create: {
          fullName: 'Dr. Aung Myat',
          bio: 'Experienced software engineer with 10+ years in the industry',
          category: 'IT',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
          publicId: 'teacher_avatar_1'
        }
      }
    }
  })

  console.log('Teacher created:', teacher.email)

  // Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp 2026',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and more from scratch. This comprehensive course covers everything you need to become a professional web developer.',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
      publicId: 'courses/web_dev_bootcamp',
      categoryId: itCategory.id,
      teacherId: teacher.id,
      chapters: {
        create: [
          {
            title: 'Introduction to Web Development',
            videoUrl: 'https://www.youtube.com/embed/kUMe1FH4CHE?si=example1'
          },
          {
            title: 'HTML Fundamentals',
            videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU?si=example2'
          },
          {
            title: 'CSS Styling and Layout',
            videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc?si=example3'
          },
          {
            title: 'JavaScript Basics',
            videoUrl: 'https://www.youtube.com/embed/hdI2bqOjy3c?si=example4'
          },
          {
            title: 'React Framework Introduction',
            videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk?si=example5'
          }
        ]
      }
    }
  })

  const course2 = await prisma.course.create({
    data: {
      title: 'English for Beginners - A1 Level',
      description: 'Start your English learning journey with this comprehensive beginner course. Cover basic grammar, vocabulary, and conversational skills.',
      imageUrl: 'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800&h=400&fit=crop',
      publicId: 'courses/english_beginners',
      categoryId: languageCategory.id,
      teacherId: teacher.id,
      chapters: {
        create: [
          {
            title: 'Alphabet and Pronunciation',
            videoUrl: 'https://www.youtube.com/embed/0-gN58kYD8k?si=example6'
          },
          {
            title: 'Basic Greetings and Introductions',
            videoUrl: 'https://www.youtube.com/embed/L0B7X9X6Y7k?si=example7'
          },
          {
            title: 'Numbers and Counting',
            videoUrl: 'https://www.youtube.com/embed/D0Aq68JpQO8?si=example8'
          }
        ]
      }
    }
  })

  const course3 = await prisma.course.create({
    data: {
      title: 'Italian Cooking Masterclass',
      description: 'Learn authentic Italian cooking from pasta to pizza. Master traditional recipes and techniques passed down through generations.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
      publicId: 'courses/italian_cooking',
      categoryId: cookingCategory.id,
      teacherId: teacher.id,
      chapters: {
        create: [
          {
            title: 'Making Fresh Pasta from Scratch',
            videoUrl: 'https://www.youtube.com/embed/J5v7fTq9k2E?si=example9'
          },
          {
            title: 'Classic Margherita Pizza',
            videoUrl: 'https://www.youtube.com/embed/YRtVZqQ-7n8?si=example10'
          },
          {
            title: 'Risotto Techniques',
            videoUrl: 'https://www.youtube.com/embed/3p-1i9mQGY8?si=example11'
          }
        ]
      }
    }
  })

  console.log('Courses created:', course1.title, course2.title, course3.title)

  // Create Blogs
  const blog1 = await prisma.blog.create({
    data: {
      title: 'The Future of Web Development in 2026',
      content: `# The Future of Web Development in 2026

Web development continues to evolve rapidly. Here are the key trends to watch:

## 1. AI-Powered Development
Artificial intelligence is transforming how we write code. Tools like GitHub Copilot are becoming indispensable for developers.

## 2. Edge Computing
Edge computing is bringing processing power closer to users, resulting in faster load times and better user experiences.

## 3. WebAssembly
WebAssembly enables high-performance applications in the browser, opening new possibilities for web development.

## 4. Serverless Architecture
Serverless continues to gain traction, offering scalability and cost-efficiency for modern applications.

Stay tuned for more updates on the ever-changing landscape of web development!`,
      categoryId: itCategory.id,
      authorId: teacher.id
    }
  })

  const blog2 = await prisma.blog.create({
    data: {
      title: 'Tips for Learning a New Language Effectively',
      content: `# Tips for Learning a New Language Effectively

Learning a new language can be challenging but rewarding. Here are proven strategies:

## 1. Consistent Practice
Practice every day, even if just for 15 minutes. Consistency beats intensity.

## 2. Immersion
Surround yourself with the language through movies, music, and conversations.

## 3. Speak Early
Don't wait until you feel "ready." Start speaking from day one.

## 4. Use Spaced Repetition
Use apps like Anki to review vocabulary at optimal intervals.

## 5. Set Realistic Goals
Break down your learning into manageable, achievable milestones.

Remember: language learning is a marathon, not a sprint!`,
      categoryId: generalKnowledgeCategory.id,
      authorId: teacher.id
    }
  })

  const blog3 = await prisma.blog.create({
    data: {
      title: 'The Art of Minimalist Cooking',
      content: `# The Art of Minimalist Cooking

Great cooking doesn't require complex techniques or expensive ingredients. Here's how to master minimalist cooking:

## Quality Over Quantity
Focus on a few high-quality ingredients rather than many mediocre ones.

## Let Ingredients Shine
Don't overcomplicate dishes. Let the natural flavors speak for themselves.

## Master Basic Techniques
Perfect simple techniques like roasting, sautéing, and steaming.

## Season Properly
Learn to use salt, acid, and fat to balance flavors.

## Reduce Waste
Use every part of your ingredients creatively.

Minimalist cooking is about simplicity, intention, and respect for ingredients.`,
      categoryId: artCategory.id,
      authorId: teacher.id
    }
  })

  const blog4 = await prisma.blog.create({
    data: {
      title: 'Understanding Machine Learning Basics',
      content: `# Understanding Machine Learning Basics

Machine learning is revolutionizing how we solve complex problems. Here's a beginner-friendly introduction:

## What is Machine Learning?
Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.

## Key Types of Machine Learning

### 1. Supervised Learning
The algorithm learns from labeled data to make predictions. Examples include classification and regression.

### 2. Unsupervised Learning
The algorithm finds patterns in unlabeled data. Clustering and dimensionality reduction are common techniques.

### 3. Reinforcement Learning
The algorithm learns through trial and error by receiving rewards or penalties.

## Getting Started
Start with Python and libraries like scikit-learn. Practice with datasets from Kaggle and build small projects.

The journey into machine learning is challenging but incredibly rewarding!`,
      categoryId: itCategory.id,
      authorId: teacher.id
    }
  })

  const blog5 = await prisma.blog.create({
    data: {
      title: 'The Renaissance: A Golden Age of Art',
      content: `# The Renaissance: A Golden Age of Art

The Renaissance (14th-17th century) marked a rebirth of art, culture, and intellectualism in Europe.

## Key Characteristics

### Humanism
Focus on human potential and achievements rather than divine intervention.

### Realism
Artists depicted the human form and nature with unprecedented accuracy.

### Perspective
The development of linear perspective created depth and realism in paintings.

## Master Artists

- Leonardo da Vinci: Mona Lisa, The Last Supper
- Michelangelo: David, Sistine Chapel ceiling
- Raphael: School of Athens
- Donatello: David (sculpture)

## Legacy
The Renaissance laid the foundation for modern art, science, and philosophy, influencing generations to come.`,
      categoryId: artCategory.id,
      authorId: teacher.id
    }
  })

  const blog6 = await prisma.blog.create({
    data: {
      title: 'Climate Change: What You Need to Know',
      content: `# Climate Change: What You Need to Know

Climate change is one of the most pressing challenges of our time. Understanding it is the first step toward action.

## The Science

### Greenhouse Effect
Gases like CO2 and methane trap heat in the atmosphere, causing global temperatures to rise.

### Human Impact
Burning fossil fuels, deforestation, and industrial activities have dramatically increased greenhouse gas emissions.

## Consequences

- Rising sea levels
- Extreme weather events
- Loss of biodiversity
- Food and water scarcity

## What You Can Do

1. Reduce energy consumption
2. Use public transportation
3. Support renewable energy
4. Reduce, reuse, recycle
5. Educate others

Every action counts in the fight against climate change.`,
      categoryId: generalKnowledgeCategory.id,
      authorId: teacher.id
    }
  })

  console.log('Blogs created:', blog1.title, blog2.title, blog3.title, blog4.title, blog5.title, blog6.title)
  console.log('Seed data completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
