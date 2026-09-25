"use client";

import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";

const PendingFormContext = createContext(false);

type PendingFormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function PendingForm({ children, onSubmit, ...props }: PendingFormProps) {
  const [pending, setPending] = useState(false);

  return (
    <PendingFormContext.Provider value={pending}>
      <form
        {...props}
        aria-busy={pending}
        onSubmit={(event) => {
          onSubmit?.(event);
          if (!event.defaultPrevented) setPending(true);
        }}
      >
        {children}
      </form>
    </PendingFormContext.Provider>
  );
}

type PendingSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel: string;
  children: ReactNode;
};

export function PendingSubmitButton({
  children,
  className,
  disabled,
  pendingLabel,
  ...props
}: PendingSubmitButtonProps) {
  const pending = useContext(PendingFormContext);

  return (
    <button
      {...props}
      aria-busy={pending}
      aria-live="polite"
      className={`${className || ""} pending-submit`.trim()}
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? (
        <>
          <span className="button-spinner" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </>
      ) : children}
    </button>
  );
}
