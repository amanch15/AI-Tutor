'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { HistoryItem } from '@/lib/definitions';

export default function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'history')) : null
  , [firestore, user]);

  const { data: historyData, isLoading } = useCollection<HistoryItem>(historyQuery);

  return (
    <div>
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-headline">Learning History</h1>
            <p className="text-muted-foreground mt-2">
            A record of all your completed lessons, quizzes, and games.
            </p>
        </header>
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">Loading history...</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && historyData?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No history found.</TableCell>
                        </TableRow>
                    )}
                    {historyData?.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.activity}</TableCell>
                        <TableCell>
                        <Badge variant={
                            item.type === 'Quiz' ? 'default' : item.type === 'Lesson' ? 'secondary' : 'outline'
                        }>{item.type}</Badge>
                        </TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell className="text-right">{item.score !== undefined ? `${item.score}%` : 'N/A'}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
