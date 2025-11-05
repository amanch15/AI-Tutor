import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { historyData } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div>
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-headline">Learning History</h1>
            <p className="text-muted-foreground mt-2">
            A record of all your completed lessons, quizzes, and games.
            </p>
        </header>
        <Card>
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
                    {historyData.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.activity}</TableCell>
                        <TableCell>
                        <Badge variant={
                            item.type === 'Quiz' ? 'default' : item.type === 'Lesson' ? 'secondary' : 'outline'
                        }>{item.type}</Badge>
                        </TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell className="text-right">{item.score ? `${item.score}%` : 'N/A'}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
