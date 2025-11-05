'use client';

import { Suspense, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateRealTimeQuiz, type GenerateRealTimeQuizOutput } from '@/ai/flows/generate-real-time-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Bot, Sparkles, Wand } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type QuizStatus = 'configuring' | 'generating' | 'in_progress' | 'completed';
type Answer = { question: string; selected: string; correct: string };

function QuizContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  const [quizState, setQuizState] = useState<QuizStatus>('configuring');
  const [topic, setTopic] = useState(initialTopic);
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState<GenerateRealTimeQuizOutput | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<{ score: number; answers: Answer[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateQuiz = () => {
    startTransition(async () => {
      setQuizState('generating');
      try {
        const generatedQuiz = await generateRealTimeQuiz({ topic, numberOfQuestions: numQuestions });
        setQuizData(generatedQuiz);
        setQuizState('in_progress');
        setAnswers({});
        setResults(null);
      } catch (error) {
        console.error('Failed to generate quiz:', error);
        // Optionally, set an error state to show in the UI
        setQuizState('configuring');
      }
    });
  };

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  const handleSubmit = () => {
    if (!quizData) return;
    let score = 0;
    const submittedAnswers: Answer[] = quizData.questions.map((q, i) => {
      if (answers[i] === q.answer) {
        score++;
      }
      return { question: q.question, selected: answers[i] || 'Not answered', correct: q.answer };
    });
    const finalScore = (score / quizData.questions.length) * 100;
    setResults({ score: finalScore, answers: submittedAnswers });
    setQuizState('completed');
  };

  const startNewQuiz = () => {
    setQuizState('configuring');
    setQuizData(null);
    setAnswers({});
    setResults(null);
  };
  
  if (quizState === 'configuring') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Generate a New Quiz</CardTitle>
            <CardDescription>Enter a topic and select the number of questions for your quiz.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Renaissance, Quantum Mechanics"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numQuestions">Number of Questions: {numQuestions}</Label>
              <Slider
                id="numQuestions"
                min={1}
                max={10}
                step={1}
                value={[numQuestions]}
                onValueChange={(value) => setNumQuestions(value[0])}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateQuiz} disabled={!topic.trim() || isPending} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="h-12 w-12 text-primary animate-bounce mb-4" />
        <h2 className="text-2xl font-semibold font-headline mb-2">Generating Your Quiz...</h2>
        <p className="text-muted-foreground">Our AI is crafting questions about &quot;{topic}&quot; just for you.</p>
      </div>
    )
  }

  if (quizState === 'completed' && results) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">{quizData?.title}</CardTitle>
            <CardDescription className="text-xl">You scored {results.score.toFixed(0)}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.answers.map((res, i) => (
              <div key={i} className="border p-4 rounded-md bg-secondary/30">
                <p className="font-medium mb-2">{i + 1}. {res.question}</p>
                {res.selected === res.correct ? (
                  <p className="text-sm flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> Correct answer: {res.correct}</p>
                ) : (
                  <>
                    <p className="text-sm flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> Your answer: {res.selected}</p>
                    <p className="text-sm flex items-center gap-2 text-green-600 mt-1"><CheckCircle className="h-4 w-4" /> Correct answer: {res.correct}</p>
                  </>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={startNewQuiz} className="w-full">
                <Wand className="mr-2 h-4 w-4" />
                Create Another Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'in_progress' && quizData) {
    return (
      <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-headline mb-2 text-center">{quizData.title}</h1>
          <p className="text-muted-foreground mb-6 text-center">Answer the questions below.</p>
          <Card>
              <CardContent className="p-6 space-y-6">
              {quizData.questions.map((q, i) => (
                  <div key={i} className="grid gap-3">
                  <Label className="font-semibold">{i + 1}. {q.question}</Label>
                  <RadioGroup onValueChange={(value) => handleAnswerChange(i, value)}>
                      {q.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary transition-colors">
                          <RadioGroupItem value={option} id={`q${i}-${option}`} />
                          <Label htmlFor={`q${i}-${option}`} className="font-normal w-full cursor-pointer">{option}</Label>
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

  return null;
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuizContent />
        </Suspense>
    )
}
