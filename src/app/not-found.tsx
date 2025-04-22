import GoBack from "@/components/ui/go-back";
export const metadata = {
  title: "Not Found || Inkingi System",
  description: "Page Not Found in Inkingi System.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center gap-6">
      <div className="flex flex-col gap-4 border-l border-secondary p-2">
        <h1 className="animate-pulse text-xl font-bold text-primary">
          Page Not Found
        </h1>
        <GoBack />
      </div>
    </div>
  );
}
