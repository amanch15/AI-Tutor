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
          <Card key={game.id} className="overflow-hidden group transition-all hover:shadow-xl hover:scale-105">
            <CardHeader className="p-0">
              <div className="relative h-60 w-full">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover"
                  data-ai-hint={game.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="font-headline text-2xl mb-2">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="#">Play Now</Link>
                 </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
