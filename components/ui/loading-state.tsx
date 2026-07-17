export function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products" aria-live="polite">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-[22px] border border-[#dfe5ec] bg-white">
          <div className="h-52 bg-[#e7eaee]" />
          <div className="space-y-3 p-5"><div className="h-3 w-24 bg-[#e7eaee]" /><div className="h-6 w-4/5 bg-[#e7eaee]" /><div className="h-3 w-full bg-[#e7eaee]" /></div>
        </div>
      ))}
    </div>
  );
}
