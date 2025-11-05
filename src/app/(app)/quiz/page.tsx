'use client';

import { useState } from 'react';
import { adaptQuizDifficultyBasedOnPerformance } from '@/ai/flows/adapt-quiz-difficulty-based-on-performance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, Sparkles, XCircle } from 'lucide-react';

const quiz = {
  id: 'algebra-101',
  title: 'Algebra Basics',
  difficulty: 'medium',
  questions: [
    {
      question: 'What is the value of x in the equation 2x + 3 = 11?',
      options: ['3', '4', '5', '6'],
      answer: '4',
    },
    {
      question: 'Simplify the expression: 3(x + 2) - 2x',
      options: ['x + 6', '5x + 6', 'x - 6', 'x + 5'],
      answer: 'x + 6',
    },
  ],
};

type QuizStatus = 'not_started' | 'in_progress' | 'completed';
type Answer = { question: string; selected: string; correct: string };
type DifficultyState = { newDifficulty: string; explanation: string } | null;

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizStatus>('not_started');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<{ score: number; answers: Answer[] } | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyState>(null);
  const [isAdapting, setIsAdapting] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  const handleSubmit = () => {
    let score = 0;
    const submittedAnswers: Answer[] = quiz.questions.map((q, i) => {
      if (answers[i] === q.answer) {
        score++;
      }
      return { question: q.question, selected: answers[i], correct: q.answer };
    });
    const finalScore = (score / quiz.questions.length) * 100;
    setResults({ score: finalScore, answers: submittedAnswers });
    setQuizState('completed');
  };
  
  const handleAdaptDifficulty = async () => {
    if (!results) return;
    setIsAdapting(true);
    try {
        const response = await adaptQuizDifficultyBasedOnPerformance({
            studentId: 'user-123',
            quizId: quiz.id,
            previousPerformance: results.score,
            currentDifficulty: quiz.difficulty,
        });
        setDifficulty(response);
    } catch(e) {
        console.error("Failed to adapt difficulty");
    } finally {
        setIsAdapting(false);
    }
  };

  const startQuiz = () => {
    setQuizState('in_progress');
    setAnswers({});
    setResults(null);
    setDifficulty(null);
  }

  if (quizState === 'not_started') {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-bold font-headline mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground mb-6">Ready to test your knowledge?</p>
            <Button onClick={startQuiz}>Start Quiz</Button>
        </div>
    )
  }

  if (quizState === 'completed' && results) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quiz Results</CardTitle>
            <CardDescription>You scored {results.score.toFixed(0)}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.answers.map((res, i) => (
              <div key={i} className="border p-4 rounded-md">
                <p className="font-medium mb-2">{res.question}</p>
                {res.selected === res.correct ? (
                  <p className="text-sm flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> Correct: {res.correct}</p>
                ) : (
                  <>
                    <p className="text-sm flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> Your answer: {res.selected}</p>
                    <p className="text-sm flex items-center gap-2 text-green-600 mt-1"><CheckCircle className="h-4 w-4" /> Correct: {res.correct}</p>
                  </>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            {difficulty ? (
                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>New Difficulty: {difficulty.newDifficulty}</AlertTitle>
                    <AlertDescription>{difficulty.explanation}</AlertDescription>
                </Alert>
            ): (
                <Button onClick={handleAdaptDifficulty} disabled={isAdapting}>
                    <Sparkles className="mr-2 h-4 w-4"/>
                    {isAdapting ? 'Adapting...' : 'Adapt Difficulty with AI'}
                </Button>
            )}
            <Button onClick={startQuiz} variant="outline">Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold font-headline mb-2 text-center">{quiz.title}</h1>
        <p className="text-muted-foreground mb-6 text-center">Answer the questions below.</p>
        <Card>
            <CardContent className="p-6 space-y-6">
            {quiz.questions.map((q, i) => (
                <div key={i} className="grid gap-3">
                <Label className="font-semibold">{i + 1}. {q.question}</Label>
                <RadioGroup onValueChange={(value) => handleAnswerChange(i, value)}>
                    {q.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q${i}-${option}`} />
                        <Label htmlFor={`q${i}-${option}`}>{option}</Label>
                    </div>
                    ))}
                </RadioGroup>
                </div>
            ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} className="w-full">Submit Quiz</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
