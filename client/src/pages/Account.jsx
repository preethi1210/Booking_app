import { Link, Navigate, useParams } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import PlacesPage from "./PlacePage";

export default function AccountPage() {
    const { ready, user, setUser } = useContext(UserContext);
    let { subpage } = useParams();  // `subpage` should be defined after `useParams()` is called
    const [redirect, setRedirect] = useState(null);

    // Default subpage to 'profile' if not provided
    let currentSubpage = subpage || 'profile';

    // Show loading message if data isn't ready
    if (!ready) {
        return "Loading...";
    }

    // Redirect to login if the user isn't logged in
    if (ready && !user) {
        return <Navigate to="/login" />;
    }

    // Logout function
    async function logout() {
        try {
            await axios.post('/logout');
            setUser(null); // Clear user context
            setRedirect('/'); // Set redirect to homepage after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }

    // Redirect if a target is set
    if (redirect) {
        return <Navigate to={redirect} />;
    }

    // Helper function to handle link classes
    function linkClasses(type) {
        let classes = 'p-2 px-6 ';
        if (type === currentSubpage) {
            classes += ' bg-primary rounded-full text-white';
        }
        return classes;
    }

    return (
        <div>
            <nav className="w-full flex justify-center mt-8 gap-4">
                <Link className={linkClasses('profile')} to="/account/profile">My profile</Link>
                <Link className={linkClasses('bookings')} to="/account/bookings">My bookings</Link>
                <Link className={linkClasses('places')} to="/account/places">My accommodation</Link>
            </nav>

            {currentSubpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                    <p>Logged in as {user.name} ({user.email})</p>
                    <button className="primary max-w-sm mt-2" onClick={logout}>Logout</button>
                </div>
            )}
            {currentSubpage === 'places' && <PlacesPage />}
        </div>
    );
}
