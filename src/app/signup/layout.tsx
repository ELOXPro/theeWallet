// Metadata configuration for the Sign-Up page
export const metadata = {
  title: "SignUp || TheeWallet", // Page title displayed in the browser tab
  description: "Create a Wallet", // Description for SEO purposes
  icons: [{ rel: "icon", url: "/icon.png" }], // Favicon configuration
};

// Layout component for the Sign-Up page
export default async function SignUpLayout({
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
