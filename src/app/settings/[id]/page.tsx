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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditAccount } from "@/components/account/EditAccount";
import Link from "next/link";
import { ArrowBigRight} from "lucide-react";
import { DeleteAccount } from "@/components/account/DeleteAccount";
import { AddAccount } from "@/components/account/AddAccount";
import { AddCategory } from "@/components/category/addCategory";
import { DeleteCategory } from "@/components/category/DeleteCategory";
import { EditCategory } from "@/components/category/EditCategory";
import { DeleteUser } from "@/components/DeleteUser";

// Validation schema using Zod
const formSchema = z
  .object({
    username: z.string().min(4, {
      message: "Username must be at least 4 characters.",
    }),
    email: z.string().email("Please enter a valid email address."),
    oldPassword: z
      .string()
      .optional(),
    newPassword: z
      .string()
      .min(4, { message: "New Password must be at least 4 characters." })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "New password and confirm password must match.",
      path: ["confirmPassword"],
    },
  );
export default function Settings() {
  const pathname = usePathname();
  const route = useRouter();
  const userId = pathname.split("/")[2] ?? "processing";
  if (userId === "") {
    route.push("/");
  }
  const utils = api.useUtils();
  const { data: user } = api.user.load.useQuery(userId);
  // Initialize the React Hook Form with Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.name ?? "",
      email: user?.email ?? "",
      oldPassword: "",
    },
  });
  const [value, setValue] = useState<string>("");
  const { data: accounts } = api.account.list.useQuery(userId);
  const { data: categories } = api.user.listCategories.useQuery({
    userId,
    type: value,
  });
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const updateUser = api.user.edit.useMutation({
    onSuccess: async (data) => {
      if (data.result.includes("Updated")) {
        toast.success(data.result, {
          duration: 2000,
        });
        setLoading(false);
        void utils.invalidate();
      } else {
        toast.error(data.result, { duration: 2000 });
        setLoading(false);
      }
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const fields = {
      name: values.username,
      email: values.email,
      id: userId,
      oldpass: values.oldPassword ?? "",
      newpass: values.newPassword ?? "",
    };
    void updateUser.mutate(fields);
  }

  useEffect(() => {
    if (user) {
      form.setValue("username", user.name);
      form.setValue("email", user.email);
    }
  }, [user, form]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 text-xs">
      <h1 className="text-3xl font-extrabold">TheeWallet</h1>
      <div className="flex flex-col gap-4 rounded-md border-2 border-secondary p-4">
        <div className="flex w-full items-center justify-center">
          <h1 className="w-4/5 border-b text-center text-xl font-bold">
            Settings
          </h1>
          <Link
            href={`/`}
            className="justify-centerw-1/5 flex items-center px-2 py-1"
          >
            <ArrowBigRight />
          </Link>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList>
            <TabsTrigger value="user">User Info</TabsTrigger>
            <TabsTrigger value="password">Security</TabsTrigger>
            <TabsTrigger value="account">Accounts</TabsTrigger>
            <TabsTrigger value="category">Categories</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent className="space-y-4" value="user">
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 mt-4">
                  <Button disabled={loading} type="submit">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <DeleteUser id={userId} />
                </div>
              </TabsContent>

              <TabsContent className="space-y-4" value="password">
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Old Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter Old Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter New Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="mt-4" disabled={loading} type="submit">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </TabsContent>
            </form>
          </Form>
          <TabsContent className="flex flex-col gap-4 p-4" value="account">
            {accounts && accounts.length > 0 && (
              <Select onValueChange={(e) => setAccount(e)}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue placeholder="Select an Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem
                      className="capitalize"
                      key={account.id}
                      value={account.id}
                    >
                      {account.name} - {account.balance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <AddAccount userId={userId} />
            {account && (
              <>
                <EditAccount userId={userId} id={account} />
                <DeleteAccount id={account} />
              </>
            )}
          </TabsContent>
          <TabsContent className="flex flex-col gap-4 p-4" value="category">
            <Select onValueChange={(value) => setValue(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {categories && categories.length > 0 && (
              <Select onValueChange={(e) => setCategory(e)}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem
                      className="capitalize"
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <AddCategory userId={userId} />
            {category && (
              <>
                <EditCategory userId={userId} id={category} />
                <DeleteCategory id={category} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
