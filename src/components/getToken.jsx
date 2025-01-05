import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function GetToken(props) {
  const [formState, setFormState] = useState({
    clientId: "",
    secretId: "",
    error: "",
  });

  const label = props.data?.label;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { clientId, secretId } = formState;

    if (!clientId.trim() || !secretId.trim()) {
      setFormState((prevState) => ({
        ...prevState,
        error: "Both Client ID and Secret ID are required.",
      }));
      return;
    }

    setFormState((prevState) => ({ ...prevState, error: "" }));

    try {
      const response = await axios.post(`http://localhost:1337/proxy/token`, {
        client_id: clientId,
        client_secret: secretId,
        grant_type: "client_credentials",
        scope:
          "openid,AdobeID,firefly_enterprise,firefly_api,session,additional_info,ff_apis",
      });
      props.setUserData((prev)=> ({...prev, auth:{token: response.data, clientId: formState.clientId}}));
      alert("Token fetched successfully!");
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to fetch token. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1 className="header">{label}</h1>
      <div className="body">
        <input
          type="text"
          name="clientId"
          placeholder="Enter Client ID"
          value={formState.clientId}
          onChange={handleInputChange}
          className="input"
        />
        <input
          type="text"
          name="secretId"
          placeholder="Enter Secret ID"
          value={formState.secretId}
          onChange={handleInputChange}
          className="input"
        />
        {formState.error && <p className="error">{formState.error}</p>}
        <button className="uploadButton" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

GetToken.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default GetToken;
