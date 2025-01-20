// Metadata configuration for the Sign-In page
export const metadata = {
  title: "SignIn || TheeWallet", // Page title displayed in the browser tab
  description: "Enter your wallet", // Description for SEO purposes
  icons: [{ rel: "icon", url: "/icon.png" }], // Favicon configuration
};

// Layout component for the Sign-In page
export default async function SignInLayout({
  children,
}: {
  children: React.ReactNode; // React children prop to render nested components
}) {
  return (
    <div>
      {/* Render child components passed into this layout */}
      {children}
    </div>
  );
}
