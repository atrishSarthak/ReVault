import { SignIn } from '@clerk/clerk-react'
import Navbar from '../components/layout/Navbar'
import './AuthLayout.css' // We will create a small CSS file to clear things out

export default function SignInPage() {
    return (
        <div className="auth-layout">
            <Navbar dark={false} />
            <main className="auth-container">
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </main>
        </div>
    )
}
