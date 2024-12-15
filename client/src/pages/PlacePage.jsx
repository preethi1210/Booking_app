import Perks from "../Perks";
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import PhotosUploader from "../PhotosUpload";

export default function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/places/${id}`)
      .then(response => {
        const { data } = response;
        setTitle(data.title);
        setAddress(data.address);
        setAddedPhotos(data.photos);
        setDescription(data.description);
        setPerks(data.perks);
        setExtraInfo(data.extraInfo);
        setCheckIn(data.checkIn);
        setCheckOut(data.checkOut);
        setMaxGuests(data.maxGuests);
        setPrice(data.price);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch place details.');
        setLoading(false);
      });
  }, [id]);

  function inputHeader(text) {
    return (
      <h2 className="text-2xl mt-4">{text}</h2>
    );
  }

  function inputDescription(text) {
    return (
      <p className="text-gray-500 text-sm">{text}</p>
    );
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };

    setLoading(true);
    setError('');

    try {
      if (id) {
        // Update existing place
        await axios.put('/places', { id, ...placeData });
      } else {
        // New place
        await axios.post('/places', placeData);
      }
      setRedirect(true);
    } catch (err) {
      setError('Failed to save the place.');
    } finally {
      setLoading(false);
    }
  }

  if (redirect) {
    return <Navigate to={'/account/places'} />;
  }

  return (
    <div>
      <form onSubmit={savePlace}>
        {preInput('Title', 'Title for your place. Should be short and catchy as in advertisement')}
        <input
          type="text"
          value={title}
          onChange={ev => setTitle(ev.target.value)}
          placeholder="Title, for example: My lovely apt"
          required
        />
        {preInput('Address', 'Address to this place')}
        <input
          type="text"
          value={address}
          onChange={ev => setAddress(ev.target.value)}
          placeholder="Address"
          required
        />
        {preInput('Photos', 'More = better')}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        {preInput('Description', 'Description of the place')}
        <textarea
          value={description}
          onChange={ev => setDescription(ev.target.value)}
          required
        />
        {preInput('Perks', 'Select all the perks of your place')}
        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Perks selected={perks} onChange={setPerks} />
        </div>
        {preInput('Extra Info', 'House rules, etc')}
        <textarea
          value={extraInfo}
          onChange={ev => setExtraInfo(ev.target.value)}
        />
        {preInput('Check-in & Check-out Times', 'Add check-in and check-out times')}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1">Check-in time</h3>
            <input
              type="text"
              value={checkIn}
              onChange={ev => setCheckIn(ev.target.value)}
              placeholder="14:00"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check-out time</h3>
            <input
              type="text"
              value={checkOut}
              onChange={ev => setCheckOut(ev.target.value)}
              placeholder="11:00"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input
              type="number"
              value={maxGuests}
              onChange={ev => setMaxGuests(ev.target.value)}
              min="1"
              required
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per night</h3>
            <input
              type="number"
              value={price}
              onChange={ev => setPrice(ev.target.value)}
              min="1"
              required
            />
          </div>
        </div>
        <button className="primary my-4" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}