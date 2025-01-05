import { useState } from "react";
import styles from "./index.module.css";
import axios from "axios";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const UploadImage = (props) => {
  const { data, onImageUpload, setUserData } = props;
  const label = data?.label;
  const [fileName, setFileName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [apiUrl, setApiUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleImageName = (e) => {
    setFileName(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCreateFile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=putObject&fileName=${fileName}.jpg`
      );

      if (response.status === 200) {
        console.log("create file: " + response.data.url)
        setUserData((prev)=>({...prev,   files: { createFile: response.data.url, getFile: '' },}))
        setApiUrl(response.data.url);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to create the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!apiUrl || !selectedImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("url", apiUrl);

      await axios.post("http://localhost:1337/proxy/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      handleGetFile();
    } catch (error) {
      console.error("Error:", error);
      alert("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=getObject&fileName=${fileName}.jpg`
      );

      if (response.status === 200) {
        setUserData((prev) => ({
          ...prev,
          files: { ...prev.files, getFile: response.data.url },
        }));
        setImageUrl(response.data.url); 
        if (onImageUpload) {
          onImageUpload(response.data.url); 
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to retrieve the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {isLoading && (
        <div className="loader">
          <div className="spinner"></div>
          <p>Processing, please wait...</p>
        </div>
      )}

      {!apiUrl && !imageUrl && !isLoading && (
        <div className={styles.createFileBlock}>
          <h1 className="header">{label}</h1>
          <input
            type="text"
            placeholder="Enter file name"
            value={fileName}
            onChange={handleImageName}
            className="input"
          />
          <div>
            <button className="uploadButton" onClick={handleCreateFile}>
              Create File
            </button>
          </div>
        </div>
      )}

      {apiUrl && !imageUrl && !isLoading && (
        <div className={styles.uploadBlock}>
          <h1 className="header">Upload Image</h1>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="uploadBlock"
          />
          <button
            className="uploadButton"
            onClick={handleUploadImage}
            disabled={!selectedImage}
          >
            Upload Image
          </button>
        </div>
      )}

      {imageUrl && (
        <div className={styles.imagePreview}>
          <div className="header">Uploaded Image Preview</div>
          <img src={imageUrl} alt="Uploaded" className={styles.previewImage} />
           <Handle type="source" position={Position.Right} />
        </div>
      )}
         {/* <Handle type="source" position={Position.Right} /> */}
    </div>
  );
};

// Add PropTypes for validation
UploadImage.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default UploadImage;
