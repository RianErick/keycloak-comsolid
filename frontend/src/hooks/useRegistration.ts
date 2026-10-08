import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { login } from '@/services/keycloak.service';
import { registerUser } from '@/services/user.service';
import type { UserRegistration } from '@/types/user';

export function useRegistration() {
  const [errorMessage, setErrorMessage] = useState('');
  const submitting = useRef(false);
  const registration = useMutation({
    mutationFn: async (user: UserRegistration) => {
      await registerUser(user);
      await login(user.username);
    },
    onMutate: () => setErrorMessage(''),
    onError: (reason: unknown) => {
      if (!axios.isAxiosError(reason)) {
        setErrorMessage(
          reason instanceof Error
            ? reason.message
            : 'Could not register. Please try again.',
        );
        return;
      }

      if (reason.response?.status === 409) {
        setErrorMessage(
          'That username or email is already in use. Try signing in or use different details.',
        );
      } else if (reason.response?.status === 400) {
        setErrorMessage(
          'Some details are invalid. Check the fields and try again.',
        );
      } else if (reason.code === 'ECONNABORTED' || !reason.response) {
        setErrorMessage(
          'Could not reach the server. Check your connection and try again.',
        );
      } else if (reason.response.status >= 500) {
        setErrorMessage(
          'Registration is unavailable right now. Please try again shortly.',
        );
      } else {
        setErrorMessage('Could not register. Please try again.');
      }
    },
  });

  return {
    busy: registration.isPending,
    error: errorMessage,
    submit: (user: UserRegistration) => {
      if (submitting.current) return;
      submitting.current = true;
      registration.mutate(user, {
        onSettled: () => {
          submitting.current = false;
        },
      });
    },
  };
}
