import { Handle } from "reactflow";
import { FaEdit, FaSave, FaUpload } from "react-icons/fa";
import { useState, useRef } from "react";
import axios from "axios";

const CustomCardNode = ({ data, setEditedImageURL }) => {
  console.log("Data:", data, setEditedImageURL);

  if (!data || !data.child) {
    return <div className="card">No Data</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    data.child.type === "textLayer" && data.child.text?.content
      ? data.child.text.content
      : ""
  );
  const [previewImage, setPreviewImage] = useState(
    data.child.type === "smartObject" ? data.child.thumbnail : null
  );
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleSave = () => {
    setIsEditing(false);
    
    if (data.child.type === "textLayer") {
      data.setEditedText && data.setEditedText(editedText);

      if (data.updateNodeData) {
        const updatedChild = { ...data.child, editedText };
        data.updateNodeData(data.id, { child: updatedChild });
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (imageUrl) => {
    if (setEditedImageURL) {
      setEditedImageURL(imageUrl);
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // 1. Get the local preview for immediate feedback
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // 2. Get a presigned URL for PUT operation
      const fileExtension = file.name.split('.').pop();
      const fileName = `image-${Date.now()}.${fileExtension}`;
      
      const presignedUrlResponse = await axios.post(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=putObject&fileName=${fileName}`
      );
      
      const presignedUrl = presignedUrlResponse.data.url;
      
      // 3. Upload the file to the presigned URL
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      
      // 4. Get the URL for accessing the uploaded file
      const getObjectResponse = await axios.get(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=getObject&fileName=${fileName}`
      );
      
      const fileUrl = getObjectResponse.data.url;
      setPreviewImage(getObjectResponse.data.url)
      handleImageUpload(fileUrl)
      
    
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="cardContainer">
        {data.child.type === "textLayer" && (
          <>
            <p className="edit">
              {isEditing ? (
                <span onClick={handleSave} style={{ cursor: "pointer" }}>
                  Save <FaSave style={{ marginLeft: "5px" }} />
                </span>
              ) : (
                <span onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
                  Edit <FaEdit style={{ marginLeft: "5px" }} />
                </span>
              )}
            </p>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              ) : (
                <span>{editedText}</span>
              )}
            </div>
          </>
        )}

        {data.child.type === "smartObject" && (
          <>
            <p className="edit">
              <span onClick={handleUploadClick} style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
                {isUploading ? "Uploading..." : "Upload"} <FaUpload style={{ marginLeft: "5px" }} />
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
                disabled={isUploading}
              />
            </p>
            <div style={{ marginTop: "10px" }}>
              {isUploading && (
                <div style={{ marginBottom: "10px", color: "#666" }}>Processing image...</div>
              )}
              <img 
                src={previewImage} 
                alt={data.child.name} 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "150px", 
                  objectFit: "contain",
                  opacity: isUploading ? 0.6 : 1
                }} 
              />
            </div>
          </>
        )}
        
        {data.child.type !== "textLayer" && data.child.type !== "smartObject" && (
          <img src={data.child.thumbnail} alt={data.child.name} />
        )}
      </div>

      <Handle type="target" position="left" id="default" />
      <Handle type="source" position="right" id="default" />
    </div>
  );
};

export default CustomCardNode;