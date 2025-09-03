'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Summary {
    id: string;
    title: string;
    fileName: string;
    createdAt: string;
    summaryText: string;
}

export default function SummariesPage() {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch summaries from API
        // For now, using mock data
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading summaries...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Your Summaries</h1>
                <Link href="/upload">
                    <Button className="bg-rose-500 hover:bg-rose-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload New File
                    </Button>
                </Link>
            </div>

            {summaries.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No summaries yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Upload your first document to get started with AI-powered summaries.
                        </p>
                        <Link href="/upload">
                            <Button className="bg-rose-500 hover:bg-rose-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {summaries.map((summary) => (
                        <Card key={summary.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-rose-500" />
                                    {summary.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {summary.fileName}
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {new Date(summary.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/summaries/${summary.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            View Summary
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 