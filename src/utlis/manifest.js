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


    // Extract layers from the response
    const layers = imageUrl.outputs[0]?.layers || [];

    // Process layers to remove duplicate children based on name
    const seenNames = new Set(); // Track unique names across all layers

    const uniqueLayers = layers.map((layer) => {
      const uniqueChildren =
        layer?.children?.filter((child) => {
          if (seenNames.has(child?.name)) {
            return false; // Skip if name is already seen
          }
          seenNames.add(child?.name); // Add to the seen set
          return true; // Include if name is not seen
        }) || [];

      return { ...layer, children: uniqueChildren };
    });

    let currentYPosition = 0;

    uniqueLayers.forEach((layer) => {
      layer.children.forEach((child) => {
        const newNodeId = `node-${Date.now()}-${child.name}`;
    
        // Calculate position before updating nodes
        const position = { x: 1450, y: currentYPosition };
    
        setNodes((prevNodes) => [
          ...prevNodes,
          {
            id: newNodeId,
            type: "customCardNode",
            position, // Use the calculated position
            data: { child },
          },
        ]);
    
        currentYPosition += 350; // Increment position after use
    
        setEdges((prevEdges) => [
          ...prevEdges,
          {
            id: `edge-to-${newNodeId}`,
            source: "4",
            target: newNodeId,
            animated: true,
          },
        ]);
      });
    });
    


  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred. Please try again.");
  }
};

export default manifest;
