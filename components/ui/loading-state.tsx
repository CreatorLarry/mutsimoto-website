export function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products" aria-live="polite">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-lg border border-[#353d43] bg-[#14191d]">
          <div className="h-52 bg-[#232a30]" />
          <div className="space-y-3 p-5"><div className="h-3 w-24 bg-[#2d3439]" /><div className="h-6 w-4/5 bg-[#2d3439]" /><div className="h-3 w-full bg-[#2d3439]" /></div>
        </div>
      ))}
    </div>
  );
}
