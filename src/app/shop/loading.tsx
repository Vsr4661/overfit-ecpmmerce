export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="h-10 w-40 rounded-full bg-zinc-200" />
          <div className="mt-4 h-5 w-64 rounded-full bg-zinc-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="aspect-square rounded-2xl bg-zinc-200" />
              <div className="mt-4 h-5 w-3/4 rounded-full bg-zinc-200" />
              <div className="mt-2 h-4 w-1/3 rounded-full bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
