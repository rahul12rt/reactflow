import { useState } from "react";
import styles from "./index.module.css";
import axios from "axios";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import { BASE_URL } from "../../../config";
import convertPsdToJpg from "../../utlis/psdToJpg";

const UploadImage = (props) => {
  const { data, setUserData } = props;
  const label = data?.label;
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("image"); // Default to "image"
  const [selectedImage, setSelectedImage] = useState(null);
  const [apiUrl, setApiUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [psdView, setPsdView] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleImageName = (e) => {
    setFileName(e.target.value);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value); // Update file type
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCreateFile = async () => {
    setIsLoading(true);
    const extension = fileType === "image" ? ".jpg" : ".psd"; // Determine file extension
    try {
      const response = await axios.post(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=putObject&fileName=${fileName}${extension}`
      );

      if (response.status === 200) {
        setUserData((prev) => ({
          ...prev,
          files: { createFile: response.data.url, getFile: "" },
        }));
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

      await axios.post(`${BASE_URL}proxy/upload-image`, formData, {
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
    const extension = fileType === "image" ? ".jpg" : ".psd";
    try {
      const response = await axios.get(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=getObject&fileName=${fileName}${extension}`
      );

      if (response.status === 200) {
        setUserData((prev) => ({
          ...prev,
          files: { ...prev.files, getFile: response.data.url },
        }));
        setImageUrl(response.data.url);

        if (fileType === "psd") {
          fetch(response.data.url)
            .then((res) => res.arrayBuffer())
            .then((buffer) => convertPsdToJpg(buffer))
            .then((jpgData) => {
              setPsdView(jpgData);
            })
            .catch((error) => console.error("Conversion failed:", error));
        }

        setSuccessMessage(
          `File '${fileName}${extension}' successfully updated.`
        );
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
          <select
            value={fileType}
            onChange={handleFileTypeChange}
            className="input"
          >
            <option value="image">Image (.jpg)</option>
            <option value="psd">PSD (.psd)</option>
          </select>
          <div>
            <button className="uploadButton" onClick={handleCreateFile}>
              Create File
            </button>
          </div>
        </div>
      )}

      {apiUrl && !imageUrl && !isLoading && (
        <div className={styles.uploadBlock}>
          <h1 className="header">
            Upload {fileType === "image" ? "Image" : "PSD"}
          </h1>
          <input
            type="file"
            accept={fileType === "image" ? "image/*" : ".psd"}
            onChange={handleImageChange}
            className="uploadBlock"
          />
          <button
            className="uploadButton"
            onClick={handleUploadImage}
            disabled={!selectedImage}
          >
            Upload {fileType === "image" ? "Image" : "PSD"}
          </button>
        </div>
      )}

      {imageUrl && (
        <div className={styles.imagePreview}>
          <div className="header">
            Uploaded {fileType.toUpperCase()} Preview
          </div>
          {fileType === "image" ? (
            <img
              src={imageUrl}
              alt="Uploaded"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.successMessage}>{successMessage}</div>
          )}
          <Handle type="source" position={Position.Right} />
        </div>
      )}
    </div>
  );
};

UploadImage.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default UploadImage;
