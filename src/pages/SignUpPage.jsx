import { SignUp } from '@clerk/clerk-react'
import Navbar from '../components/layout/Navbar'
import './AuthLayout.css'

export default function SignUpPage() {
    return (
        <div className="auth-layout">
            <Navbar dark={false} />
            <main className="auth-container">
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </main>
        </div>
    )
}
