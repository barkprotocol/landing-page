'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from '@/lib/supabase/actions';
import { ActionState } from '@/lib/auth/middleware';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolanaLoginButton } from '@/components/ui/solana-login-button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LoginProps {
  mode?: 'signin' | 'signup';
}

export function Login({ mode = 'signin' }: LoginProps) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useFormState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const wallet = useWallet();

  const handleSolanaLogin = async () => {
    if (!wallet.connected) {
      await wallet.connect();
    }

    if (wallet.publicKey && wallet.signMessage) {
      setIsLoading(true);
      try {
        const message = `Login to Milton: ${new Date().toISOString()}`;
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await wallet.signMessage(encodedMessage);
        
        const formData = new FormData();
        formData.append('walletAddress', wallet.publicKey.toBase58());
        formData.append('signedMessage', Buffer.from(signedMessage).toString('base64'));
        formData.append('message', message);
        
        const result = await signIn(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }

        toast.success('Logged in successfully!');
        if (redirect) {
          window.location.href = redirect;
        }
      } catch (error) {
        console.error('Solana login error:', error);
        toast.error('Failed to login with Solana wallet');
        setState((prevState) => ({
          ...prevState,
          error: 'Failed to login with Solana wallet',
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
            alt="Milton Logo"
            width={68}
            height={68}
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={setState.formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={50}
                  className="w-full"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  maxLength={100}
                  className="w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-destructive text-sm">{state.error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <SolanaLoginButton onClick={handleSolanaLogin} className="w-full" />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  {mode === 'signin' ? 'New to our platform?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`${mode === 'signin' ? '/signup' : '/login'}`}
                className="font-medium text-primary hover:text-primary/80"
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}