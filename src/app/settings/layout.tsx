

export const metadata = {
  title: "Settings || TheeWallet",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

// Layout component for the Sign-Up page
export default async function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
