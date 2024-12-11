import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {setUser}= useContext(UserContext);
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(false);

async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
        const { data } = await axios.post('/login', { email, password });
        setUser(data);
        alert("Login Successful");
        setRedirect(true);
    } catch (e) {
        alert("Login failed. Please check your credentials.");
    } finally {
        setLoading(false);
    }
}



    if (redirect) {
        return <Navigate to={'/'} />;  // Redirect to home page after login
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className="underline text-black" to={'/register'}>Register now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
