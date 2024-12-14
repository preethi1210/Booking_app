import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Perks from "../Perks";
import PhotosUploader from "../PhotosUpload";

export default function PlacesPage() {
  const { action } = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [redirect, setRedirect] = useState(''); 
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [addedPhotos, setAddedPhotos] = useState([]);

  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  useEffect(() => {
    if (redirect) {
      // This will redirect once after the state change
      return <Navigate to={redirect} />;
    }
  }, [redirect]);

  async function addNewPlace(e) {
    e.preventDefault();
    if (!title || !address) {
      alert('Title and Address are required!');
      return;
    }
    try {
      const { data } = await axios.post('/places', {
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests
      });
      setRedirect('/accounts/places'); 
    } catch (error) {
      console.error("Error adding place:", error);
    }
  }

  return (
    <div>
      {action !== "new" && (
        <div className="text-center mt-4">
          <Link
            className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
            to="/accounts/places/new"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add new place
          </Link>
          <div>My places</div>
        </div>
      )}
      {action === "new" && (
        <form onSubmit={addNewPlace}>
          {preInput('Title', 'Title (short & crisp)')}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, for example: My lovely apt"
          />
          {preInput('Address', 'Address for your place')}
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />
          {preInput('Photos', 'more = better')}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

          {preInput('Description', 'Description of the place')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {preInput('Perks', 'Select all the perks')}
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Perks selected={perks} onChange={setPerks} />
          </div>
          {preInput('Extra information', 'House rules, etc')}
          <textarea
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />
          {preInput(
            'Check in & out times, max guests',
            'Add check-in and out times, remember to have some time window for cleaning between guests'
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <h3 className="mt-2 mb-1">Check in time</h3>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="14"
              />
            </div>
            <div>
              <h3 className="mt-2 mb-1">Check out time</h3>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="11"
              />
            </div>
            <div>
              <h3 className="mt-2 mb-1">Max number of guests</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <button className="primary my-4">Save</button>
          </div>
        </form>
      )}
    </div>
  );
}
