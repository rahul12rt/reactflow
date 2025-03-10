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

    const newNodeId = `node-${Date.now()}`;
    const position = { x: 1450, y: 0 };

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: "9",
        type: "customCardNode",
        position,
        data: { children: uniqueChildren },
      },
    ]);

    setEdges((prevEdges) => [
      ...prevEdges,
      {
        id: "10",
        source: "6",
        target: "9",
        animated: true,
      },
    ]);
  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred. Please try again.");
  }
};

export default manifest;
