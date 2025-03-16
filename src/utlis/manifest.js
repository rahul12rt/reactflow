import axios from "axios";
import { BASE_URL } from "../../config";

const manifest = async (userData, setNodes, setEdges) => {
  try {
    const response = await axios.post(
      `${BASE_URL}proxy/manifest`,
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
        `${BASE_URL}proxy/fetch-manifest-status`,
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
        throw new Error("Manifest fetch failed.");
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      return fetchStatus();
    };

    const imageUrl = await fetchStatus();
    const layers = imageUrl.outputs[0]?.layers || [];

    const seenNames = new Set();
    const uniqueChildren = [];

    layers.forEach((layer) => {
      layer.children?.forEach((child) => {
        if (!seenNames.has(child?.name)) {
          seenNames.add(child?.name);
          uniqueChildren.push(child);
        }
      });
    });

    setNodes((prevNodes) => {
      const newNodes = [];
      const newEdges = [];
    
      let currentX = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1].position.x + 200 : 0;
      let lastNodeId = prevNodes.length > 0 
        ? parseInt(prevNodes[prevNodes.length - 1].id.split("-").pop(), 10) 
        : 0;
    
      uniqueChildren.forEach((child, index) => {
        lastNodeId += 1; // Increment lastNodeId for each new node
    
        const newNodeId = `node-${lastNodeId}`;
    
        const yOffset = (index % 5) * 100;
        const position = { x: currentX, y: yOffset };
    
        newNodes.push({
          id: newNodeId,
          type: "customCardNode",
          position,
          data: { child },
        });
    
        if (index > 0 || prevNodes.length > 0) {
          const sourceNodeId =
            index === 0 ? prevNodes[prevNodes.length - 1].id : newNodes[index - 1].id;
    
          newEdges.push({
            id: `edge-${index}`,
            source: "6",
            target: newNodeId,
            animated: false,
          });
    
          if ((index + 1) % 5 === 0) {
            currentX += 200; // Move to the right after every 5 nodes
          }
        }
      });
    
      setEdges((prevEdges) => [...prevEdges, ...newEdges]);
      return [...prevNodes, ...newNodes];
    });
    
    
    
  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred. Please try again.");
  }
};

export default manifest;
