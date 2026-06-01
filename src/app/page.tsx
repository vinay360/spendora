import {
  ArrowRightIcon,
  ChartLineUpIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Logo } from "@/components/app/logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const features = [
  {
    title: "Budget with context",
    description: "Track monthly limits by category and see where money is moving before it becomes noise.",
    icon: ChartLineUpIcon,
  },
  {
    title: "Google-first security",
    description: "OAuth sign-in through Better Auth keeps account access simple and avoids password handling.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Built for clean data",
    description: "Drizzle and Neon Postgres schemas keep every transaction tied to the authenticated user.",
    icon: SparkleIcon,
  },
]

const categories = ["Housing", "Groceries", "Travel", "Subscriptions"]

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-6 md:px-8 lg:py-8">
        <header className="flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Open app
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </nav>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <Badge className="w-fit" variant="secondary">
                Expense clarity without spreadsheet fatigue
              </Badge>
              <div className="flex flex-col gap-4">
                <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-balance md:text-7xl">
                  Your money, organized into calmer decisions.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Spendora gives households and solo builders a focused place to
                  capture transactions, group spending, and protect budgets with
                  a production-ready Next.js foundation.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-in">
                  Start with Google
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">View dashboard shell</Link>
              </Button>
            </div>
          </div>

          <Card className="relative overflow-hidden border-primary/20 bg-card/80 shadow-2xl shadow-primary/10">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>May overview</CardTitle>
                  <CardDescription>Budget health across core categories</CardDescription>
                </div>
                <Badge variant="outline">Live model</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Spent" value="$3,284" />
                <Metric label="Saved" value="$860" />
                <Metric label="Runway" value="24d" />
              </div>
              <Separator />
              <div className="flex flex-col gap-4">
                {categories.map((category, index) => (
                  <div className="flex flex-col gap-2" key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        {[68, 42, 81, 27][index]}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-none bg-muted">
                      <div
                        className="h-full rounded-none bg-primary"
                        style={{ width: `${[68, 42, 81, 27][index]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="text-primary" weight="duotone" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-none border bg-background p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
    </div>
  )
}
