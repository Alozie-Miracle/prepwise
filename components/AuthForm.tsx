"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { email, z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import FormFields from "./FormField";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, "Name is required")
        : z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

type Props = {
  type: string;
};

const AuthForm = ({ type }: Props) => {
  const router = useRouter();
  const formSchema = authFormSchema(type as FormType);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-in") {
        const { email, password } = values;

        const userCrendential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCrendential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully!");
        router.push("/");
      } else {
        // Handle sign-up logic

        const { name, email, password } = values;

        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          email,
          password,
          name: name!,
        });

        if (!result?.success) {
          toast.error(result?.message);
        }

        toast.success("Account created successfully!");
        router.push("/sign-in");
      }
    } catch (error) {
      console.log(error);
      toast.error(`An error occurred: ${error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3 className="">Practice job interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full mt-4 form"
          >
            {!isSignIn && (
              <FormFields
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormFields
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormFields
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button type="submit" className="btn">
              {type === "sign-in" ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {type === "sign-in" ? "No account yet?" : "Have an account already?"}
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {type === "sign-in" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
