import { addEdge } from "reactflow";
import axios from "axios";

const handleConnections = async (connections, edges, setEdges, setNodes, userData) => {
  const newEdge = { ...connections, animated: true, id: `${edges.length + 1}` };

  setEdges((prevEdges) => {
    const updatedEdges = addEdge(newEdge, prevEdges);

    if (connections.source === "2" && connections.target === "3") {
      console.log("Remove Background Image", userData);
      removeBackgroundImage(userData, setNodes, setEdges);
    } else if (connections.source === "2" && connections.target === "4") {
      console.log("Create Mask", userData);
    }

    return updatedEdges;
  });
};

// removeBackgroundImage
// removeBackgroundImage
const removeBackgroundImage = async (userData, setNodes, setEdges) => {
  try {
    // Step 1: Initial API Call to Remove Background
    const response = await axios.post(
      "http://localhost:1337/proxy/remove-bg",
      { userData },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const href = response.data._links.self.href;

    const fetchStatus = async () => {
      const result = await axios.post(
        "http://localhost:1337/proxy/fetch-bg-status",
        {
          href,
          token: userData.auth.token.access_token,
          clientId: userData.auth.clientId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      if (result.data.status === "succeeded") {
        return result.data.url; 
      } else if (result.data.status === "failed") {
        throw new Error("Background removal task failed.");
      }
    
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return fetchStatus();
    };

    const imageUrl = await fetchStatus(); 
    console.log("Received image URL:", imageUrl); 

    if (imageUrl) {
      const newNodeId = `node-${Date.now()}`; 

      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: newNodeId,
          type: "imageNode",
          position: { x: 1850, y: 100 },
          data: { imageUrl },
        },
      ]);
      setEdges((prevEdges) => [
        ...prevEdges,
        {
          id: `edge-to-${newNodeId}`,
          source: "3",
          target: newNodeId, 
          animated: true,
        },
      ]);
    }
  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred. Please try again.");
  }
};


export default handleConnections;