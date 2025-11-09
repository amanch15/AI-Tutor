'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();

    const handlePasswordReset = async () => {
        if (!user?.email) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No email address associated with this account.',
            });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: 'Password Reset Email Sent',
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to send password reset email.',
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account and application settings.
                </p>
            </header>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            This is your public information. It cannot be edited here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <Input value={user?.displayName || ''} readOnly />
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <Input value={user?.email || ''} readOnly />
                         </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Manage your account security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Click the button below to send a password reset link to your email.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handlePasswordReset}>Change Password</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
