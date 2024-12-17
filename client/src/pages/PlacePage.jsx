import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Link, useParams } from "react-router-dom";
import AccountNav from "../AccountNav";

export default function PlacePage() {
  const {id} = useParams();
  const [place,setPlace] = useState(null);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`/places/${id}`).then(response => {
      setPlace(response.data);
    });
  }, [id]);

  if (!place) return '';

  return (
    <div>
      <AccountNav />
      <div className="text-center">
        <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Add new place
        </Link>
        </div>
        <div className="mt-4">
          {place.length >0 && place.map(place=>(
            <Link to={"/account/places/"+place._id} className="flex cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl">
              <div className="flex w-32 h-32 bg-gray-300 grow shrink-0">{place.photos.length && (
                <img className="object-cover" src={'http://localhost:4000/uploads'+place.photos[0]} alt=""/>
              )}
                </div>
                <h2 className="text-xl " >{place.title}</h2>
            </Link>
          ))}
        </div>
    </div>
  );
}
