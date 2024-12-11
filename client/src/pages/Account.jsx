import { Link, Navigate, useParams } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function AccountPage() {
    const { ready, user } = useContext(UserContext);
    const { subpage } = useParams(); // `subpage` should be defined after `useParams()` is called
    
    if (!ready) {
        return "Loading";  // Show loading state until the data is ready
    }
    
    if (ready && !user) {
        return <Navigate to={'/login'} />;  // Redirect to login if no user
    }

    function logout() {
        axios.post('/logout').then(() => {
            // You might want to redirect or update state after logout
            window.location.reload(); // A simple way to reload and reset the app state
        });
    }

    function linkClasses(type = null) {
        let classes = 'p-2 px-6';
        if (type === subpage || (subpage === undefined && type === 'profile')) {
            classes += ' bg-primary rounded-full';
        }
        return classes;
    }

    return (
        <div>
            <nav className="w-full flex justify-center mt-8 gap-4">
                <Link className={linkClasses('profile')} to={'/accounts/profile'}>My profile</Link>
                <Link className={linkClasses('bookings')} to={'/accounts/bookings'}>My bookings</Link>
                <Link className={linkClasses('places')} to={'/accounts/places'}>My accommodation</Link>
            </nav>

            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                    Logged in as {user.name} ({user.email})<br />
                    <button className="primary max-w-sm mt-2" onClick={logout}>Logout</button>
                </div>
            )}

            {/* Add other subpage content here based on the 'subpage' value */}
        </div>
    );
}
