'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gamesData } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GamesPage() {
  return (
    <div>
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Learning Games</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Reinforce your knowledge and have fun with our collection of educational games.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {gamesData.map((game) => (
          <Card key={game.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-0">
              <div className="relative h-60 w-full">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={game.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-6">
                    <CardTitle className="font-headline text-2xl mb-1 text-primary-foreground">{game.title}</CardTitle>
                    <CardDescription className="text-primary-foreground/80">{game.description}</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardFooter className="p-6">
                 <Button asChild className="w-full">
                    <Link href={`/quiz?topic=${encodeURIComponent(game.title)}`}>Play Now</Link>
                 </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
