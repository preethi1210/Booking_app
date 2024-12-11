import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!user) {
            axios.get("/profile", { withCredentials: true }) // Ensure cookies are included if necessary
                .then(({ data }) => {
                    setUser(data);
                    setReady(true);
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                    setReady(true); // Ensure 'ready' is set to true even if there's an error to stop loading
                });
        }
    }, [user]); // This effect depends on the 'user' state to avoid unnecessary requests

    return (
        <UserContext.Provider value={{ user, ready, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
