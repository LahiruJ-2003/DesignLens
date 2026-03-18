import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card border border-border rounded-lg shadow-lg',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              formFieldInput: 'bg-background border border-border text-foreground',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border bg-background hover:bg-muted text-foreground',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
              footerActionLink: 'text-primary hover:text-primary/80',
              formResendCodeLink: 'text-primary hover:text-primary/80',
              footerActionText: 'text-muted-foreground',
              identifierInputField: 'bg-background border border-border text-foreground',
            },
          }}
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  )
}
