export const metadata = {
  title: "SignIn || TheeWallet", // Page title displayed in the browser tab
  description: "Enter your wallet", // Description for SEO purposes
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default async function SignInLayout({
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
