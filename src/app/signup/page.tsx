"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Validation schema using Zod
const formSchema = z.object({
  username: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

export default function SignUp() {
  const router = useRouter();
  const utils = api.useUtils();
  // Initialize the React Hook Form with Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);

  // Mutation to create a user account
  const createUser = api.user.create.useMutation({
    onSuccess: async (data) => {
      if (data.result === "Wallet Created") {
        // Notify the user of success
        toast.success("Your wallet has been created successfully!", {
          duration: 2000,
        });
        setLoading(false);

        // Automatically sign in the user
        await signIn("credentials", {
          id: data.user,
          redirect: false,
        }).then((res) => {
          if (res?.status === 401) {
            toast.error(res.error);
          } else {
            
            void utils.invalidate();
            router.push("/"); // Redirect to the home page
          }
        });
      } else {
        // Handle creation error
        toast.error(data.result, { duration: 2000 });
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error(error.message);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    createUser.mutate(values);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 text-xs">
      {/* Application header */}
      <h1 className="text-3xl font-extrabold">TheeWallet</h1>

      {/* Sign-up form container */}
      <div className="rounded-md border-2 border-secondary p-4">
        <h1 className="mb-4 w-full border-b text-center text-xl font-bold">
          Create a Wallet
        </h1>

        <Form {...form}>
          {/* Form submission handler */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" {...field} />
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
                      placeholder="Create a password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button disabled={loading} type="submit">
              {loading ? "Creating..." : "Submit"}
            </Button>
          </form>
        </Form>

        {/* Redirect to Sign In */}
        <Link className="mt-4 block text-center" href="/signin">
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
