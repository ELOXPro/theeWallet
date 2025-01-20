"use client"; // Enables client-side rendering

// Imports
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver for Zod validation
import { z } from "zod"; // Schema validation
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Form-related UI components
import { Input } from "@/components/ui/input"; // Input component
import Link from "next/link"; // Link for navigation
import { signIn } from "next-auth/react"; // Authentication handler
import { useRouter } from "next/navigation"; // Router for navigation
import { useForm } from "react-hook-form"; // React Hook Form
import { toast } from "sonner"; // Notification library
import { api } from "@/trpc/react"; // tRPC API integration
import { useState } from "react"; // State management

// Form schema using Zod for validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

// SignIn component
export default function SignIn() {
  const router = useRouter(); // Router instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Zod resolver for validation
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [loading, setLoading] = useState(false); // Loading state

  // API mutation for login
  const Login = api.user.login.useMutation({
    onSuccess: async (data) => {
      if (data.user && data?.result === `Logged in`) {
        toast.success(data.result); // Show success message
        await signIn("credentials", {
          id: data.user,
          redirect: false,
        }).then((res) => {
          if (res?.status === 401) {
            toast.error(res.error); // Show error if login fails
          } else {
            router.push("/"); // Redirect to home page
          }
        });
      } else {
        toast.error(data?.result); // Show error message
        setLoading(false); // Reset loading state
      }
    },
  });

  // Form submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true); // Set loading state
    Login.mutate(values); // Trigger API mutation
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center text-xs space-y-8">
      {/* App Title */}
      <h1 className="text-3xl font-extrabold">TheeWallet</h1>

      {/* Form Container */}
      <div className="rounded-md border-2 border-secondary p-4">
        <h1 className="mb-4 w-full border-b text-center text-xl font-bold">
          Enter your Wallet
        </h1>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit Button */}
            <Button disabled={loading} type="submit">
              Submit
            </Button>
          </form>
        </Form>
        {/* Sign-Up Link */}
        <Link className="mt-4 block text-center" href="/signup">
          Don't have an account?
        </Link>
      </div>
    </div>
  );
}
