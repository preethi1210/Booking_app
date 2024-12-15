// PhotosUpload.js
import { useState } from "react";
import axios from "axios";

export default function PhotosUploader({ addedPhotos, onChange }) {
  const [photoLink, setPhotoLink] = useState('');
  const [loading, setLoading] = useState(false);

  function uploadPhoto(e) {
    e.preventDefault();
    const files = e.target.files;
    const data = new FormData();

    // Append files to FormData
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }

    // Post request to upload the files
    setLoading(true);
    axios
      .post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        const { data: filenames } = response; // This should be an array of filenames
        onChange((prev) => [...prev, ...filenames]);
      })
      .catch((err) => {
        console.error('Failed to upload photos:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: filename } = await axios.post('/upload-by-link', { link: photoLink });
      onChange((prev) => [...prev, filename]);
      setPhotoLink(''); // Reset input after upload
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {addedPhotos.length > 0 &&
          addedPhotos.map((link) => (
            <div className="h-32 flex" key={link}>
              <img
                className="rounded-2xl w-full object-cover position-center"
                src={`http://localhost:4000/uploads/${link}`}
                alt={`Photo`}
              />
            </div>
          ))}
      </div>

      <label className="h-32 cursor-pointer flex gap-1 items-center justify-center border bg-transparent rounded-2xl p-8">
        <input type="file" multiple onChange={uploadPhoto} className="hidden" />
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

      {loading && <p className="text-gray-500 mt-2">Uploading...</p>}
    </>
  );
}

