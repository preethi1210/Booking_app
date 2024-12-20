import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/places")
      .then((response) => {
        setPlaces(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching places:", error);
        setError("Failed to load places");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {places.length > 0 ? (
        places.map(place=> (
          <Link to={`/place/${place._id}`} key={place._id}>
            <div className="bg-gray-500 mb-2 rounded-2xl flex">
              {place.photos?.[0] ? (
                <img
                  className="rounded-2xl object-cover aspect-square"
                  src={`http://localhost:4000/uploads/${place.photos[0]}`}
                  alt={place.title || "Place image"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-2xl">
                  No Image Available
                </div>
              )}
            </div>
            <h2 className="font-bold">{place.address}</h2>
            <h3 className="text-sm text-gray-500">{place.title}</h3>
            <div className="mt-1">
              <span className="font-bold">${place.price.toFixed(2)}</span> per night
            </div>
          </Link>
        ))
      ) : (
        <div>No places found</div>
      )}
    </div>
  );
}
