'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';

import { useSecurity } from '@/hooks/use-security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login, isLoaded, isSecurityEnabled, isAuthenticated } = useSecurity();
    const { toast } = useToast();

    useEffect(() => {
        // Redirect if security is not enabled or user is already authenticated
        if (isLoaded && (!isSecurityEnabled || isAuthenticated)) {
            router.replace('/dashboard');
        }
    }, [isLoaded, isSecurityEnabled, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(password);

        if (success) {
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            router.replace('/dashboard');
        } else {
            setError('Invalid password. Please try again.');
            setIsLoading(false);
        }
    };
    
    if (!isLoaded || (isLoaded && (!isSecurityEnabled || isAuthenticated))) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex justify-center">
                      <Logo />
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-11 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm space-y-6">
                <Logo className="justify-center" />
                <Card>
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>
                            Please enter your password to access your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    aria-label="Password"
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <KeyRound />
                                )}
                                Unlock
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
