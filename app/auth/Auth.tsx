import {type FormEvent, useState} from 'react'
import {useAuth} from '@/Providers/AuthProvider'
import {useNavigate} from 'react-router'

export default function Auth() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {signIn, isLoading, error} = useAuth()

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            await signIn(email, password)
            navigate('/')
        } catch (err) {
            // handled in AuthProvider
        }
    }

    return (
        <div className="grid h-[100vh] place-content-center">
            <div className="bg-white p-6 rounded-lg shadow-md min-w-80">
                <h1 className="text-2xl mb-10">WalletWatcher</h1>

                <form onSubmit={handleLogin}>
                    <input
                        className="input-styles w-full mb-5"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        required={true}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input-styles w-full mb-1"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        required={true}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-sm text-red-500 mb-5">{error}</p>
                    <button
                        className="block w-full border border-gray-300 rounded-sm py-2 hover:bg-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !email || !password}>
                        {isLoading ? <span>Loading</span> : <span>Sign in</span>}
                    </button>
                </form>

            </div>
        </div>
    )
}