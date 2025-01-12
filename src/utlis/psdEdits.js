import axios from "axios";
import { BASE_URL } from "../../config";

const psdEdits = async (editedText, userData, id, setNodes, setEdges) => {
  try {
    const payload = {
      userData: {
        files: {
          getFile: userData.files.getFile,
          createFile: userData.files.createFile,
        },
        layers: [
          {
            id: id,
            text: {
              orientation: "horizontal",
              contents: editedText,
              antiAlias: "antiAliasSharp",
              characterStyles: [
                {
                  autoKern: "metricsKern",
                  fontPostScriptName: "<font_postscript_name>",
                  fontCaps: "allCaps",
                  size: 25,
                  leading: 20,
                  tracking: 20,
                  syntheticBold: true,
                  ligature: true,
                  syntheticItalic: true,
                  color: {
                    blue: 100,
                    green: 200,
                    red: 163,
                  },
                },
              ],
            },
          },
        ],
        auth: {
          token: {
            access_token: userData.auth.token.access_token,
          },
          clientId: userData.auth.clientId,
        },
      },
    };

    const response = await axios.post(`${BASE_URL}proxy/psdEdits`, payload);
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

    // Automatically download the file
    const link = document.createElement("a");
    link.href = imageUrl.outputs[0].input; // URL of the file to download
    link.download = "edited-image.psd"; // Specify the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error in psdEdits:", error);
    alert("Failed to edit PSD. Please try again.");
  }
};

export default psdEdits;
