export const metadata = {
  title: "Settings || TheeWallet", // Page title displayed in the browser tab
  description: "Edit theeWallet Account Info", // Description for SEO purposes
  icons: [{ rel: "icon", url: "/icon.png" }],
};

// Layout component for the Sign-Up page
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
