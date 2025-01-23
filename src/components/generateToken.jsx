import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BASE_URL } from "../../config";
import { ToastQueue} from '@react-spectrum/toast'
import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  defaultTheme,
  Dialog,
  DialogTrigger,
  Divider,
  Heading,
  Provider,
  Text,
} from "@adobe/react-spectrum";

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
      ToastQueue.info('Generating a token')
      const response = await axios.post(`${BASE_URL}proxy/token`, {
        client_id: clientId,
        client_secret: secretId,
        grant_type: "client_credentials",
        scope:
          "openid,AdobeID,firefly_enterprise,firefly_api,session,additional_info,ff_apis",
      });
      props.setUserData((prev) => ({
        ...prev,
        auth: { token: response.data, clientId: formState.clientId },
      }));
      ToastQueue.positive('Token generated successfully!')
    } catch (error) {
      console.error("API Error:", error);
      ToastQueue.negative('Failed to fetch token. Please try again.')
    }
  };

  return (
    <section className="wrapper">
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
        <Button
          variant="accent"
          onPress={handleSubmit}
        >
          Generate Token
        </Button>
      </div>
    </div>
    </section>

    // <DialogTrigger type="fullscreen" isOpen="true" >
    //   <ActionButton>See Details</ActionButton>
    //   {(close) => (
    //         <div style={{
    //           backgroundImage: "url('/login-bg-large.jpg')",
    //           backgroundSize: 'cover',
    //           backgroundPosition: 'center',
    //           backgroundRepeat: 'no-repeat',
    //           width: '100%',
    //           height: '100%',
    //           minHeight: '500px', position:"relative"}} >
    //     <Dialog>
    //       <Content>
    //         <div className="form">
    //           <div className="body">
    //             <input
    //               type="text"
    //               name="clientId"
    //               placeholder="Enter Client ID"
    //               value={formState.clientId}
    //               onChange={handleInputChange}
    //               className="input"
    //             />
    //             <input
    //               type="text"
    //               name="secretId"
    //               placeholder="Enter Secret ID"
    //               value={formState.secretId}
    //               onChange={handleInputChange}
    //               className="input"
    //             />
    //             {formState.error && <p className="error">{formState.error}</p>}
    //             <Button variant="accent" onPress={handleSubmit}>
    //               Generate Token
    //             </Button>
    //           </div>
    //         </div>
    //       </Content>
    //       {/* <ButtonGroup>
    //       <Button variant="secondary" onPress={close}>Cancel</Button>
    //       <Button variant="accent" onPress={close} autoFocus>Buy</Button>
    //     </ButtonGroup> */}
    //     </Dialog>
    //     </div>
    //   )}
    // </DialogTrigger>

  );
}

GetToken.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default GetToken;
