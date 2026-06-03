import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import QuizView from "./QuizView";

const prisma = new PrismaClient();

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: true,
      flashcards: true,
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }} className="quiz-page-container">
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }} className="no-print">{quiz.title}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }} className="no-print">
        Generated on {new Date(quiz.createdAt).toLocaleDateString()}
      </p>

      <QuizView quiz={quiz} />
    </div>
  );
}
