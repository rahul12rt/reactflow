import { useState } from "react";
import styles from "./index.module.css";
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
  TextField,
  Picker,
  Item,
} from "@adobe/react-spectrum";
import { Handle, Position, useReactFlow } from "reactflow";
import { ToastQueue } from "@react-spectrum/toast";

export const CreateFileNode = (props) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const { data, setUserData } = props;
  const [fileName, setFileName] = useState("New");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileType, setFileType] = useState("image");
  const [isLoading, setIsLoading] = useState(false);
  const [isFileCreated, setIsFileCreated] = useState(false);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (value) => {
    setFileName(value);
  };

  const handleFileTypeChange = (value) => {
    setFileType(value);
  };

  const handleCreateFile = async () => {
    if (!fileName) {
      ToastQueue.negative("Please enter a file name", { timeout: 2000 });
      return;
    }

    setIsLoading(true);
    const extension = fileType === "image" ? ".jpg" : ".psd";
    try {
      const response = await axios.post(
        `https://786177-dragonfly.adobeio-static.net/api/v1/web/Dragonfly/storage?operation=putObject&fileName=${fileName}${extension}`
      );

      if (response.status === 200) {
        setUserData((prev) => ({
          ...prev,
          files: {
            createFile: response.data.url,
            fileType: fileType,
            fileName: `${fileName}${extension}`,
          },
        }));

        const currentNodes = getNodes();
        const lastNode = currentNodes[currentNodes.length - 1];

        const newPosition = lastNode
          ? { x: lastNode.position.x + 200, y: lastNode.position.y }
          : { x: 50, y: 50 };

        // Create a new node
        const newNode = {
          id: (currentNodes.length + 1).toString(),
          data: { label: "Upload File Document" },
          position: newPosition,
          type: "uploadImageNode",
        };

        // Add the new node
        setNodes((nds) => nds.concat(newNode));

        const newEdge = {
          id: `edge-2`, // Unique edge ID
          source: "2", // Connect from the current node
          target: "3", // Connect to the new node
          type: "default", // Edge type
        };

        // Add the new edge
        setEdges((eds) => eds.concat(newEdge));

        ToastQueue.positive("File created successfully!", { timeout: 2000 });
        setIsFileCreated(true);
        closeDialog();
      }
    } catch (error) {
      console.error("API Error:", error);
      ToastQueue.negative("Failed to create the file. Please try again.", {
        timeout: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        className={`${styles.container}`}
        onClick={handleClick}
        style={{ background: "#fff" }}
      >
        <img src="/logo/folder.png" alt="folder" className={styles.icon} />
      </div>

      <div className={styles.textContainer}>
        <p className={styles.subTitle}>Create Document</p>
      </div>

      <DialogTrigger isOpen={dialogOpen} onClose={closeDialog}>
        <div style={{ visibility: "hidden" }}>
          <ActionButton>Create</ActionButton>
        </div>
        {(close) => (
          <Dialog>
            <Heading>
              <Flex alignItems="center" gap="size-100">
                <Text>Create a Document</Text>
              </Flex>
            </Heading>
            <Divider />
            <Content>
              <TextField
                label="File Name"
                autoFocus
                value={fileName}
                onChange={handleInputChange}
                placeholder="Enter file name"
              />
              <Picker
                label="File Type"
                selectedKey={fileType}
                onSelectionChange={handleFileTypeChange}
                width="100%"
                marginTop="size-100"
              >
                <Item key="image">Image (.jpg)</Item>
                <Item key="psd">PSD (.psd)</Item>
              </Picker>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={handleCreateFile}
                isDisabled={!fileName || isLoading}
                isPending={isLoading}
              >
                Create
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>

      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isFileCreated}
      />
    </div>
  );
};

CreateFileNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
  }),
  setUserData: PropTypes.func.isRequired,
};

export default CreateFileNode;
