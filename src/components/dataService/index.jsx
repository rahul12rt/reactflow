import { Position } from "@xyflow/react";
import PropTypes from "prop-types";
import { Handle, useReactFlow } from "reactflow";
import { useState } from "react";
import axios from "axios";
import { ToastQueue } from "@react-spectrum/toast";
import styles from "./index.module.css";
import {
  ActionButton,
  Button,
  ButtonGroup,
  Checkbox,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Flex,
  Footer,
  Form,
  Heading,
  Text,
  TextField,
} from "@adobe/react-spectrum";
import { BASE_URL } from "../../../config";

const DataService = ({ data, id, setUserData }) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    clientId: "296111349a3944829d5450be1744c58e",
    secretId: "p8e-inRDq3MJjPM8q_zK7MHHLWyzq26g2tqs",
    error: "",
    isLoading: false,
  });

  const handleClick = () => {
    if (data.label === "Generate Token") {
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormState({ clientId: "", secretId: "", error: "", isLoading: false });
  };

  const handleInputChange = (name, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (close) => {
    const { clientId, secretId } = formState;
    if (!clientId.trim() || !secretId.trim()) {
      setFormState((prevState) => ({
        ...prevState,
        error: "Both Client ID and Secret ID are required.",
      }));
      return;
    }

    // Start loading state
    setFormState((prevState) => ({
      ...prevState,
      isLoading: true,
      error: "",
    }));

    try {
      const response = await axios.post(`${BASE_URL}proxy/token`, {
        client_id: clientId,
        client_secret: secretId,
        grant_type: "client_credentials",
        scope: "openid,AdobeID,firefly_enterprise,firefly_api,session,additional_info,ff_apis",
      });

      ToastQueue.positive("Token generated successfully!", { timeout: 100 });

      setUserData((prev) => ({
        ...prev,
        auth: { token: response.data, clientId: formState.clientId },
      }));

      const currentNodes = getNodes();
      const lastNode = currentNodes[currentNodes.length - 1];
  
      const newPosition = lastNode
        ? { x: lastNode.position.x + 200, y: lastNode.position.y }
        : { x: 50, y: 50 };

      // Create a new node
      const newNode = {
        id: (currentNodes.length + 1).toString(),
        data: { label: "Create a File Name" },
        position: newPosition,
        type: "createFileName",
      };

      // Add the new node
      setNodes((nds) => nds.concat(newNode));

      // Create a connection (edge) between the current node and the new node
      const newEdge = {
        id: `edge-${id}-2`, // Unique edge ID
        source: id, // Connect from the current node
        target: "2", // Connect to the new node
        type: "default", // Edge type
      };

      // Add the new edge
      setEdges((eds) => eds.concat(newEdge));

      setDialogOpen(false);
    } catch (error) {
      console.error("API Error:", error);
      ToastQueue.negative("Failed to fetch token. Please try again.");
    } finally {
      // Reset loading state
      setFormState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  };

  const parentToUI = {
    PS: {
      image: "/logo/Adobe-Photoshop-Symbol.jpg",
      color: "#000",
      displayName: "Photoshop",
    },
    FF: {
      image: "/logo/Adobe-Firefly-Logo.png",
      color: "#ff851b",
      displayName: "Firefly",
    },
    GT: {
      image: "/logo/user.png",
      color: "#fff",
      displayName: "User",
    },
  };

  const currentUI = parentToUI[data.parent] || {};

  return (
    <div style={{ position: "relative" }}>
      <div
        className={`${styles.container}`}
        onClick={handleClick}
        style={{
          backgroundColor: currentUI.color || "#f5f5f5",
        }}
      >
        <img src={currentUI.image} alt={data.parent} className={styles.icon} />
      </div>

      <div className={styles.textContainer}>
        <p className={styles.title}>{currentUI.displayName || data.parent}</p>
        <p className={styles.subtitle}>{data.label}</p>
      </div>

      <DialogTrigger isOpen={dialogOpen} onClose={closeDialog}>
        <div style={{ visibility: "hidden" }}>
          <ActionButton>Register</ActionButton>
        </div>
        {(close) => (
          <Dialog>
            <Heading>
              <Flex alignItems="center" gap="size-100">
                <Text>Generate a token</Text>
              </Flex>
            </Heading>
            <Divider />
            <Content>
              <Form>
                <TextField
                  label="Client ID"
                  autoFocus
                  value={formState.clientId}
                  onChange={(value) => handleInputChange("clientId", value)}
                />
                <TextField
                  label="Client Secret"
                  value={formState.secretId}
                  onChange={(value) => handleInputChange("secretId", value)}
                />
                {formState.error && <Text color="negative">{formState.error}</Text>}
              </Form>
            </Content>
            <Footer>
              <Checkbox>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Checkbox>
            </Footer>
            <ButtonGroup>
              <Button variant="secondary" onPress={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={() => handleSubmit(close)}
                isDisabled={formState.isLoading}
              >
                {formState.isLoading ? "Generating..." : "Generate"}
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

DataService.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
  setUserData: PropTypes.func.isRequired,
};

export default DataService;
