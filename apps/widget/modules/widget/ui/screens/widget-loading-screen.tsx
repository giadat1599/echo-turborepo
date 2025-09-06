'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { WidgetHeader } from '../components/widget-header';
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
} from '../../atoms/widget-atoms';
import { useAction, useMutation } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';

type InitStep = 'org' | 'session' | 'settings' | 'vapi' | 'done';

export function WidgetLoadingScreen({
  organizationId,
}: {
  organizationId?: string | null;
}) {
  const [step, setStep] = useState<InitStep>('org');
  const [sessionValid, setSessionValid] = useState(false);

  const [loadingMessage, setLoadingMessage] = useAtom(loadingMessageAtom);
  const [, setOrganizationId] = useAtom(organizationIdAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [contactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId || '')
  );

  const validateOrganization = useAction(api.public.organizations.validate);
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  // Step 1: Validate organization
  useEffect(() => {
    if (step !== 'org') return;

    setLoadingMessage('Finding organization ID...');

    if (!organizationId) {
      setErrorMessage('Organization ID is required');
      setScreen('error');
      return;
    }

    setLoadingMessage('Verifying organization...');

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep('session');
        } else {
          setErrorMessage(result.reason || 'Invalid configuration');
          setScreen('error');
        }
      })
      .catch(() => {
        setErrorMessage('Unabled to verify organization');
        setScreen('error');
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setStep,
    validateOrganization,
    setLoadingMessage,
  ]);

  // Step 2: Validate contact session
  useEffect(() => {
    if (step !== 'session') return;

    if (!contactSessionId) {
      setSessionValid(false);
      setStep('done');
      return;
    }

    setLoadingMessage('Validating session...');

    validateContactSession({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep('done');
      })
      .catch(() => {
        setSessionValid(false);
        setStep('settings');
      });
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  useEffect(() => {
    if (step !== 'done') return;

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? 'selection' : 'auth');
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderCircleIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || 'Loading...'}</p>
      </div>
    </>
  );
}
