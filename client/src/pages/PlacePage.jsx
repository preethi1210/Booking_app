import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Perks from "../Perks";

export default function PlacesPage() {
  const { action } = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState('');
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);

  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }
  const [isUploading, setIsUploading] = useState(false);

  function uploadPhoto(e) {
    e.preventDefault();
    setIsUploading(true); // Start uploading
    const files = e.target.files;
    const data = new FormData();
  
    // Append files to FormData
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }
  
    // Post request to upload the files
    axios
      .post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        const filenames = response.data; // This should be an array of filenames
        // Assuming filenames are just the filenames without paths
        const imageLinks = filenames.map((filename) => ({
          filename,
          url: `http://localhost:4000/uploads/${filename}`, // Construct image URL
        }));
        setAddedPhotos((prev) => [...prev, ...imageLinks]); // Add image objects to state
        setIsUploading(false); // Stop uploading
      })
      .catch((err) => {
        console.error('Error uploading files:', err);
        setIsUploading(false); // Stop uploading on error
      });
  }
  
  
  
  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  const addPhotoByLink = async (e) => {
    e.preventDefault(); // Prevent form submission on button click, but not on form submit
    try {
      const { data: filename } = await axios.post('/upload-by-link', { link: photoLink });
      setAddedPhotos((prev) => [...prev, filename]);
      setPhotoLink(''); // Reset input after upload
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }
  };
  

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
        <form>
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
          <div className="flex gap-2">
            <input
              type="text"
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
              placeholder="Add using a link... jpg"
            />
            <button
              type="button" // Prevent form submission on button click
              onClick={addPhotoByLink}
              className="bg-gray-200 px-4 rounded-2xl"
            >
              Add photo
            </button>
          </div>

          <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ">
  {addedPhotos.length > 0 && addedPhotos.map((link) => (
    <div className="h-32 flex">
    <img className="rounded-2xl w-full object-cover position-center"
      key={link}  // Ensure each image has a unique key
      src={`http://localhost:4000/uploads/${link.filename}`}
      alt={`Photo`} 
    /></div>
  ))}
</div>

          <label  className="h-32 cursor-pointer flex gap-1 items-center justify-center border bg-transparent rounded-2xl p-8">
            <input type="file" onChange={uploadPhoto} className="hidden" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
            Upload
          </label>
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
                onChange={(e) => setMaxGuests(e.target.value)}
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
