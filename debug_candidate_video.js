import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCandidate() {
  const email = 'maulipawar968@gmail.com';
  console.log(`Checking candidate: ${email}`);
  
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email },
      include: {
        interviews: {
          include: {
            result: true,
          }
        }
      }
    });
    
    if (!candidate) {
      console.log('Candidate not found in Video Interview database.');
      return;
    }
    
    console.log('Candidate found:', JSON.stringify(candidate, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCandidate();
