import { SiteLoader } from "@/components/ui/site-loader";

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteLoader />
      {children}
    </>
  );
}
