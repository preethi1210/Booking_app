import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProfilePage() {
  const { id } = useParams(); // Get the user id from the URL
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photo: ""
  });
  const [isEditing, setIsEditing] = useState(false); // State to toggle form visibility
  const navigate = useNavigate(); // To redirect after the update

  useEffect(() => {
    // Fetch the existing profile details when the component loads
    axios.get(`/edit/${id}`)
      .then(response => {
        const { data } = response;
        setProfile(data); // Set the initial data into the state
      })
      .catch(error => {
        console.error("Error fetching profile:", error);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/edit/${id}`, profile);
      console.log("Profile updated successfully:", response.data); // Log the success response
      navigate(`/profile`); // Redirect to the profile page after the update
    } catch (error) {
      console.error("Error updating profile:", error); // Log any errors that occur during the update
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setIsEditing(false); // Close the form without saving changes
  };

  return (
    <div className="text-center max-w-lg mx-auto">
      {!isEditing ? (
        <button onClick={() => setIsEditing(true)} className="primary mt-4">Edit Profile</button>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="w-full border p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className="w-full border p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
              className="w-full border p-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium">Profile Photo URL</label>
            <input
              type="text"
              id="photo"
              name="photo"
              value={profile.photo}
              onChange={handleChange}
              className="w-full border p-2"
            />
          </div>

          <div className="flex justify-between">
            <button type="submit" className="primary max-w-sm mt-2">Save Changes</button>
            <button type="button" onClick={handleCancel} className="secondary max-w-sm mt-2">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
