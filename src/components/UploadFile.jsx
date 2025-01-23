import { useState, useEffect } from "react";
import styles from "./uploadImage/index.module.css";
import axios from "axios";
import PropTypes from "prop-types";
import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Flex,
  Heading,
  Text,
} from "@adobe/react-spectrum";
import { BASE_URL } from "../../config";
import { Handle, useReactFlow } from "reactflow";
import { Position } from "@xyflow/react";

const UploadImageNode = (props) => {
  const { data, setUserData, userData } = props;
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const reactFlowInstance = useReactFlow(); // Hook to manage React Flow state

  const fileType = userData?.files?.fileType || "image";
  const fileName = userData?.files?.fileName || "";
  const apiUrl = userData?.files?.createFile;

  const handleClick = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
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
    try {
      const response = await axios.get(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=getObject&fileName=${fileName}`
      );

      if (response.status === 200) {
        const fileUrl = response.data.url;

        console.log("Received file URL:", fileUrl);

        setUserData((prev) => ({
          ...prev,
          files: {
            ...prev.files,
            getFile: fileUrl,
          },
        }));

        setImageUrl(fileUrl);

        // Dynamically add the new node and edge
        const newNode = {
          id:"4",
          type: "filePreviewNode",
          position: { x: 900, y: 450 }, // Adjust the position
          data: { fileUrl, fileType: "imagePreview"},
        };

        const newEdge = {
          id: `edge-${data.id}`,
          source: "3",
          target: "4",
        };

        reactFlowInstance.addNodes(newNode);
        reactFlowInstance.addEdges(newEdge);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to retrieve the file");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current imageUrl:", imageUrl);
    console.log("Current userData:", userData);
  }, [imageUrl, userData]);

  return (
    <div style={{ position: "relative" }}>
      <div
        className={`${styles.container}`}
        onClick={handleClick}
        style={{ background: "#fff" }}
      >
        <img src="/logo/upload.png" alt="folder" className={styles.icon} />
      </div>

      <div className={styles.textContainer}>
        <p className={styles.subTitle}>Upload Document</p>
      </div>

      <DialogTrigger isOpen={dialogOpen} onClose={closeDialog}>
        <div style={{ visibility: "hidden" }}>
          <ActionButton>Create</ActionButton>
        </div>
        {(close) => (
          <Dialog>
            <Heading>
              <Flex alignItems="center" gap="size-100">
                <Text>Upload a Document</Text>
              </Flex>
            </Heading>
            <Divider />
            <Content>
              {!userData?.files?.getFile && (
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
                </div>
              )}
              {userData?.files?.getFile && (
                <div className={styles.imagePreview}>
                  <div className="header">
                    Uploaded {fileType.toUpperCase()} Preview
                  </div>
                  {fileType === "image" ? (
                    <img
                      src={userData?.files?.getFile}
                      alt="Uploaded"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.successMessage}>PSD File Uploaded</div>
                  )}
                </div>
              )}
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={closeDialog}>
                Cancel
              </Button>
              <Button variant="accent" onPress={handleUploadImage}>
                Upload
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

UploadImageNode.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    files: PropTypes.shape({
      createFile: PropTypes.string,
      fileType: PropTypes.string,
      fileName: PropTypes.string,
    }),
  }),
  setUserData: PropTypes.func.isRequired,
  userData: PropTypes.object,
};

export default UploadImageNode;
