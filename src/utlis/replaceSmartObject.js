import axios from "axios";
import { BASE_URL } from "../../config";

const replaceSO = async (editedImageURL, userData, id, setNodes, setEdges) => {
  console.log(editedImageURL, id);
  try {
    const payload = {
      userData: {
        files: {
          getFile: userData.files.getFile,
          createFile: userData.files.createFile,
        },
        layers: [
          {
            name: "BG",
            locked: false,
            id: id, 
            edit: {},
            input: {
              href: editedImageURL,
              storage: "external"
            },
            visible: true,
            transformToCanvas: "fill"
          }
        ],
        auth: {
          token: {
            access_token: userData.auth.token.access_token,
          },
          clientId: userData.auth.clientId,
        },
        outputType: "image/png",
      },
    };

    // Call the smartObjectV2 endpoint
    const response = await axios.post(`${BASE_URL}proxy/smartObjectV2`, payload);
    const href = response.data._links.self.href;

    console.log(href,"----")

    // Check for job status
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
        return result.data;
      } else if (result.data.status === "failed") {
        throw new Error("Manifest fetch failed.");
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      return fetchStatus();
    };

    const manifestData = await fetchStatus();
    console.log(manifestData.url.outputs[0].input)
    const psdUrl = manifestData.url.outputs[0].input;

    // // Create a blob from the PSD URL
    // const psdResponse = await fetch(psdUrl);
    // const psdBlob = await psdResponse.blob();
    
    // // Convert PSD to JPG for preview using ConvertAPI
    // const formData = new FormData();
    // formData.append("File", psdBlob, "edited-image.psd");
    
    // const convertResponse = await axios.post(
    //   'https://v2.convertapi.com/convert/psd/to/jpg',
    //   formData,
    //   {
    //     headers: {
    //       "Authorization": "Bearer secret_OqOClxbpSqblzQs0",
    //       "Content-Type": "multipart/form-data",
    //     },
    //   }
    // );
    
    // // Get the JPG preview URL
    // const previewUrl = `data:image/jpeg;base64,${convertResponse.data.Files[0].FileData}`;
    
    // Create new node in the React flow diagram
    setNodes(currentNodes => {
      const lastNode = currentNodes[currentNodes.length - 1];
      const newNodeId = (currentNodes.length + 1).toString();
      
      const newPosition = lastNode
        ? { x: lastNode.position.x + 200, y: lastNode.position.y }
        : { x: 50, y: 50 };
      
      const newNode = {
        id: newNodeId,
        type: "filePreviewNode",
        position: newPosition,
        data: { 
          url: psdUrl, 
          fileType: "imagePreview",
          psdUrl: psdUrl,
        },
      };
      
      // Create a new edge
      setEdges(currentEdges => [
        ...currentEdges,
        {
          id: `edge-7-${newNodeId}`,
          source: "16",
          target: newNodeId,
        }
      ]);
      
      return [...currentNodes, newNode];
    });
    
    return {
      psdUrl
    };

  } catch (error) {
    console.error("Error in smartObjectV2:", error);
    alert("Failed to edit PSD. Please try again.");
    return null;
  }
};

export default replaceSO;