import axios from "axios";

const removeBackgroundImage = async (userData, setNodes, setEdges) => {
  try {
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
  } catch (error) {
    console.error("API Error:", error);
    alert("An error occurred. Please try again.");
  }
};

export default removeBackgroundImage;
