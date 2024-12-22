import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PlaceGallery from "../PlaceGallery";
import BookingWidget from "../BookingWidget";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios
      .get(`/places/${id}`)
      .then((response) => {
        console.log("Fetched place:", response.data);
        setPlace(response.data);
      })
      .catch((error) => {
        console.error("Error fetching place:", error);
      });
  }, [id]);

  if (!place) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
      <h1 className="text-3xl">{place.title}</h1>
      <a
        target="_blank"
        className="font-semibold underline my-2"
        href={`https://maps.google.com/?q=${place.address}`}
      >
        View on Google Maps
      </a>
      <PlaceGallery place={place} />
      <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="my-4">
            <h2 className="font-semibold text-2xl">Description</h2>
            {place.description}
          </div>
          Check-in: {place.checkIn}
          <br />
          Check-out: {place.checkOut}
          <br />
          Max number of guests: {place.maxGuests}
        </div>
<div>
  <BookingWidget place={place} />
</div></div>
<div className="bg-white -mx-8 px-8 py-8" >
<h2 className="font-semibold text-2xl">Extra information</h2>
<div className="mb-4 mt-1 text-sm text-gray-700 leading-4">{place.extraInfo}</div>
    </div></div>
  );
}
