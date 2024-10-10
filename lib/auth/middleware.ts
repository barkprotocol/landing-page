import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

// Define the structure for ActionState, allowing dynamic properties.
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

// Type definition for action functions that receive validated data.
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

// Higher-order function for validating action with Zod schema.
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T; // Return the first validation error.
    }

    return action(result.data, formData); // Call the validated action.
  };
}

// Type definition for actions requiring user context.
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

// Higher-order function for validating action with user context.
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated'); // Throw an error if the user is not found.
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T; // Return the first validation error.
    }

    return action(result.data, formData, user); // Call the validated action with the user context.
  };
}

// Type definition for actions that need team context.
type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

// Higher-order function for actions that require team context.
export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in'); // Redirect to sign-in if user is not authenticated.
    }

    const team = await getTeamForUser(user.id);
    if (!team) {
      throw new Error('Team not found'); // Throw an error if the team is not found.
    }

    return action(formData, team); // Call the action with the team context.
  };
}
