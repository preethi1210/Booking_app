import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });

  const [photoLink, setPhotoLink] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [isUrlInput, setIsUrlInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    // Fetch profile details
    axios.get(`/profile/${id}`)
      .then(response => setProfile(response.data))
      .catch(error => console.error("Error fetching profile:", error));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedProfile = { ...profile };
    setLoading(true);

    try {
      if (photoLink) {
        const { data } = await axios.post("/upload-by-link", { link: photoLink });
        updatedProfile.photo = data;
      } else if (photoFile) {
        const formData = new FormData();
        formData.append("photos", photoFile);
        const { data } = await axios.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedProfile.photo = data[0];
      }

      const response = await axios.put(`/edit/${id}`, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      setFileError(""); // Clear any previous errors
      setPhotoFile(file);
    } else {
      setFileError("Please upload a valid image file under 5MB.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfile({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      photo: profile.photo
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      {!isEditing ? (
        <div>
          <button onClick={() => setIsEditing(true)} className="bg-primary text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300">
            Edit Profile
          </button>
          <div className="mt-6">
            <p className="text-xl font-semibold">Welcome  {profile.name}</p>
            <div >
              <label>Personal information</label>
            <p className="text-md text-gray-600">Email: {profile.email}</p>
            <p className="text-md text-gray-600">Phone: {profile.phone}</p>
            <img src={profile.photo} alt="" className="w-24 h-24 rounded-full mx-auto mt-4" />
          </div></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="photoLink" className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <div className="flex mb-4 space-x-4">
              <button 
                type="button" 
                className={`px-4 py-2 rounded-full ${isUrlInput ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} hover:bg-primary`}
                onClick={() => setIsUrlInput(true)}
              >
                Use URL
              </button>
              <button 
                type="button" 
                className={`px-4 py-2 rounded-full ${!isUrlInput ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} hover:bg-primary`}
                onClick={() => setIsUrlInput(false)}
              >
                Upload File
              </button>
            </div>
            
            {isUrlInput ? (
              <input
                type="text"
                id="photoLink"
                value={photoLink}
                onChange={(e) => setPhotoLink(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:primary"
                placeholder="Enter photo URL"
              />
            ) : (
              <input
                type="file"
                id="photoFile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:primary"
              />
            )}

            {fileError && <div className="text-red-500 text-sm mt-2">{fileError}</div>}
          </div>

          {loading && <div className="text-blue-500">Loading...</div>}

          <div className="flex justify-between space-x-4">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300">Save Changes</button>
            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-primary transition duration-300">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
