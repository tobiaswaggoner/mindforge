import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            MindForge Admin
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Content Engine für das KI-gestützte Lern-Ökosystem
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Fragen</CardTitle>
              <CardDescription>
                Fragen-Cluster und Varianten verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-zinc-500">Fragen-Cluster</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generierung</CardTitle>
              <CardDescription>
                AI-gestützte Content-Generierung steuern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">—</p>
              <p className="text-sm text-zinc-500">Aktive Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fächer</CardTitle>
              <CardDescription>
                Fächer und Themen organisieren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-zinc-500">Aktive Fächer</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Schnellstart</CardTitle>
              <CardDescription>
                Erste Schritte mit MindForge Admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  1
                </div>
                <div>
                  <p className="font-medium">Backend starten</p>
                  <code className="text-sm text-zinc-500">
                    cd apps/backend && uvicorn src.main:app --reload --port 4202
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  2
                </div>
                <div>
                  <p className="font-medium">Fächer anlegen</p>
                  <p className="text-sm text-zinc-500">
                    Erstelle Fächer und definiere Themengebiete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  3
                </div>
                <div>
                  <p className="font-medium">Content generieren</p>
                  <p className="text-sm text-zinc-500">
                    Starte die AI-gestützte Fragen-Generierung
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
