import { createContext, useState, useEffect } from "react";
import axios from "axios";
import {data} from "autoprefixer";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready,setReady]=useState(false);
    useEffect(() => {
        if (!user) {
            axios.get("/profile").then(({data}) => {
                    setUser(data);
                    setReady(true);
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                });
        }
    }, [user]);
    // This effect depends on the 'user' state to avoid unnecessary requests

    return (
        <UserContext.Provider value={{ user, setUser ,ready}}>
            {children}
        </UserContext.Provider>
    );
}
