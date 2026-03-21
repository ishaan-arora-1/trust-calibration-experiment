"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminStats {
  totalParticipants: number;
  completedParticipants: number;
  abandonedParticipants: number;
  totalTrials: number;
  conditionStats: {
    id: string;
    name: string;
    description: string;
    participantCount: number;
  }[];
  recentParticipants: {
    id: string;
    externalId: string;
    condition: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    currentTrial: number;
  }[];
  overallReliance: number | null;
  avgLatencyMs: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleExport = (type: string, format: string) => {
    window.open(`/api/export?type=${type}&format=${format}`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Experiment Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Trust Calibration Study — Admin Panel
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Participants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalParticipants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats.completedParticipants}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Reliance Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.overallReliance !== null
                  ? `${stats.overallReliance}%`
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Decision Latency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.avgLatencyMs > 0
                  ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s`
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Condition Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Condition Balance</CardTitle>
            <CardDescription>
              Participant distribution across experimental conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condition</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Participants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.conditionStats.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{c.name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.description}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {c.participantCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Tabs defaultValue="participants">
          <TabsList>
            <TabsTrigger value="participants">Recent Participants</TabsTrigger>
            <TabsTrigger value="export">Data Export</TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Recent Participants</CardTitle>
                <CardDescription>Last 10 sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentParticipants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No participants yet. Share the experiment link to begin
                    collecting data.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trial</TableHead>
                        <TableHead>Started</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentParticipants.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">
                            {p.externalId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.condition}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {p.currentTrial}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(p.startedAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>
                  Download experiment data in CSV or JSON format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      type: "trials",
                      label: "Trial Data",
                      desc: "All trial decisions with latency and AI accuracy",
                    },
                    {
                      type: "participants",
                      label: "Participant Data",
                      desc: "Demographics, conditions, and completion status",
                    },
                    {
                      type: "events",
                      label: "Event Log",
                      desc: "Fine-grained behavioral event stream",
                    },
                    {
                      type: "trust",
                      label: "Trust Survey",
                      desc: "Post-task trust scale responses",
                    },
                  ].map(({ type, label, desc }) => (
                    <div
                      key={type}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(type, "csv")}
                        >
                          Download CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(type, "json")}
                        >
                          Download JSON
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
